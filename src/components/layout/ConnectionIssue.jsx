// #genai: Shown at launch when a stored session exists but the API cannot be reached.
//
// The honest message is "I can't reach the server", not "sign in": the session is untouched and a
// retry will almost always work (the Wi-Fi came back, the backend finished restarting). Sign-out is
// offered as a way out so a genuinely broken account is never a dead end.
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { BrandMark } from '@/components/brand/BrandMark';
import { AmbientBackground } from '@/components/surfaces/AmbientBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function ConnectionIssue({ onRetry, onSignOut }) {
  const theme = useTheme();

  return (
    <AmbientBackground>
      <View style={[styles.center, { gap: theme.spacing.xl, paddingHorizontal: theme.metrics.gutter }]}>
        <BrandMark size={60} />
        <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
          <Text style={[theme.textStyles.title, { color: theme.colors.text, textAlign: 'center' }]}>
            Can’t reach Card Buddy
          </Text>
          <Text style={[theme.textStyles.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>
            You’re still signed in. Check your connection and try again.
          </Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton label="Try again" onPress={onRetry} />
          <TextLink label="Sign out instead" onPress={onSignOut} />
        </View>
      </View>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
  },
});
