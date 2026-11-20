# FamiljeKoll – Agentinstruktioner

Läs `docs/SPECIFICATION.md` (vad), `docs/GUARDRAILS.md` (förhållningsregler) och `docs/UX-GUIDELINES.md` (utseende) före arbete.

## Vad projektet är
Ett enkelt familjeverktyg för vardagsaktiviteter (enstaka och återkommande) kopplade till familjemedlemmar och kategorier.
Systerprojekt i anda till CareCalendar (`c:\git\dekiru\CareScheduler\CareCalendar`) – använd det som förebild för struktur, men inte för vårdspecifika delar.
**Nedskalat före funktionsrikt.** Bygg inte mer än vad som är beslutat.

## Arkitektur
Se strukturen i `docs/SPECIFICATION.md` §6. Standard layered: **Controller → Service → Repository**, hoppa aldrig över lager.
Entiteter ligger i Domain. DTO:er ligger i Service. EF Core code-first.

## Kommandon
```powershell
# Backend + DB + frontend lokalt (Aspire)
cd src\FamiljeKoll.AppHost; dotnet run
# Frontend ensamt
cd frontend\familjekoll-ui; npm install; npm run dev
# Tester
dotnet test FamiljeKoll.slnx
# Ny migration
dotnet ef migrations add <Namn> --project src/FamiljeKoll.Repository --startup-project src/FamiljeKoll.Api
```

## Konventioner
- **UI-text på svenska.** Kod, variabler, kommentarer och API-fält på engelska.
- Datum som `DateOnly`; veckan börjar på måndag; formatera med `sv-SE`.
- Enums serialiseras som strängar. Valideringsregler finns på servern, inte bara i frontend.
- Frontend: TypeScript strikt, Material UI (inte Tailwind), TanStack Query för serverdata, inga onödiga bibliotek.
- Kommentera endast där koden behöver förtydligas.
- Använd senaste **stabila** versioner av ramverk och paket; verifiera (`npm view`, nuget) innan pinning. Inga preview/RC.

## Gör inte
- Lägg inte till funktioner utanför specen (se "Ingår inte") utan att användaren beslutat det.
- Ta inte bort eller kringgå autentisering/allowlist.
- Checka inte in hemligheter, anslutningssträngar eller klient-hemligheter.
- Kör aldrig migreringar mot Azure-databaser själv; generera migration + uppdatera `sql-scripts/migrate.sql` och be användaren köra den.
- Använd inte engelska UI-strängar. Hoppa inte över lager.

## Definition of done
Tester tillagda/uppdaterade där relevant och gröna, migration genererad (ej körd) och `migrate.sql` uppdaterad, svensk UI-text, inga hemligheter i diffen,
fungerar på telefon/platta/dator, `docs/` uppdaterad om beslut ändrats.

## Git
- Git-användare: `dahl.micke@gmail.com`.
- Feature-branch `feature/<kort-beskrivning>` för ny funktionalitet; `master` endast för merge/hotfix.
- Pusha aldrig utan att användaren uttryckligen ber om det.
