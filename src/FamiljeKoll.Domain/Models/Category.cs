namespace FamiljeKoll.Domain.Models;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
