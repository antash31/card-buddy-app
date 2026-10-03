// #genai: The one-word verdict on a card — Keep, Close, Upgrade, Downgrade, Review, Needs info.
//
// Colour carries the tone but never alone: the word is always there, so the verdict survives a
// colour-vision deficiency and a glance at a screenshot in greyscale.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { VERDICTS } from '../lib/auditCopy';

export function VerdictPill({ verdict }) {
  const theme = useTheme();
  const { label, tone } = VERDICTS[verdict] ?? VERDICTS.unknown;

  const foreground = tone === 'muted' ? theme.colors.textMuted : theme.colors[tone];
  const background = tone === 'muted' ? theme.materials.inset.background : theme.colors[`${tone}Subtle`];

  return (
    <View
      accessibilityLabel={`Verdict: ${label}`}
      style={[styles.pill, { backgroundColor: background, borderRadius: theme.radius.full }]}
    >
      <Text style={[theme.textStyles.micro, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
