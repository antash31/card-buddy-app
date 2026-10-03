/* global jest, test, expect, beforeEach */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/constants/storageKeys';

import { useReminderStore } from './reminderStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-secure-store', () => ({}));

beforeEach(async () => {
  await AsyncStorage.clear();
  useReminderStore.setState({ enabled: false, hydrated: false });
});

test('starts off, so nothing is scheduled and no permission is asked for until the user opts in', () => {
  expect(useReminderStore.getState().enabled).toBe(false);
  expect(useReminderStore.getState().hydrated).toBe(false);
});

test('remembers the choice across launches', async () => {
  useReminderStore.getState().setEnabled(true);
  await Promise.resolve();

  useReminderStore.setState({ enabled: false, hydrated: false }); // a fresh launch
  await useReminderStore.getState().hydrate();

  expect(useReminderStore.getState()).toMatchObject({ enabled: true, hydrated: true });
});

test('hydrates to off when nothing, or something unexpected, was stored', async () => {
  await useReminderStore.getState().hydrate();
  expect(useReminderStore.getState()).toMatchObject({ enabled: false, hydrated: true });

  await AsyncStorage.setItem(StorageKeys.creditReminders, JSON.stringify({ enabled: 'yes' }));
  await useReminderStore.getState().hydrate();
  expect(useReminderStore.getState().enabled).toBe(false);
});

test('only an actual true turns it on', () => {
  useReminderStore.getState().setEnabled('true');
  expect(useReminderStore.getState().enabled).toBe(false);
  useReminderStore.getState().setEnabled(true);
  expect(useReminderStore.getState().enabled).toBe(true);
});
