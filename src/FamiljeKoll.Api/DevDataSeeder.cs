using FamiljeKoll.Domain.Models;
using FamiljeKoll.Repository;
using Microsoft.EntityFrameworkCore;

namespace FamiljeKoll.Api;

// Development only: synthetic example family.
public static class DevDataSeeder
{
    public static async Task SeedAsync(FamiljeKollDbContext db)
    {
        if (await db.Members.AnyAsync()) return;

        var members = new[]
        {
            new Member { Name = "Mamma", Color = "#F06292", SortOrder = 1 },
            new Member { Name = "Pappa", Color = "#4DD0E1", SortOrder = 2 },
            new Member { Name = "Ella", Color = "#FFD54F", SortOrder = 3 },
            new Member { Name = "Max", Color = "#81C784", SortOrder = 4 },
        };
        db.Members.AddRange(members);

        var cats = await db.Categories.ToDictionaryAsync(c => c.Name);
        var today = DateOnly.FromDateTime(DateTime.Today);
        var pattern = new RecurringPattern
        {
            Frequency = Domain.Enums.RecurringFrequency.Weeks, Interval = 2,
            GeneratedUntil = today.AddMonths(3), EndDate = today.AddMonths(3)
        };
        db.RecurringPatterns.Add(pattern);

        for (var i = 0; i < 7; i++)
        {
            var d = today.AddDays(i * 14);
            db.Activities.Add(new Activity
            {
                Title = "Vattna blommorna", Date = d, Points = 5, CategoryId = cats["Trädgård"].Id,
                RecurringPatternId = pattern.Id,
                Members = [new ActivityMember { MemberId = members[2].Id }]
            });
        }
        db.Activities.Add(new Activity { Title = "Byta däck på bilen", Date = today.AddDays(3), Points = 10, CategoryId = cats["Bil"].Id, Members = [new ActivityMember { MemberId = members[1].Id }] });
        db.Activities.Add(new Activity { Title = "Matlåda till utflykten", Date = today, CategoryId = cats["Mat"].Id });
        await db.SaveChangesAsync();
    }
}
