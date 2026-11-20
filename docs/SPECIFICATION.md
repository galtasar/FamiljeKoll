# FamiljeKoll – Specifikation

## 1. Syfte
Ett enkelt, glatt verktyg för en familjs vardag: "vem ska göra vad, och när". Det ersätter lappen på kylskåpet.
Exempel: vattna blommor varannan söndag, städa badrummet varje vecka, byta däck (enstaka), ta med matlåda till utflykten.

**Principer:** nedskalat före funktionsrikt. Ett barn ska klara det utan förklaring. Fungerar på telefon, platta/skärm och dator.
Inspirerat av CareCalendar (veckokalender, återkommande uppgifter) men varmare och mer färgglatt, och utan rum/vårdkoppling.

## 2. Omfattning

### Ingår (v1)
- Aktiviteter: enstaka eller återkommande, med datum, titel, valfri anteckning.
- Ansvariga: noll, en, flera eller hela familjen (ingen vald = gäller alla/ingen särskild).
- Kategorier: skapa, ändra, ta bort i appen. Har namn, färg och emoji.
- Familjemedlemmar: skapa, ändra, arkivera. Har namn, färg och emoji/avatar.
- Status: **klar / inte klar**. Aktivitet vars datum passerat och som inte är klar visas som "försenad" (endast visuellt, lagras inte).
- Poäng: aktivitet har valfria poäng (0 = inga). Poäng räknas per medlem.
- Vyer: **Idag**, **Vecka** (mån–sön), **Kommande** (lista).
- Inga filter (medvetet borttagna för enkelhetens skull).
- Inloggning med Google eller Microsoft; endast tillåtna e-postadresser får in.

### Ingår inte (medvetet)
Flera familjer, tid på dagen, påminnelser/notiser, månadsvy, delade listor (inköp), chatt, historik/audit, filuppladdning,
integrationer med externa kalendrar, egna inloggningar för barn. Läggs till först efter uttryckligt beslut.

## 3. Domänmodell

| Entitet | Fält |
|---|---|
| `Member` | Id (GUID), Name, Color, Emoji, SortOrder, IsArchived |
| `Category` | Id (GUID), Name, Color, Emoji, SortOrder |
| `Activity` | Id (GUID), Title, Notes?, Date (DateOnly), IsDone, DoneAt?, CompletedByMemberId?, Points (int ≥ 0), CategoryId?, RecurringPatternId? |
| `ActivityMember` | ActivityId, MemberId (många-till-många) |
| `RecurringPattern` | Id (GUID), Frequency (`Days`/`Weeks`/`Months`), Interval (≥ 1), EndDate? |

### Återkommande aktiviteter
- Varje förekomst lagras som egen `Activity`-rad med gemensamt `RecurringPatternId`, så varje förekomst har egen klar-status.
- Skapa serie: första förekomst = valt startdatum; resten genereras fram till slutdatum. Utan slutdatum genereras ett rullande fönster (förslag: 12 månader framåt) som förlängs vid behov.
- Ändra/ta bort: UI frågar **"Bara denna"** eller **"Denna och kommande"**.
- Exempel "varannan söndag" = Frequency `Weeks`, Interval 2, startdatum en söndag.
- Månadsintervall på dag 29–31 klampas till månadens sista dag.

### Poäng
- När en aktivitet markeras klar får **varje ansvarig** aktivitetens poäng. Utan ansvarig får den som markerade klar (`CompletedByMemberId`) poängen.
- Ångrar man "klar" dras poängen tillbaka (poäng beräknas från klara aktiviteter, lagras inte separat).
- Poängöversikt per medlem: denna vecka och totalt.
- *Antagande, bekräftas vid granskning.*

