using FamiljeKoll.Domain.Models;
using FamiljeKoll.Repository.Repositories;
using FamiljeKoll.Service.Dtos;
using FamiljeKoll.Service.Interfaces;

namespace FamiljeKoll.Service.Implementations;

public class MemberService(IMemberRepository members) : IMemberService
{
    public Task<List<Member>> GetAllAsync(bool includeArchived) => members.GetAllAsync(includeArchived);

    public async Task<Member> CreateAsync(SaveMemberDto dto)
    {
        var member = new Member();
        Apply(member, dto);
        await members.AddAsync(member);
        return member;
    }

    public async Task<Member?> UpdateAsync(Guid id, SaveMemberDto dto)
    {
        var member = await members.GetByIdAsync(id);
        if (member is null) return null;
        Apply(member, dto);
        await members.SaveAsync();
        return member;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var member = await members.GetByIdAsync(id);
        if (member is null) return false;
        await members.DeleteAsync(member);
        return true;
    }

    private static void Apply(Member m, SaveMemberDto dto)
    {
        m.Name = dto.Name.Trim();
        m.Color = dto.Color;
        m.SortOrder = dto.SortOrder;
        m.IsArchived = dto.IsArchived;
    }
}

public class CategoryService(ICategoryRepository categories) : ICategoryService
{
    public Task<List<Category>> GetAllAsync() => categories.GetAllAsync();

    public async Task<Category> CreateAsync(SaveCategoryDto dto)
    {
        var category = new Category();
        Apply(category, dto);
        await categories.AddAsync(category);
        return category;
    }

    public async Task<Category?> UpdateAsync(Guid id, SaveCategoryDto dto)
    {
        var category = await categories.GetByIdAsync(id);
        if (category is null) return null;
        Apply(category, dto);
        await categories.SaveAsync();
        return category;
    }

    // Activities keep existing but lose their category (FK is SET NULL).
    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await categories.GetByIdAsync(id);
        if (category is null) return false;
        await categories.DeleteAsync(category);
        return true;
    }

    private static void Apply(Category c, SaveCategoryDto dto)
    {
        c.Name = dto.Name.Trim();
        c.Color = dto.Color;
        c.SortOrder = dto.SortOrder;
    }
}
