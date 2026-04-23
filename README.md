<p align="center">
  <a href="./docs/assets/onimaibot-preview.jpg">
    <img src="./docs/assets/onimaibot-preview.jpg" alt="OnimaiBot Preview" width="260" />
  </a>
</p>

<h1 align="center">OnimaiBot</h1>

<p align="center">
  Eine schöne, einfache und direkt startbare <strong>WhatsApp-Bot-Base</strong><br />
  mit <strong>OnimaiBaseV3</strong>, <strong>main.js</strong>, <strong>Onicommands</strong> und einer hübschen Konsole.
</p>

<p align="center">
  <a href="./docs/assets/onimaibot-preview.jpg"><strong>Bild in groß öffnen</strong></a>
</p>

<p align="center">
  <img alt="Node 20+" src="https://img.shields.io/badge/Node-20%2B-1f6feb?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="WhatsApp Bot" src="https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img alt="PM2 Ready" src="https://img.shields.io/badge/PM2-ready-6d28d9?style=for-the-badge" />
  <img alt="Starter Friendly" src="https://img.shields.io/badge/Starter-friendly-f59e0b?style=for-the-badge" />
</p>

---

## Warum dieses Repo?

`OnimaiBot` soll nicht überladen sein, sondern **schön aussehen**, **leicht zu verstehen** sein und **direkt funktionieren**.

Du bekommst hier eine Base, die schon fertig vorbereitet ist für:

- WhatsApp-Bot mit Baileys
- klare Ordnerstruktur
- offizielle `main.js` als Einstieg
- einfacher Command-Ordner `Onicommands/`
- schöne Konsolen-Ausgabe beim Start
- Buttons, Menü und Fallback-Demo
- `.env`-Support
- PM2-Start
- Dry-Run für sicheres lokales Testen

---

## Features im Überblick

| Bereich | Enthalten |
|---|---|
| Einstieg | `main.js` |
| Commands | `Onicommands/` |
| Interaktionen | Buttons + Menü + Text-Fallback |
| Start-Konsole | Banner + Statusbox |
| Config | `.env`, `config/` |
| Logs | `logs/` |
| Prozessmanager | PM2 |
| Tests | Smoke-Test inklusive |

---

## Schnellstart 🚀

### 1. Projekt klonen oder herunterladen

```bash
git clone <DEIN-REPO-LINK> OnimaiBot
cd OnimaiBot
```

Oder einfach als ZIP herunterladen und entpacken.

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. `.env` anlegen

```bash
cp .env.example .env
```

### 4. Für echten WhatsApp-Login Dry-Run deaktivieren

Öffne `.env` und setze:

```env
ONIMAIBASEV3_DRY_RUN=false
```

### 5. Bot starten

```bash
npm start
```

Danach erscheint im Live-Modus ein QR-Code im Terminal, den du mit WhatsApp scannen kannst.

---

## Noch schneller testen

Wenn du erstmal **nur prüfen willst, ob alles korrekt bootet**, lass in der `.env` einfach diesen Wert aktiv:

```env
ONIMAIBASEV3_DRY_RUN=true
```

Dann kannst du direkt testen mit:

```bash
npm run build
npm test
npm start
```

In diesem Modus wird **keine echte WhatsApp-Verbindung** aufgebaut.

---

## Wichtige `.env`-Werte

| Variable | Bedeutung |
|---|---|
| `APP_NAME` | Anzeigename der App |
| `NODE_ENV` | Umgebung, z. B. `development` oder `production` |
| `LOG_LEVEL` | z. B. `info`, `warn`, `error` |
| `BOT_PREFIX` | Prefix für Text-Commands, Standard `!` |
| `WHATSAPP_SESSION_DIR` | Ordner für Session-Dateien |
| `WHATSAPP_PRINT_QR` | QR-Code im Terminal anzeigen |
| `ONIMAIBASEV3_DRY_RUN` | Trockentest ohne Live-Login |

---

## Projektstruktur

```text
OnimaiBot/
├── Onicommands/
│   ├── menu.js
│   └── ping.js
├── components/
│   ├── buttons/
│   └── menus/
├── config/
├── core/
├── docs/
│   └── assets/
│       └── onimaibot-preview.jpg
├── events/
├── handlers/
├── logs/
├── scripts/
├── tests/
├── utils/
├── .env
├── .env.example
├── .gitignore
├── ecosystem.config.cjs
├── index.js
├── jsconfig.json
├── main.js
├── package.json
└── package-lock.json
```

---

## Was liegt wo?

- `main.js` → offizieller Einstiegspunkt
- `index.js` → kleiner Weiterleiter für Kompatibilität
- `Onicommands/` → einfache Beispiel-Commands
- `events/` → WhatsApp-Verbindung und Nachrichtenverarbeitung
- `components/` → Buttons und Menü-Handler
- `config/` → App- und Env-Konfiguration
- `utils/` → Logger, WhatsApp-Helfer, Fehler-Utilities
- `tests/` → Smoke-Test für die Base
- `docs/assets/` → Bilder und GitHub-Assets

---

## Beispiel-Commands

Nach erfolgreichem Start kannst du dem Bot schreiben:

- `!ping`
- `!menu`

### `!ping`

Gibt einen schnellen Status zurück.

### `!menu`

Zeigt:

- zwei Buttons
- ein kleines Menü
- einen Fallback per `1`, `2`, `3`

So bleibt die Base einsteigerfreundlich und funktioniert auch dann noch gut, wenn ein Client keine nativen Interaktionen perfekt darstellt.

---

## Eigene Commands hinzufügen

Lege eine neue Datei in `Onicommands/` an:

```js
export default {
  name: 'hallo',
  aliases: [],
  description: 'Sagt hallo',
  async execute({ reply }) {
    await reply('Hallo aus OnimaiBot!');
  }
};
```

---

## PM2 Start

Die App ist direkt für PM2 vorbereitet.

```bash
npm run pm2:start
npm run pm2:restart
npm run pm2:stop
```

PM2-App-Name:

```text
OnimaiBaseV3
```

---

## Entwicklung & Qualität

Zum Prüfen der Base:

```bash
npm run build
npm test
```

Die Base wurde bewusst so gebaut, dass sie:

- schnell verständlich ist
- sauber strukturiert ist
- leicht erweitert werden kann
- für Einsteiger nicht unnötig kompliziert wirkt

---

## Sicherheit

- Keine Tokens oder Secrets im Code speichern
- Session-Dateien landen lokal im Ordner `auth/`
- `.env` ist in `.gitignore`
- Bei Problemen kannst du den Session-Ordner löschen und neu scannen

---

## Troubleshooting

### Kein QR-Code erscheint?

- prüfe, ob `ONIMAIBASEV3_DRY_RUN=false` gesetzt ist
- prüfe, ob `WHATSAPP_PRINT_QR=true` gesetzt ist
- starte den Bot danach neu

### Bot verbindet nicht sauber?

- lösche testweise den Ordner `auth/`
- starte den Bot erneut
- scanne den QR-Code neu

### Nur Boot testen?

- `ONIMAIBASEV3_DRY_RUN=true` setzen

---

## Für GitHub schön vorbereitet

Diese README ist so aufgebaut, dass Besucher direkt sehen:

- was das Projekt ist
- wie man es installiert
- wie man es startet
- wo die wichtigsten Dateien liegen
- wie die ersten Beispiel-Funktionen aussehen

Kurz gesagt: **Repository öffnen, lesen, installieren, loslegen.**

---

Viel Spaß mit `OnimaiBot` 💜
