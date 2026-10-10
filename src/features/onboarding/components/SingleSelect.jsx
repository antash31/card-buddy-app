// #genai: Database-value-safe single-select — pills for short options, soft rows for long ones.
//
// The option strings are the exact database enum values, so they are rendered verbatim and never
// reworded. Layout is chosen from the data: a set of short values ("Salaried", "6L-12L") reads best
// as a cloud of pills that fits on one screen, while sentence-length values ("Cashback / Statement
// Credit") need a full-width row to stay on one line. Either way the whole control is one radio
// group, selection is announced as `checked`, and the selected state changes shape AND colour (a
// check glyph appears), so it never relies on colour alone.
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { CheckIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

const LONG_OPTION = 20;

export function SingleSelect({ label, options, value, onChange, disabled = false, error }) {
  const theme = useTheme();
  const asRows = options.some((option) => option.length > LONG_OPTION);

  return (
    <View style={{ gap: theme.spacing.md }}>
      {label ? (
        <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>{label}</Text>
      ) : null}

      {asRows ? (
        <View style={{ gap: theme.spacing.sm + 2 }} accessibilityRole="radiogroup">
          {options.map((option) => {
            const selected = option === value;

            return (
              <PressableScale
                key={option}
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                haptic="selection"
                onPress={() => onChange(option)}
                scaleTo={0.98}
                style={[
                  styles.row,
                  {
                    minHeight: theme.metrics.buttonHeight + 4,
                    borderRadius: theme.radius.lg,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    gap: theme.spacing.lg,
                    backgroundColor: selected
                      ? theme.colors.primarySubtle
                      : theme.materials.card.background,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  },
                  selected ? null : theme.materials.shadow.sm,
                ]}
              >
                <Text
                  style={[
                    selected ? theme.textStyles.bodyStrong : theme.textStyles.body,
                    styles.label,
                    { color: selected ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {option}
                </Text>

                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: selected ? theme.colors.primary : theme.colors.borderStrong,
                      backgroundColor: selected ? theme.colors.primary : 'transparent',
                    },
                  ]}
                >
                  {selected ? (
                    <CheckIcon size={13} color={theme.colors.onPrimary} strokeWidth={2.8} />
                  ) : null}
                </View>
              </PressableScale>
            );
          })}
        </View>
      ) : (
        <View style={[styles.cloud, { gap: theme.spacing.sm + 2 }]} accessibilityRole="radiogroup">
          {options.map((option) => (
            <Chip
              key={option}
              label={option}
              accessibilityRole="radio"
              selected={option === value}
              showCheck
              disabled={disabled}
              onPress={() => onChange(option)}
            />
          ))}
        </View>
      )}

      {error ? (
        <Text
          accessibilityRole="alert"
          style={[theme.textStyles.caption, { color: theme.colors.danger }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  label: {
    flex: 1,
  },
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
