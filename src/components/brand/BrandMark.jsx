// #genai: The Card Buddy mark — a lit blue card in front of a pane of glass.
//
// Two rounded plates, one behind the other: a frosted, outlined one rotated slightly back and to the
// left, and a solid blue one in front, lit from above with a rim highlight and a card stripe across
// it. It is the product's whole material palette (glass + accent) at logo size.
//
// The wordmark is set in Manrope ExtraBold, tight. It is the single strongest brand signal in the
// product, and putting it here means every auth screen inherits it for free.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function BrandMark({ size = 44, showWordmark = true }) {
  const theme = useTheme();
  const plate = size * 0.78;
  // The wordmark scales with the mark, so its line height must too: the heading style's fixed line
  // height is shorter than the glyphs at larger sizes, which clips the tops of the letters.
  const wordmarkSize = size * 0.46 + 4;
  const corner = size * 0.3;
  const { button } = theme.materials;

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      <View style={{ width: size, height: size }}>
        <View
          style={[
            styles.back,
            {
              width: plate,
              height: plate,
              borderRadius: corner,
              borderColor: theme.colors.primaryEdge,
              backgroundColor: theme.materials.brandSubtle,
            },
          ]}
        />

        <View
          style={[
            styles.front,
            { width: plate, height: plate, borderRadius: corner },
            theme.materials.shadow.sm,
          ]}
        >
          <LinearGradient
            colors={button.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: corner }]}
          />
          <View
            style={[styles.rim, { backgroundColor: button.rim, left: corner * 0.6, right: corner * 0.6 }]}
          />

          {/* The stripe and chip that make the plate read as a card rather than a swatch. */}
          <View style={[styles.stripe, { backgroundColor: theme.colors.onPrimary, opacity: 0.95 }]} />
          <View
            style={[
              styles.stripe,
              styles.stripeShort,
              { backgroundColor: theme.colors.onPrimary, opacity: 0.55 },
            ]}
          />
        </View>
      </View>

      {showWordmark && (
        <Text
          style={[
            theme.textStyles.heading,
            {
              color: theme.colors.text,
              fontFamily: theme.fonts.display.semibold,
              fontSize: wordmarkSize,
              lineHeight: Math.round(wordmarkSize * 1.25),
              letterSpacing: theme.typography.tracking.title,
            },
          ]}
        >
          Card Buddy
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: StyleSheet.hairlineWidth * 2,
    transform: [{ rotate: '-10deg' }],
  },
  front: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 7,
    justifyContent: 'flex-end',
    gap: 4,
  },
  rim: {
    position: 'absolute',
    top: 0,
    height: StyleSheet.hairlineWidth * 2,
    borderRadius: 2,
  },
  stripe: {
    height: 2.5,
    borderRadius: 2,
    width: '76%',
  },
  stripeShort: {
    width: '46%',
  },
});
