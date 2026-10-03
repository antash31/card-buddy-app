// #genai: Segmented pill progress for the four onboarding pages.
//
// Four soft pills rather than a hairline: completed segments are the glowing accent, the rest are
// recessed. The step number is spelled out in the eyebrow too — a bar alone says "some progress",
// not "step 2 of 4", and it is invisible to a screen reader without the label below.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function OnboardingProgress({ step }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`Onboarding step ${step} of 4`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: 4, now: step }}
      style={{ gap: theme.spacing.md }}
    >
      <View style={styles.labels}>
        <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
          Step {String(step).padStart(2, '0')}
        </Text>
        <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>of 04</Text>
      </View>

      <View style={[styles.track, { gap: theme.spacing.xs + 2 }]}>
        {[1, 2, 3, 4].map((segment) => {
          const done = segment <= step;

          return (
            <View
              key={segment}
              style={[
                styles.segment,
                {
                  backgroundColor: done ? theme.colors.primary : theme.materials.inset.background,
                },
                done && {
                  shadowColor: theme.colors.primary,
                  shadowOpacity: 0.35,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                },
              ]}
            />
          );
        })}
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
    height: 6,
    borderRadius: 3,
  },
});
