import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import chalk from 'chalk';

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50
};

const COLORS = {
  debug: chalk.cyan,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.magentaBright
};

const ICONS = {
  debug: '∙',
  info: '✓',
  warn: '⚠',
  error: '✖',
  fatal: '☠'
};

function serializeMeta(meta) {
  if (meta === undefined) {
    return '';
  }

  if (typeof meta === 'string') {
    return meta;
  }

  try {
    return JSON.stringify(meta);
  } catch {
    return util.inspect(meta, { depth: 4, breakLength: 120 });
  }
}

export function createLogger({ appName, level = 'info', logsDir, scope = 'app' }) {
  fs.mkdirSync(logsDir, { recursive: true });

  const currentLevel = LEVELS[level] ?? LEVELS.info;
  const logFile = path.join(logsDir, `${appName.toLowerCase()}.log`);

  function write(levelName, message, meta) {
    if ((LEVELS[levelName] ?? LEVELS.info) < currentLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const metaChunk = serializeMeta(meta);
    const line = `[${timestamp}] [${appName}] [${scope}] [${levelName.toUpperCase()}] ${message}${metaChunk ? ` ${metaChunk}` : ''}`;
    const consoleTime = new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const colorize = COLORS[levelName] || ((value) => value);
    const prettyLine = [
      chalk.gray(consoleTime),
      colorize(`${ICONS[levelName] || '•'} ${levelName.toUpperCase().padEnd(5)}`),
      chalk.hex('#8b5cf6')(`[${scope}]`),
      chalk.white(message),
      metaChunk ? chalk.dim(metaChunk) : ''
    ].filter(Boolean).join('  ');

    fs.appendFileSync(logFile, `${line}\n`, 'utf8');
    console.log(prettyLine);
  }

  return {
    debug(message, meta) {
      write('debug', message, meta);
    },
    info(message, meta) {
      write('info', message, meta);
    },
    warn(message, meta) {
      write('warn', message, meta);
    },
    error(message, meta) {
      write('error', message, meta);
    },
    fatal(message, meta) {
      write('fatal', message, meta);
    },
    child(childScope) {
      return createLogger({
        appName,
        level,
        logsDir,
        scope: `${scope}:${childScope}`
      });
    }
  };
}
