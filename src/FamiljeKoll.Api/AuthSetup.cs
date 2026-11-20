using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authorization;

namespace FamiljeKoll.Api;

public static class AuthSetup
{
    public const string FamilyPolicy = "FamilyMember";
    private static readonly string[] Providers = ["Google", "Microsoft"];

    public static bool IsAuthDisabled(IConfiguration config, IHostEnvironment env) =>
        env.IsDevelopment() && config.GetValue<bool>("Authentication:DisableAuth");

    public static void AddFamilyAuth(this WebApplicationBuilder builder)
    {
        var config = builder.Configuration;

        if (IsAuthDisabled(config, builder.Environment))
        {
            builder.Services.AddAuthentication(DisabledAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, DisabledAuthHandler>(DisabledAuthHandler.SchemeName, _ => { });
            builder.Services.AddAuthorization(o => o.AddPolicy(FamilyPolicy, p => p.RequireAssertion(_ => true)));
            return;
        }

        var auth = builder.Services.AddAuthentication(o =>
        {
            o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            o.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        }).AddCookie(o =>
        {
            o.Cookie.Name = "familjekoll.auth";
            o.Cookie.HttpOnly = true;
            o.Cookie.SameSite = SameSiteMode.Lax;
            o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            o.ExpireTimeSpan = TimeSpan.FromDays(30);
            o.SlidingExpiration = true;
            o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
            o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
        });

        if (config["Authentication:Google:ClientId"] is { Length: > 0 })
            auth.AddGoogle(o =>
            {
                o.ClientId = config["Authentication:Google:ClientId"]!;
                o.ClientSecret = config["Authentication:Google:ClientSecret"] ?? "";
            });

        if (config["Authentication:Microsoft:ClientId"] is { Length: > 0 })
            auth.AddMicrosoftAccount(o =>
            {
                o.ClientId = config["Authentication:Microsoft:ClientId"]!;
                o.ClientSecret = config["Authentication:Microsoft:ClientSecret"] ?? "";
            });

        builder.Services.AddSingleton<IAuthorizationHandler, FamilyHandler>();
        builder.Services.AddAuthorization(o => o.AddPolicy(FamilyPolicy, p => p
            .RequireAuthenticatedUser()
            .AddRequirements(new FamilyRequirement())));
    }

    public static HashSet<string> LoadAllowed(IConfiguration config) =>
        (config.GetSection("Authorization:AllowedEmails").Get<string[]>() ?? [])
            .Select(e => e.Trim().ToLowerInvariant()).Where(e => e.Length > 0).ToHashSet();

    public static bool IsAllowed(ClaimsPrincipal user, ISet<string> allowed) =>
        EmailOf(user) is { } email && allowed.Contains(email.ToLowerInvariant());

    public static string? EmailOf(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Email);

    public static void MapAuthEndpoints(this WebApplication app)
    {
        var config = app.Configuration;
        var disabled = IsAuthDisabled(config, app.Environment);

        // Anonymous: tells the frontend which login buttons to show.
        app.MapGet("/api/public-config", () => Results.Ok(new
        {
            providers = disabled ? Array.Empty<string>() : Providers.Where(p => config[$"Authentication:{p}:ClientId"] is { Length: > 0 }).ToArray(),
            authDisabled = disabled
        })).AllowAnonymous();

        app.MapGet("/api/me", (ClaimsPrincipal user, IConfiguration cfg) => Results.Ok(new
        {
            email = disabled ? "dev@localhost" : EmailOf(user),
            name = user.Identity?.Name ?? "Dev",
            allowed = disabled || IsAllowed(user, LoadAllowed(cfg))
        })).RequireAuthorization();

        if (disabled) return;

        app.MapGet("/auth/login/{provider}", (string provider, string? returnUrl) =>
        {
            var scheme = provider.ToLowerInvariant() switch
            {
                "google" => GoogleDefaults.AuthenticationScheme,
                "microsoft" => MicrosoftAccountDefaults.AuthenticationScheme,
                _ => null
            };
            if (scheme is null || config[$"Authentication:{(scheme == GoogleDefaults.AuthenticationScheme ? "Google" : "Microsoft")}:ClientId"] is not { Length: > 0 })
                return Results.NotFound();
            // Only local redirects, to avoid open redirects.
            var target = returnUrl is { Length: > 0 } && returnUrl.StartsWith('/') && !returnUrl.StartsWith("//") ? returnUrl : "/";
            return Results.Challenge(new AuthenticationProperties { RedirectUri = target }, [scheme]);
        }).AllowAnonymous();

        app.MapPost("/auth/logout", async (HttpContext ctx) =>
        {
            await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        }).RequireAuthorization();
    }
}

public class FamilyRequirement : IAuthorizationRequirement;

public class FamilyHandler(IConfiguration config) : AuthorizationHandler<FamilyRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, FamilyRequirement requirement)
    {
        if (AuthSetup.IsAllowed(context.User, AuthSetup.LoadAllowed(config)))
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}

// Local development only (Authentication:DisableAuth=true in Development).
public class DisabledAuthHandler(
    Microsoft.Extensions.Options.IOptionsMonitor<AuthenticationSchemeOptions> options,
    Microsoft.Extensions.Logging.ILoggerFactory logger,
    System.Text.Encodings.Web.UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "DevNoAuth";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Name, "Dev"), new Claim(ClaimTypes.Email, "dev@localhost")], SchemeName);
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }
}
