using FamiljeKoll.Domain.Enums;

namespace FamiljeKoll.Domain.Models;

public class RecurringPattern
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public RecurringFrequency Frequency { get; set; }
    public int Interval { get; set; } = 1;
    public DateOnly? EndDate { get; set; }

    // Occurrences exist up to this date (rolling window for series without end date).
    public DateOnly GeneratedUntil { get; set; }
}
