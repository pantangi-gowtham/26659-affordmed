export function logInfo(message, meta = {}) {
  const payload = { level: 'info', message, meta, timestamp: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.info('[AffordMed]', JSON.stringify(payload));
}

export function logError(message, error) {
  const meta = error instanceof Error ? { message: error.message, stack: error.stack } : { error };
  const payload = { level: 'error', message, meta, timestamp: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.error('[AffordMed]', JSON.stringify(payload));
}

export function logApiCall(message, meta = {}) {
  const payload = { level: 'api', message, meta, timestamp: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.log('[AffordMed]', JSON.stringify(payload));
}
