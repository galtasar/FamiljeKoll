using FamiljeKoll.Domain.Enums;
using FamiljeKoll.Domain.Models;
using FamiljeKoll.Service.Implementations;

namespace FamiljeKoll.Service.UnitTests;

public class RecurrenceGeneratorTests
{
    private static readonly DateOnly Start = new(2026, 11, 22); // a Sunday

    [Fact]
    public void EveryOtherWeek_GeneratesEvery14Days()
    {
        var dates = RecurrenceGenerator.Generate(Start, RecurringFrequency.Weeks, 2, null, Start.AddDays(40));
        Assert.Equal([Start, Start.AddDays(14), Start.AddDays(28)], dates);
        Assert.All(dates, d => Assert.Equal(DayOfWeek.Sunday, d.DayOfWeek));
    }

    [Fact]
    public void EndDate_LimitsOccurrencesInclusively()
    {
        var dates = RecurrenceGenerator.Generate(Start, RecurringFrequency.Days, 1, Start.AddDays(2), Start.AddYears(1));
        Assert.Equal(3, dates.Count);
    }

    [Fact]
    public void Months_ClampToMonthEndWithoutDrift()
    {
        var dates = RecurrenceGenerator.Generate(new DateOnly(2026, 1, 31), RecurringFrequency.Months, 1, null, new DateOnly(2026, 4, 30));
        Assert.Equal([new(2026, 1, 31), new(2026, 2, 28), new(2026, 3, 31), new(2026, 4, 30)], dates);
    }

    [Fact]
    public void Skip_OmitsFirstOccurrences()
    {
        var dates = RecurrenceGenerator.Generate(Start, RecurringFrequency.Weeks, 1, null, Start.AddDays(14), skip: 1);
        Assert.Equal([Start.AddDays(7), Start.AddDays(14)], dates);
    }

    [Fact]
    public void NeverExceedsMaxOccurrences()
    {
        var dates = RecurrenceGenerator.Generate(Start, RecurringFrequency.Days, 1, null, Start.AddYears(50));
        Assert.Equal(RecurrenceGenerator.MaxOccurrences, dates.Count);
    }
}

public class PointsCalculatorTests
{
    private static Activity Done(int points, Guid? by, params Guid[] members) => new()
    {
        IsDone = true, Points = points, CompletedByMemberId = by,
        Members = members.Select(m => new ActivityMember { MemberId = m }).ToList()
    };

    [Fact]
    public void EachResponsibleMemberGetsFullPoints()
    {
        Guid a = Guid.NewGuid(), b = Guid.NewGuid();
        var result = PointsCalculator.Calculate([Done(5, null, a, b)]);
        Assert.Equal(5, result.Single(p => p.MemberId == a).Points);
        Assert.Equal(5, result.Single(p => p.MemberId == b).Points);
    }

    [Fact]
    public void WithoutMembers_CompletedByGetsPoints()
    {
        var who = Guid.NewGuid();
        var result = PointsCalculator.Calculate([Done(3, who)]);
        Assert.Equal(3, Assert.Single(result).Points);
    }

    [Fact]
    public void NotDoneOrZeroPoints_AreIgnored()
    {
        var m = Guid.NewGuid();
        var notDone = Done(5, null, m);
        notDone.IsDone = false;
        Assert.Empty(PointsCalculator.Calculate([notDone, Done(0, null, m), Done(4, null)]));
    }
}
