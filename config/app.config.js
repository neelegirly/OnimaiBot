import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export function createAppConfig(overrides = {}) {
  const { env, missing } = loadEnv(overrides);

  return {
    appName: 'OnimaiBaseV3',
    packageName: 'onimaibasev3',
    title: 'OnimaiBaseV3',
    projectRoot,
    paths: {
      projectRoot,
      mainFile: path.join(projectRoot, 'main.js'),
      commandsDir: path.join(projectRoot, 'Onicommands'),
      eventsDir: path.join(projectRoot, 'events'),
      componentsDir: path.join(projectRoot, 'components'),
      logsDir: path.join(projectRoot, 'logs'),
      sessionDir: path.join(projectRoot, env.sessionDir)
    },
    runtime: {
      nodeEnv: env.nodeEnv,
      logLevel: env.logLevel,
      missingEnv: missing
    },
    whatsapp: {
      prefix: env.botPrefix,
      printQr: env.printQr,
      dryRun: env.dryRun
    }
  };
}
