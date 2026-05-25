import { server } from '../src/server.js';

/**
 * Jest runs this file before any test suite.
 * It starts the HTTP server on a random free port and stores the URL
 * in a global variable that every test can read.
 */
export const startTestServer = async () => {
  // In test mode we don't want the server listening on the default PORT.
  // Pass 0 → OS picks a free port.
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  global.__BASE_URL__ = baseUrl; // make it globally available
};

export const stopTestServer = async () => {
  await new Promise((resolve) => server.close(resolve));
};