// #genai: Text input with a floating label — a soft white field with a glowing focus state.
//
// The label is a single element that springs between two states rather than two labels
// cross-fading, so focus, blur and typing can interrupt each other without a flicker. Border and
// glow are interpolated on the UI thread so the focus response has no frame of latency.
//
// Two layers again: the outer view owns the (animated) shadow, the inner pressable owns the border
// and fill. On focus the shadow turns blue and widens, which is what reads as the field "lighting
// up" — a coloured border alone looks like a form from 2015.
//
// The leading icon sits in a small rounded tile that tints blue with focus, echoing the icon tiles
// in the reference design.
import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useSurfaceGround } from '@/components/surfaces/SurfaceContext';
import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { useTheme } from '@/providers/ThemeProvider';
import { springs, timings } from '@/theme/motion';

import { FieldError } from './FieldError';

const MULTILINE_MIN_HEIGHT = 120;
const TILE = 36;

// The whole field is the tap target, not just the ~20pt line the text sits on.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TextField = forwardRef(function TextField(
  {
    label,
    value,
    onChangeText,
    error,
    secureTextEntry = false,
    leftIcon: LeftIcon,
    helperText,
    onBlur,
    onFocus,
    editable = true,
    ...inputProps
  },
  ref,
) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const ground = useSurfaceGround();
  const inputId = useId();

  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Kept alongside the forwarded ref so tapping the field's padding can focus the input while
  // callers can still drive focus themselves for return-key chaining.
  const inputRef = useRef(null);
  const attachInput = useCallback(
    (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const hasValue = Boolean(value);
  const isFloating = focused || hasValue;

  // Driving both from derived values keeps interruption smooth: a blur that lands mid-focus
  // animation retargets the same spring instead of starting a competing one.
  const floatProgress = useDerivedValue(
    () =>
      reduceMotion
        ? withTiming(isFloating ? 1 : 0, { duration: timings.fast })
        : withSpring(isFloating ? 1 : 0, springs.snappy),
    [isFloating, reduceMotion],
  );

  const focusProgress = useDerivedValue(
    () => withTiming(focused ? 1 : 0, { duration: timings.base }),
    [focused],
  );

  const errorProgress = useDerivedValue(
    () => withTiming(error ? 1 : 0, { duration: timings.base }),
    [error],
  );

  const { field } = theme.materials;

  const borderStyle = useAnimatedStyle(() => {
    const focusColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      [field.border, field.borderFocused],
    );

    return {
      borderColor: interpolateColor(errorProgress.value, [0, 1], [focusColor, field.borderError]),
    };
  }, [field]);

  // The glow. Interpolating the soft resting shadow into a wider, coloured one is what makes focus
  // feel like a physical state change rather than a colour tweak.
  const glowStyle = useAnimatedStyle(() => {
    const ringColor = interpolateColor(
      errorProgress.value,
      [0, 1],
      [field.borderFocused, field.borderError],
    );
    const emphasis = Math.max(focusProgress.value, errorProgress.value);

    return {
      shadowColor: interpolateColor(
        emphasis,
        [0, 1],
        [theme.materials.shadow.sm.shadowColor, ringColor],
      ),
      // On a card the field is recessed, so it carries no resting shadow — only the focus glow.
      shadowOpacity: interpolate(
        emphasis,
        [0, 1],
        [ground === 'card' ? 0 : theme.materials.shadow.sm.shadowOpacity, 0.3],
      ),
      shadowRadius: interpolate(emphasis, [0, 1], [10, 16]),
    };
  }, [field, ground, theme.materials.shadow.sm]);

  const labelStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      [theme.colors.textMuted, field.borderFocused],
    );

    return {
      color: interpolateColor(errorProgress.value, [0, 1], [color, field.borderError]),
      transform: [
        { translateY: interpolate(floatProgress.value, [0, 1], [0, -11]) },
        { scale: interpolate(floatProgress.value, [0, 1], [1, 0.78]) },
      ],
    };
  }, [field, theme.colors.textMuted]);

  const handleFocus = useCallback(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const iconColor = error
    ? field.borderError
    : focused
      ? field.borderFocused
      : theme.colors.textMuted;

  const multiline = Boolean(inputProps.multiline);
  const tileBackground = error
    ? theme.colors.dangerSubtle
    : focused
      ? theme.colors.primarySubtle
      : theme.colors.surfaceAlt;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          {
            borderRadius: theme.radius.lg,
            shadowOffset: { width: 0, height: 4 },
            elevation: ground === 'card' ? 0 : 2,
          },
          glowStyle,
        ]}
      >
        <AnimatedPressable
          accessible={false}
          disabled={!editable}
          onPress={focusInput}
          style={[
            styles.container,
            {
              height: multiline ? undefined : theme.metrics.fieldHeight,
              minHeight: multiline ? MULTILINE_MIN_HEIGHT : undefined,
              alignItems: multiline ? 'flex-start' : 'center',
              paddingVertical: multiline ? theme.spacing.lg : 0,
              borderRadius: theme.radius.lg,
              backgroundColor: ground === 'card' ? field.onCard : field.background,
              paddingLeft: LeftIcon ? theme.spacing.md : theme.spacing.lg + theme.spacing.xs,
              paddingRight: theme.spacing.lg,
              gap: theme.spacing.md,
            },
            !editable && styles.disabled,
            borderStyle,
          ]}
        >
          {LeftIcon && (
            <View
              style={[
                styles.tile,
                { backgroundColor: tileBackground, borderRadius: theme.radius.sm },
              ]}
            >
              <LeftIcon size={18} color={iconColor} />
            </View>
          )}

          <View style={styles.inputColumn}>
            <Animated.Text
              nativeID={inputId}
              pointerEvents="none"
              numberOfLines={1}
              style={[
                styles.label,
                {
                  fontFamily: theme.fonts.text.regular,
                  fontSize: theme.typography.fontSize.body,
                  letterSpacing: theme.typography.tracking.body,
                },
                multiline && { top: 0 },
                labelStyle,
              ]}
            >
              {label}
            </Animated.Text>

            <View style={[styles.inputHolder, multiline && { marginTop: 22 }]}>
              <TextInput
                ref={attachInput}
                accessibilityLabel={label}
                accessibilityLabelledBy={inputId}
                editable={editable}
                onBlur={handleBlur}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={secureTextEntry && !revealed}
                selectionColor={field.borderFocused}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.fonts.text.medium,
                    fontSize: theme.typography.fontSize.body,
                    letterSpacing: theme.typography.tracking.body,
                  },
                  multiline && { minHeight: 64, textAlignVertical: 'top' },
                  // The field draws its own focus ring; the browser default would sit on top of it.
                  Platform.OS === 'web' && styles.webInput,
                ]}
                value={value}
                {...inputProps}
              />
            </View>
          </View>

          {secureTextEntry && (
            <PressableScale
              accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              haptic="selection"
              onPress={() => setRevealed((previous) => !previous)}
              scaleTo={0.88}
            >
              {revealed ? (
                <EyeOffIcon size={20} color={theme.colors.textMuted} />
              ) : (
                <EyeIcon size={20} color={theme.colors.textMuted} />
              )}
            </PressableScale>
          )}
        </AnimatedPressable>
      </Animated.View>

      <FieldError message={error} helperText={helperText} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  container: {
    flexDirection: 'row',
    borderWidth: 1.5,
  },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  inputColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    // Anchored left so the shrink reads as the label rising into the corner, not drifting inward.
    transformOrigin: 'left center',
    position: 'absolute',
    left: 0,
  },
  inputHolder: {
    marginTop: 12,
  },
  input: {
    padding: 0,
    margin: 0,
    // Android adds its own vertical padding that breaks the shared baseline.
    paddingVertical: Platform.OS === 'android' ? 2 : 0,
  },
  webInput: {
    outlineStyle: 'none',
  },
});
