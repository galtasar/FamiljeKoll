using System.ComponentModel.DataAnnotations;
using FamiljeKoll.Domain.Enums;
using FamiljeKoll.Domain.Models;

namespace FamiljeKoll.Service.Dtos;

public class SaveMemberDto
{
    [Required, StringLength(50, MinimumLength = 1)] public string Name { get; set; } = string.Empty;
    [Required, RegularExpression("^#[0-9A-Fa-f]{6}$")] public string Color { get; set; } = string.Empty;
    [Range(0, 1000)] public int SortOrder { get; set; }
    public bool IsArchived { get; set; }
}

public class SaveCategoryDto
{
    [Required, StringLength(50, MinimumLength = 1)] public string Name { get; set; } = string.Empty;
    [Required, RegularExpression("^#[0-9A-Fa-f]{6}$")] public string Color { get; set; } = string.Empty;
    [Range(0, 1000)] public int SortOrder { get; set; }
}

public class SaveActivityDto
{
    [Required, StringLength(120, MinimumLength = 1)] public string Title { get; set; } = string.Empty;
    [StringLength(1000)] public string? Notes { get; set; }
    public DateOnly Date { get; set; }
    [Range(0, 1000)] public int Points { get; set; }
    public Guid? CategoryId { get; set; }
    [MaxLength(50)] public List<Guid> MemberIds { get; set; } = [];

    // Recurrence is only used when creating (or turning a single activity into a series).
    public RecurringFrequency? Frequency { get; set; }
    [Range(1, 365)] public int? Interval { get; set; }
    public DateOnly? EndDate { get; set; }
}

public record SetDoneDto(bool IsDone, Guid? CompletedByMemberId);

public record ActivityDto(
    Guid Id,
    string Title,
    string? Notes,
    DateOnly Date,
    bool IsDone,
    DateTime? DoneAt,
    Guid? CompletedByMemberId,
    int Points,
    Guid? CategoryId,
    IReadOnlyList<Guid> MemberIds,
    Guid? RecurringPatternId)
{
    public static ActivityDto From(Activity a) => new(
        a.Id, a.Title, a.Notes, a.Date, a.IsDone, a.DoneAt, a.CompletedByMemberId, a.Points,
        a.CategoryId, a.Members.Select(m => m.MemberId).ToList(), a.RecurringPatternId);
}

public record MemberPointsDto(Guid MemberId, int Points);

public class ValidationFailedException(string message) : Exception(message);
