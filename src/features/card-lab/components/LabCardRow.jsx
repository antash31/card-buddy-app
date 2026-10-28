// #genai: One card in the Card Lab list: its art, its name, and "Rs.2,950 a year · 2 prizes · 5 free things".
import { StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { ChevronRightIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

import { listSummary } from '../lib/cardLabCopy';

const THUMB = 56;

export function LabCardRow({ card, onPress }) {
  const theme = useTheme();
  const summary = listSummary(card);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${card.cardName}. ${summary}`}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.99}
      dimTo={0.96}
      hitSlop={0}
      style={[styles.row, { padding: theme.spacing.lg, gap: theme.spacing.md }]}
    >
      <CardArt width={THUMB} bank={card.bank} ghost={false} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
          {card.bank}
        </Text>
        <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{card.cardName}</Text>
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{summary}</Text>
      </View>
      <ChevronRightIcon size={18} color={theme.colors.textFaint} />
    </PressableScale>
  );
}

/** Width of the card art; rules between rows inset by this plus the row's padding and gap. */
export const LAB_ROW_THUMB = THUMB;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
