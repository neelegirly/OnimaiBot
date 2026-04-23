# OnimaiBaseV3

`OnimaiBaseV3` ist jetzt bewusst **einfacher und schöner** aufgebaut: mit einer offiziellen `main.js`, einer hübschen Start-Konsole und einem klaren Command-Ordner namens `Onicommands`.

Direkt enthalten sind:

- offizielle `main.js` als Startpunkt
- schicke Konsole beim Start
- einfache WhatsApp-Beispiel-Commands
- Demo-Buttons und Mini-Menü mit Fallback
- `.env`-Support
- Logging und Error-Handling
- PM2-Konfiguration
- Dry-Run-Modus zum sicheren Testen ohne Live-Verbindung

## Voraussetzungen

- Node.js `>= 20.11`
- ein WhatsApp-Konto zum Scannen des QR-Codes

## Installation

1. In den Ordner `OnimaiBaseV3/` wechseln
2. Abhängigkeiten installieren
3. `.env` prüfen

Typischer Ablauf:

- `npm install`
- `.env` prüfen
- `npm start`

## .env einrichten

Die Datei `.env` ist bereits vorhanden. Standardmäßig startet das Projekt im sicheren Dry-Run-Modus.

Wichtige Variablen:

- `BOT_PREFIX` – Prefix für Text-Commands, Standard `!`
- `WHATSAPP_SESSION_DIR` – Ordner für die Session-Dateien, Standard `auth`
- `WHATSAPP_PRINT_QR` – QR-Code im Terminal anzeigen
- `ONIMAIBASEV3_DRY_RUN` – `true` für lokalen Test ohne WhatsApp-Verbindung, `false` für echten Login

Beispiel:

- `ONIMAIBASEV3_DRY_RUN=true` → prüft Loader, Commands und Komponenten ohne Verbindung
- `ONIMAIBASEV3_DRY_RUN=false` → erzeugt beim Start einen QR-Code für WhatsApp

## Lokal starten

### Entwicklungsmodus

- `npm run dev`

### Normaler Start

- `npm start`

### Validieren / Build-Check

- `npm run build`
- `npm test`

## PM2 starten

Die PM2-App heißt überall konsistent **OnimaiBaseV3**.

- `npm run pm2:start`
- `npm run pm2:restart`
- `npm run pm2:stop`

Vor dem PM2-Start solltest du `ONIMAIBASEV3_DRY_RUN=false` setzen, damit der Bot wirklich mit WhatsApp verbindet.

## Projektstruktur

```text
OnimaiBaseV3/
├── Onicommands/
├── components/
│   ├── buttons/
│   └── menus/
├── config/
├── core/
├── events/
├── handlers/
├── logs/
├── main.js
├── scripts/
├── tests/
├── utils/
├── .env
├── .env.example
├── .gitignore
├── ecosystem.config.cjs
├── index.js
├── jsconfig.json
└── package.json
```

## Wo liegt was?

- `main.js` – offizieller Einstieg und Startkonsole
- `Onicommands/` – einfache Beispiel-Commands wie `!ping` und `!menu`
- `events/` – WhatsApp-Verbindungs- und Nachrichten-Events
- `handlers/` – Loader für Commands, Komponenten und Events
- `components/buttons/` – Aktionen für Button-Klicks
- `components/menus/` – Aktionen für Listen-/Menü-Auswahl
- `config/` – Laufzeit-Konfiguration und `.env`-Parsing
- `utils/` – Hilfsfunktionen für Logger, Fehler und WhatsApp-Nachrichten
- `core/` – zentrale Bot-Klasse und Startlogik

## Demo direkt ausprobieren

1. `.env` auf `ONIMAIBASEV3_DRY_RUN=false` setzen
2. `npm start`
3. QR-Code mit WhatsApp scannen
4. dem Bot schreiben:

- `!ping`
- `!menu`

`!menu` zeigt:

- native WhatsApp-Buttons
- ein natives Menü / List Message
- zusätzlich ein Text-Fallback mit `1`, `2`, `3`

So bleibt die Base erstmal bewusst klein und leicht verständlich.

## Eigene Commands hinzufügen

Lege eine neue Datei in `Onicommands/` an:

```js
export default {
  name: 'hallo',
  aliases: [],
  description: 'Sagt hallo',
  async execute({ reply }) {
    await reply('Hallo aus OnimaiBaseV3!');
  }
};
```

## Eigene Buttons oder Menüs hinzufügen

1. `customId` definieren
2. Datei in `components/buttons/` oder `components/menus/` anlegen
3. dort `customId` und `execute()` exportieren
4. die ID in einer gesendeten WhatsApp-Interaktion verwenden

## Sicherheit

- Keine Secrets im Code hardcoden
- Session-Dateien liegen lokal im Ordner `auth/`
- `.env` ist in `.gitignore`
- Logs landen im Ordner `logs/`

## Hinweise für Einsteiger

- Der Dry-Run ist ideal, um Struktur und Loader ohne echte Verbindung zu prüfen
- Für eine frische Session bei Problemen den Ordner `auth/` löschen und neu scannen
- Die Demo verwendet zusätzlich Text-Fallbacks, damit die Base stabil bleibt

## Offizieller Startpunkt

Der Bot startet jetzt offiziell über:

- `main.js`

`index.js` ist nur noch ein kleiner Weiterleiter für Kompatibilität.

Viel Spaß beim Weiterbauen – die Base ist bewusst leichtgewichtig, damit man sie später unkompliziert erweitern kann.
