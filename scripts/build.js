process.env.ONIMAIBOT_DRY_RUN = process.env.ONIMAIBOT_DRY_RUN || process.env.ONIMAIBASEV3_DRY_RUN || 'true';

const { createOnimaiBot } = await import('../core/OnimaiBaseV3Bot.js');

const bot = await createOnimaiBot({
  LOG_LEVEL: 'warn'
});

await bot.init();

console.log('✅ OnimaiBot wa-api Multi-Session Build-/Validierungsdurchlauf erfolgreich.');
