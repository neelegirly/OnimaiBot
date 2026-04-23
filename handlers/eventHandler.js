import { getFilesRecursively, importFromFile } from '../utils/fileSystem.js';

const EVENT_BINDINGS = {
  'message.received': 'onMessageReceived',
  'message.updated': 'onMessageUpdate',
  'session.connected': 'onConnected',
  'session.disconnected': 'onDisconnected',
  'session.connecting': 'onConnecting',
  'session.pairing': 'onPairingCode'
};

export async function loadEventDefinitions({ client, config, logger }) {
  const files = await getFilesRecursively(config.paths.eventsDir);

  client.events = [];

  for (const filePath of files) {
    const module = await importFromFile(filePath);
    const event = module.default;

    if (!event?.name || typeof event.execute !== 'function') {
      logger.warn('Event-Datei übersprungen, da Export unvollständig ist.', { filePath });
      continue;
    }

    client.events.push(event);
  }

  logger.info('Event-Definitionen geladen.', { total: client.events.length });
}

export function bindEvents({ client, config, logger, services }) {
  if (client.listenersBound) {
    logger.debug('wa-api Event-Listener waren bereits gebunden.');
    return;
  }

  for (const event of client.events) {
    const bindingName = EVENT_BINDINGS[event.name];
    const binder = bindingName ? client.waApi?.[bindingName] : null;

    if (typeof binder !== 'function') {
      logger.warn('Event konnte nicht an wa-api gebunden werden.', {
        eventName: event.name,
        bindingName
      });
      continue;
    }

    binder((...args) =>
      event.execute(
        {
          client,
          config,
          logger: logger.child(event.name),
          services
        },
        ...args
      )
    );
  }

  client.listenersBound = true;

  logger.info('Events an wa-api Listener gebunden.', { total: client.events.length });
}
