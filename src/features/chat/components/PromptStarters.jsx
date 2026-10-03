// #genai: The empty state.
//
// A blank chat with a placeholder is a guessing game — the engine only answers when it gets an
// amount, so the first screen shows the exact shape of a question that works. Tapping loads the
// composer instead of sending, so the amount can be edited to the real one.
import { StyleSheet, Text, View } from 'react-native';

import { ArrowRightIcon } from '@/components/icons';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { PressableScale } from '@/components/motion/PressableScale';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

const STARTERS = [
  'Rs.4,000 groceries at a POS',
  'Rs.18,000 flight booking online',
  'Rs.1,200 Swiggy order',
  'Rs.6,000 fuel at a petrol pump',
];

export function PromptStarters({ onSelect }) {
  const theme = useTheme();
  const pad = theme.spacing.lg;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionLabel label="Try asking" />
      <Surface padded={false}>
        {STARTERS.map((prompt, index) => (
          <View key={prompt}>
            {index > 0 ? <Rule inset={pad} /> : null}
            <PressableScale
              accessibilityLabel={`Use the example: ${prompt}`}
              onPress={() => onSelect(prompt)}
              haptic="light"
              scaleTo={0.99}
              hitSlop={0}
              style={[styles.row, { padding: pad, gap: theme.spacing.md }]}
            >
              <Text style={[theme.textStyles.body, styles.grow, { color: theme.colors.text }]}>
                {prompt}
              </Text>
              <View style={[styles.arrow, { backgroundColor: theme.colors.primarySubtle }]}>
                <ArrowRightIcon size={15} color={theme.colors.primary} />
              </View>
            </PressableScale>
          </View>
        ))}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
