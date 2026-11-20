using FamiljeKoll.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FamiljeKoll.Repository.Repositories;

public interface IActivityRepository
{
    Task<List<Activity>> GetRangeAsync(DateOnly from, DateOnly to, Guid? memberId, Guid? categoryId);
    Task<List<Activity>> GetUpcomingAsync(DateOnly from, int limit);
    Task<Activity?> GetByIdAsync(Guid id);
    Task<List<Activity>> GetSeriesFromAsync(Guid patternId, DateOnly fromDate);
    Task<List<Activity>> GetCompletedAsync(DateOnly? from, DateOnly? to);
    Task<List<RecurringPattern>> GetOpenEndedPatternsAsync();
    Task<DateOnly?> GetLastDateAsync(Guid patternId);
    Task<Activity?> GetSeriesTemplateAsync(Guid patternId);
    Task AddPatternAsync(RecurringPattern pattern);
    Task AddRangeAsync(IEnumerable<Activity> activities);
    Task RemoveRangeAsync(IEnumerable<Activity> activities);
    Task SaveAsync();
}

public class ActivityRepository(FamiljeKollDbContext db) : IActivityRepository
{
    private IQueryable<Activity> Query => db.Activities.Include(a => a.Members);

    public Task<List<Activity>> GetRangeAsync(DateOnly from, DateOnly to, Guid? memberId, Guid? categoryId)
    {
        var q = Query.Where(a => a.Date >= from && a.Date <= to);
        // Activities without members belong to the whole family and match every member filter.
        if (memberId is not null)
            q = q.Where(a => a.Members.Count == 0 || a.Members.Any(m => m.MemberId == memberId));
        if (categoryId is not null)
            q = q.Where(a => a.CategoryId == categoryId);
        return q.OrderBy(a => a.Date).ThenBy(a => a.Title).ToListAsync();
    }

    public Task<List<Activity>> GetUpcomingAsync(DateOnly from, int limit) =>
        Query.Where(a => a.Date >= from && !a.IsDone)
            .OrderBy(a => a.Date).ThenBy(a => a.Title).Take(limit).ToListAsync();

    public Task<Activity?> GetByIdAsync(Guid id) => Query.FirstOrDefaultAsync(a => a.Id == id);

    public Task<List<Activity>> GetSeriesFromAsync(Guid patternId, DateOnly fromDate) =>
        Query.Where(a => a.RecurringPatternId == patternId && a.Date >= fromDate).OrderBy(a => a.Date).ToListAsync();

    public Task<List<Activity>> GetCompletedAsync(DateOnly? from, DateOnly? to)
    {
        var q = Query.Where(a => a.IsDone && a.Points > 0);
        if (from is not null) q = q.Where(a => a.Date >= from);
        if (to is not null) q = q.Where(a => a.Date <= to);
        return q.ToListAsync();
    }

    public Task<List<RecurringPattern>> GetOpenEndedPatternsAsync() =>
        db.RecurringPatterns.Where(p => p.EndDate == null).ToListAsync();

    public async Task<DateOnly?> GetLastDateAsync(Guid patternId) =>
        await db.Activities.Where(a => a.RecurringPatternId == patternId).MaxAsync(a => (DateOnly?)a.Date);

    public Task<Activity?> GetSeriesTemplateAsync(Guid patternId) =>
        Query.Where(a => a.RecurringPatternId == patternId).OrderByDescending(a => a.Date).FirstOrDefaultAsync();

    public Task AddPatternAsync(RecurringPattern pattern)
    {
        db.RecurringPatterns.Add(pattern);
        return Task.CompletedTask;
    }

    public async Task AddRangeAsync(IEnumerable<Activity> activities)
    {
        db.Activities.AddRange(activities);
        await db.SaveChangesAsync();
    }

    public async Task RemoveRangeAsync(IEnumerable<Activity> activities)
    {
        db.Activities.RemoveRange(activities);
        await db.SaveChangesAsync();
    }

    public Task SaveAsync() => db.SaveChangesAsync();
}
