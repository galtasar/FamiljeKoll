using FamiljeKoll.Service.Interfaces;

namespace FamiljeKoll.Api;

// Keeps open-ended recurring series filled 12 months ahead.
public class SeriesExtensionWorker(IServiceScopeFactory scopes, ILogger<SeriesExtensionWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            var wait = TimeSpan.FromHours(12);
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<IActivityService>().ExtendOpenEndedSeriesAsync();
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Database may be paused/unavailable (e.g. Azure SQL free tier); retry soon.
                logger.LogWarning(ex, "Series extension failed; retrying in 10 minutes.");
                wait = TimeSpan.FromMinutes(10);
            }
            await Task.Delay(wait, stoppingToken);
        }
    }
}
