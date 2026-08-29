// #genai: First screen an unauthenticated visitor sees.
//
// One primary action, one secondary, and a hero the user can physically play with. The staggered
// reveal resolves top-to-bottom so the eye lands on the headline before the buttons.
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { BrandMark } from '@/components/brand/BrandMark';
import { CardStack } from '@/components/brand/CardStack';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

export function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <AuthLayout contentStyle={styles.content}>
      <Reveal delay={stagger(0)}>
        <BrandMark />
      </Reveal>

      <Reveal delay={stagger(1)} style={styles.hero}>
        <CardStack />
      </Reveal>

      <View style={{ gap: theme.spacing.lg }}>
        <Reveal delay={stagger(2)}>
          {/* The one place the Didone runs at full size. It is the whole first impression. */}
          {/* No manual line break: at hero size this wraps to two clean lines on a phone, and a
              hard break would strand a single word on its own line on any narrower device. */}
          <Text style={[theme.textStyles.hero, { color: theme.colors.text }]}>
            Know which card to reach for.
          </Text>
        </Reveal>

        <Reveal delay={stagger(3)}>
          <Text style={[theme.textStyles.body, styles.prose, { color: theme.colors.textMuted }]}>
            Card Buddy keeps track of the rewards, caps and benefits on every card in your wallet —
            so the right one is obvious before you pay, not after the statement arrives.
          </Text>
        </Reveal>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <Reveal delay={stagger(4)}>
          <PrimaryButton label="Create an account" onPress={() => router.push('/sign-up')} />
        </Reveal>

        <Reveal delay={stagger(5)}>
          <SecondaryButton
            label="I already have an account"
            onPress={() => router.push('/sign-in')}
          />
        </Reveal>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
  },
  prose: {
    maxWidth: 460,
  },
});
