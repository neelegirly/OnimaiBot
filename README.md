<p align="center">
  <a href="https://github.com/neelegirly/OnimaiBot">
    <img src="./docs/assets/readme-hero.jpg" alt="OnimaiBot Hero" width="520" />
  </a>
</p>

## Kurz erklärt

`OnimaiBot` bzw. diese `OnimaiBase` ist eine **WhatsApp-only** Bot-Basis mit einer bewusst einfachen Struktur:
Der Kern lebt in **`Onimai.js`** und nicht verteilt über viele halbfertige Loader, Events und Demo-Ordner.

Das heißt in der Praxis:

- du findest die Hauptlogik schneller
- du verstehst den Nachrichtenfluss leichter
- du kannst Commands direkter anpassen
- du musst nicht erst eine Plugin-Architektur auseinandernehmen, um kleine Änderungen zu machen

## Warum diese Base?

`OnimaiBase` ist keine verstreute Plugin-Wüste, sondern eine bewusst zentral gehaltene WhatsApp-Basis.
Die Kernlogik lebt in **`Onimai.js`**. Genau das macht die Base leichter zu verstehen, schneller zu warten und einfacher auf GitHub sauber zu halten.

Das Ziel ist simpel:

- **WhatsApp-only** statt Mischbetrieb mit Discord oder Fremd-Bridge-Logik
- **eine zentrale Runtime** statt zehn verstreuter Einstiegspunkte
- **moderne Neelegirly-Pakete** statt halb-alter Legacy-Abhängigkeiten
- **direkt nutzbare Commands** für Alltag, Gruppen, Owner und Sessions

## So funktioniert die Base

Wenn du wissen willst, *wie es geht*, dann ist das hier der kurze Ablauf von oben nach unten:

1. **`Onimai.js` lädt die Konfiguration**  
  Beim Start werden `.env`, `owner.json` und die internen Runtime-Werte geladen.

2. **Die lokale Datenbasis wird vorbereitet**  
  Einstellungen wie Prefix, Nutzerdaten, Welcome-Status und Statistikwerte werden aus der Datenbank bzw. JSON-Struktur gelesen.

3. **Sessions werden hochgezogen**  
  Über `WA_API_BOOTSTRAP_SESSIONS` können Sessions automatisch gestartet werden. Alternativ geht das später auch per Chat-Command.

4. **Nachrichten werden normalisiert**  
  Eingehende WhatsApp-Nachrichten werden in eine Form gebracht, mit der Text, Medien, Buttons, Listen und Gruppenereignisse einheitlich verarbeitet werden können.

5. **Commands werden über Prefix + Alias erkannt**  
  Der Bot prüft den Prefix, ordnet Aliase zu und landet dann im passenden Case der Command-Logik.

6. **Antwort, Gruppenaktion oder Session-Aktion wird ausgeführt**  
  Je nach Command antwortet der Bot mit Text, sendet Medien, markiert Gruppenmitglieder, ändert Welcome-Einstellungen oder verwaltet Sessions.

Kurz: **Start → Config → Session → Nachricht → Command → Antwort**.

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

## Schnellstart Schritt für Schritt

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. `.env` vorbereiten

Nimm die Datei `.env.example` als Vorlage und passe die Werte an deine Umgebung an.

Wichtige Umgebungsvariablen:

- `APP_NAME`
- `BOT_PREFIX`
- `WHATSAPP_PRINT_QR`
- `BOT_OWNER_NUMBERS`
- `WA_API_BOOTSTRAP_SESSIONS`
- `WA_API_RETRY_LIMIT`
- `ONIMAIBOT_DRY_RUN`

### 3. `owner.json` prüfen

In `owner.json` legst du Name, Nummer, Anzeige-Tag und Kontakt-Link für den Owner fest.
Diese Werte tauchen später in Owner-Infos und Hilfetexten wieder auf.

### 4. Erstmal sicher testen

Wenn du nur sehen willst, ob alles sauber startet, nutze den Dry-Run:

```bash
ONIMAIBOT_DRY_RUN=true npm start
```

Dann wird **keine echte WhatsApp-Session** geöffnet, aber du siehst, ob Config und Runtime korrekt laden.

### 5. Normal starten

```bash
npm start
```

Wenn `WHATSAPP_PRINT_QR=true` gesetzt ist und noch keine Session verbunden wurde, bekommst du den QR-Flow direkt im Terminal.

## Wenn du etwas ändern willst

Die Base ist extra so gebaut, dass du nicht lange suchen musst:

- **neuer Command** → meistens direkt in `Onimai.js`
- **Owner-/Branding-Werte** → `owner.json`
- **Startverhalten / Prefix / Sessions** → `.env`
- **kleine Helper** → `lib/`

Wenn du zum Beispiel einen neuen simplen Command willst, ist der typische Weg:

1. Alias ergänzen
2. Command in die Menü-/Help-Listen aufnehmen
3. den passenden `case` in `Onimai.js` ergänzen
4. testen mit `node --check Onimai.js` und `node --test smoke.test.js`

Dadurch bleibt die Base verständlich, auch wenn du später mehr Features einbaust.

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

## Wie du die wichtigsten Sachen benutzt

### Prefix ändern

Wenn du den Prefix dauerhaft anders haben willst, hast du zwei Wege:

- direkt über `BOT_PREFIX` in der `.env`
- oder live per Chat über `setprefix`, wenn du die nötigen Rechte hast

### Neue Session starten

Für neue Sessions kannst du entweder Bootstrapping über die `.env` nutzen oder direkt im Chat mit den Session-Commands arbeiten.
Das ist praktisch, wenn du mehr als eine Nummer oder mehr als einen Einsatzzweck parallel brauchst.

### Welcome-System nutzen

Das Welcome-System reagiert auf Gruppenereignisse von WhatsApp.
Du kannst es aktivieren, deaktivieren, den Status prüfen und eigene Texte setzen.

### Gruppen verwalten

Mit `tagall` und `groupinfo` hast du direkt zwei nützliche Gruppenwerkzeuge eingebaut, ohne erst weitere Dateien oder Plugins anlegen zu müssen.

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
