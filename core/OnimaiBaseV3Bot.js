import * as waApi from '@neelegirly/wa-api';
import { createAppConfig } from '../config/app.config.js';
import { loadCommands } from '../handlers/commandHandler.js';
import { loadComponents } from '../handlers/componentHandler.js';
import { bindEvents, loadEventDefinitions } from '../handlers/eventHandler.js';
import { registerProcessErrorHandlers } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';
import { ensureSessionRunning, getManagedSessions, getSessionStatus } from '../utils/multisession.js';

function toRestoredCount(restored) {
  if (Array.isArray(restored)) {
    return restored.length;
  }

  if (typeof restored === 'number') {
    return restored;
  }

  if (!restored) {
    return 0;
  }

  return 1;
}

export class OnimaiBaseV3Bot {
  constructor(config) {
    this.config = config;
    this.logger = createLogger({
      appName: config.appName,
      level: config.runtime.logLevel,
      logsDir: config.paths.logsDir
    });

    this.client = {
      waApi,
      commands: new Map(),
      commandAliases: new Map(),
      buttons: new Map(),
      menus: new Map(),
      menuSessions: new Map(),
      events: [],
      isReady: false,
      listenersBound: false,
      runtime: {
        restoredCount: 0,
        bootstrappedSessions: [],
        updateStatus: null
      },
      appConfig: config
    };

    this.initialized = false;
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

    bindEvents({
      client: this.client,
      config: this.config,
      logger: this.logger.child('events'),
      services: {
        getManagedSessions: () => getManagedSessions(this.client),
        getSessionStatus: (sessionId) => getSessionStatus(this.client, sessionId)
      }
    });

    this.initialized = true;
    return this;
  }

  async start() {
    await this.init();

    if (this.config.runtime.missingEnv.length > 0 && !this.config.whatsapp.dryRun) {
      throw new Error(`Fehlende Umgebungsvariablen: ${this.config.runtime.missingEnv.join(', ')}`);
    }

    if (this.config.whatsapp.dryRun) {
      this.logger.info('Dry-Run aktiv. Loader, Session-Registry und Multi-Session-Lifecycle wurden geladen.', {
        commands: this.client.commands.size,
        buttons: this.client.buttons.size,
        menus: this.client.menus.size,
        events: this.client.events.length
      });

      return {
        dryRun: true
      };
    }

    try {
      await waApi.checkForUpdates();
      this.client.runtime.updateStatus = waApi.getUpdateStatus?.() ?? null;
    } catch (error) {
      this.logger.warn('Update-Check für @neelegirly/wa-api konnte nicht abgeschlossen werden.', {
        message: error instanceof Error ? error.message : String(error)
      });
    }

    const restored = await waApi.loadSessionsFromStorage();
    const restoredCount = toRestoredCount(restored);
    this.client.runtime.restoredCount = restoredCount;

    const bootstrappedSessions = [];

    for (const sessionId of this.config.multiSession.bootstrapSessions) {
      const outcome = await ensureSessionRunning({
        client: this.client,
        config: this.config,
        logger: this.logger.child('bootstrap'),
        sessionId
      });

      bootstrappedSessions.push(outcome);
    }

    this.client.runtime.bootstrappedSessions = bootstrappedSessions;

    const managedSessions = getManagedSessions(this.client);
    this.client.isReady = true;

    this.logger.info('wa-api Multi-Session-Basis aktiv.', {
      restoredCount,
      managedSessions: managedSessions.length,
      bootstrapSessions: this.config.multiSession.bootstrapSessions
    });

    return {
      dryRun: false,
      restoredCount,
      bootstrappedSessions,
      managedSessions
    }
  }

  async stop() {
    this.logger.info('OnimaiBot beendet. Sessions bleiben für PM2-Warm-Restarts in der wa-api Registry erhalten.');
  }
}

export const OnimaiBot = OnimaiBaseV3Bot;

export async function createOnimaiBaseV3Bot(overrides = {}) {
  const config = createAppConfig(overrides);
  return new OnimaiBaseV3Bot(config);
}

export async function createOnimaiBot(overrides = {}) {
  return createOnimaiBaseV3Bot(overrides);
}
