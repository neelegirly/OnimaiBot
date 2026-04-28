export default {
  name: 'owner',
  aliases: ['owners', 'adminhelp'],
  description: 'Zeigt Owner-Hinweise und die wichtigsten administrativen WhatsApp-Commands.',
  async execute({ config, isOwner, reply }) {
    if (!isOwner) {
      await reply('🔒 Dieser Command ist nur für Owner gedacht. Trage `BOT_OWNER_NUMBERS` in der `.env` ein.');
      return;
    }

    const ownerNumbers = config.whatsapp.ownerNumbers.length > 0
      ? config.whatsapp.ownerNumbers.map((number) => `+${number}`).join(', ')
      : 'Nicht gesetzt — Session-Commands sind aktuell offen.';

    await reply([
      '👑 *OnimaiBot Owner-Hilfe*',
      `Owner-Nummern: *${ownerNumbers}*`,
      '',
      'Wichtige Owner-Commands:',
      `• *${config.whatsapp.prefix}session-start <id>*`,
      `• *${config.whatsapp.prefix}session-pair <id> <nummer>*`,
      `• *${config.whatsapp.prefix}session-pause <id>*`,
      `• *${config.whatsapp.prefix}session-resume <id>*`,
      `• *${config.whatsapp.prefix}session-stop <id>*`,
      `• *${config.whatsapp.prefix}session-delete <id>*`,
      `• *${config.whatsapp.prefix}welcome on|off|text|preview*`,
      '',
      'Die Base ist bewusst auf WhatsApp fokussiert — kein Discord- oder Telegram-Zwangskostüm mehr.'
    ].join('\n'));
  }
};