## 4. API (skiss)
```
GET/POST/PUT/DELETE  /api/members
GET/POST/PUT/DELETE  /api/categories           (borttagning: aktiviteter behåller kategori = null)
GET   /api/activities?from=&to=&memberId=&categoryId=
GET   /api/activities/upcoming
POST  /api/activities                          (enstaka eller serie)
PUT   /api/activities/{id}                     DELETE /api/activities/{id}
PUT   /api/activities/{id}/series              DELETE /api/activities/{id}/series   (denna och kommande)
PATCH /api/activities/{id}/done                { isDone, completedByMemberId? }
GET   /api/points?from=&to=
GET   /api/public-config                       (anonym; OIDC-inställningar för frontend)
GET   /health, /alive                          (anonyma)
```
Alla övriga endpoints kräver autentisering och tillåten e-post. Servervalidering av all input.

## 5. Vyer och flöden
- **Idag (startsida):** dagens aktiviteter som stora kort med medlemsfärg, kategori-emoji och stor klar-knapp. Försenade överst.
- **Vecka:** sju kolumner (mån–sön) på dator/platta; på telefon en dag i taget med svep/pilar. Navigering: förra/nästa vecka + "Idag".
- **Kommande:** kronologisk lista, grupperad per dag.
- **Ny aktivitet:** stor "+"-knapp. Formulär: titel, datum, ansvariga (medlemschips; ingen vald = alla), kategori, upprepning (Aldrig/Var N dag/vecka/månad + slutdatum), poäng, anteckning.
- **Klar-markering:** ett tryck. Om flera ansvariga eller ingen: fråga "Vem gjorde det?" bara när poäng > 0 och det behövs.
- **Inställningar:** Familjemedlemmar, Kategorier, Poäng.
- Språk i UI: svenska. Kod, variabler och API-fält: engelska.

## 6. Teknik
| Del | Val |
|---|---|
| Backend | C# / .NET 11 (senaste stabila; fallback .NET 10 LTS vid problem), ASP.NET Core controllers, EF Core |
| Databas | Azure SQL Database (gratis-erbjudande); lokalt SQL Server-container via Aspire |
| Frontend | React 19, TypeScript, Vite, Material UI (eget färgglatt tema), TanStack Query, react-router, dayjs |
| Orkestrering lokalt | .NET Aspire (AppHost + ServiceDefaults) |
| Inloggning | OpenID Connect med Google och Microsoft; e-post-allowlist i konfiguration |
| Tester | xUnit (enhet + integration), ev. Vitest |
| Solution | `FamiljeKoll.slnx` (mapparna `/src/` och `/tests/`), öppnas i Rider |

### Lagerstruktur
```
src/
  FamiljeKoll.Api              Controllers, auth, serverar byggd frontend (publiceras som ett projekt)
  FamiljeKoll.Service          Affärslogik (återkommande, poäng)
  FamiljeKoll.Domain           Entiteter och enums
  FamiljeKoll.Repository       EF Core, migrationer
  FamiljeKoll.AppHost          Aspire (lokal utveckling)
  FamiljeKoll.ServiceDefaults  Telemetri, health, resiliens
frontend/familjekoll-ui        React-appen
tests/                         Enhets- och integrationstester
docs/                          Dessa dokument
sql-scripts/migrate.sql        Idempotent migreringsscript (körs manuellt)
```

## 7. Publicering
- Api-projektet bygger frontend vid `Release` (`npm ci && npm run build` → `wwwroot`) så att **Publicera på Api-projektet i Rider** ger en komplett app.
- Användaren skapar Azure App Service själv; konfiguration (anslutningssträng, OIDC-klienter, tillåtna e-postadresser) sätts som App Service-inställningar.
- Se `docs/PUBLISHING.md` (skapas under bygget).

## 8. Öppna punkter
- Poängmodellen enligt ovan – bekräfta.
- Villkor/begränsningar för Azure SQL gratis-erbjudandet (autopaus ger långsam första förfrågan → retry).
- Bekräfta .NET 11-stöd i installerad Rider och på vald App Service-plan.
