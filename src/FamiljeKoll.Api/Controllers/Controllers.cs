using FamiljeKoll.Service.Dtos;
using FamiljeKoll.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FamiljeKoll.Api.Controllers;

[ApiController]
[Route("api/members")]
[Authorize(Policy = AuthSetup.FamilyPolicy)]
public class MembersController(IMemberService members) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeArchived = false) =>
        Ok(await members.GetAllAsync(includeArchived));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveMemberDto dto) => Ok(await members.CreateAsync(dto));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveMemberDto dto) =>
        await members.UpdateAsync(id, dto) is { } m ? Ok(m) : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) => await members.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api/categories")]
[Authorize(Policy = AuthSetup.FamilyPolicy)]
public class CategoriesController(ICategoryService categories) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await categories.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaveCategoryDto dto) => Ok(await categories.CreateAsync(dto));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveCategoryDto dto) =>
        await categories.UpdateAsync(id, dto) is { } c ? Ok(c) : NotFound();

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) => await categories.DeleteAsync(id) ? NoContent() : NotFound();
}

[ApiController]
[Route("api")]
[Authorize(Policy = AuthSetup.FamilyPolicy)]
public class ActivitiesController(IActivityService activities) : ControllerBase
{
    [HttpGet("activities")]
    public async Task<IActionResult> GetRange([FromQuery] DateOnly from, [FromQuery] DateOnly to,
        [FromQuery] Guid? memberId, [FromQuery] Guid? categoryId) =>
        Ok(await activities.GetRangeAsync(from, to, memberId, categoryId));

    [HttpGet("activities/upcoming")]
    public async Task<IActionResult> GetUpcoming([FromQuery] DateOnly? from) =>
        Ok(await activities.GetUpcomingAsync(from));

    [HttpPost("activities")]
    public async Task<IActionResult> Create([FromBody] SaveActivityDto dto) => Ok(await activities.CreateAsync(dto));

    [HttpPut("activities/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveActivityDto dto) =>
        await activities.UpdateAsync(id, dto) is { } a ? Ok(a) : NotFound();

    [HttpPut("activities/{id:guid}/series")]
    public async Task<IActionResult> UpdateSeries(Guid id, [FromBody] SaveActivityDto dto) =>
        await activities.UpdateSeriesAsync(id, dto) is { } list ? Ok(list) : NotFound();

    [HttpDelete("activities/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id) => await activities.DeleteAsync(id) ? NoContent() : NotFound();

    [HttpDelete("activities/{id:guid}/series")]
    public async Task<IActionResult> DeleteSeries(Guid id) =>
        await activities.DeleteSeriesAsync(id) ? NoContent() : NotFound();

    [HttpPatch("activities/{id:guid}/done")]
    public async Task<IActionResult> SetDone(Guid id, [FromBody] SetDoneDto dto) =>
        await activities.SetDoneAsync(id, dto) is { } a ? Ok(a) : NotFound();

    [HttpGet("points")]
    public async Task<IActionResult> GetPoints([FromQuery] DateOnly? from, [FromQuery] DateOnly? to) =>
        Ok(await activities.GetPointsAsync(from, to));
}
