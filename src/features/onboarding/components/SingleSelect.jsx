// #genai: Full-width, database-value-safe single-select rows.
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

export function SingleSelect({ label, options, value, onChange, disabled = false, error }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      {label ? (
        <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>{label}</Text>
      ) : null}

      <View>
        <Rule />
        {options.map((option) => {
          const selected = option === value;

          return (
            <View key={option}>
              <PressableScale
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                haptic="selection"
                onPress={() => onChange(option)}
                scaleTo={0.99}
                style={[
                  styles.row,
                  {
                    minHeight: theme.metrics.buttonHeight,
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.xs,
                    gap: theme.spacing.lg,
                    backgroundColor: selected ? theme.colors.primarySubtle : 'transparent',
                  },
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
                    },
                  ]}
                >
                  {selected ? (
                    <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                  ) : null}
                </View>
              </PressableScale>
              <Rule />
            </View>
          );
        })}
      </View>

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
  },
  label: {
    flex: 1,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
