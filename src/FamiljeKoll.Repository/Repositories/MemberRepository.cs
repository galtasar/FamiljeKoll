using FamiljeKoll.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FamiljeKoll.Repository.Repositories;

public interface IMemberRepository
{
    Task<List<Member>> GetAllAsync(bool includeArchived);
    Task<Member?> GetByIdAsync(Guid id);
    Task<int> CountExistingAsync(IReadOnlyCollection<Guid> ids);
    Task AddAsync(Member member);
    Task DeleteAsync(Member member);
    Task SaveAsync();
}

public class MemberRepository(FamiljeKollDbContext db) : IMemberRepository
{
    public Task<List<Member>> GetAllAsync(bool includeArchived) =>
        db.Members.Where(m => includeArchived || !m.IsArchived)
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Name).ToListAsync();

    public Task<Member?> GetByIdAsync(Guid id) => db.Members.FirstOrDefaultAsync(m => m.Id == id);

    public Task<int> CountExistingAsync(IReadOnlyCollection<Guid> ids) =>
        db.Members.CountAsync(m => ids.Contains(m.Id) && !m.IsArchived);

    public async Task AddAsync(Member member)
    {
        db.Members.Add(member);
        await db.SaveChangesAsync();
    }

    // ActivityMember rows cascade; CompletedByMemberId has no FK so it is cleared explicitly.
    public async Task DeleteAsync(Member member)
    {
        await db.Activities.Where(a => a.CompletedByMemberId == member.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.CompletedByMemberId, (Guid?)null));
        db.Members.Remove(member);
        await db.SaveChangesAsync();
    }

    public Task SaveAsync() => db.SaveChangesAsync();
}
