export default {
  name: 'session.disconnected',
  async execute({ logger }, sessionId, details) {
    logger.warn('Session getrennt.', {
      sessionId,
      details: details || null
    });
  }
};
