// #genai: Live password strength feedback.
//
// Validating as the user types (rather than on submit) turns the password policy from a gate
// into guidance — each requirement ticks off the moment it is satisfied.
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

import { CheckIcon } from '@/components/icons';
import { Reveal } from '@/components/motion/Reveal';
import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';
import { getPasswordStrength } from '@/features/auth/lib/validation';
import { springs, timings } from '@/theme/motion';

const SEGMENTS = 4;

function Segment({ active, color, reduceMotion }) {
  const animatedStyle = useAnimatedStyle(() => {
    const target = active ? 1 : 0.18;

    return {
      opacity: reduceMotion
        ? withTiming(target, { duration: timings.base })
        : withSpring(target, springs.snappy),
    };
  }, [active, reduceMotion]);

  return <Animated.View style={[styles.segment, { backgroundColor: color }, animatedStyle]} />;
}

export function PasswordStrength({ value }) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();

  if (!value) return null;

  const { score, label, rules } = getPasswordStrength(value);

  const tone =
    score >= 4
      ? theme.colors.success
      : score === 3
        ? theme.colors.success
        : score === 2
          ? theme.colors.warning
          : theme.colors.danger;

  return (
    <Reveal distance={6} style={{ gap: theme.spacing.sm }}>
      <View style={[styles.meterRow, { gap: theme.spacing.xs }]}>
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <Segment
            key={index}
            active={index < score}
            color={index < score ? tone : theme.colors.border}
            reduceMotion={reduceMotion}
          />
        ))}
        <Text style={[theme.textStyles.caption, { color: tone, marginLeft: theme.spacing.sm }]}>
          {label}
        </Text>
      </View>

      <View style={[styles.rules, { gap: theme.spacing.sm }]}>
        {rules.map((rule) => (
          <View key={rule.id} style={[styles.rule, { gap: theme.spacing.xs }]}>
            <CheckIcon
              size={12}
              color={rule.met ? theme.colors.success : theme.colors.textMuted}
              strokeWidth={rule.met ? 2.6 : 1.6}
            />
            <Text
              style={[
                theme.textStyles.caption,
                { color: rule.met ? theme.colors.text : theme.colors.textMuted },
              ]}
            >
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  rules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
