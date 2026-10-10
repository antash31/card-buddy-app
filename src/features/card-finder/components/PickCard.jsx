// #genai: One recommended card: what it adds to the wallet, what that already counts, and why.
//
// The gain is the headline; every line under it is a part of that figure or a fact it leaves out
// (the joining fee), so the reader can see what the number rests on.
import { StyleSheet, Text, View } from 'react-native';

import { CardArt } from '@/components/brand/CardArt';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import {
  earnsOnText,
  feeText,
  gainText,
  goalText,
  joiningText,
  otherFeesText,
  styleText,
  takesFromText,
} from '../lib/finderCopy';

const THUMB = 64;

export function PickCard({ pick, caption, goal }) {
  const theme = useTheme();
  const details = [earnsOnText(pick), takesFromText(pick), otherFeesText(pick), joiningText(pick)].filter(Boolean);
  const tags = [goalText(pick, goal), styleText(pick, goal)].filter(Boolean);

  return (
    <Surface contentStyle={{ gap: theme.spacing.md }}>
      <View style={[styles.header, { gap: theme.spacing.md }]}>
        <CardArt width={THUMB} bank={pick.bank} />
        <View style={styles.identity}>
          {caption ? (
            <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>{caption}</Text>
          ) : null}
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{pick.cardName}</Text>
          <Text numberOfLines={1} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
            {pick.bank}
          </Text>
        </View>
      </View>

      <View style={{ gap: 2 }}>
        <Text style={[theme.textStyles.heading, { color: theme.colors.success }]}>{gainText(pick.annualGain)}</Text>
        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{feeText(pick)}</Text>
      </View>

      {details.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          {details.map((line) => (
            <Text key={line} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
              {line}
            </Text>
          ))}
        </View>
      ) : null}

      {tags.length > 0 ? (
        <Text style={[theme.textStyles.caption, { color: theme.colors.primary, fontFamily: theme.fonts.text.semibold }]}>
          {tags.join(' · ')}
        </Text>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identity: {
    flex: 1,
    gap: 2,
  },
});
