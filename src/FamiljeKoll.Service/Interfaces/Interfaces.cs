using FamiljeKoll.Domain.Models;
using FamiljeKoll.Service.Dtos;

namespace FamiljeKoll.Service.Interfaces;

public interface IMemberService
{
    Task<List<Member>> GetAllAsync(bool includeArchived);
    Task<Member> CreateAsync(SaveMemberDto dto);
    Task<Member?> UpdateAsync(Guid id, SaveMemberDto dto);
}

public interface ICategoryService
{
    Task<List<Category>> GetAllAsync();
    Task<Category> CreateAsync(SaveCategoryDto dto);
    Task<Category?> UpdateAsync(Guid id, SaveCategoryDto dto);
    Task<bool> DeleteAsync(Guid id);
}

public interface IActivityService
{
    Task<List<ActivityDto>> GetRangeAsync(DateOnly from, DateOnly to, Guid? memberId, Guid? categoryId);
    Task<List<ActivityDto>> GetUpcomingAsync(DateOnly? from);
    Task<List<ActivityDto>> CreateAsync(SaveActivityDto dto);
    Task<ActivityDto?> UpdateAsync(Guid id, SaveActivityDto dto);
    Task<List<ActivityDto>?> UpdateSeriesAsync(Guid id, SaveActivityDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> DeleteSeriesAsync(Guid id);
    Task<ActivityDto?> SetDoneAsync(Guid id, SetDoneDto dto);
    Task<List<MemberPointsDto>> GetPointsAsync(DateOnly? from, DateOnly? to);
    Task ExtendOpenEndedSeriesAsync();
}
