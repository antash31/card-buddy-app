// #genai: The empty state.
//
// A blank chat with a placeholder is a guessing game — the engine only answers when it gets an
// amount, so the first screen shows the exact shape of a question that works. Tapping loads the
// composer instead of sending, so the amount can be edited to the real one.
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

const STARTERS = [
  'Rs.4,000 groceries at a POS',
  'Rs.18,000 flight booking online',
  'Rs.1,200 Swiggy order',
  'Rs.6,000 fuel at a petrol pump',
];

export function PromptStarters({ onSelect }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>Try</Text>
      <View>
        {STARTERS.map((prompt) => (
          <View key={prompt}>
            <Rule />
            <PressableScale
              accessibilityLabel={`Use the example: ${prompt}`}
              onPress={() => onSelect(prompt)}
              haptic="light"
              scaleTo={0.99}
              style={[styles.row, { paddingVertical: theme.spacing.md }]}
            >
              <Text style={[theme.textStyles.body, styles.grow, { color: theme.colors.text }]}>
                {prompt}
              </Text>
              <Text style={[theme.textStyles.body, { color: theme.colors.textFaint }]}>→</Text>
            </PressableScale>
          </View>
        ))}
        <Rule />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
});
