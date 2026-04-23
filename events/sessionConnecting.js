export default {
  name: 'session.connecting',
  async execute({ logger }, sessionId) {
    logger.info('Session verbindet sich.', { sessionId });
  }
};
