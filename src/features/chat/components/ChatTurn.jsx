// #genai: One turn in the transcript.
//
// The chat is deliberately prose-only. SwipeMax's calculated result stays server-side as
// grounding for the LLM, rather than exposing card rules, fees, caps, or internal conditions.
import { StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';

import { Markdown } from './Markdown';

export function ChatTurn({ role, text, animate = true, streaming = false }) {
  const theme = useTheme();
  const isUser = role === 'user';
  const Wrapper = animate ? Reveal : View;

  return (
    <Wrapper style={{ gap: theme.spacing.sm }}>
      <Text
        style={[
          theme.textStyles.micro,
          { color: theme.colors.textFaint, textAlign: isUser ? 'right' : 'left' },
        ]}
      >
        {isUser ? 'You' : 'SwipeMax'}
      </Text>

      {isUser ? (
        <Text style={[theme.textStyles.bodyStrong, styles.userText, { color: theme.colors.text }]}>
          {text}
        </Text>
      ) : (
        // What the user typed is plain text; only the model writes Markdown.
        <Markdown text={text} streaming={streaming} />
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  userText: {
    textAlign: 'right',
  },
});
