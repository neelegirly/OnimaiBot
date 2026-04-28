<p align="center">
  <a href="https://github.com/neelegirly/OnimaiBot">
    <img src="./docs/assets/neelegirly-preview.png" alt="OnimaiBot powered by Neelegirly" width="88%" />
  </a>
</p>

<h1 align="center">OnimaiBase · WhatsApp-only mit <code>Onimai.js</code></h1>

<p align="center">
  Eine moderne, zentrale WhatsApp-Bot-Basis mit aktuellem <strong>@neelegirly</strong>-Stack, Welcome-System,
  Profilen, Owner-Tools und Multi-Session-Steuerung – bewusst kompakt und ohne Discord-Ballast.
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="WhatsApp Only" src="https://img.shields.io/badge/Platform-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img alt="Neelegirly Stack" src="https://img.shields.io/badge/Stack-%40neelegirly-8A2BE2?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

## Warum diese Base?

`OnimaiBase` ist keine verstreute Plugin-Wüste, sondern eine bewusst zentral gehaltene WhatsApp-Basis.
Die Kernlogik lebt in **`Onimai.js`**. Genau das macht die Base leichter zu verstehen, schneller zu warten und einfacher auf GitHub sauber zu halten.

Das Ziel ist simpel:

- **WhatsApp-only** statt Mischbetrieb mit Discord oder Fremd-Bridge-Logik
- **eine zentrale Runtime** statt zehn verstreuter Einstiegspunkte
- **moderne Neelegirly-Pakete** statt halb-alter Legacy-Abhängigkeiten
- **direkt nutzbare Commands** für Alltag, Gruppen, Owner und Sessions

## Was du direkt bekommst

| Bereich | Inhalt |
| --- | --- |
| Runtime | zentrale Bot-Logik in `Onimai.js` |
| Sessions | Start, Pairing, Pause, Resume, Stop, Delete per Command |
| Gruppen | `tagall`, `groupinfo`, Welcome-/Goodbye-Steuerung |
| User | `register`, `me`, XP/Level-Basis |
| Owner | `owner`, `ownercontact`, `setprefix` |
| Diagnose | `ping`, `uptime`, `stats`, `session-info` |
| Qualität | `smoke.test.js`, `node --check`, `.env.example`, `.gitignore` |

## Aktueller Stack

Diese Base ist auf den aktuellen WhatsApp-Flow mit dem **@neelegirly**-Ökosystem ausgelegt:

- `@neelegirly/wa-api`
- `@neelegirly/baileys`
- `@neelegirly/libsignal`
- `@neelegirly/downloader`
- `lowdb`
- `dotenv`
- `chalk`
- `boxen`
- `pm2`

## Schnellstart

1. Abhängigkeiten installieren
2. `.env` auf Basis von `.env.example` anpassen
3. `owner.json` prüfen
4. Bot starten

Wichtige Umgebungsvariablen:

- `APP_NAME`
- `BOT_PREFIX`
- `WHATSAPP_PRINT_QR`
- `BOT_OWNER_NUMBERS`
- `WA_API_BOOTSTRAP_SESSIONS`
- `WA_API_RETRY_LIMIT`
- `ONIMAIBOT_DRY_RUN`

## Commands im Alltag

### Allgemein

- `!menu` – Menü
- `!help` – ausführliche Hilfe
- `!ping` – schneller Lebenszeichen-Check
- `!uptime` – Laufzeit, Bootzeit, Counter
- `!about` – Stack- und Projektinfo
- `!plugins` – eingebaute Features
- `!stats` – Runtime-Zahlen
- `!prefix` – aktiven Prefix anzeigen

### Profil & Owner

- `!register <Name>` – registriert den Nutzer
- `!me` – zeigt dein Profil
- `!owner` – Owner-Hilfe
- `!ownercontact` – Owner-Kontakt anzeigen
- `!setprefix <neu>` – Prefix ändern *(Owner-only)*

### Gruppen

- `!tagall` – markiert alle Gruppenmitglieder
- `!groupinfo` – zeigt Gruppeninfos und wenn möglich Gruppenbild
- `!welcome on|off|status|preview` – Welcome-System steuern
- `!welcome set <Text>` – eigenen Welcome-Text setzen
- `!welcome setbye <Text>` – Goodbye-Text setzen

### Multi-Session

- `!sessions`
- `!session-info`
- `!session-start <sessionId>`
- `!session-pair <sessionId> <nummer>`
- `!session-pause <sessionId>`
- `!session-resume <sessionId>`
- `!session-stop <sessionId>`
- `!session-delete <sessionId>`

> Der Prefix ist standardmäßig `!`, kann aber per Config oder mit `setprefix` geändert werden.

## Was in dieser Version modernisiert wurde

- Einstieg von **`Mainonimai.js`** auf **`Onimai.js`** umgestellt
- Hilfetexte und Menüs an den neuen Einstieg angepasst
- neue eingebaute Commands: **`uptime`**, **`ownercontact`**, **`prefix`**, **`setprefix`**, **`groupinfo`**
- zentrale WhatsApp-Architektur beibehalten statt neue Extra-Ordner einzuführen
- Tests und Scripts auf den neuen Einstieg synchronisiert

Kurz gesagt: weniger Chaos, mehr nutzbare Base. Der Bot hat jetzt weniger „wo war das nochmal?“-Energie. 😄

## Projektstruktur

```text
OnimaiBase/
├── Onimai.js
├── package.json
├── smoke.test.js
├── owner.json
├── .env.example
├── .gitignore
├── lib/
└── docs/assets/
```

## Wo liegt was?

- `Onimai.js` → zentrale Runtime, Commands, Events, Session-Handling
- `lib/` → kleine Helfer und Kompatibilitätsfunktionen
- `owner.json` → Branding, Owner-Infos
- `.env.example` → Startkonfiguration
- `smoke.test.js` → schneller Syntax-/README-/Package-Check

## Entwicklung & Checks

Vor einem Push sollten mindestens diese Checks grün sein:

- Syntaxprüfung für `Onimai.js`
- Smoke-Tests über `smoke.test.js`
- optionaler Dry-Run mit `ONIMAIBOT_DRY_RUN=true`

## Troubleshooting

### QR wird nicht angezeigt

Prüfe `WHATSAPP_PRINT_QR` in der `.env` und ob die Session sauber neu gestartet wurde.

### Pairing klappt nicht

Kontrolliere die übergebene Nummer im internationalen Format und ob die Session-ID korrekt ist.

### Welcome reagiert nicht

Das Welcome-System nutzt WhatsApp-Gruppenereignisse. Teste in einer echten Gruppe und prüfe, ob `!welcome status` aktiviert ist.

### Prefix reagiert nicht

Mit `!prefix` siehst du den aktiven Wert. Wenn du ihn geändert hast, teste direkt mit dem neuen Prefix weiter.

## Sicherheit & Hinweise

- Committe keine echten Session-Daten.
- Lass `.env`, Datenbanken und Session-Artefakte im Ignore.
- Wenn du öffentlich pushst, prüfe vorher Owner-Nummern und Branding.

## Credits

Powered by **Neelegirly** 💜

Wenn du eine kompakte, moderne und GitHub-taugliche WhatsApp-Basis willst, ist diese Variante genau darauf zugeschnitten: **eine Datei für die Kernlogik, klare Commands und weniger Legacy-Gepäck**.
