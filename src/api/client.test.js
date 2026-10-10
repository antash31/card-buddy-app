/* global jest, test, expect, beforeEach, describe */
// #genai: Token refresh in the HTTP client. The rule under test: a refresh that is *refused* ends the
// session, but a refresh that could not be *attempted* (offline, timeout, 5xx) does not. Treating the
// two alike signs people out whenever the connection drops while a token happens to expire.
import { AxiosError } from 'axios';

import { StorageKeys } from '@/constants/storageKeys';

import { ApiError } from './ApiError';
import { apiClient } from './client';
import { configureSessionBridge } from './sessionBridge';

const mockStorage = new Map();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key, value) => void mockStorage.set(key, value)),
  deleteItemAsync: jest.fn(async (key) => void mockStorage.delete(key)),
}));
jest.mock('@/lib/logger', () => ({ logger: { debug: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('@/features/tracking/native', () => ({
  nativeSession: jest.fn(async () => null),
  refreshNativeSession: jest.fn(async () => null),
}));

const onSessionExpired = jest.fn();
const onSessionRefreshed = jest.fn();

/** Scripts the server: `routes[url]` is called with the attempt number and returns a body or throws. */
function serve(routes) {
  const attempts = {};
  apiClient.defaults.adapter = async (config) => {
    const url = config.url;
    attempts[url] = (attempts[url] ?? 0) + 1;
    const handler = routes[url];
    if (!handler) throw new Error(`unexpected request: ${url}`);

    const result = handler(attempts[url], config);
    if (result instanceof Error) throw result;
    return { data: result.body, status: 200, statusText: 'OK', headers: {}, config };
  };
  return attempts;
}

const reject = (status, config, code = 'x') =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    data: { success: false, error: { message: `HTTP ${status}`, code } },
    config,
  });

const networkDown = (config) => new AxiosError('Network Error', 'ERR_NETWORK', config);

beforeEach(() => {
  mockStorage.clear();
  mockStorage.set(StorageKeys.accessToken, 'old-access');
  mockStorage.set(StorageKeys.refreshToken, 'refresh-1');
  onSessionExpired.mockReset();
  onSessionRefreshed.mockReset();
  configureSessionBridge({ onSessionExpired, onSessionRefreshed });
});

describe('an expired access token', () => {
  test('is refreshed once and the request replayed', async () => {
    serve({
      '/thing': (attempt, config) =>
        attempt === 1 ? reject(401, config) : { body: { success: true, data: { ok: true } } },
      '/auth/refresh': () => ({
        body: { success: true, data: { session: { accessToken: 'new-access', refreshToken: 'refresh-2' }, user: { id: 'u' }, profile: null } },
      }),
    });

    await expect(apiClient.get('/thing')).resolves.toEqual({ ok: true });
    expect(mockStorage.get(StorageKeys.accessToken)).toBe('new-access');
    expect(mockStorage.get(StorageKeys.refreshToken)).toBe('refresh-2');
    expect(onSessionRefreshed).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});

describe('a refresh that cannot be attempted', () => {
  test.each([
    ['the network is down', (config) => networkDown(config)],
    ['the server times out', (config) => reject(408, config)],
    ['the server is busy', (config) => reject(429, config)],
    ['the server errors', (config) => reject(500, config)],
    ['the server is unavailable', (config) => reject(503, config)],
  ])('keeps the session when %s', async (_name, failure) => {
    serve({
      '/thing': (_attempt, config) => reject(401, config),
      '/auth/refresh': (_attempt, config) => failure(config),
    });

    const error = await apiClient.get('/thing').catch((caught) => caught);

    expect(onSessionExpired).not.toHaveBeenCalled();
    expect(mockStorage.get(StorageKeys.refreshToken)).toBe('refresh-1');
    // Reported as the connection problem it is, so the caller does not treat it as "signed out".
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.code).toBe('network_error');
    expect(error.isTransient).toBe(true);
  });
});

describe('a refresh the server refuses', () => {
  test.each([
    ['401', 401],
    ['403', 403],
    ['400', 400],
  ])('ends the session on %s', async (_name, status) => {
    serve({
      '/thing': (_attempt, config) => reject(401, config),
      '/auth/refresh': (_attempt, config) => reject(status, config, 'SESSION_EXPIRED'),
    });

    const error = await apiClient.get('/thing').catch((caught) => caught);

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });

  test('ends the session when there is no refresh token to try', async () => {
    mockStorage.delete(StorageKeys.refreshToken);
    serve({ '/thing': (_attempt, config) => reject(401, config) });

    const error = await apiClient.get('/thing').catch((caught) => caught);

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(error.status).toBe(401);
  });
});

describe('concurrent requests', () => {
  test('share one refresh, so a single-use refresh token is spent once', async () => {
    const attempts = serve({
      '/a': (attempt, config) => (attempt === 1 ? reject(401, config) : { body: { success: true, data: 'a' } }),
      '/b': (attempt, config) => (attempt === 1 ? reject(401, config) : { body: { success: true, data: 'b' } }),
      '/auth/refresh': () => ({
        body: { success: true, data: { session: { accessToken: 'new-access', refreshToken: 'refresh-2' }, user: { id: 'u' }, profile: null } },
      }),
    });

    await expect(Promise.all([apiClient.get('/a'), apiClient.get('/b')])).resolves.toEqual(['a', 'b']);
    expect(attempts['/auth/refresh']).toBe(1);
  });
});

describe('ApiError.isTransient', () => {
  test('is true for connection and server trouble, false for a refusal', () => {
    const transient = (status) => new ApiError({ message: 'x', status }).isTransient;
    for (const status of [0, 408, 429, 500, 502, 503, 504]) expect(transient(status)).toBe(true);
    for (const status of [400, 401, 403, 404, 409, 422]) expect(transient(status)).toBe(false);
  });
});
