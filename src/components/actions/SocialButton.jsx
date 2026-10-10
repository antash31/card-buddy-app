// #genai: OAuth provider button.
//
// Providers keep their own brand marks, so this is intentionally neutral: a soft white pill that
// matches the secondary button, with the logo supplying the only colour on it.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppleIcon, GoogleIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

const PROVIDERS = {
  google: { label: 'Continue with Google', Icon: GoogleIcon },
  apple: { label: 'Continue with Apple', Icon: AppleIcon },
};

export function SocialButton({ provider, onPress, loading = false, disabled = false, style }) {
  const theme = useTheme();
  const config = PROVIDERS[provider];

  if (!config) return null;

  const { label, Icon } = config;
  const isInactive = disabled || loading;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.97}
      style={[
        styles.shell,
        {
          height: theme.metrics.buttonHeight,
          borderRadius: theme.radius.full,
          borderColor: theme.colors.border,
          backgroundColor: theme.materials.card.background,
          ...theme.materials.shadow.sm,
        },
        style,
      ]}
    >
      <View style={[styles.content, { gap: theme.spacing.md }]}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.text} />
        ) : (
          <>
            <Icon size={20} color={provider === 'apple' ? theme.colors.text : undefined} />
            <Text style={[theme.textStyles.button, { color: theme.colors.text }]}>{label}</Text>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
