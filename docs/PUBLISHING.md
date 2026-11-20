# Publicera FamiljeKoll

Hela appen (API + React-frontend) publiceras genom att publicera **ett projekt**: `src/FamiljeKoll.Api`.
En Release-build kör automatiskt `npm ci && npm run build` och publicerar frontenden som `wwwroot` (se `PublishFrontend` i `FamiljeKoll.Api.csproj`). Node.js (LTS) måste därför finnas installerat där du publicerar.

## Publicera i Rider
1. Högerklicka `FamiljeKoll.Api` → **Publish**.
2. Välj profilen **FolderProfile** (mapp) eller lägg till en **Azure App Service**-profil och välj din App Service.
3. Publicera. Mappalternativet hamnar i `src/FamiljeKoll.Api/bin/Release/net11.0/publish/` och kan zip-deployas.

Från terminal: `dotnet publish src/FamiljeKoll.Api -c Release -o publish`
(lägg till `-p:SkipFrontendBuild=true` om frontenden redan är byggd).

## Azure (du skapar resurserna)
- **App Service** (Windows eller Linux, .NET 11 – annars self-contained publicering eller .NET 10 fallback, se `DECISIONS.md`).
- **Azure SQL Database** (gratis-erbjudandet räcker). Första anropet efter paus kan vara långsamt; appen försöker om automatiskt.

### App Service → Environment variables
| Namn | Värde |
|---|---|
| `ConnectionStrings__DefaultConnection` | Anslutningssträng till Azure SQL (type: SQLAzure) |
| `Authorization__AllowedEmails__0`, `__1`, … | E-postadresser som får använda appen |
| `Authentication__Google__ClientId` / `__ClientSecret` | Från Google Cloud Console (valfritt) |
| `Authentication__Microsoft__ClientId` / `__ClientSecret` | Från Entra ID app registration (valfritt) |

Minst en inloggningsleverantör måste konfigureras. Redirect-URI:er:
- Google: `https://<din-app>.azurewebsites.net/signin-google`
- Microsoft: `https://<din-app>.azurewebsites.net/signin-microsoft`

`Authentication__DisableAuth` fungerar **bara** i Development och ska aldrig sättas i Azure.

### Databasmigrering (manuellt)
Produktionsdatabasen migreras aldrig automatiskt. Kör `sql-scripts/migrate.sql` (idempotent) mot Azure SQL, t.ex. i Azure Portal Query editor eller Rider Database-verktyget, **före** du publicerar en ny version som ändrar modellen.

Skapa ny migration och uppdatera skriptet:
```
dotnet dotnet-ef migrations add <Namn> --project src/FamiljeKoll.Repository --startup-project src/FamiljeKoll.Api
dotnet dotnet-ef migrations script --idempotent --project src/FamiljeKoll.Repository --startup-project src/FamiljeKoll.Api -o sql-scripts/migrate.sql
```

## Lokalt
- **Aspire:** kör `FamiljeKoll.AppHost` (kräver Docker för SQL Server). Startar API (utan inloggning) och Vite-frontenden; öppna `ui` i Aspire-dashboarden.
- **Manuellt:** starta API (`https`-profilen, port 5018/7227) och kör `npm run dev` i `frontend/familjekoll-ui`.
