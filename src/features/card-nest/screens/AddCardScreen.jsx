// #genai: Search the loaded catalog and add a card to the nest.
//
// The three "nothing to show" states are deliberately different sentences. Merging them into one
// generic "No results" is how a user ends up thinking the catalog is missing their card when they
// have in fact only typed one letter.
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { SearchIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { BankFilter } from '../components/BankFilter';
import { CatalogResult } from '../components/CatalogResult';
import { MIN_QUERY_LENGTH, useAddCard, useCatalogSearch, useMyCards } from '../hooks/useNest';

export function AddCardScreen({
  mode = 'app',
  beforeHeader = null,
  footer = null,
  header = {
    eyebrow: 'Catalog',
    title: 'Add a card',
    description:
      'Only cards with reward data loaded appear here — those are the ones Card Buddy can actually score.',
  },
}) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [bank, setBank] = useState(null);
  const [banner, setBanner] = useState(null);
  const searchRef = useRef(null);

  const nest = useMyCards();
  const search = useCatalogSearch({ q: query, bank });
  const add = useAddCard();

  const ownedIds = useMemo(
    () => new Set((nest.data?.cards ?? []).map((card) => card.cardId)),
    [nest.data?.cards],
  );

  const results = search.cards;
  const noResults = search.hasResolved && results.length === 0;
  const addingId = add.isPending ? add.variables : null;
  const ScreenShell = mode === 'onboarding' ? AuthLayout : AppScreen;

  const handleAdd = (card) => {
    setBanner(null);

    if (ownedIds.has(card.cardId)) {
      setBanner({ tone: 'info', message: `${card.cardName} is already in your nest.` });
      return;
    }

    add.mutate(card.cardId, {
      onSuccess: () => {
        setBanner({ tone: 'success', message: `${card.cardName} added to your nest.` });
      },
      onError: (error) => {
        setBanner({
          tone: 'error',
          message:
            error.code === 'CARD_ALREADY_IN_NEST'
              ? `${card.cardName} is already in your nest.`
              : error.message,
        });
      },
    });
  };

  return (
    <ScreenShell>
      {beforeHeader}
      <ScreenHeader {...header} />

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.lg }}>
          <TextField
            ref={searchRef}
            label="Card or bank name"
            leftIcon={SearchIcon}
            value={query}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onChangeText={(value) => {
              setBanner(null);
              setQuery(value);
            }}
          />

          <BankFilter
            value={bank}
            onChange={(next) => {
              setBanner(null);
              setBank(next);
            }}
          />
        </View>
      </Reveal>

      {banner ? <FormBanner message={banner.message} tone={banner.tone} /> : null}
      {search.error ? <FormBanner message={search.error.message} /> : null}

      {/* Idle: teach the two ways to search rather than showing an empty results area. */}
      {!search.isActive ? (
        <Text style={[theme.textStyles.body, styles.prose, { color: theme.colors.textMuted }]}>
          Type at least {MIN_QUERY_LENGTH} characters, or pick a bank to browse everything it
          issues.
        </Text>
      ) : null}

      {search.isSearching ? (
        <View style={[styles.centered, { paddingVertical: theme.spacing.xl }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {noResults ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
            Nothing matches that
          </Text>
          <Text style={[theme.textStyles.body, styles.prose, { color: theme.colors.textMuted }]}>
            Reward data is still being loaded bank by bank, so a card you hold may not be searchable
            yet. Try the issuer name on its own.
          </Text>
        </View>
      ) : null}

      {results.length ? (
        <View style={{ gap: theme.spacing.md }}>
          <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
            {results.length} {results.length === 1 ? 'match' : 'matches'}
          </Text>
          <View>
            <Rule />
            {results.map((card, index) => (
              <CatalogResult
                key={card.cardId}
                card={card}
                alreadyInNest={ownedIds.has(card.cardId)}
                adding={addingId === card.cardId}
                isLast={index === results.length - 1}
                onAdd={() => handleAdd(card)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {typeof footer === 'function' ? footer({ hasCards: ownedIds.size > 0 }) : footer}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
  },
  prose: {
    maxWidth: 460,
  },
});
