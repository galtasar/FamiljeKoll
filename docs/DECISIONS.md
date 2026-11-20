# FamiljeKoll – Beslutslogg

| # | Beslut | Motivering |
|---|---|---|
| 1 | Namn: **FamiljeKoll** | Användarens val |
| 2 | Backend: C# på senaste stabila .NET (**11.0**, GA/STS). Fallback .NET 10 LTS om verktyg/hosting saknar stöd | "Senaste stabila"; installerad SDK är bara 10.0.115 → installera 11 |
| 3 | Frontend: React 19 + TypeScript + Vite + MUI (versioner verifieras vid scaffold) | Samma stack som CareCalendar, känd och fungerande |
| 4 | Databas: Azure SQL Database (gratis-erbjudande), SQL Server-container lokalt | Relationsdata, EF Core, gratis i Azure; samma som CareCalendar |
| 5 | Inloggning: Google + Microsoft (OIDC) med e-post-allowlist | Slipper lösenordshantering; en familj per installation |
| 6 | Aspire AppHost + ServiceDefaults | Som CareCalendar; enkel lokal start av DB + API + frontend |
| 7 | Hosting: användaren skapar Azure App Service; vi levererar publicerbart Api-projekt med inbyggd frontend | Användarens önskemål |
| 8 | Vyer: Idag, Vecka, Kommande | Nedskalat; månadsvy utelämnad |
| 9 | Status: bara klar/inte klar; "försenad" är en visuell härledning | Enklast för barn |
| 10 | Ansvariga valfria (0..n medlemmar) | Aktiviteter kan gälla hela familjen |
| 11 | Återkommande: var N dag/vecka/månad + slutdatum, en rad per förekomst | Beprövat i CareCalendar; "varannan söndag" = Weeks, Interval 2 |
| 12 | Extra: endast poäng/belöning | Användarens val; övrigt (tid, påminnelser, listor, audit) utelämnas |
| 13 | En familj per installation | Enklast |
| 14 | Poäng ges till varje ansvarig vid klar (annars till den som markerade) – **antagande** | Enkelt och rättvist; bekräftas |
