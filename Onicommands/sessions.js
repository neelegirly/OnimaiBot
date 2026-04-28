import { formatManagedSessions } from '../utils/multisession.js';

export default {
  name: 'sessions',
  aliases: ['session-list', 'sessionen'],
  description: 'Listet alle bekannten wa-api Sessions auf.',
  async execute({ client, reply }) {
    await reply([
      '*OnimaiBot Sessions*',
      formatManagedSessions(client)
    ].join('\n'));
  }
};
