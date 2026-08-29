// #genai: Branded hold while the stored session is validated at launch.
//
// Showing this instead of the sign-in screen matters: flashing "sign in" at someone who is
// already signed in reads as a bug and, for a moment, as data loss.
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand/BrandMark';
import { PaperBackground } from '@/components/surfaces/PaperBackground';
import { useTheme } from '@/providers/ThemeProvider';

export function BootSplash() {
  const theme = useTheme();

  return (
    <PaperBackground>
      <View style={[styles.center, { gap: theme.spacing.xxl }]}>
        <BrandMark size={56} />
        <ActivityIndicator color={theme.colors.textFaint} />
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
