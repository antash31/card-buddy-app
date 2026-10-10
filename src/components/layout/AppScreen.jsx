// #genai: Shell for the signed-in area.
//
// Content scrolls *under* the floating tab capsule — which is why the capsule can be glass at all,
// since there is real content moving behind it to blur. The bottom padding reserves the capsule's
// full height plus its gap and the home-indicator inset, so the last card is always reachable
// rather than trapped behind the chrome.
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/surfaces/AmbientBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function AppScreen({ children, scroll = true, contentStyle, stickyFooter, refreshControl }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + theme.spacing.lg,
    paddingHorizontal: theme.metrics.gutter,
    paddingBottom: insets.bottom + theme.metrics.tabBarReserve,
  };

  // Soft cards need room to breathe: 20pt between them, a touch more than a typical list gap.
  const gap = theme.spacing.lg + theme.spacing.xs;

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, padding, { gap }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padding, { gap }, contentStyle]}>{children}</View>
  );

  return (
    <AmbientBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {stickyFooter}
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
});
