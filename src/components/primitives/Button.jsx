// #genai: Themed pressable with variant/size support and a built-in loading state.
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { Text } from './Text';

function getVariantStyle(theme, variant, pressed) {
  const map = {
    primary: {
      backgroundColor: pressed ? theme.colors.primaryPressed : theme.colors.primary,
      borderColor: 'transparent',
      labelColor: theme.colors.onPrimary,
    },
    secondary: {
      backgroundColor: pressed ? theme.colors.border : theme.colors.surfaceAlt,
      borderColor: theme.colors.border,
      labelColor: theme.colors.text,
    },
    ghost: {
      backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
      borderColor: 'transparent',
      labelColor: theme.colors.primary,
    },
  };
  return map[variant] ?? map.primary;
}

const SIZES = {
  sm: { paddingVertical: 8, paddingHorizontal: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 18 },
  lg: { paddingVertical: 16, paddingHorizontal: 22 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  ...rest
}) {
  const theme = useTheme();
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        SIZES[size] ?? SIZES.md,
        {
          backgroundColor: getVariantStyle(theme, variant, pressed).backgroundColor,
          borderColor: getVariantStyle(theme, variant, pressed).borderColor,
          borderRadius: theme.radius.md,
          opacity: isInteractive ? 1 : 0.5,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      {({ pressed }) => {
        const labelColor = getVariantStyle(theme, variant, pressed).labelColor;
        return (
          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="small" color={labelColor} />
            ) : (
              <Text variant="subtitle" color={labelColor}>
                {label}
              </Text>
            )}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
