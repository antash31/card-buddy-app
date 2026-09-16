// #genai: Compare a purchase against the signed-in Card Nest.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { formatRupees } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useComparePurchase } from '../hooks/useSwipeMax';

export function SwipeMaxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const compare = useComparePurchase();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [channel, setChannel] = useState('');
  const [isInternational, setIsInternational] = useState(false);

  const result = compare.data;

  const onCompare = () => {
    const parsed = Number(String(amount).replace(/,/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    compare.mutate({
      amount: parsed,
      ...(category.trim() ? { category: category.trim().toLowerCase() } : {}),
      ...(merchant.trim() ? { merchant: merchant.trim().toLowerCase() } : {}),
      ...(channel.trim() ? { channel: channel.trim().toLowerCase() } : {}),
      ...(isInternational ? { isInternational: true } : {}),
    });
  };

  return (
    <AppScreen>
      <ScreenHeader
        eyebrow="Before you pay"
        title="SwipeMax"
        description="Score this purchase against the cards in your nest. The figure is from the engine, not a guess."
        trailing={
          <TextLink
            label="Ask"
            align="right"
            onPress={() => router.push('/chat')}
            style={{ paddingVertical: 0 }}
          />
        }
      />

      {compare.error ? <FormBanner message={compare.error.message} /> : null}

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.md }}>
          <TextField
            label="Amount (Rs.)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />
          <TextField
            label="Category"
            value={category}
            onChangeText={setCategory}
            autoCapitalize="none"
            helperText="grocery, dining, fuel, utility, travel…"
          />
          <TextField
            label="Merchant"
            value={merchant}
            onChangeText={setMerchant}
            autoCapitalize="none"
          />
          <TextField
            label="Channel"
            value={channel}
            onChangeText={setChannel}
            autoCapitalize="none"
            helperText="pos, google_pay_app, smartbuy…"
          />
          <View style={[styles.switchRow, { paddingVertical: theme.spacing.sm }]}>
            <Text style={[theme.textStyles.body, { color: theme.colors.text, flex: 1 }]}>
              International
            </Text>
            <Switch
              value={isInternational}
              onValueChange={setIsInternational}
              trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <PrimaryButton
            label="Which card"
            onPress={onCompare}
            loading={compare.isPending}
            disabled={!amount.trim()}
          />
        </View>
      </Reveal>

      {result ? (
        <Reveal delay={stagger(6)}>
          <View style={{ gap: theme.spacing.lg }}>
            <Rule weight="strong" />
            <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>Verdict</Text>
            <Text style={[theme.textStyles.display, { color: theme.colors.text }]}>
              {result.verdict === 'winner'
                ? result.ranked[0]?.cardName
                : result.verdict === 'tie'
                  ? 'Tie'
                  : result.verdict === 'no_positive_option'
                    ? 'No positive option'
                    : result.verdict === 'needs_clarification'
                      ? 'Conditional result'
                      : 'No ranking'}
            </Text>
            {(result.bestGuaranteed ?? result.ranked[0]) ? (
              <Text
                style={[
                  theme.textStyles.title,
                  {
                    color: theme.colors.primary,
                    fontFamily: theme.fonts.text.semibold,
                  },
                ]}
              >
                {formatRupees((result.bestGuaranteed ?? result.ranked[0]).rewardValue ?? 0)} rewards
              </Text>
            ) : null}
            <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
              {result.verdictText}
            </Text>

            {(result.ranked ?? []).map((row, index) => (
              <View key={`${row.cardName}-${index}`}>
                <Rule />
                <View style={[styles.rankRow, { paddingVertical: theme.spacing.md }]}>
                  <View style={{ flex: 1, gap: theme.spacing.hair }}>
                    <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
                      {row.cardName}
                    </Text>
                    {row.capped ? (
                      <Text style={[theme.textStyles.caption, { color: theme.colors.textFaint }]}>
                        Capped
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[
                      theme.textStyles.bodyStrong,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.fonts.text.semibold,
                      },
                    ]}
                  >
                    {formatRupees(row.rewardValue ?? 0)}
                  </Text>
                </View>
                {(row.feeCost ?? 0) > 0 ? (
                  <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
                    Fee {formatRupees(row.feeCost)} · net benefit{' '}
                    {formatRupees(row.netBenefit ?? 0)}
                  </Text>
                ) : null}
              </View>
            ))}

            {(result.conditionalWinners ?? []).map((path, index) => (
              <View key={`conditional-${path.cardId ?? path.cardName}-${path.ruleId}-${index}`}>
                <Rule />
                <Text
                  style={[
                    theme.textStyles.caption,
                    { color: theme.colors.textMuted, paddingVertical: theme.spacing.md },
                  ]}
                >
                  If {(path.requirements ?? []).map((item) => item.reason).join(' and ')},{' '}
                  {path.cardName} gives {formatRupees(path.rewardValue ?? 0)} rewards.
                </Text>
              </View>
            ))}

            {result.recommendedClarification ? (
              <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
                One question: {result.recommendedClarification.reason}
              </Text>
            ) : null}
          </View>
        </Reveal>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
