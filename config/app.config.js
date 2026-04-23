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
      logsDir: path.join(projectRoot, 'logs')
    },
    runtime: {
      nodeEnv: env.nodeEnv,
      logLevel: env.logLevel,
      missingEnv: missing,
      dryRun: env.dryRun
    },
    whatsapp: {
      prefix: env.botPrefix,
      printQr: env.printQr,
      dryRun: env.dryRun,
      ownerNumbers: env.ownerNumbers
    },
    multiSession: {
      sessionRoot: 'sessions_neelegirly',
      bootstrapSessions: env.bootstrapSessions,
      retryLimit: env.retryLimit,
      packageStack: {
        waApi: '1.8.4',
        baileys: '2.2.18',
        libsignal: '1.0.28',
        downloader: '0.1.65'
      }
    }
  };
}
