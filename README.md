<p align="center">
  <a href="./docs/assets/neelegirly-preview.jpg">
    <img src="./docs/assets/neelegirly-preview.jpg" alt="OnimaiBot powered by Neelegirly" width="320" />
  </a>
</p>

<h1 align="center">OnimaiBot</h1>

<p align="center">
  Eine schöne, einfache und moderne <strong>WhatsApp Multi-Session Base</strong><br />
  für Menschen, die schnell starten wollen — ohne Chaos, ohne unnötigen Ballast und mit klarer Struktur.
</p>

<p align="center">
  <strong>Powered by Neelegirly</strong>
</p>

<p align="center">
  <a href="./docs/assets/neelegirly-preview.jpg"><strong>Bild in groß öffnen</strong></a>
</p>

<p align="center">
  <img alt="Node 20+" src="https://img.shields.io/badge/Node-20%2B-1f6feb?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="Powered by Neelegirly" src="https://img.shields.io/badge/Powered%20by-Neelegirly-ff00aa?style=for-the-badge" />
  <img alt="wa-api" src="https://img.shields.io/badge/@neelegirly-wa--api-7c3aed?style=for-the-badge" />
  <img alt="WhatsApp Multi Session" src="https://img.shields.io/badge/WhatsApp-Multi--Session-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img alt="PM2 Ready" src="https://img.shields.io/badge/PM2-ready-6d28d9?style=for-the-badge" />
</p>

---

## Warum dieses Repo?

`OnimaiBot` ist dafür gedacht, dass man **schnell versteht, schnell startet und sauber erweitern kann**.

Viele Starter-Bases sehen auf den ersten Blick stark aus, sind aber unnötig kompliziert. Diese hier geht bewusst den anderen Weg:

- klare Ordnerstruktur
- einfache Commands
- hübsche Konsole
- Multi-Session statt Einmal-Login
- PM2-ready für echte Nutzung
- verständlich genug für Einsteiger
- offen genug für Fortgeschrittene

Kurz gesagt: **weniger Frust, mehr Startklar.**

---

## Was du direkt bekommst

| Bereich | Enthalten |
|---|---|
| Einstieg | `main.js` als klarer Startpunkt |
| Sessions | echte Multi-Session mit `@neelegirly/wa-api` |
| Struktur | `Onicommands`, `events`, `components`, `utils`, `config` |
| Beispiel-Plugins | zusätzliche Beispiel-Commands direkt im Projekt |
| Interaktionen | Buttons, Menü und Text-Fallback |
| Betrieb | PM2-Unterstützung und Registry-Restore |
| Tests | Smoke-Tests für Loader und Utilities |
| Design | hübsche Startbox mit sauberer Terminal-Ausgabe |

---

## Plugin- & Modul-Stack

Hier ist alles so aufgebaut, dass es sich wie eine kleine Plugin-Base anfühlt: klare Module, saubere Verantwortlichkeiten und leicht erweiterbar.

| Modul / Paket | Zweck |
|---|---|
| `@neelegirly/wa-api` | steuert Sessions, Pairing, QR, Status und Lifecycle |
| `@neelegirly/baileys` | WhatsApp-Protokoll-Basis unter der Haube |
| `@neelegirly/libsignal` | Kryptografie und Signal-Unterbau |
| `@neelegirly/downloader` | Grundlage für Media- und Download-Workflows |
| `pm2` | stabiler Betrieb im Hintergrund |
| `dotenv` | einfache `.env`-Konfiguration |
| `chalk` + `boxen` | schönere Konsole und lesbare Status-Ausgabe |

Wenn du später mehr Funktionen willst, kannst du sehr einfach weitere Commands, Events oder eigene Utility-Module ergänzen.

---

## Für wen ist das gedacht?

Diese Base passt gut für dich, wenn du:

- einen WhatsApp-Bot sauber aufbauen willst
- mehrere Sessions nutzen möchtest
- nicht mit einem riesigen Monster-Projekt starten willst
- schnell Beispiele zum Kopieren und Umbauen brauchst
- eine öffentliche README möchtest, die andere sofort verstehen

