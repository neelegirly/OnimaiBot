export default {
  name: 'session.connected',
  async execute({ logger }, sessionId) {
    logger.info('Session verbunden.', { sessionId });
  }
};
