# FamiljeKoll – Guardrails och förhållningsregler

## Produkt
1. **Enkelhet slår funktioner.** Varje ny funktion måste motiveras mot "kan ett barn använda det?". Vid tvekan: låt bli.
2. Ändra inte beslutad omfattning (`SPECIFICATION.md` §2) utan att fråga användaren. Fråga löpande om vägval.
3. Max två tryck för de vanligaste handlingarna (markera klar, lägga till aktivitet).

## Säkerhet och integritet
4. Appen är publik på internet och innehåller familjens (inkl. barns) namn och rutiner – behandla det som personuppgifter (GDPR).
5. Alla endpoints kräver autentisering **och** tillåten e-post (`Authorization:AllowedEmails`), förutom `/health`, `/alive` och `/api/public-config`.
6. Auth får aldrig stängas av i delad kod. Lokal dev-override endast via användarsecrets/`appsettings.Development.json` som inte checkas in.
7. Inga hemligheter i git (anslutningssträngar, OIDC-klienthemligheter). Lokalt: user-secrets. Azure: App Service-inställningar/Key Vault.
8. Validera all input på servern (längdgränser, färgformat, poäng 0–1000, datumintervall, existerande ids).
9. Endast HTTPS. Cookies `Secure`, `HttpOnly`, `SameSite=Lax`. CSRF-skydd om cookie-baserad auth används mot API.
10. Logga inte tokens, hemligheter eller personuppgifter i onödan. Använd syntetisk data i tester och exempel.
11. Håll beroenden uppdaterade; kör `dotnet list package --vulnerable` och `npm audit`, flagga fynd.

## Databas och migrationer
12. EF Core code-first. Varje modelländring ger en migration **och** uppdaterat `sql-scripts/migrate.sql` (idempotent).
13. **Agenten kör aldrig migrationer eller DDL/DML mot Azure-databaser.** Användaren gör det manuellt. Lokal dev-databas får auto-migreras.
14. Ändra aldrig en driftsatt databas direkt – alltid via migration.
15. Azure SQL (gratis) kan vara pausad vid första anrop: använd `EnableRetryOnFailure`.

## Kod
16. Controller → Service → Repository. Ingen affärslogik i controllers, ingen EF-kod utanför Repository.
17. Svensk UI-text, engelsk kod. Inga hårdkodade färger i komponenter – använd temat/palettvariabler.
18. Använd senaste stabila versioner; inga preview-paket. Dokumentera avvikelser i `docs/DECISIONS.md`.
19. Små, fokuserade ändringar. Inga orelaterade refaktoreringar.

## Test
20. Enhetstester för återkommande-generering (månadsklampning, slutdatum, rullande fönster), serieändring, poängberäkning.
21. Integrationstester för API och auth-skydd (oautentiserad → 401, ej tillåten e-post → 403).
22. Kör tester och bygg innan commit.

## Git
23. Git-användare `dahl.micke@gmail.com`. Feature-branches (`feature/<namn>`); `master` för merge/hotfix.
24. Commit-meddelanden korta och beskrivande; inkludera `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` när agenten committar.
25. **Pusha aldrig utan uttrycklig begäran.** Inga force-push, inga raderade grenar/taggar utan fråga.

## Destruktiva handlingar – fråga alltid först
Radera data, Azure-resurser, rotera nycklar, ändra brandväggsregler, skriva över filer användaren kan ha ändrat.

## Publicering
26. Ska kunna publiceras genom att publicera **ett projekt** (`FamiljeKoll.Api`) i Rider/CLI; frontend byggs in vid Release.
27. Användaren äger Azure-infrastrukturen; agenten skapar inga Azure-resurser.
