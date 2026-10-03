// #genai: A tappable row with an icon tile, a title and one line of status — the Card Nest's doorway
// to a tool. Several of these sit together inside one padded-false `Surface`, separated by a `Rule`
// inset to the text, so a group of tools reads as one list rather than a stack of cards.
import { StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon, LockIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

/** Width of the icon tile; rules between rows inset by this plus the row's padding and gap. */
export const TOOL_ROW_TILE = 40;

export function ToolRow({ icon: Icon, title, subtitle, locked = false, onPress }) {
  const theme = useTheme();

  return (
    <PressableScale
      accessibilityLabel={`${title}. ${subtitle}`}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.99}
      dimTo={0.96}
      hitSlop={0}
      style={[styles.row, { padding: theme.spacing.lg, gap: theme.spacing.md }]}
    >
      <View style={[styles.tile, { backgroundColor: theme.colors.primarySubtle, borderRadius: theme.radius.sm }]}>
        <Icon size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{subtitle}</Text>
      </View>
      {locked ? (
        <LockIcon size={18} color={theme.colors.textFaint} />
      ) : (
        <ChevronRightIcon size={18} color={theme.colors.textFaint} />
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    width: TOOL_ROW_TILE,
    height: TOOL_ROW_TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
