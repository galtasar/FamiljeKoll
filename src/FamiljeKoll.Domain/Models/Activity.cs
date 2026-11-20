namespace FamiljeKoll.Domain.Models;

public class Activity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateOnly Date { get; set; }
    public bool IsDone { get; set; }
    public DateTime? DoneAt { get; set; }
    public Guid? CompletedByMemberId { get; set; }
    public int Points { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public Guid? RecurringPatternId { get; set; }
    public RecurringPattern? RecurringPattern { get; set; }
    public List<ActivityMember> Members { get; set; } = [];
}

public class ActivityMember
{
    public Guid ActivityId { get; set; }
    public Activity? Activity { get; set; }
    public Guid MemberId { get; set; }
    public Member? Member { get; set; }
}
