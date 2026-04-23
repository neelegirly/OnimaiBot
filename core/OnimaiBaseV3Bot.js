import makeWASocket, {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { createAppConfig } from '../config/app.config.js';
import { loadCommands } from '../handlers/commandHandler.js';
import { loadComponents } from '../handlers/componentHandler.js';
import { bindEvents, loadEventDefinitions } from '../handlers/eventHandler.js';
import { registerProcessErrorHandlers } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

export class OnimaiBaseV3Bot {
  constructor(config) {
    this.config = config;
    this.logger = createLogger({
      appName: config.appName,
      level: config.runtime.logLevel,
      logsDir: config.paths.logsDir
    });

    this.client = {
      commands: new Map(),
      commandAliases: new Map(),
      buttons: new Map(),
      menus: new Map(),
      menuSessions: new Map(),
      events: [],
      socket: null,
      isReady: false,
      appConfig: config
    };

    this.initialized = false;
    this.reconnecting = false;
  }

  async init() {
    if (this.initialized) {
      return this;
    }

    registerProcessErrorHandlers(this.logger);

    await loadCommands({
      client: this.client,
      config: this.config,
      logger: this.logger.child('commands')
    });

    await loadComponents({
      client: this.client,
      config: this.config,
      logger: this.logger.child('components')
    });

    await loadEventDefinitions({
      client: this.client,
      config: this.config,
      logger: this.logger.child('events')
    });

    this.initialized = true;
    return this;
  }

  async createSocket() {
    const { state, saveCreds } = await useMultiFileAuthState(this.config.paths.sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: state,
      browser: Browsers.ubuntu('OnimaiBaseV3'),
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      logger: pino({ level: 'silent' })
    });

    socket.ev.on('creds.update', saveCreds);

    this.client.socket = socket;

    bindEvents({
      client: this.client,
      config: this.config,
      logger: this.logger.child('events'),
      services: {
        reconnect: () => this.reconnect(),
        stop: () => this.stop()
      }
    });

    return socket;
  }

  async start() {
    await this.init();

    if (this.config.runtime.missingEnv.length > 0 && !this.config.whatsapp.dryRun) {
      throw new Error(`Fehlende Umgebungsvariablen: ${this.config.runtime.missingEnv.join(', ')}`);
    }

    if (this.config.whatsapp.dryRun) {
      this.logger.info('Dry-Run aktiv. Registries wurden geladen, aber es wird keine WhatsApp-Verbindung aufgebaut.', {
        commands: this.client.commands.size,
        buttons: this.client.buttons.size,
        menus: this.client.menus.size,
        events: this.client.events.length
      });

      return {
        dryRun: true
      };
    }

    await this.createSocket();
    this.logger.info('WhatsApp-Socket wurde initialisiert. Warte auf Verbindung oder QR-Code.');

    return {
      dryRun: false
    };
  }

  async reconnect() {
    if (this.reconnecting) {
      return;
    }

    this.reconnecting = true;

    try {
      this.logger.warn('WhatsApp-Verbindung wird neu aufgebaut.');
      await this.createSocket();
    } finally {
      this.reconnecting = false;
    }
  }

  async stop() {
    try {
      this.client.socket?.end?.(undefined);
    } catch (error) {
      this.logger.warn('WhatsApp-Socket konnte nicht sauber beendet werden.', {
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export async function createOnimaiBaseV3Bot(overrides = {}) {
  const config = createAppConfig(overrides);
  return new OnimaiBaseV3Bot(config);
}
