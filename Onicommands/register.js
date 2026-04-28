import { registerUserProfile } from '../utils/runtimeStore.js';

export default {
  name: 'register',
  aliases: ['reg', 'anmelden'],
  description: 'Registriert den aktuellen Nutzer in der kleinen OnimaiBot Runtime-DB.',
  async execute({ config, rawArgs, reply, senderId, senderName }) {
    const displayName = String(rawArgs || '').trim() || senderName || 'Freund';
    const profile = await registerUserProfile(config.projectRoot, {
      senderId,
      displayName
    });

    await reply([
      '✅ *Registrierung erfolgreich*',
      `Name: *${profile.registeredName || profile.name}*`,
      `Level: *${profile.level}*`,
      `XP: *${profile.xp}*`,
      'Du kannst jetzt mit `!me` dein OnimaiBot-Profil ansehen.'
    ].join('\n'));
  }
};
