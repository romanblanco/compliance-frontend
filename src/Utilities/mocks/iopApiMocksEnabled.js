/**
 * When true, query hooks return fixture data instead of calling the network.
 * Controlled by IOP_MOCK_API env var at build time (defaults to false).
 */
export function isIopApiMocksEnabled() {
  return process.env.IOP_MOCK_API === 'true';
}
