export function normalizeError(error) {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  return new Error(JSON.stringify(error));
}

export function formatError(error) {
  const normalized = normalizeError(error);

  return {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack
  };
}

export function registerProcessErrorHandlers(logger) {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unbehandelte Promise-Ablehnung erkannt.', formatError(reason));
  });

  process.on('uncaughtException', (error) => {
    logger.fatal('Unbehandelte Ausnahme erkannt.', formatError(error));
    process.exitCode = 1;
  });
}
