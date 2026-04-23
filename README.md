<p align="center">
  <a href="./docs/assets/onimaibot-preview.jpg">
    <img src="./docs/assets/onimaibot-preview.jpg" alt="OnimaiBot Preview" width="260" />
  </a>
</p>

<h1 align="center">OnimaiBot</h1>

<p align="center">
  Eine hübsche, schlanke und direkt startbare <strong>WhatsApp Multi-Session Base</strong><br />
  mit <strong>@neelegirly/wa-api</strong>, <strong>PM2</strong>, <strong>main.js</strong> und <strong>Onicommands</strong>.
</p>

<p align="center">
  <a href="./docs/assets/onimaibot-preview.jpg"><strong>Bild in groß öffnen</strong></a>
</p>

<p align="center">
  <img alt="Node 20+" src="https://img.shields.io/badge/Node-20%2B-1f6feb?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="wa-api" src="https://img.shields.io/badge/@neelegirly-wa--api-7c3aed?style=for-the-badge" />
  <img alt="WhatsApp Multi Session" src="https://img.shields.io/badge/WhatsApp-Multi--Session-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img alt="PM2 Ready" src="https://img.shields.io/badge/PM2-ready-6d28d9?style=for-the-badge" />
</p>

---

## Warum dieses Repo?

`OnimaiBot` soll direkt Spaß machen: sauber, verständlich, PM2-tauglich und bereit für mehrere WhatsApp-Sessions.

Du bekommst hier eine Basis, die bereits vorbereitet ist für:

- `@neelegirly/wa-api` Multi-Session Lifecycle
- `loadSessionsFromStorage()` für PM2-Warm-Restarts
- QR-Start **und** Pairing-Code-Start
- hübsche Start-Konsole mit Statusbox
- einfache `Onicommands/`-Struktur
- Buttons, Menü und Text-Fallback
- Dry-Run für sichere lokale Checks

---

## Stack

| Paket | Version |
|---|---:|
| `@neelegirly/wa-api` | `1.8.4` |
| `@neelegirly/baileys` | `2.2.18` |
| `@neelegirly/libsignal` | `1.0.28` |
| `@neelegirly/downloader` | `0.1.65` |

---

## Schnellstart 🚀

### 1. Installieren

```bash
npm install
```

### 2. `.env` vorbereiten

```bash
cp .env.example .env
```

Empfohlene Startwerte:

```env
APP_NAME=OnimaiBaseV3
BOT_PREFIX=!
WHATSAPP_PRINT_QR=true
BOT_OWNER_NUMBERS=
WA_API_BOOTSTRAP_SESSIONS=main-session
WA_API_RETRY_LIMIT=10
ONIMAIBASEV3_DRY_RUN=false
```

### 3. Bot starten

```bash
npm start
```

Wenn `main-session` noch nicht gekoppelt ist, erscheint der QR-Code direkt im Terminal.

---

## Dry-Run

Wenn du nur prüfen willst, ob Loader, Commands, Events und Config sauber booten:

```env
ONIMAIBASEV3_DRY_RUN=true
```

Dann kannst du gefahrlos testen mit:

```bash
npm run build
npm test
npm start
```

In diesem Modus wird **keine echte Session** gestartet.

---

## Wichtige `.env`-Werte

| Variable | Bedeutung |
|---|---|
| `APP_NAME` | Anzeigename der App |
| `BOT_PREFIX` | Prefix für Text-Commands, Standard `!` |
| `WHATSAPP_PRINT_QR` | QR-Code bei QR-Start im Terminal anzeigen |
| `BOT_OWNER_NUMBERS` | Kommagetrennte Liste erlaubter Owner-Nummern ohne `+` |
| `WA_API_BOOTSTRAP_SESSIONS` | Sessions, die beim Start automatisch hochgezogen werden |
| `WA_API_RETRY_LIMIT` | Retry-Limit für `startSession()` |
| `ONIMAIBASEV3_DRY_RUN` | Trockentest ohne echte Session-Starts |

> Wenn `BOT_OWNER_NUMBERS` leer bleibt, dürfen in dieser Starter-Base alle Nutzer die Session-Commands verwenden. Für produktive Nutzung solltest du die Liste setzen.

---

## Multi-Session Befehle

Nach dem Start kannst du dem Bot unter anderem schreiben:

- `!ping`
- `!menu`
- `!sessions`
- `!session-start support`
- `!session-pair sales 491234567890`
- `!session-pause support`
- `!session-resume support`
- `!session-stop support`
- `!session-delete support`

### Pairing-Hinweis

Bei `wa-api` muss die Telefonnummer **direkt beim Pairing-Start** mitgegeben werden. Deshalb erwartet `!session-pair` immer:

```text
!session-pair <session-id> <telefonnummer>
```

---

## PM2 Start

Die Base ist für PM2 vorbereitet. Sessions, deren gewünschter Zustand auf `running` steht, werden beim Neustart wieder aus der Registry geladen.

```bash
npm run pm2:start
npm run pm2:restart
npm run pm2:stop
```

PM2-App-Name:

```text
OnimaiBaseV3
```

Standard-Session-Root der wa-api Registry:

```text
sessions_neelegirly/
```

---

## Projektstruktur

```text
OnimaiBot/
├── Onicommands/
│   ├── menu.js
│   ├── ping.js
│   ├── sessions.js
│   ├── session-start.js
│   ├── session-pair.js
│   ├── session-pause.js
│   ├── session-resume.js
│   ├── session-stop.js
│   └── session-delete.js
├── components/
├── config/
├── core/
├── docs/assets/
├── events/
├── handlers/
├── logs/
├── scripts/
├── tests/
├── utils/
├── .env.example
├── ecosystem.config.cjs
├── main.js
└── package.json
```

---

## Was liegt wo?

- `main.js` → offizieller Einstiegspunkt
- `core/OnimaiBaseV3Bot.js` → Start, Restore, Bootstrap und Runtime
- `Onicommands/` → Beispiel-Commands inkl. Session-Lifecycle
- `events/` → wa-api Listener für Nachrichten und Session-Status
- `utils/multisession.js` → Session-Helfer, Owner-Checks und Formatierung
- `components/` → Buttons und Menü-Demos

---

## Entwicklung & Checks

```bash
npm run build
npm test
```

Die Smoke-Tests prüfen unter anderem:

- Command- und Event-Lader
- Demo-Menü-Fallback
- Multi-Session-Utils

---

## Troubleshooting

### Kein QR-Code erscheint?

- `ONIMAIBASEV3_DRY_RUN=false` setzen
- `WHATSAPP_PRINT_QR=true` prüfen
- `!session-start <id>` verwenden, falls keine Bootstrap-Session gesetzt ist

### Pairing-Code kommt nicht?

- `!session-pair <id> <telefonnummer>` mit vollständiger Nummer nutzen
- Nummer nur als Ziffern schicken, z. B. `491234567890`

### PM2 startet, aber keine Session kommt hoch?

- prüfen, ob die Session zuvor wirklich gestartet war
- `WA_API_BOOTSTRAP_SESSIONS` kontrollieren
- `sessions_neelegirly/` nicht versehentlich löschen

---

## Sicherheit

- keine Tokens oder Secrets im Code speichern
- `.env` bleibt lokal
- Session-Dateien und Registry nicht unbedacht weitergeben
- für produktive Bots `BOT_OWNER_NUMBERS` setzen

---

Viel Spaß mit `OnimaiBot` 💜
