import { createOnimaiBot } from './core/OnimaiBaseV3Bot.js';
import { printStartupResult, printWelcomeConsole } from './utils/consoleUi.js';

async function main() {
  const bot = await createOnimaiBot();

  printWelcomeConsole(bot.config);

  const result = await bot.start();

  printStartupResult(bot, result);

  if (result?.dryRun) {
    bot.logger.info('Dry-Run beendet. Setze ONIMAIBOT_DRY_RUN=false (legacy: ONIMAIBASEV3_DRY_RUN=false) und starte erneut, damit die wa-api Multi-Session-Basis echte Sessions startet.');
  }
}

try {
  await main();
} catch (error) {
  console.error('[OnimaiBot] Start fehlgeschlagen:', error);
  process.exitCode = 1;
}
