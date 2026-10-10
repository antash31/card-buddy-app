// #genai: Branded hold while the stored session is validated at launch.
//
// Showing this instead of the sign-in screen matters: flashing "sign in" at someone who is
// already signed in reads as a bug and, for a moment, as data loss.
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand/BrandMark';
import { AmbientBackground } from '@/components/surfaces/AmbientBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function BootSplash() {
  const theme = useTheme();

  return (
    <AmbientBackground>
      <View style={[styles.center, { gap: theme.spacing.xxl }]}>
        <BrandMark size={60} />
        <ActivityIndicator color={theme.colors.primary} />
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
});
