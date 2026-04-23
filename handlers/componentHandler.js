import path from 'node:path';
import { getFilesRecursively, importFromFile } from '../utils/fileSystem.js';

export async function loadComponents({ client, config, logger }) {
  const buttonFiles = await getFilesRecursively(path.join(config.paths.componentsDir, 'buttons'));
  const menuFiles = await getFilesRecursively(path.join(config.paths.componentsDir, 'menus'));

  client.buttons.clear();
  client.menus.clear();

  for (const filePath of buttonFiles) {
    const module = await importFromFile(filePath);
    const component = module.default;

    if (!component?.customId || typeof component.execute !== 'function') {
      logger.warn('Button-Datei übersprungen, da Export unvollständig ist.', { filePath });
      continue;
    }

    client.buttons.set(component.customId, component);
  }

  for (const filePath of menuFiles) {
    const module = await importFromFile(filePath);
    const component = module.default;

    if (!component?.customId || typeof component.execute !== 'function') {
      logger.warn('Menü-Datei übersprungen, da Export unvollständig ist.', { filePath });
      continue;
    }

    client.menus.set(component.customId, component);
  }

  logger.info('Komponenten geladen.', {
    buttons: client.buttons.size,
    menus: client.menus.size
  });
}
