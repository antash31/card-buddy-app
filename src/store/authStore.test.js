/* global jest, test, expect, beforeEach, describe */
// #genai: What launch does to a stored session. The rule under test: only the server refusing the
// token ends it. Not being able to reach the server (offline, backend restarting, a 5xx) must keep
// the tokens and offer a retry, because that is what used to sign people out.
import { ApiError } from '@/api/ApiError';
import { StorageKeys } from '@/constants/storageKeys';
import { cancelByPrefix } from '@/lib/notifications';

import { useAuthStore } from './authStore';

const mockStorage = new Map();
const mockFetchCurrentUser = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key, value) => void mockStorage.set(key, value)),
  deleteItemAsync: jest.fn(async (key) => void mockStorage.delete(key)),
}));
jest.mock('@/lib/notifications', () => ({ cancelByPrefix: jest.fn(async () => 0) }));
jest.mock('@/lib/logger', () => ({ logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('@/features/tracking/native', () => ({
  nativeSession: jest.fn(async () => null),
  clearSmsOnLogout: jest.fn(async () => undefined),
  refreshNativeSession: jest.fn(async () => null),
}));
jest.mock('@/features/auth/api/authApi', () => ({
  fetchCurrentUser: (...args) => mockFetchCurrentUser(...args),
}));

const api = (status, message = 'x') => new ApiError({ message, code: 'x', status });
const state = () => useAuthStore.getState();

beforeEach(() => {
  mockStorage.clear();
  mockStorage.set(StorageKeys.accessToken, 'access-1');
  mockStorage.set(StorageKeys.refreshToken, 'refresh-1');
  mockFetchCurrentUser.mockReset();
  useAuthStore.setState({ status: 'loading', user: null, profile: null });
});

describe('launching with no stored session', () => {
  test('is signed out without asking the server', async () => {
    mockStorage.clear();
    await state().hydrate();
    expect(state().status).toBe('unauthenticated');
    expect(mockFetchCurrentUser).not.toHaveBeenCalled();
  });
});

describe('launching with a stored session the server accepts', () => {
  test('is signed in with the user and profile', async () => {
    mockFetchCurrentUser.mockResolvedValue({ user: { id: 'u1' }, profile: { fullName: 'A' } });
    await state().hydrate();
    expect(state()).toMatchObject({ status: 'authenticated', user: { id: 'u1' }, profile: { fullName: 'A' } });
    expect(mockStorage.get(StorageKeys.accessToken)).toBe('access-1');
  });
});

describe('launching when the server cannot be reached', () => {
  test.each([
    ['offline', 0],
    ['timed out', 408],
    ['rate limited', 429],
    ['server error', 500],
    ['bad gateway', 502],
    ['unavailable', 503],
  ])('keeps the session when the request fails: %s', async (_name, status) => {
    mockFetchCurrentUser.mockRejectedValue(api(status));
    await state().hydrate();

    expect(state().status).toBe('unreachable');
    expect(mockStorage.get(StorageKeys.accessToken)).toBe('access-1');
    expect(mockStorage.get(StorageKeys.refreshToken)).toBe('refresh-1');
  });

  test('retrying signs in once the server is back', async () => {
    mockFetchCurrentUser.mockRejectedValueOnce(api(0));
    await state().hydrate();
    expect(state().status).toBe('unreachable');

    mockFetchCurrentUser.mockResolvedValueOnce({ user: { id: 'u1' }, profile: { fullName: 'A' } });
    await state().hydrate();
    expect(state().status).toBe('authenticated');
    expect(mockStorage.get(StorageKeys.accessToken)).toBe('access-1');
  });

  test('shows the loading state while a retry is in flight', async () => {
    mockFetchCurrentUser.mockRejectedValueOnce(api(0));
    await state().hydrate();

    let release;
    mockFetchCurrentUser.mockReturnValueOnce(new Promise((resolve) => (release = resolve)));
    const retry = state().hydrate();
    await Promise.resolve();
    expect(state().status).toBe('loading');

    release({ user: { id: 'u1' }, profile: null });
    await retry;
    expect(state().status).toBe('authenticated');
  });

  test('a person can still sign out from the retry state', async () => {
    mockFetchCurrentUser.mockRejectedValue(api(0));
    await state().hydrate();
    await state().signedOut();

    expect(state().status).toBe('unauthenticated');
    expect(mockStorage.has(StorageKeys.accessToken)).toBe(false);
  });

  test('signing out also cancels the phone’s scheduled credit reminders', async () => {
    cancelByPrefix.mockClear();
    await state().signedOut();

    expect(cancelByPrefix).toHaveBeenCalledWith('cb-credit:');
  });
});

describe('launching when the server refuses the session', () => {
  test.each([
    ['unauthorised', 401],
    ['forbidden (revoked session)', 403],
    ['not found', 404],
  ])('signs out and clears the tokens: %s', async (_name, status) => {
    mockFetchCurrentUser.mockRejectedValue(api(status));
    await state().hydrate();

    expect(state()).toMatchObject({ status: 'unauthenticated', user: null, profile: null });
    expect(mockStorage.has(StorageKeys.accessToken)).toBe(false);
    expect(mockStorage.has(StorageKeys.refreshToken)).toBe(false);
  });
});

describe('an error that is not an ApiError', () => {
  test('is not mistaken for a connection problem', async () => {
    mockFetchCurrentUser.mockRejectedValue(new TypeError('boom'));
    await state().hydrate();
    expect(state().status).toBe('unauthenticated');
  });
});
