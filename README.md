# NFL-Fantasy-Cheatsheet

Ein browserbasiertes Tool für MFL-Fantasy-Football-Drafts.

## Features

- **Einstellungen**: Anzahl & Namen der Teams, Draftreihenfolge (inkl. Snake-Draft-Option), Keeper-Slots pro Team, vollständig konfigurierbare Scoring Settings (Passing, Rushing, Receiving, Kicking).
- **Spielerliste**: Alle NFL-QBs, RBs, WRs, TEs, Ks sowie alle 32 Team-Defenses, mit Projections und daraus berechneten Fantasy-Punkten nach deinen Scoring Settings. Filterbar nach Position, durchsuchbar nach Name, sortierbar nach jeder Statistik/Punktzahl. Ein Klick auf eine Zeile zeigt die Projection-Werte der einzelnen Quellen.
- **Draft-Modus**: Zeigt an, welches Team am Zug ist; ein Klick auf „Draften“ weist den Spieler dem Team zu und entfernt ihn aus der Liste. Picks lassen sich einzeln zurücknehmen (Undo) oder der gesamte Draft zurücksetzen.
- **CSV-Import**: Projections können jederzeit über CSV-Dateien aktualisiert/ergänzt werden (siehe Einstellungen → „Projections importieren“ für das erwartete Spaltenformat).

## Hinweis zum Startdatensatz

Die App wird mit einem Startdatensatz realer NFL-Spieler (Saison 2026, Stand Wissensstand des Modells) ausgeliefert. Da ein zuverlässiger Live-Abruf von fünf externen Projection-Anbietern ohne API-Zugriff nicht möglich ist, sind die Projections ein aus Depth-Chart-Tiers abgeleiteter Platzhalter-Konsens über 5 synthetische Quellen — kein echter, live gescrapter Wert. Rosterentscheidungen (Trades, Verletzungen, Backups) können zudem inzwischen veraltet sein.

Für exakte, aktuelle Werte: Projections deiner bevorzugten Anbieter (z. B. FantasyPros, ESPN, Yahoo, NFL.com, Sleeper) als CSV exportieren/aufbereiten und über den Import einspielen — das ersetzt oder ergänzt die Startdaten pro Spieler und Quelle.

## Entwicklung

```bash
npm install
npm run dev      # Dev-Server unter http://localhost:5173
npm run build    # Produktionsbuild nach dist/
```

Alle Einstellungen und der Draft-Fortschritt werden lokal im Browser (localStorage) gespeichert.
