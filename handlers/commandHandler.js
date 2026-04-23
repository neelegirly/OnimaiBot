import { getFilesRecursively, importFromFile } from '../utils/fileSystem.js';

export async function loadCommands({ client, config, logger }) {
  const files = await getFilesRecursively(config.paths.commandsDir);

  client.commands.clear();
  client.commandAliases.clear();

  for (const filePath of files) {
    const module = await importFromFile(filePath);
    const command = module.default;

    if (!command?.name || typeof command.execute !== 'function') {
      logger.warn('Command-Datei übersprungen, da Export unvollständig ist.', { filePath });
      continue;
    }

    const normalizedName = command.name.toLowerCase();
    const normalizedAliases = (command.aliases || []).map((alias) => alias.toLowerCase());

    client.commands.set(normalizedName, {
      ...command,
      name: normalizedName,
      aliases: normalizedAliases
    });

    for (const alias of normalizedAliases) {
      client.commandAliases.set(alias, client.commands.get(normalizedName));
    }
  }

  logger.info('Commands geladen.', {
    total: client.commands.size,
    aliases: client.commandAliases.size
  });
}
