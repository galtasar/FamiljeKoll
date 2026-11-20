using FamiljeKoll.Service.Dtos;
using Microsoft.AspNetCore.Diagnostics;

namespace FamiljeKoll.Api;

public class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is ValidationFailedException)
        {
            ctx.Response.StatusCode = StatusCodes.Status400BadRequest;
            await ctx.Response.WriteAsJsonAsync(new { title = ex.Message, status = 400 }, ct);
            return true;
        }

        logger.LogError(ex, "Unhandled exception for {Path}", ctx.Request.Path);
        ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await ctx.Response.WriteAsJsonAsync(new { title = "Något gick fel.", status = 500 }, ct);
        return true;
    }
}
