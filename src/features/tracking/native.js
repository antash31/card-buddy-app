import { requireOptionalNativeModule } from 'expo-modules-core';
import { PermissionsAndroid, Platform } from 'react-native';

import { env } from '@/config/env';
import { StorageKeys } from '@/constants/storageKeys';
import { secureStorage } from '@/lib/storage';

const native = Platform.OS === 'android' ? requireOptionalNativeModule('CardBuddySms') : null;
export const smsAvailable = !!native;
export async function nativeSession() {
  if (!native) return null;
  const session = await native.session('');
  if (session?.accessToken) {
    await secureStorage.set(StorageKeys.accessToken, session.accessToken);
    await secureStorage.set(StorageKeys.refreshToken, session.refreshToken);
  }
  return session;
}
export async function refreshNativeSession(failedToken) {
  const session = await nativeSession();
  if (!session) return null;
  const refreshed = await native.refreshSession(session.userId, failedToken);
  await secureStorage.set(StorageKeys.accessToken, refreshed.accessToken);
  await secureStorage.set(StorageKeys.refreshToken, refreshed.refreshToken);
  return refreshed;
}
export async function smsStatus() {
  return native ? native.status() : { enabled: false, permissionGranted: false, queued: 0 };
}
export async function enableSms(userId, historyDays) {
  if (!native) throw new Error('SMS tracking requires the Card Buddy Android development build.');
  const receive = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
  if (receive !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('SMS permission was not granted. You can connect email or paste an alert.');
  if (historyDays > 0) {
    const read = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);
    if (read !== PermissionsAndroid.RESULTS.GRANTED) throw new Error('History permission was not granted. Choose future messages only instead.');
  }
  await native.enable(userId, env.apiUrl, await secureStorage.get(StorageKeys.accessToken), await secureStorage.get(StorageKeys.refreshToken), historyDays);
}
export async function disableSms() {
  if (!native) return;
  const session = await native.disable();
  if (session?.accessToken) {
    await secureStorage.set(StorageKeys.accessToken, session.accessToken);
    await secureStorage.set(StorageKeys.refreshToken, session.refreshToken);
  }
}
export async function clearSmsOnLogout() { if (native) await native.disable(); }
export async function flushSms() { if (native) await native.flush(); }
