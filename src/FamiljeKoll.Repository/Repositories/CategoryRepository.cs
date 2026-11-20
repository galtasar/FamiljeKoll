using FamiljeKoll.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace FamiljeKoll.Repository.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task AddAsync(Category category);
    Task DeleteAsync(Category category);
    Task SaveAsync();
}

public class CategoryRepository(FamiljeKollDbContext db) : ICategoryRepository
{
    public Task<List<Category>> GetAllAsync() =>
        db.Categories.OrderBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync();

    public Task<Category?> GetByIdAsync(Guid id) => db.Categories.FirstOrDefaultAsync(c => c.Id == id);

    public Task<bool> ExistsAsync(Guid id) => db.Categories.AnyAsync(c => c.Id == id);

    public async Task AddAsync(Category category)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Category category)
    {
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
    }

    public Task SaveAsync() => db.SaveChangesAsync();
}
