// #genai: Wallet Categorisation — which card to use for which kind of spend.
//
// Two views of one map, because the question arrives from both ends: "I am about to pay for
// groceries, which card?" (by category) and "what is this card actually for?" (by card). A category
// can have several cards and a card can serve several categories.
//
// Unlocked by the wallet audit: the audit supplies the spend that says how a category is split once
// caps are in play. Until then this screen explains the lock and sends the user to the audit rather
// than showing an empty map.
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { IconButton } from '@/components/actions/IconButton';
import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { ArrowLeftIcon, ArrowRightIcon, LockIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { BucketCard } from '../components/BucketCard';
import { CardMapRow } from '../components/CardMapRow';
import { useCategorisation } from '../hooks/useWallet';
import { formatPct, GROUP_LABELS } from '../lib/auditCopy';

const GROUP_ORDER = ['everyday', 'recurring', 'other'];

function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      accessibilityLabel="Back"
      icon={ArrowLeftIcon}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={styles.back}
    />
  );
}

export function WalletCategorisationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const query = useCategorisation();
  const [view, setView] = useState('category');

  const map = query.data;
  const labelFor = useMemo(() => {
    const labels = new Map((map?.buckets ?? []).map((bucket) => [bucket.id, bucket.label.toLowerCase()]));
    return (id) => labels.get(id) ?? id;
  }, [map]);

  if (query.isPending) {
    return (
      <AppScreen>
        <BackButton />
        <View style={[styles.centered, { paddingVertical: theme.spacing.huge }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </AppScreen>
    );
  }

  // The audit has not been finished: explain the lock, and open the way to it.
  if (query.error?.code === 'AUDIT_INCOMPLETE') {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader eyebrow="Wallet categorisation" title="Finish your audit first" />
        <Surface contentStyle={{ gap: theme.spacing.lg }}>
          <View style={[styles.lock, { backgroundColor: theme.colors.primarySubtle }]}>
            <LockIcon size={22} color={theme.colors.primary} />
          </View>
          <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
            Categorisation shows which card takes which spend. To split a category sensibly — a capped card first,
            a steady one after — it needs to know what you spend. The wallet audit asks that, and unlocks this.
          </Text>
          <PrimaryButton label="Start the audit" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/wallet-audit')} />
        </Surface>
      </AppScreen>
    );
  }

  if (query.error?.code === 'NEST_EMPTY') {
    return (
      <AppScreen>
        <BackButton />
        <ScreenHeader eyebrow="Wallet categorisation" title="Add your cards first" />
        <PrimaryButton label="Find your first card" trailingIcon={ArrowRightIcon} onPress={() => router.replace('/add-card')} />
      </AppScreen>
    );
  }

  if (query.error) {
    return (
      <AppScreen>
        <BackButton />
        <FormBanner message={query.error.message} />
        <SecondaryButton label="Try again" onPress={query.refetch} />
      </AppScreen>
    );
  }

  const withSpend = map.buckets.filter((bucket) => bucket.monthly > 0);
  const withoutSpend = map.buckets.filter((bucket) => bucket.monthly === 0 && !bucket.noCardEarns);

  return (
    <AppScreen>
      <BackButton />
      <ScreenHeader
        eyebrow="Wallet categorisation"
        title="Which card, for what"
        description="Your cards mapped to your spending. A category can use more than one card, and a card can serve more than one category."
      />

      <View style={[styles.switch, { gap: theme.spacing.sm }]}>
        <Chip label="By category" accessibilityRole="radio" selected={view === 'category'} onPress={() => setView('category')} style={styles.switchChip} />
        <Chip label="By card" accessibilityRole="radio" selected={view === 'card'} onPress={() => setView('card')} style={styles.switchChip} />
      </View>

      {view === 'category' ? (
        <>
          {GROUP_ORDER.map((group) => {
            const rows = withSpend.filter((bucket) => bucket.group === group);
            if (rows.length === 0) return null;
            return (
              <Reveal key={group} delay={stagger(2)} style={{ gap: theme.spacing.md }}>
                <SectionLabel label={GROUP_LABELS[group]} count={rows.length} />
                {rows.map((bucket) => (
                  <BucketCard key={bucket.id} bucket={bucket} />
                ))}
              </Reveal>
            );
          })}

          {withoutSpend.length > 0 ? (
            <View style={{ gap: theme.spacing.md }}>
              <SectionLabel label="No spend entered" count={withoutSpend.length} />
              <Surface padded={false}>
                {withoutSpend.map((bucket, index) => {
                  const lead = bucket.cards[0];
                  return (
                    <View key={bucket.id}>
                      {index > 0 ? <Rule inset={theme.spacing.lg + theme.spacing.xs} /> : null}
                      <View style={[styles.compact, { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
                        <View style={styles.compactCopy}>
                          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{bucket.label}</Text>
                          <Text numberOfLines={1} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                            {lead.cardName}
                          </Text>
                        </View>
                        <Text style={[theme.textStyles.numeric, { color: theme.colors.primary }]}>{formatPct(lead.ratePct)}</Text>
                      </View>
                    </View>
                  );
                })}
              </Surface>
            </View>
          ) : null}
        </>
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          <SectionLabel label="Your cards" count={map.cards.length} />
          {map.cards.map((card) => (
            <CardMapRow key={card.cardId} card={card} labelFor={labelFor} />
          ))}
        </View>
      )}

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
        Rates are what each card earns on a Rs.{map.referenceAmount.toLocaleString('en-IN')} purchase, after any monthly
        cap. The share shown is how your own spend is split once caps are in play.
      </Text>

      <SecondaryButton label="Change my spend" onPress={() => router.push('/wallet-audit')} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  centered: {
    alignItems: 'center',
  },
  lock: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    flexDirection: 'row',
  },
  switchChip: {
    flex: 1,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCopy: {
    flex: 1,
    gap: 2,
  },
});
