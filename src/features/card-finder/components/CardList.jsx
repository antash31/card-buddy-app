// #genai: A compact list of cards with one line each — the rest of the options, cards without a fee,
// cards that cannot be scored. One soft card holding rows divided by inset rules, like the tool lists.
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

/** `rows`: [{ key, title, subtitle, value, valueTone }] — `value` is optional, right-aligned. */
export function CardList({ rows }) {
  const theme = useTheme();

  return (
    <Surface padded={false}>
      {rows.map((row, index) => (
        <Fragment key={row.key}>
          {index > 0 ? <Rule inset={theme.spacing.lg} /> : null}
          <View style={[styles.row, { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
            <View style={styles.copy}>
              <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{row.title}</Text>
              {row.subtitle ? (
                <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>{row.subtitle}</Text>
              ) : null}
            </View>
            {row.value ? (
              <Text
                style={[
                  theme.textStyles.bodyStrong,
                  { color: row.valueTone === 'success' ? theme.colors.success : theme.colors.textMuted },
                ]}
              >
                {row.value}
              </Text>
            ) : null}
          </View>
        </Fragment>
      ))}
    </Surface>
  );
}

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
