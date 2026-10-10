// #genai: Shared shell for auth and onboarding screens.
//
// The lit canvas runs edge to edge and content scrolls over it, rather than the background being
// boxed into a fixed strip. Safe-area insets are applied to the content, not the canvas, so the
// ground reaches the very edges of the display.
//
// The back affordance is a small glass lens — the round "<" control from the reference. Unlike the
// old bare arrow it is a real, visible target, which matters now that the page behind it is busy
// with colour.
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/actions/IconButton';
import { ArrowLeftIcon } from '@/components/icons';
import { AmbientBackground } from '@/components/surfaces/AmbientBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function AuthLayout({ children, showBack = false, onBack, footer, contentStyle }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
  };

  return (
    <AmbientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + theme.spacing.md,
              paddingBottom: insets.bottom + theme.spacing.xxl,
              paddingHorizontal: theme.metrics.gutter,
              gap: theme.spacing.xl,
            },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {showBack && (
            <IconButton
              accessibilityLabel="Go back"
              icon={ArrowLeftIcon}
              onPress={handleBack}
              style={styles.back}
            />
          )}

          {children}
        </ScrollView>

        {footer && (
          <View
            style={{
              paddingHorizontal: theme.metrics.gutter,
              paddingBottom: insets.bottom + theme.spacing.lg,
            }}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  back: {
    alignSelf: 'flex-start',
  },
});
