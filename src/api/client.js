// #genai: Axios instance wired to card-buddy-backend.
// The backend answers with `{ success: true, data }` or `{ success: false, error }`,
// so the response interceptor unwraps `data` and converts failures into `ApiError`.
import axios from 'axios';
import { nativeSession, refreshNativeSession } from '@/features/tracking/native';

import { env } from '@/config/env';
import { StorageKeys } from '@/constants/storageKeys';
import { logger } from '@/lib/logger';
import { secureStorage } from '@/lib/storage';

import { ApiError } from './ApiError';
import { endpoints } from './endpoints';
import { notifySessionExpired, notifySessionRefreshed } from './sessionBridge';

// eslint-disable-next-line import/no-named-as-default-member -- axios.create is the documented API
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;

  await nativeSession();
  const token = await secureStorage.get(StorageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;

    // Unwrap the backend envelope; tolerate endpoints that return a bare payload.
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        return body.data;
      }
      throw new ApiError({
        message: body.error?.message ?? 'Request failed',
        code: body.error?.code ?? 'request_failed',
        status: response.status,
        details: body.error?.details ?? null,
      });
    }

    return body;
  },
  async (error) => {
    if (error instanceof ApiError) {
      throw error;
    }

    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const original = error.config;

    // An expired access token is recoverable: refresh once, then replay the original request.
    // `_retried` stops a still-401 replay from looping.
    if (status === 401 && original && !original._retried && !original.skipAuth) {
      original._retried = true;

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        original.headers = { ...original.headers, Authorization: `Bearer ${refreshed}` };
        return apiClient(original);
      }
    }

    const apiError = new ApiError({
      message: payload?.error?.message ?? error.message ?? 'Network request failed',
      code: payload?.error?.code ?? (status === 0 ? 'network_error' : 'http_error'),
      status,
      details: payload?.error?.details ?? null,
    });

    logger.warn(
      'api',
      `${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      apiError.message,
    );
    throw apiError;
  },
);

// Concurrent 401s must trigger exactly one refresh; the rest await the same promise, otherwise
// each parallel request would burn a separate (single-use) refresh token.
let refreshInFlight = null;

async function refreshAccessToken() {
  refreshInFlight ??= performRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function performRefresh() {
  try {
    const failedToken = await secureStorage.get(StorageKeys.accessToken);
    const native = await refreshNativeSession(failedToken);
    if (native?.accessToken) return native.accessToken;
    const refreshToken = await secureStorage.get(StorageKeys.refreshToken);
    if (!refreshToken) {
      notifySessionExpired();
      return null;
    }

    // `skipAuth` keeps the request interceptor from attaching the token we are replacing.
    const data = await apiClient.post(
      endpoints.auth.refresh,
      { refreshToken },
      { skipAuth: true },
    );

    const session = data?.session;
    if (!session?.accessToken) {
      notifySessionExpired();
      return null;
    }

    await Promise.all([
      secureStorage.set(StorageKeys.accessToken, session.accessToken),
      secureStorage.set(StorageKeys.refreshToken, session.refreshToken),
    ]);

    notifySessionRefreshed({ session, user: data.user, profile: data.profile });

    return session.accessToken;
  } catch (error) {
    logger.warn('api', 'session refresh failed', error?.message);
    notifySessionExpired();
    return null;
  }
}
