// #genai: Chat REST + SSE through the Express chatbot.
import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { streamSse } from '@/api/streamSse';
import { env } from '@/config/env';
import { StorageKeys } from '@/constants/storageKeys';
import { secureStorage } from '@/lib/storage';

export function createChatSession() {
  return apiClient.post(endpoints.swipemax.chatSessions);
}

export function fetchChatSession(sessionId) {
  return apiClient.get(endpoints.swipemax.chatSession(sessionId));
}

/**
 * Runs one turn. The verdict lands through `onVerdict` well before the narration finishes
 * streaming through `onToken`, which is the whole point of the SSE path.
 *
 * Resolves with the turn payload (`{ narration, verdict, message }`) whether the server streamed
 * or answered with a plain JSON envelope.
 */
export async function sendChatMessage({ sessionId, message, onVerdict, onToken }) {
  const token = await secureStorage.get(StorageKeys.accessToken);
  let settled = null;

  const jsonPayload = await streamSse({
    url: `${env.apiUrl}${endpoints.swipemax.chatMessages(sessionId)}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    onEvent: ({ event, data }) => {
      if (event === 'verdict') onVerdict?.(data);
      else if (event === 'token' && data?.token) onToken?.(data.token);
      else if (event === 'done') settled = data;
    },
  });

  return settled ?? jsonPayload;
}
