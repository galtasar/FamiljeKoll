# FamiljeKoll – UX- och designriktlinjer

## Känsla
Glad, varm och stilren – inte klinisk. Mycket vitt/ljust utrymme, färgglada accenter, rundade former, emoji/ikoner som ledtrådar.
Barn ska förstå utan att läsa mycket: bild + kort text.

## Layout och enheter
- **Mobile-first.** Brytpunkter: telefon (<600 px), platta (600–1200 px), dator/stor skärm (>1200 px).
- Telefon: nederkant-navigation (Idag · Vecka · Kommande · Inställningar), en dag i taget i veckovyn.
- Platta/dator: sidonavigation eller toppmeny, full veckokolumnvy. Stor skärm (hall/kök) ska vara läsbar på avstånd.
- Tryckytor minst 48×48 px. Inget som kräver hover.

## Färg och typografi
- Pastellbaserad palett med en stark primärfärg (förslag: korall/turkos/solgul); varje medlem och kategori har egen färg från en fast färgpalett (väljs, ingen fri hex-inmatning).
- Kontrast minst WCAG AA för text. Färg får aldrig vara enda informationsbärare – kombinera med emoji/ikon/text.
- Rund, vänlig typsnittsfamilj (t.ex. Nunito/Quicksand via self-host eller system-fallback), stora tydliga storlekar.
- Mörkt läge: ej i v1.

## Komponenter
- Aktivitetskort: kategori-emoji, titel, ansvarigas färgade avatarer, poäng (⭐), stor klar-ruta. Klart = överstruket/dämpat + liten ✔-animation.
- Försenat: varm röd/orange kant + texten "Försenad".
- Stor flytande "+"-knapp för ny aktivitet.
- Formulär med få fält; avancerat (upprepning, poäng, anteckning) i hopfällbar sektion.
- Bekräftelsedialog endast för raderingar; serieändring frågar "Bara denna / Denna och kommande".
- Tomma lägen med glad illustration/emoji och tydlig nästa handling.

## Språk
Svenska, korta meningar, du-tilltal. Veckodagar och månader med `sv-SE`. Måndag först.

## Tillgänglighet
Tangentbordsnavigering, synlig fokus, aria-etiketter på ikonknappar, respektera `prefers-reduced-motion`.

## Inspirationskällor
Cozi (färgkodade medlemmar), OurHome/S'moresUp (klar-markering + poäng), CareCalendar (enkel veckokalender, återkommande med "denna/alla").
Behåll det som är enkelt; hoppa över betalväggar, chatt och gamification-överdrifter.
