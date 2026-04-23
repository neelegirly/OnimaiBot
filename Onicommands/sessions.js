import { formatManagedSessions } from '../utils/multisession.js';

export default {
  name: 'sessions',
  aliases: ['session-list', 'sessionen'],
  description: 'Listet alle bekannten wa-api Sessions auf.',
  async execute({ client, reply }) {
    await reply([
      '*OnimaiBaseV3 Sessions*',
      formatManagedSessions(client)
    ].join('\n'));
  }
};
