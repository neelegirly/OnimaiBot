export default {
  name: 'session.pairing',
  async execute({ logger }, sessionId, code) {
    logger.info('Pairing-Code erzeugt.', {
      sessionId,
      code
    });
  }
};
