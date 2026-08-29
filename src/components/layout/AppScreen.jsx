// #genai: Shell for the signed-in area.
//
// The generous horizontal gutter is the point, not an accident — wide margins are what make a page
// read as "this content was worth the paper". Content scrolls under the tab bar (which is
// translucent) but the bottom padding reserves the bar's full height plus the home-indicator inset,
// so the last row is always reachable rather than trapped behind the chrome.
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaperBackground } from '@/components/surfaces/PaperBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function AppScreen({ children, scroll = true, contentStyle, stickyFooter, refreshControl }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + theme.spacing.xl,
    paddingHorizontal: theme.metrics.gutter,
    paddingBottom: insets.bottom + theme.metrics.tabBarHeight + theme.spacing.xxl,
  };

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, padding, { gap: theme.spacing.xl }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padding, { gap: theme.spacing.xl }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {stickyFooter}
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
});
