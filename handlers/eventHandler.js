import { getFilesRecursively, importFromFile } from '../utils/fileSystem.js';

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
  if (!client.socket?.ev) {
    logger.warn('Events konnten nicht gebunden werden, da noch kein WhatsApp-Socket existiert.');
    return;
  }

  for (const event of client.events) {
    client.socket.ev.on(event.name, (...args) =>
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

  logger.info('Events an WhatsApp-Socket gebunden.', { total: client.events.length });
}
