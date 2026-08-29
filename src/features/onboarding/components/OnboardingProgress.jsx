// #genai: Quiet statement-rule progress for the four onboarding pages.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function OnboardingProgress({ step }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`Onboarding step ${step} of 4`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: 4, now: step }}
      style={{ gap: theme.spacing.sm }}
    >
      <View style={styles.labels}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
          Step {String(step).padStart(2, '0')}
        </Text>
        <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>of 04</Text>
      </View>

      <View style={[styles.track, { gap: theme.spacing.xs }]}>
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            style={[
              styles.segment,
              {
                backgroundColor: segment <= step ? theme.colors.borderStrong : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
