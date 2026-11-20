using FamiljeKoll.Domain.Models;
using FamiljeKoll.Repository.Repositories;
using FamiljeKoll.Service.Dtos;
using FamiljeKoll.Service.Interfaces;

namespace FamiljeKoll.Service.Implementations;

public class ActivityService(
    IActivityRepository activities,
    IMemberRepository members,
    ICategoryRepository categories,
    TimeProvider time) : IActivityService
{
    private const int MaxRangeDays = 400;
    private const int UpcomingLimit = 200;
    private const int MaxSeriesYears = 5;

    private static readonly TimeZoneInfo Zone = FindZone();

    private static TimeZoneInfo FindZone()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("Europe/Stockholm"); }
        catch (TimeZoneNotFoundException) { return TimeZoneInfo.Local; }
    }

    private DateOnly Today() =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(time.GetUtcNow(), Zone).DateTime);

    public async Task<List<ActivityDto>> GetRangeAsync(DateOnly from, DateOnly to, Guid? memberId, Guid? categoryId)
    {
        if (to < from || to.DayNumber - from.DayNumber > MaxRangeDays)
            throw new ValidationFailedException("Ogiltigt datumintervall.");
        var list = await activities.GetRangeAsync(from, to, memberId, categoryId);
        return list.Select(ActivityDto.From).ToList();
    }

    public async Task<List<ActivityDto>> GetUpcomingAsync(DateOnly? from)
    {
        var list = await activities.GetUpcomingAsync(from ?? Today(), UpcomingLimit);
        return list.Select(ActivityDto.From).ToList();
    }

    public async Task<List<ActivityDto>> CreateAsync(SaveActivityDto dto)
    {
        await ValidateAsync(dto);
        var created = new List<Activity>();

        if (dto.Frequency is null)
        {
            created.Add(Build(dto, dto.Date, null));
        }
        else
        {
            var pattern = await CreatePatternAsync(dto);
            foreach (var date in Occurrences(dto, pattern, skip: 0))
                created.Add(Build(dto, date, pattern.Id));
        }

        await activities.AddRangeAsync(created);
        return created.Select(ActivityDto.From).ToList();
    }

    public async Task<ActivityDto?> UpdateAsync(Guid id, SaveActivityDto dto)
    {
        await ValidateAsync(dto);
        var activity = await activities.GetByIdAsync(id);
        if (activity is null) return null;

        Apply(activity, dto, dto.Date);

        List<Activity> extra = [];
        if (dto.Frequency is not null && activity.RecurringPatternId is null)
        {
            var pattern = await CreatePatternAsync(dto);
            activity.RecurringPatternId = pattern.Id;
            extra = Occurrences(dto, pattern, skip: 1).Select(d => Build(dto, d, pattern.Id)).ToList();
        }

        await activities.SaveAsync();
        if (extra.Count > 0) await activities.AddRangeAsync(extra);
        return ActivityDto.From(activity);
    }

    // "This and following": fields are applied to all later occurrences; the date moves by the same offset.
    public async Task<List<ActivityDto>?> UpdateSeriesAsync(Guid id, SaveActivityDto dto)
    {
        await ValidateAsync(dto);
        var activity = await activities.GetByIdAsync(id);
        if (activity is null) return null;
        if (activity.RecurringPatternId is null)
            return (await UpdateAsync(id, dto)) is { } single ? [single] : null;

        var offset = dto.Date.DayNumber - activity.Date.DayNumber;
        var series = await activities.GetSeriesFromAsync(activity.RecurringPatternId.Value, activity.Date);
        foreach (var a in series)
            Apply(a, dto, a.Date.AddDays(offset));
        await activities.SaveAsync();
        return series.Select(ActivityDto.From).ToList();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var activity = await activities.GetByIdAsync(id);
        if (activity is null) return false;
        await activities.RemoveRangeAsync([activity]);
        return true;
    }

    public async Task<bool> DeleteSeriesAsync(Guid id)
    {
        var activity = await activities.GetByIdAsync(id);
        if (activity is null) return false;
        var toRemove = activity.RecurringPatternId is { } pid
            ? await activities.GetSeriesFromAsync(pid, activity.Date)
            : [activity];
        await activities.RemoveRangeAsync(toRemove);
        return true;
    }

    public async Task<ActivityDto?> SetDoneAsync(Guid id, SetDoneDto dto)
    {
        var activity = await activities.GetByIdAsync(id);
        if (activity is null) return null;

        if (dto.IsDone && dto.CompletedByMemberId is { } by && await members.CountExistingAsync([by]) != 1)
            throw new ValidationFailedException("Okänd familjemedlem.");

        activity.IsDone = dto.IsDone;
        activity.DoneAt = dto.IsDone ? time.GetUtcNow().UtcDateTime : null;
        activity.CompletedByMemberId = dto.IsDone ? dto.CompletedByMemberId : null;
        await activities.SaveAsync();
        return ActivityDto.From(activity);
    }

    public async Task<List<MemberPointsDto>> GetPointsAsync(DateOnly? from, DateOnly? to) =>
        PointsCalculator.Calculate(await activities.GetCompletedAsync(from, to));

    // Keeps series without end date filled 12 months ahead.
    public async Task ExtendOpenEndedSeriesAsync()
    {
        var today = Today();
        var target = today.AddMonths(RecurrenceGenerator.WindowMonths);
        foreach (var pattern in await activities.GetOpenEndedPatternsAsync())
        {
            if (pattern.GeneratedUntil >= target) continue;
            var template = await activities.GetSeriesTemplateAsync(pattern.Id);
            var last = await activities.GetLastDateAsync(pattern.Id);
            if (template is null || last is null) continue;

            // Continue the cadence from the latest existing occurrence.
            var dates = RecurrenceGenerator.Generate(last.Value, pattern.Frequency, pattern.Interval, null, target, skip: 1);
            if (dates.Count > 0)
            {
                var dto = new SaveActivityDto
                {
                    Title = template.Title, Notes = template.Notes, Points = template.Points,
                    CategoryId = template.CategoryId, MemberIds = template.Members.Select(m => m.MemberId).ToList()
                };
                await activities.AddRangeAsync(dates.Select(d => Build(dto, d, pattern.Id)));
            }
            pattern.GeneratedUntil = target;
            await activities.SaveAsync();
        }
    }

    private async Task<RecurringPattern> CreatePatternAsync(SaveActivityDto dto)
    {
        var pattern = new RecurringPattern
        {
            Frequency = dto.Frequency!.Value,
            Interval = dto.Interval ?? 1,
            EndDate = dto.EndDate,
            GeneratedUntil = dto.EndDate ?? RecurrenceGenerator.WindowEnd(dto.Date, Today())
        };
        await activities.AddPatternAsync(pattern);
        return pattern;
    }

    private static List<DateOnly> Occurrences(SaveActivityDto dto, RecurringPattern p, int skip) =>
        RecurrenceGenerator.Generate(dto.Date, p.Frequency, p.Interval, p.EndDate, p.GeneratedUntil, skip);

    private static Activity Build(SaveActivityDto dto, DateOnly date, Guid? patternId)
    {
        var a = new Activity { RecurringPatternId = patternId };
        Apply(a, dto, date);
        return a;
    }

    private static void Apply(Activity a, SaveActivityDto dto, DateOnly date)
    {
        a.Title = dto.Title.Trim();
        a.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        a.Date = date;
        a.Points = dto.Points;
        a.CategoryId = dto.CategoryId;

        var wanted = dto.MemberIds.Distinct().ToHashSet();
        a.Members.RemoveAll(m => !wanted.Contains(m.MemberId));
        foreach (var id in wanted.Where(id => a.Members.All(m => m.MemberId != id)))
            a.Members.Add(new ActivityMember { MemberId = id });
    }

    private async Task ValidateAsync(SaveActivityDto dto)
    {
        var today = Today();
        if (dto.Date < today.AddYears(-1) || dto.Date > today.AddYears(MaxSeriesYears))
            throw new ValidationFailedException("Datumet är utanför tillåtet intervall.");

        if (dto.Frequency is null && (dto.Interval is not null || dto.EndDate is not null))
            throw new ValidationFailedException("Upprepning saknas.");
        if (dto.EndDate is { } end && (end < dto.Date || end > dto.Date.AddYears(MaxSeriesYears)))
            throw new ValidationFailedException("Ogiltigt slutdatum.");

        var memberIds = dto.MemberIds.Distinct().ToList();
        if (memberIds.Count > 0 && await members.CountExistingAsync(memberIds) != memberIds.Count)
            throw new ValidationFailedException("Okänd familjemedlem.");
        if (dto.CategoryId is { } cat && !await categories.ExistsAsync(cat))
            throw new ValidationFailedException("Okänd kategori.");
    }
}
