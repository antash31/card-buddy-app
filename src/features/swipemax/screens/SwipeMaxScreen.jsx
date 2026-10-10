// #genai: Compare a purchase against the signed-in Card Nest.
//
// A form on one soft card, and a verdict on a pane of tinted glass beneath it — the one place the
// glass is stained with the accent, because the answer is the one thing on this screen the user is
// here to see. Every rupee figure comes from the engine; the bars under the ranking are only a
// visual ratio of those same figures and carry no numbers of their own.
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { CardArt } from '@/components/brand/CardArt';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { SparkleIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useMyCards } from '@/features/card-nest/hooks/useNest';
import { formatRupees } from '@/lib/money';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useComparePurchase } from '../hooks/useSwipeMax';

// Characters of engine text shown before it collapses behind "Show all".
const ENGINE_TEXT_PREVIEW = 240;

const VERDICT_TITLES = {
  tie: 'Tie',
  no_positive_option: 'No positive option',
  needs_clarification: 'Conditional result',
};

const VERDICT_EYEBROWS = {
  winner: 'Use this card',
  tie: 'Either works',
  no_positive_option: 'Nothing earns here',
  needs_clarification: 'Depends on one thing',
};

export function SwipeMaxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const compare = useComparePurchase();
  const nest = useMyCards();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [channel, setChannel] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [showEngineText, setShowEngineText] = useState(false);

  const result = compare.data;
  const ranked = result?.ranked ?? [];
  const top = result?.bestGuaranteed ?? ranked[0];

  // The engine names cards but does not return their issuer; the nest does, so match on name to
  // give the winner its colours. A miss simply renders without art.
  const nestByName = useMemo(
    () => new Map((nest.data?.cards ?? []).map((card) => [card.cardName, card])),
    [nest.data?.cards],
  );

  const topReward = Math.max(...ranked.map((row) => row.rewardValue ?? 0), 0);
  const winnerCard = nestByName.get(ranked[0]?.cardName);

  // The engine's own explanation is exhaustive — every rule and condition it weighed, with raw ids.
  // It stays on screen (it is the ground truth behind the figures), but long ones start collapsed
  // so the verdict above it is what the eye lands on.
  const engineText = result?.verdictText ?? '';
  const engineTextIsLong = engineText.length > ENGINE_TEXT_PREVIEW;

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
          <IconButton
            accessibilityLabel="Ask SwipeMax"
            icon={SparkleIcon}
            onPress={() => router.push('/chat')}
          />
        }
      />

      {compare.error ? <FormBanner message={compare.error.message} /> : null}

      <Reveal delay={stagger(4)}>
        <Surface contentStyle={{ gap: theme.spacing.md }}>
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

          <View style={[styles.switchRow, { paddingVertical: theme.spacing.xs }]}>
            <View style={{ flex: 1, gap: theme.spacing.hair }}>
              <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
                International
              </Text>
              <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                Paid abroad or in a foreign currency
              </Text>
            </View>
            <Switch
              value={isInternational}
              onValueChange={setIsInternational}
              trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.borderStrong}
            />
          </View>

          <PrimaryButton
            label="Which card"
            onPress={onCompare}
            loading={compare.isPending}
            disabled={!amount.trim()}
          />
        </Surface>
      </Reveal>

      {result ? (
        <Reveal delay={stagger(2)} style={{ gap: theme.spacing.lg }}>
          <SectionLabel label="Verdict" />

          <Surface tone="glassTinted" shadow="lg" contentStyle={{ gap: theme.spacing.lg }}>
            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
                {VERDICT_EYEBROWS[result.verdict] ?? 'No ranking'}
              </Text>
              <Text style={[theme.textStyles.title, { color: theme.colors.text }]}>
                {result.verdict === 'winner'
                  ? ranked[0]?.cardName
                  : (VERDICT_TITLES[result.verdict] ?? 'No ranking')}
              </Text>
            </View>

            {winnerCard && result.verdict === 'winner' ? (
              <View style={styles.winnerArt}>
                <CardArt
                  width={236}
                  bank={winnerCard.bank}
                  network={winnerCard.network}
                  title={winnerCard.cardName}
                  subtitle={winnerCard.bank}
                />
              </View>
            ) : null}

            {top ? (
              <View style={{ gap: theme.spacing.xs }}>
                <Text style={[theme.textStyles.figure, { color: theme.colors.primary }]}>
                  {formatRupees(top.rewardValue ?? 0)}
                </Text>
                <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>
                  in rewards on this purchase
                </Text>
              </View>
            ) : null}

            <View style={{ gap: theme.spacing.xs }}>
              <Text
                numberOfLines={engineTextIsLong && !showEngineText ? 4 : undefined}
                style={[theme.textStyles.body, { color: theme.colors.textMuted }]}
              >
                {engineText}
              </Text>
              {engineTextIsLong ? (
                <TextLink
                  label={showEngineText ? 'Show less' : 'Show all engine detail'}
                  align="start"
                  onPress={() => setShowEngineText((previous) => !previous)}
                />
              ) : null}
            </View>
          </Surface>

          {ranked.length ? (
            <Surface padded={false}>
              {ranked.map((row, index) => {
                const reward = row.rewardValue ?? 0;
                const share = topReward > 0 ? Math.max(reward / topReward, 0.04) : 0.04;
                const isTop = index === 0;

                return (
                  <View key={`${row.cardName}-${index}`}>
                    {index > 0 ? <Rule inset={theme.spacing.lg + theme.spacing.xs} /> : null}
                    <View style={{ padding: theme.spacing.lg + theme.spacing.xs, gap: theme.spacing.md }}>
                      <View style={[styles.rankRow, { gap: theme.spacing.md }]}>
                        <View
                          style={[
                            styles.rankBadge,
                            {
                              backgroundColor: isTop
                                ? theme.colors.primary
                                : theme.materials.inset.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              theme.textStyles.micro,
                              { color: isTop ? theme.colors.onPrimary : theme.colors.textMuted },
                            ]}
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <View style={{ flex: 1, gap: theme.spacing.hair }}>
                          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
                            {row.cardName}
                          </Text>
                          {row.capped ? (
                            <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
                              Capped
                            </Text>
                          ) : null}
                        </View>

                        <Text style={[theme.textStyles.numeric, { color: theme.colors.text }]}>
                          {formatRupees(reward)}
                        </Text>
                      </View>

                      <View
                        style={[styles.track, { backgroundColor: theme.materials.inset.background }]}
                      >
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${share * 100}%`,
                              backgroundColor: theme.colors.primary,
                              opacity: isTop ? 1 : 0.38,
                            },
                          ]}
                        />
                      </View>

                      {(row.feeCost ?? 0) > 0 ? (
                        <Text style={[theme.textStyles.caption, { color: theme.colors.warning }]}>
                          Fee {formatRupees(row.feeCost)} · net benefit{' '}
                          {formatRupees(row.netBenefit ?? 0)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </Surface>
          ) : null}

          {(result.conditionalWinners ?? []).map((path, index) => (
            <Surface
              key={`conditional-${path.cardId ?? path.cardName}-${path.ruleId}-${index}`}
              tone="inset"
            >
              <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                If {(path.requirements ?? []).map((item) => item.reason).join(' and ')},{' '}
                {path.cardName} gives {formatRupees(path.rewardValue ?? 0)} rewards.
              </Text>
            </Surface>
          ))}

          {result.recommendedClarification ? (
            <Surface tone="tinted">
              <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
                One question: {result.recommendedClarification.reason}
              </Text>
            </Surface>
          ) : null}
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
  winnerArt: {
    alignItems: 'flex-start',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