---

## Schnellstart 🚀

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. `.env` vorbereiten

```bash
cp .env.example .env
```

### 3. Grundwerte setzen

```env
APP_NAME=OnimaiBaseV3
BOT_PREFIX=!
WHATSAPP_PRINT_QR=true
BOT_OWNER_NUMBERS=
WA_API_BOOTSTRAP_SESSIONS=main-session
WA_API_RETRY_LIMIT=10
ONIMAIBASEV3_DRY_RUN=false
```

### 4. Starten

```bash
npm start
```

Wenn `main-session` noch nicht gekoppelt ist, erscheint im Live-Modus der QR-Code direkt im Terminal.

---

## Extra einfach erklärt

Wenn du gerade erst anfängst, brauchst du eigentlich nur diese 3 Dinge zu wissen:

1. `npm install` installiert alles.
2. `.env` steuert Prefix, Sessions und Startmodus.
3. `npm start` bootet die Base.

Danach kannst du schon mit Commands arbeiten und den Rest Schritt für Schritt erweitern.

---

## Dry-Run für sicheres Testen

Wenn du erstmal nur prüfen willst, ob alles sauber lädt, ohne echte WhatsApp-Session:

```env
ONIMAIBASEV3_DRY_RUN=true
```

Dann kannst du sicher testen mit:

```bash
npm run build
npm test
npm start
```

In diesem Modus wird **kein echter Login** aufgebaut.

---

## Wichtige `.env`-Werte

| Variable | Bedeutung |
|---|---|
| `APP_NAME` | Anzeigename deiner App |
| `BOT_PREFIX` | Prefix für Commands, z. B. `!` |
| `WHATSAPP_PRINT_QR` | zeigt QR-Code im Terminal |
| `BOT_OWNER_NUMBERS` | Owner-Nummern, kommasepariert, ohne `+` |
| `WA_API_BOOTSTRAP_SESSIONS` | Sessions, die beim Start automatisch hochkommen |
| `WA_API_RETRY_LIMIT` | Retry-Anzahl beim Starten einer Session |
| `ONIMAIBASEV3_DRY_RUN` | sicherer Testmodus ohne echte Session |

> Wenn `BOT_OWNER_NUMBERS` leer ist, sind in dieser Starter-Base die Session-Commands offen. Für öffentliche oder produktive Nutzung solltest du diese Liste setzen.

---

## Commands im Alltag

Nach dem Start kannst du direkt mit diesen Befehlen arbeiten:

- `!ping`
- `!about`
- `!plugins`
- `!session-info`
- `!menu`
- `!sessions`
- `!session-start support`
- `!session-pair sales 491234567890`
- `!session-pause support`
- `!session-resume support`
- `!session-stop support`
- `!session-delete support`

### Was machen die wichtigsten Commands?

- `!ping` → schneller Statuscheck
- `!about` → kurze Projektübersicht mit Neelegirly-Branding
- `!plugins` → zeigt geladene Beispiel-Plugins, Commands und Module
- `!session-info` → zeigt aktuelle Session, Nutzer und Rechte
- `!menu` → zeigt die Starter-Demo mit Buttons und Menü
- `!sessions` → listet bekannte Sessions
- `!session-start` → startet oder reaktiviert eine Session per QR
- `!session-pair` → startet den Pairing-Code-Flow mit Telefonnummer

### Neue Beispiel-Plugins direkt im Projekt

Damit die Base nicht nur in der README nach „mehr Plugins“ aussieht, sind jetzt direkt im Projekt drei zusätzliche Beispiel-Commands eingebaut:

- `about.js` → einfache Projekt- und Stack-Info
- `plugins.js` → zeigt geladene Module und Command-Beispiele
- `session-info.js` → demonstriert sessionbezogene Antworten in einer Multi-Session-Base

Das sind bewusst gute Starter-Beispiele, die man leicht kopieren, umbauen oder erweitern kann.

