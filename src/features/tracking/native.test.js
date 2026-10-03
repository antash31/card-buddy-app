/* global jest, test, expect, beforeEach */
const mockNative = { disable: jest.fn(), session: jest.fn(), refreshSession: jest.fn(), status: jest.fn(), enable: jest.fn(), flush: jest.fn() };
const mockStorage = { set: jest.fn(), get: jest.fn(), remove: jest.fn() };
jest.mock('expo-modules-core', () => ({ requireOptionalNativeModule: () => mockNative }));
jest.mock('react-native', () => ({ Platform: { OS: 'android' }, PermissionsAndroid: { PERMISSIONS: { RECEIVE_SMS: 'receive', READ_SMS: 'read' }, RESULTS: { GRANTED: 'granted' }, request: jest.fn() } }));
jest.mock('@/config/env', () => ({ env: { apiUrl: 'https://api.example.com/api' } }));
jest.mock('@/lib/storage', () => ({ secureStorage: mockStorage }));
const { PermissionsAndroid } = require('react-native');
const { clearSmsOnLogout, disableSms, enableSms, nativeSession, smsStatus } = require('./native');
beforeEach(() => { jest.clearAllMocks(); mockStorage.get.mockResolvedValue('token'); });
test('logout calls native queue and credential cleanup', async () => { await clearSmsOnLogout(); expect(mockNative.disable).toHaveBeenCalledTimes(1); expect(mockStorage.set).not.toHaveBeenCalled(); });
test('disable keeps the latest rotated app session while native clears its outbox', async () => { mockNative.disable.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' }); await disableSms(); expect(mockStorage.set).toHaveBeenCalledWith(expect.any(String), 'new-refresh'); });
test('permission denial never enables capture', async () => { PermissionsAndroid.request.mockResolvedValue('denied'); await expect(enableSms('user', 0)).rejects.toThrow('not granted'); expect(mockNative.enable).not.toHaveBeenCalled(); });
test('future-only does not request inbox access', async () => { PermissionsAndroid.request.mockResolvedValue('granted'); await enableSms('user', 0); expect(PermissionsAndroid.request.mock.calls).toEqual([['receive']]); });
test('history permission is separately requested', async () => { PermissionsAndroid.request.mockResolvedValue('granted'); await enableSms('user', 30); expect(PermissionsAndroid.request.mock.calls).toEqual([['receive'], ['read']]); });
test('revoked permission is surfaced from native status', async () => { mockNative.status.mockResolvedValue({ enabled: false, permissionGranted: false, queued: 0 }); expect(await smsStatus()).toEqual({ enabled: false, permissionGranted: false, queued: 0 }); });
test('foreground adopts background token rotation before an API call', async () => { mockNative.session.mockResolvedValue({ userId: 'user', accessToken: 'worker-access', refreshToken: 'worker-refresh' }); await nativeSession(); expect(mockStorage.set).toHaveBeenCalledWith(expect.any(String), 'worker-access'); });
