// #genai: Storage abstraction with two tiers:
//   - `storage`       -> AsyncStorage, for non-sensitive preferences
//   - `secureStorage` -> SecureStore on native, AsyncStorage fallback on web
//     (SecureStore has no web implementation; the fallback keeps dev on web working
//      but is NOT encrypted, so treat web tokens as low-trust.)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { logger } from './logger';

export const storage = {
  async get(key) {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw == null ? null : JSON.parse(raw);
    } catch (error) {
      logger.warn('storage', `failed to read "${key}"`, error);
      return null;
    }
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.warn('storage', `failed to write "${key}"`, error);
    }
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.warn('storage', `failed to remove "${key}"`, error);
    }
  },
};

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async get(key) {
    try {
      return isWeb ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.warn('secureStorage', `failed to read "${key}"`, error);
      return null;
    }
  },
  async set(key, value) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      logger.warn('secureStorage', `failed to write "${key}"`, error);
    }
  },
  async remove(key) {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      logger.warn('secureStorage', `failed to remove "${key}"`, error);
    }
  },
};
