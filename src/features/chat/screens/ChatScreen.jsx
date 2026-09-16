// #genai: Streaming-aware SwipeMax chat — the ranking paints before the sentence arrives.
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { PaperBackground } from '@/components/surfaces/PaperBackground';
import { useTheme } from '@/providers/ThemeProvider';

import { ChatTurn } from '../components/ChatTurn';
import { Composer } from '../components/Composer';
import { PromptStarters } from '../components/PromptStarters';
import { useChatSession, useCreateChatSession, useSendChatMessage } from '../hooks/useChat';
import { llmAnswerFromLiveText, llmAnswerOf } from '../lib/transcript';

export function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const createSession = useCreateChatSession();
  const [sessionId, setSessionId] = useState(null);
  const [draft, setDraft] = useState('');
  const [pendingAsk, setPendingAsk] = useState(null);
  const [liveVerdict, setLiveVerdict] = useState(null);
  const [liveNarration, setLiveNarration] = useState('');
  const scrollRef = useRef(null);

  const start = () => createSession.mutate(undefined, { onSuccess: (d) => setSessionId(d.sessionId) });

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
    // One session per screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = useChatSession(sessionId);
  const send = useSendChatMessage(sessionId);

  // The scoring result remains backend grounding only. The chat displays LLM narration, or the
  // unavailable message when the server persisted its deterministic fallback instead.
  const turns = useMemo(
    () =>
      (history.data?.messages ?? []).map((message) => ({
        key: message.messageId,
        role: message.role,
        text: message.role === 'user' ? message.content : llmAnswerOf(message),
      })),
    [history.data?.messages],
  );

  const onSend = () => {
    const message = draft.trim();
    if (!message || !sessionId || send.isPending) return;

    setDraft('');
    setPendingAsk(message);
    setLiveVerdict(null);
    setLiveNarration('');

    send.mutate(
      {
        message,
        onVerdict: setLiveVerdict,
        onToken: (token) => setLiveNarration((prev) => prev + token),
      },
      {
        // The hook refetches the transcript before this runs, so clearing the live turn here
        // hands over to the persisted one without a gap.
        onSettled: () => {
          setPendingAsk(null);
          setLiveVerdict(null);
          setLiveNarration('');
        },
      },
    );
  };

  const nestIsEmpty = send.error?.code === 'NEST_EMPTY';
  const showStarters = turns.length === 0 && !pendingAsk && !history.isPending;
  const bottomInset = insets.bottom + theme.metrics.tabBarHeight;

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{
            paddingTop: insets.top + theme.spacing.xl,
            paddingHorizontal: theme.metrics.gutter,
            paddingBottom: theme.spacing.xxl,
            gap: theme.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <ScreenHeader
            eyebrow="At the counter"
            title="Ask"
            description="Name an amount and where you are paying. The ranking arrives first; the sentence follows."
          />

          {createSession.error ? (
            <View style={{ gap: theme.spacing.sm }}>
              <FormBanner message={createSession.error.message} />
              <TextLink label="Try again" align="left" onPress={start} />
            </View>
          ) : null}

          {send.error ? (
            <View style={{ gap: theme.spacing.sm }}>
              <FormBanner
                message={
                  nestIsEmpty
                    ? 'There are no cards in your nest to compare yet.'
                    : send.error.message
                }
              />
              {nestIsEmpty ? (
                <TextLink label="Add a card" align="left" onPress={() => router.push('/add-card')} />
              ) : null}
            </View>
          ) : null}

          {showStarters ? <PromptStarters onSelect={setDraft} /> : null}

          {turns.map((turn) => (
            <ChatTurn
              key={turn.key}
              role={turn.role}
              text={turn.text}
              animate={false}
            />
          ))}

          {pendingAsk ? <ChatTurn role="user" text={pendingAsk} /> : null}

          {pendingAsk && liveNarration ? (
            <ChatTurn
              role="assistant"
              text={llmAnswerFromLiveText(liveNarration, liveVerdict)}
              streaming
            />
          ) : null}
        </ScrollView>

        <Composer
          value={draft}
          onChangeText={setDraft}
          onSubmit={onSend}
          pending={send.isPending}
          ready={Boolean(sessionId)}
          paddingBottom={bottomInset + theme.spacing.sm}
        />
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
