using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using FamiljeKoll.Repository;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FamiljeKoll.Api.IntegrationTests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _conn = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _conn.Open();
        builder.UseEnvironment("Production");
        builder.ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = "Server=unused",
            ["Authorization:AllowedEmails:0"] = "familj@example.com",
            ["Authentication:Google:ClientId"] = "test-client",
            ["Authentication:Google:ClientSecret"] = "test-secret",
        }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<FamiljeKollDbContext>>();
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<FamiljeKollDbContext>));
            services.AddDbContext<FamiljeKollDbContext>(o => o.UseSqlite(_conn));
            services.AddAuthentication().AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
            services.PostConfigure<AuthenticationOptions>(o => o.DefaultScheme = "Test");
            services.RemoveAll<Microsoft.Extensions.Hosting.IHostedService>();
        });
    }

    public HttpClient ClientFor(string? email)
    {
        using (var scope = Services.CreateScope())
            scope.ServiceProvider.GetRequiredService<FamiljeKollDbContext>().Database.EnsureCreated();
        var client = CreateClient();
        if (email is not null) client.DefaultRequestHeaders.Add("X-Test-Email", email);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _conn.Dispose();
    }
}

public class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> o, ILoggerFactory l, UrlEncoder e)
    : AuthenticationHandler<AuthenticationSchemeOptions>(o, l, e)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Test-Email", out var email))
            return Task.FromResult(AuthenticateResult.NoResult());
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Email, email.ToString()), new Claim(ClaimTypes.Name, "Test")], "Test");
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), "Test")));
    }
}

public class AuthAndApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Theory]
    [InlineData("/api/activities?from=2026-01-01&to=2026-01-07")]
    [InlineData("/api/members")]
    [InlineData("/api/categories")]
    [InlineData("/api/points")]
    public async Task Anonymous_IsUnauthorized(string url)
    {
        var res = await factory.ClientFor(null).GetAsync(url);
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task EmailNotOnAllowlist_IsForbidden()
    {
        var res = await factory.ClientFor("stranger@example.com").GetAsync("/api/members");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task PublicConfig_IsAnonymousAndListsConfiguredProviders()
    {
        var res = await factory.ClientFor(null).GetAsync("/api/public-config");
        res.EnsureSuccessStatusCode();
        Assert.Contains("Google", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task AllowedUser_SeesSeededCategories_AndCanCreateActivity()
    {
        var client = factory.ClientFor("Familj@Example.com");
        var cats = await client.GetFromJsonAsync<List<System.Text.Json.JsonElement>>("/api/categories");
        Assert.Equal(7, cats!.Count);

        var res = await client.PostAsJsonAsync("/api/activities", new { title = "Byta däck", date = DateOnly.FromDateTime(DateTime.Today).ToString("yyyy-MM-dd"), points = 10 });
        res.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task InvalidInput_ReturnsBadRequest()
    {
        var client = factory.ClientFor("familj@example.com");
        var res = await client.PostAsJsonAsync("/api/members", new { name = "", color = "red", emoji = "x" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }
}
