using FamiljeKoll.Domain.Enums;
using FamiljeKoll.Domain.Models;
using FamiljeKoll.Repository;
using FamiljeKoll.Repository.Repositories;
using FamiljeKoll.Service.Dtos;
using FamiljeKoll.Service.Implementations;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Time.Testing;

namespace FamiljeKoll.Service.UnitTests;

public sealed class ActivityServiceTests : IDisposable
{
    private readonly SqliteConnection _conn = new("DataSource=:memory:");
    private readonly FamiljeKollDbContext _db;
    private readonly ActivityService _svc;
    private readonly FakeTimeProvider _time = new(new DateTimeOffset(2026, 11, 20, 12, 0, 0, TimeSpan.Zero));
    private readonly Member _ella = new() { Name = "Ella", Color = "#FFD54F" };
    private readonly Member _max = new() { Name = "Max", Color = "#81C784" };

    public ActivityServiceTests()
    {
        _conn.Open();
        _db = new FamiljeKollDbContext(new DbContextOptionsBuilder<FamiljeKollDbContext>().UseSqlite(_conn).Options);
        _db.Database.EnsureCreated();
        _db.Members.AddRange(_ella, _max);
        _db.SaveChanges();
        _svc = new ActivityService(new ActivityRepository(_db), new MemberRepository(_db), new CategoryRepository(_db), _time);
    }

    public void Dispose() { _db.Dispose(); _conn.Dispose(); }

    private static SaveActivityDto Dto(DateOnly date, params Guid[] members) =>
        new() { Title = "Vattna blommor", Date = date, MemberIds = members.ToList() };

    private static readonly DateOnly Sunday = new(2026, 11, 22);

    [Fact]
    public async Task Create_Single_HasNoPattern()
    {
        var created = await _svc.CreateAsync(Dto(Sunday, _ella.Id));
        var a = Assert.Single(created);
        Assert.Null(a.RecurringPatternId);
        Assert.Equal([_ella.Id], a.MemberIds);
    }

    [Fact]
    public async Task Create_EveryOtherWeekWithEndDate_GeneratesRowsPerOccurrence()
    {
        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Weeks;
        dto.Interval = 2;
        dto.EndDate = Sunday.AddDays(28);
        var created = await _svc.CreateAsync(dto);
        Assert.Equal(3, created.Count);
        Assert.Single(created.Select(c => c.RecurringPatternId).Distinct());
    }

    [Fact]
    public async Task Create_WithoutEndDate_FillsTwelveMonthWindow()
    {
        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Weeks;
        dto.Interval = 1;
        var created = await _svc.CreateAsync(dto);
        Assert.InRange(created.Count, 52, 54);
    }

    [Fact]
    public async Task UpdateSeries_ChangesThisAndFollowing_ButNotEarlier()
    {
        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Weeks;
        dto.Interval = 1;
        dto.EndDate = Sunday.AddDays(21);
        var series = await _svc.CreateAsync(dto);

        var edit = Dto(series[1].Date, _max.Id);
        edit.Title = "Städa";
        await _svc.UpdateSeriesAsync(series[1].Id, edit);

        var all = await _svc.GetRangeAsync(Sunday, Sunday.AddDays(30), null, null);
        Assert.Equal("Vattna blommor", all[0].Title);
        Assert.All(all.Skip(1), a => { Assert.Equal("Städa", a.Title); Assert.Equal([_max.Id], a.MemberIds); });
    }

    [Fact]
    public async Task DeleteSeries_RemovesThisAndFollowing()
    {
        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Weeks;
        dto.Interval = 1;
        dto.EndDate = Sunday.AddDays(21);
        var series = await _svc.CreateAsync(dto);

        Assert.True(await _svc.DeleteSeriesAsync(series[2].Id));
        Assert.Equal(2, (await _svc.GetRangeAsync(Sunday, Sunday.AddDays(30), null, null)).Count);
    }

    [Fact]
    public async Task SetDone_RecordsWhoAndUndoClearsIt()
    {
        var a = (await _svc.CreateAsync(Dto(Sunday))).Single();
        var done = await _svc.SetDoneAsync(a.Id, new SetDoneDto(true, _ella.Id));
        Assert.True(done!.IsDone);
        Assert.Equal(_ella.Id, done.CompletedByMemberId);

        var undone = await _svc.SetDoneAsync(a.Id, new SetDoneDto(false, null));
        Assert.False(undone!.IsDone);
        Assert.Null(undone.CompletedByMemberId);
    }

    [Fact]
    public async Task MemberFilter_IncludesWholeFamilyActivities()
    {
        await _svc.CreateAsync(Dto(Sunday, _ella.Id));
        await _svc.CreateAsync(Dto(Sunday, _max.Id));
        await _svc.CreateAsync(Dto(Sunday));
        var forElla = await _svc.GetRangeAsync(Sunday, Sunday, _ella.Id, null);
        Assert.Equal(2, forElla.Count);
    }

    [Fact]
    public async Task UnknownMemberOrBadEndDate_IsRejected()
    {
        await Assert.ThrowsAsync<ValidationFailedException>(() => _svc.CreateAsync(Dto(Sunday, Guid.NewGuid())));

        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Days;
        dto.EndDate = Sunday.AddDays(-1);
        await Assert.ThrowsAsync<ValidationFailedException>(() => _svc.CreateAsync(dto));
    }

    [Fact]
    public async Task ExtendOpenEndedSeries_AddsOccurrencesAsTimePasses()
    {
        var dto = Dto(Sunday);
        dto.Frequency = RecurringFrequency.Weeks;
        dto.Interval = 1;
        var before = (await _svc.CreateAsync(dto)).Count;

        _time.Advance(TimeSpan.FromDays(90));
        await _svc.ExtendOpenEndedSeriesAsync();

        var all = await _db.Activities.CountAsync();
        Assert.True(all > before);
        Assert.Equal(all, await _db.Activities.Select(a => a.Date).Distinct().CountAsync());
    }
}
