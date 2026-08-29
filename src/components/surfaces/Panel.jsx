// #genai: A bordered paper panel, for the rare case where content genuinely needs containing.
//
// Used sparingly and never nested. If two panels end up adjacent, the right answer is almost always
// one panel with a `Rule` between its rows — or no panel at all and more space. There is no shadow:
// this sits *on* the page, it does not float above it.
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function Panel({ children, tone = 'default', padded = true, style, contentStyle }) {
  const theme = useTheme();

  const tones = {
    default: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
    sunken: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
    accent: { backgroundColor: theme.colors.primarySubtle, borderColor: theme.colors.primaryEdge },
    // No side stripe, no icon chrome — the tint alone carries the tone.
    danger: { backgroundColor: theme.colors.dangerSubtle, borderColor: theme.colors.danger },
  };

  return (
    <View
      style={[styles.shell, { borderRadius: theme.radius.md }, tones[tone] ?? tones.default, style]}
    >
      <View style={[padded && { padding: theme.spacing.xl, gap: theme.spacing.md }, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
