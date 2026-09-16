// #genai: Chat session + streaming turn hooks.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { haptics } from '@/lib/haptics';

import * as chatApi from '../api/chatApi';

export const chatKeys = {
  session: (id) => ['chat', 'session', id],
};

export function useCreateChatSession() {
  return useMutation({
    mutationFn: chatApi.createChatSession,
    onError: () => haptics.error(),
  });
}

export function useChatSession(sessionId) {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => chatApi.fetchChatSession(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useSendChatMessage(sessionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars) => chatApi.sendChatMessage({ sessionId, ...vars }),
    // Settled, not success: a turn that fails mid-narration has already persisted the question,
    // so the transcript is stale either way. Awaiting it here means the caller's own `onSettled`
    // can drop the live turn without the screen flashing empty.
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.session(sessionId) });
    },
    onError: () => haptics.error(),
  });
}
