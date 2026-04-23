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
    `${chalk.bold('Commands')}     ${chalk.white(path.basename(config.paths.commandsDir))}`,
    `${chalk.bold('Session')}      ${chalk.white(path.basename(config.paths.sessionDir))}`,
    `${chalk.bold('PM2')}          ${chalk.white('OnimaiBaseV3')}`,
    `${chalk.bold('Beispiele')}    ${chalk.white(`${config.whatsapp.prefix}ping, ${config.whatsapp.prefix}menu`)}`
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
      title: ' OnimaiBaseV3 ',
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
    lines.push('', chalk.yellow('Dry-Run ist aktiv. Für echten WhatsApp-Login ONIMAIBASEV3_DRY_RUN=false setzen.'));
  } else {
    lines.push('', chalk.green('WhatsApp-Socket läuft. Wenn ein QR-Code erscheint, einfach scannen.'));
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
