// #genai: One turn in the transcript, drawn as a message bubble.
//
// The user's turns are accent-blue bubbles pinned right, with the sharp corner at the bottom-right
// where the tail would be; the assistant's are white soft cards pinned left behind a small lit
// sparkle badge, sharp corner top-left. The asymmetric corner is the whole "this is a message"
// signal — it needs no tail glyph.
//
// The chat is deliberately prose-only. SwipeMax's calculated result stays server-side as
// grounding for the LLM, rather than exposing card rules, fees, caps, or internal conditions.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { SparkleIcon } from '@/components/icons';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';

import { Markdown } from './Markdown';

const TAIL = 6;

export function ChatTurn({ role, text, animate = true, streaming = false }) {
  const theme = useTheme();
  const isUser = role === 'user';
  const Wrapper = animate ? Reveal : View;
  const radius = theme.radius.lg;

  return (
    <Wrapper style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant, { gap: theme.spacing.sm }]}>
      {!isUser ? (
        <View style={[styles.badge, theme.materials.shadow.sm]}>
          <LinearGradient
            colors={theme.materials.button.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <SparkleIcon size={15} color={theme.colors.onPrimary} />
        </View>
      ) : null}

      {isUser ? (
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: radius,
              borderBottomRightRadius: TAIL,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
            },
            theme.materials.button.glow,
            // The glow is a button effect; a message bubble should only just lift off the page.
            { shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
          ]}
        >
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.onPrimary }]}>
            {text}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: theme.materials.card.background,
              borderColor: theme.materials.card.rim,
              borderRadius: radius,
              borderTopLeftRadius: TAIL,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
            },
            theme.materials.shadow.sm,
          ]}
        >
          {/* What the user typed is plain text; only the model writes Markdown. */}
          <Markdown text={text} streaming={streaming} color={theme.colors.text} />
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
});