### Wichtiger Pairing-Hinweis

Bei `wa-api` muss die Telefonnummer **direkt beim Pairing-Start** mitgegeben werden.

```text
!session-pair <session-id> <telefonnummer>
```

Beispiel:

```text
!session-pair support 491234567890
```

---

## PM2 & Produktion

Die Base ist bereits für PM2 vorbereitet.

```bash
npm run pm2:start
npm run pm2:restart
npm run pm2:stop
```

PM2-App-Name:

```text
OnimaiBaseV3
```

Standard-Session-Root:

```text
sessions_neelegirly/
```

Sessions mit gewünschtem Zustand `running` können beim Neustart wieder aus der Registry geladen werden. Genau das macht die Base angenehm für echte, längere Nutzung.

---

## Projektstruktur auf einen Blick

```text
OnimaiBot/
├── Onicommands/
│   ├── about.js
│   ├── menu.js
│   ├── ping.js
│   ├── plugins.js
│   ├── session-info.js
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

## Wo liegt was?

- `main.js` → offizieller Einstiegspunkt
- `core/OnimaiBaseV3Bot.js` → Start, Restore, Bootstrap und Runtime
- `Onicommands/` → Commands wie bei kleinen Plugins aufgebaut
- `Onicommands/about.js` → Projekt-Info und Branding-Beispiel
- `Onicommands/plugins.js` → Plugin-/Modul-Übersicht als Demo
- `Onicommands/session-info.js` → Beispiel für sessionbezogene Antworten
- `events/` → Listener für Nachrichten und Session-Zustände
- `components/` → Buttons und Menülogik
- `utils/` → Helper für WhatsApp, Multi-Session und Logging
- `config/` → `.env`-Parsing und Laufzeitkonfiguration
- `tests/` → schnelle Smoke-Tests

---

## Eigene Erweiterungen hinzufügen

Wenn du einen eigenen Command hinzufügen willst, lege einfach eine Datei in `Onicommands/` an:

```js
export default {
  name: 'hallo',
  aliases: ['hi'],
  description: 'Sagt hallo',
  async execute({ reply }) {
    await reply('Hallo von OnimaiBot 👋');
  }
};
```

So bleibt die Base einsteigerfreundlich, aber trotzdem offen für größere Projekte.

---

## Entwicklung & Checks

```bash
npm run build
npm test
```

Aktuell prüfen die Smoke-Tests unter anderem:

- Command-Loader
- Event-Loader
- Menü-Fallback
- Multi-Session-Utilities

---

## Troubleshooting

### Kein QR-Code erscheint?

- `ONIMAIBASEV3_DRY_RUN=false` setzen
- `WHATSAPP_PRINT_QR=true` prüfen
- notfalls `!session-start <id>` manuell nutzen

### Pairing-Code kommt nicht?

- vollständige Nummer als Ziffern verwenden
- Beispiel: `491234567890`
- `!session-pair <id> <telefonnummer>` exakt so senden

### PM2 startet, aber keine Session kommt hoch?

- prüfen, ob die Session vorher schon aktiv war
- `WA_API_BOOTSTRAP_SESSIONS` kontrollieren
- den Ordner `sessions_neelegirly/` nicht versehentlich löschen

---

## Sicherheit

- keine Secrets direkt im Code speichern
- `.env` lokal halten
- Session-Dateien und Registry mit Vorsicht behandeln
- für produktive Nutzung unbedingt `BOT_OWNER_NUMBERS` setzen

---

## Powered by Neelegirly

Dieses Projekt basiert auf dem Neelegirly-Stack rund um:

- `@neelegirly/wa-api`
- `@neelegirly/baileys`
- `@neelegirly/libsignal`
- `@neelegirly/downloader`

Wenn du eine WhatsApp-Basis suchst, die modern, modular und freundlich lesbar ist, bist du hier genau richtig.

---

Viel Spaß mit `OnimaiBot` 💜  
**Powered by Neelegirly**
