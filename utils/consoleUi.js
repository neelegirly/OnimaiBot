import boxen from 'boxen';
import chalk from 'chalk';
import path from 'node:path';

function createBanner() {
  return [
    chalk.hex('#14f1c0')('█▀█ █▄░█ █ █▀▄▀█ ▄▀█ █ █▄▄ ▄▀█ █▀ █▀▀'),
    chalk.hex('#8b5cf6')('█▄█ █░▀█ █ █░▀░█ █▀█ █ █▄█ █▀█ ▄█ ██▄')
  ].join('\n');
}

function createInfoRows(config) {
  return [
    `${chalk.bold('App')}          ${chalk.white(config.appName)}`,
    `${chalk.bold('Modus')}        ${config.whatsapp.dryRun ? chalk.yellow('Dry-Run') : chalk.green('Live')}`,
    `${chalk.bold('Prefix')}       ${chalk.cyan(config.whatsapp.prefix)}`,
    `${chalk.bold('Stack')}        ${chalk.white('@neelegirly/wa-api + @neelegirly/baileys')}`,
    `${chalk.bold('Commands')}     ${chalk.white(path.basename(config.paths.commandsDir))}`,
    `${chalk.bold('Sessions')}     ${chalk.white(config.multiSession.sessionRoot)}`,
    `${chalk.bold('Bootstrap')}    ${chalk.white(config.multiSession.bootstrapSessions.join(', ') || 'keine')}`,
    `${chalk.bold('PM2')}          ${chalk.white(config.appName)}`,
    `${chalk.bold('Beispiele')}    ${chalk.white(`${config.whatsapp.prefix}ping, ${config.whatsapp.prefix}menu, ${config.whatsapp.prefix}register, ${config.whatsapp.prefix}me`)}`
  ].join('\n');
}

export function printWelcomeConsole(config) {
  console.clear();
  console.log(createBanner());
  console.log('');
  console.log(
    boxen(createInfoRows(config), {
      padding: { top: 1, right: 2, bottom: 1, left: 2 },
      margin: { top: 0, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'cyan',
      title: ` ${config.title} `,
      titleAlignment: 'center'
    })
  );
}

export function printStartupResult(bot, result) {
  const lines = [
    `${chalk.bold('Commands geladen')}  ${chalk.green(String(bot.client.commands.size))}`,
    `${chalk.bold('Buttons geladen')}   ${chalk.green(String(bot.client.buttons.size))}`,
    `${chalk.bold('Menüs geladen')}     ${chalk.green(String(bot.client.menus.size))}`,
    `${chalk.bold('Events geladen')}    ${chalk.green(String(bot.client.events.length))}`
  ];

  if (result?.dryRun) {
    lines.push('', chalk.yellow('Dry-Run ist aktiv. Für echte wa-api Sessions ONIMAIBOT_DRY_RUN=false setzen (legacy: ONIMAIBASEV3_DRY_RUN=false).'));
  } else {
    lines.push(
      `${chalk.bold('Wiederhergestellt')} ${chalk.green(String(result?.restoredCount ?? 0))}`,
      `${chalk.bold('Gemanagte Sessions')} ${chalk.green(String(result?.managedSessions?.length ?? 0))}`,
      `${chalk.bold('Bootstrap-Aktionen')} ${chalk.green(String(result?.bootstrappedSessions?.length ?? 0))}`,
      '',
      chalk.green('PM2-ready Multi-Session-Basis läuft. QR oder Pairing-Code erscheinen pro Session im Terminal.')
    );
  }

  console.log(
    boxen(lines.join('\n'), {
      padding: 1,
      margin: { top: 0, bottom: 1 },
      borderStyle: 'double',
      borderColor: 'green',
      title: ' Status ',
      titleAlignment: 'center'
    })
  );
}
