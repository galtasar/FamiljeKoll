using FamiljeKoll.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FamiljeKoll.Repository;

public class FamiljeKollDbContext(DbContextOptions<FamiljeKollDbContext> options) : DbContext(options)
{
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ActivityMember> ActivityMembers => Set<ActivityMember>();
    public DbSet<RecurringPattern> RecurringPatterns => Set<RecurringPattern>();

    private static Category Seed(string id, string name, string color, string emoji, int order) =>
        new() { Id = Guid.Parse(id), Name = name, Color = color, Emoji = emoji, SortOrder = order };

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Member>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(50).IsRequired();
            e.Property(x => x.Color).HasMaxLength(9).IsRequired();
            e.Property(x => x.Emoji).HasMaxLength(16).IsRequired();
        });

        b.Entity<Category>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(50).IsRequired();
            e.Property(x => x.Color).HasMaxLength(9).IsRequired();
            e.Property(x => x.Emoji).HasMaxLength(16).IsRequired();
            e.HasData(
                Seed("00000000-0000-0000-0000-000000000001", "Hem", "#FF8A65", "🏠", 1),
                Seed("00000000-0000-0000-0000-000000000002", "Städ", "#4DD0E1", "🧹", 2),
                Seed("00000000-0000-0000-0000-000000000003", "Trädgård", "#81C784", "🌱", 3),
                Seed("00000000-0000-0000-0000-000000000004", "Bil", "#7986CB", "🚗", 4),
                Seed("00000000-0000-0000-0000-000000000005", "Skola", "#FFD54F", "📚", 5),
                Seed("00000000-0000-0000-0000-000000000006", "Mat", "#F06292", "🍽️", 6),
                Seed("00000000-0000-0000-0000-000000000007", "Övrigt", "#A1887F", "⭐", 7));
        });

        b.Entity<RecurringPattern>(e =>
        {
            e.Property(x => x.Frequency).HasConversion<string>().HasMaxLength(10);
        });

        b.Entity<Activity>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(120).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(1000);
            e.HasIndex(x => x.Date);
            e.HasIndex(x => x.RecurringPatternId);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.RecurringPattern).WithMany().HasForeignKey(x => x.RecurringPatternId).OnDelete(DeleteBehavior.NoAction);
        });

        b.Entity<ActivityMember>(e =>
        {
            e.HasKey(x => new { x.ActivityId, x.MemberId });
            e.HasOne(x => x.Activity).WithMany(a => a.Members).HasForeignKey(x => x.ActivityId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Member).WithMany().HasForeignKey(x => x.MemberId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
