using FamiljeKoll.Domain.Enums;

namespace FamiljeKoll.Service.Implementations;

public static class RecurrenceGenerator
{
    public const int MaxOccurrences = 2000;
    public const int WindowMonths = 12;

    // Dates are always computed from the start date (not cumulatively) so month-end clamping never drifts.
    public static List<DateOnly> Generate(DateOnly start, RecurringFrequency frequency, int interval,
        DateOnly? endDate, DateOnly until, int skip = 0)
    {
        if (interval < 1) throw new ArgumentOutOfRangeException(nameof(interval));
        var limit = endDate is { } e && e < until ? e : until;
        var result = new List<DateOnly>();
        for (var n = skip; n < MaxOccurrences; n++)
        {
            var date = Nth(start, frequency, interval, n);
            if (date > limit) break;
            result.Add(date);
        }
        return result;
    }

    public static DateOnly Nth(DateOnly start, RecurringFrequency frequency, int interval, int n) => frequency switch
    {
        RecurringFrequency.Days => start.AddDays(interval * n),
        RecurringFrequency.Weeks => start.AddDays(7 * interval * n),
        RecurringFrequency.Months => start.AddMonths(interval * n),
        _ => throw new ArgumentOutOfRangeException(nameof(frequency))
    };

    // Window end for series that have no end date.
    public static DateOnly WindowEnd(DateOnly start, DateOnly today) =>
        (start > today ? start : today).AddMonths(WindowMonths);
}
