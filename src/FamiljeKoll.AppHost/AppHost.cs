var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .WithDataVolume("familjekoll-sqlserver-data")
    .WithLifetime(ContainerLifetime.Persistent);
var db = sql.AddDatabase("DefaultConnection", "FamiljeKoll");

var api = builder.AddProject<Projects.FamiljeKoll_Api>("api")
    .WithReference(db)
    .WaitFor(db)
    .WithExternalHttpEndpoints();

builder.AddViteApp("ui", "../../frontend/familjekoll-ui")
    .WithReference(api);

builder.Build().Run();
