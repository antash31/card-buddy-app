// #genai: A word explained in place — "Voucher: A voucher is a gift code…". It sits under the first
// thing on the page that uses the word, as a recessed tile, so it reads as a side note, not a rule.
import { Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function TermNote({ word, text }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`${word}. ${text}`}
      style={{
        backgroundColor: theme.materials.inset.background,
        borderRadius: theme.radius.sm,
        paddingVertical: theme.spacing.sm + theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.hair,
      }}
    >
      <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>{word}</Text>
      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{text}</Text>
    </View>
  );
}
