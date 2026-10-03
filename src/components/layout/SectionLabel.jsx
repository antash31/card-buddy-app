// #genai: The label above a group of cards — "LAST ACTIONS 1", "IN PROGRESS 2", "+ CREATE".
//
// Small tracked caps in the muted tone with the count riding alongside in the accent blue, and an
// optional action pinned to the right. It replaces a section heading: the card group beneath it is
// self-explanatory, so the label only has to name it and say how many there are.
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function SectionLabel({ label, count, action, onAction, actionIcon: ActionIcon, style }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.md }, style]}>
      <View style={[styles.title, { gap: theme.spacing.sm }]}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>{label}</Text>
        {count !== undefined && count !== null ? (
          <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>{count}</Text>
        ) : null}
      </View>

      {action ? (
        <PressableScale
          accessibilityLabel={action}
          haptic="selection"
          onPress={onAction}
          scaleTo={0.95}
          dimTo={0.6}
          style={[styles.action, { gap: theme.spacing.xs }]}
        >
          {ActionIcon ? <ActionIcon size={14} color={theme.colors.primary} /> : null}
          <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>{action}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
