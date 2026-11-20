using System.Text.Json.Serialization;
using FamiljeKoll.Api;
using FamiljeKoll.Repository;
using FamiljeKoll.Repository.Repositories;
using FamiljeKoll.Service.Implementations;
using FamiljeKoll.Service.Interfaces;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();

builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    // Azure App Service terminates TLS in front of the app.
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

builder.AddFamilyAuth();

// Without Aspire there is no connection string; tell the developer how to get one instead of failing cryptically.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString) && builder.Environment.IsDevelopment())
    Console.WriteLine("WARNING: No ConnectionStrings:DefaultConnection. Start FamiljeKoll.AppHost (Docker) instead of the Api project, " +
                      "or set the connection string in appsettings.Development.json.");

builder.Services.AddDbContext<FamiljeKollDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        sql => sql.EnableRetryOnFailure(maxRetryCount: 6, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null)));

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddHostedService<SeriesExtensionWorker>();

builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Development only: auto-migrate and seed. Deployed databases are migrated manually (sql-scripts/migrate.sql).
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<FamiljeKollDbContext>();
        await db.Database.MigrateAsync();
        await DevDataSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Migration/seed failed - API starts but the database may be unavailable.");
    }
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapAuthEndpoints();
app.MapControllers();
app.Map("/api/{**rest}", () => Results.NotFound()).AllowAnonymous();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program { }
