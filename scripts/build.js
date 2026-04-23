process.env.ONIMAIBASEV3_DRY_RUN = process.env.ONIMAIBASEV3_DRY_RUN || 'true';

const { createOnimaiBaseV3Bot } = await import('../core/OnimaiBaseV3Bot.js');

const bot = await createOnimaiBaseV3Bot({
  LOG_LEVEL: 'warn'
});

await bot.init();

console.log('✅ OnimaiBaseV3 Build-/Validierungsdurchlauf erfolgreich.');
