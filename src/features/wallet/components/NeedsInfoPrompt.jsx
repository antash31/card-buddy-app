// #genai: Asks the one question that would let a card into the audit — answered in place.
//
// Some cards earn differently depending on a fact only the person knows (which version of the card
// they hold, whether they have Prime). Rather than guess, the audit leaves the card out and asks;
// the answer is stored as a confirmed fact and the audit recomputes.
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { useTheme } from '@/providers/ThemeProvider';

import { humanizeCode } from '../lib/auditCopy';

export function NeedsInfoPrompt({ cardId, fact, pending, onAnswer }) {
  const theme = useTheme();

  // A yes/no question has no stored options; an enum has its own.
  const options =
    fact.valueType === 'boolean'
      ? [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ]
      : (fact.allowedValues ?? []).map((value) => ({ value, label: humanizeCode(value) }));

  if (options.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.sm + 2 }}>
      <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>
        {fact.question ?? 'One question about this card'}
      </Text>
      <View style={[styles.options, { gap: theme.spacing.sm }]}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            disabled={pending}
            onPress={() =>
              onAnswer({
                conditionKey: fact.conditionKey,
                value: option.value,
                cardId: fact.scope === 'per_card' ? cardId : undefined,
              })
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
