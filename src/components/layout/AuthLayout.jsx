// #genai: Shared shell for auth and onboarding screens.
//
// The paper runs edge to edge and content scrolls over it, rather than the background being boxed
// into a fixed strip. Safe-area insets are applied to the content, not the canvas, so the ground
// reaches the very edges of the display.
//
// The back affordance is a bare arrow rather than a circular chip. A chip is a container drawn for a
// single glyph, and the arrow already reads as "back" at the top-left of a page.
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { PaperBackground } from '@/components/surfaces/PaperBackground';
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
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + theme.spacing.lg,
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
            <PressableScale
              accessibilityLabel="Go back"
              haptic="selection"
              onPress={handleBack}
              scaleTo={0.88}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 24 }}
              style={styles.backButton}
            >
              <ArrowLeftIcon size={22} color={theme.colors.text} />
            </PressableScale>
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
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  backButton: {
    width: 30,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
