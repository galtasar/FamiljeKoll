using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FamiljeKoll.Repository;

// Used only by `dotnet ef` at design time; never connects to a database.
public class DesignTimeFactory : IDesignTimeDbContextFactory<FamiljeKollDbContext>
{
    public FamiljeKollDbContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<FamiljeKollDbContext>()
            .UseSqlServer("Server=localhost;Database=FamiljeKoll;Trusted_Connection=True;TrustServerCertificate=True")
            .Options);
}
