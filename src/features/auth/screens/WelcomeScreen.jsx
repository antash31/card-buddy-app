// #genai: First screen an unauthenticated visitor sees.
//
// Modelled on the reference's landing card: a big, tight, left-aligned headline with a lime
// scribble under the key phrase, a stack of bright cards the user can physically play with, and one
// glowing primary action above a quiet secondary. The staggered reveal resolves top-to-bottom so
// the eye lands on the headline before the buttons.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { ArrowRightIcon } from '@/components/icons';
import { BrandMark } from '@/components/brand/BrandMark';
import { CardStack } from '@/components/brand/CardStack';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Reveal } from '@/components/motion/Reveal';
import { palette } from '@/theme/colors';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

const SCRIBBLE_HEIGHT = 14;

// A hand-drawn-looking wave that sits under the last line of the headline. It is measured from the
// text it underlines, so it stays attached whatever width the device wraps to.
function Scribble({ width, color }) {
  if (!width) return null;

  const w = width;
  const d = `M2 9 C ${w * 0.12} 1, ${w * 0.22} 13, ${w * 0.4} 6 S ${w * 0.66} 1, ${w * 0.8} 8 S ${w * 0.95} 10, ${w - 2} 4`;

  return (
    <Svg width={w} height={SCRIBBLE_HEIGHT} style={styles.scribble} pointerEvents="none">
      <Path d={d} stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [lineWidth, setLineWidth] = useState(0);

  // Lime is an illustration accent — allowed on decoration, never on text or controls. On the dark
  // canvas it needs no help; on the light one it is the only place the palette's yellow-green shows.
  const scribbleColor = theme.mode === 'dark' ? palette.lime : '#B4E233';

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
          <Text style={[theme.textStyles.hero, { color: theme.colors.text }]}>
            Know which card
          </Text>
          <View
            style={styles.underlined}
            onLayout={(event) => setLineWidth(event.nativeEvent.layout.width)}
          >
            <Text style={[theme.textStyles.hero, { color: theme.colors.text }]}>
              to reach for.
            </Text>
            <Scribble width={lineWidth} color={scribbleColor} />
          </View>
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
          <PrimaryButton
            label="Create an account"
            trailingIcon={ArrowRightIcon}
            onPress={() => router.push('/sign-up')}
          />
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
  underlined: {
    alignSelf: 'flex-start',
    paddingBottom: SCRIBBLE_HEIGHT - 4,
  },
  scribble: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});
