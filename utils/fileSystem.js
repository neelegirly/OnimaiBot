import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function getFilesRecursively(directoryPath) {
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    directoryEntries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return getFilesRecursively(fullPath);
      }

      if (entry.isFile() && fullPath.endsWith('.js')) {
        return [fullPath];
      }

      return [];
    })
  );

  return nestedFiles.flat().sort((left, right) => left.localeCompare(right));
}

export async function importFromFile(filePath) {
  return import(pathToFileURL(filePath).href);
}
