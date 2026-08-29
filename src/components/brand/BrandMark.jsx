// #genai: The Card Buddy mark — two plates, one behind the other.
//
// Flat pine and hairlines rather than a gradient with white highlights. The offset plate is an
// outline only, so the mark reads as one solid object with a second implied behind it, which is a
// truer picture of a wallet than two competing filled shapes.
//
// The wordmark is set in the Didone. It is the single strongest brand signal in the product, and
// putting it here means every auth screen inherits it for free.
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function BrandMark({ size = 44, showWordmark = true }) {
  const theme = useTheme();
  const plate = size * 0.76;

  return (
    <View style={[styles.row, { gap: theme.spacing.md }]}>
      <View style={{ width: size, height: size }}>
        <View
          style={[
            styles.back,
            {
              width: plate,
              height: plate,
              borderRadius: theme.radius.xs,
              borderColor: theme.colors.primaryEdge,
              backgroundColor: theme.materials.brandSubtle,
            },
          ]}
        />

        <View
          style={[
            styles.front,
            {
              width: plate,
              height: plate,
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          {/* The inscribed rules that make the plate read as a card rather than a swatch. */}
          <View
            style={[styles.stripe, { backgroundColor: theme.colors.onPrimary, opacity: 0.9 }]}
          />
          <View
            style={[
              styles.stripe,
              styles.stripeShort,
              { backgroundColor: theme.colors.onPrimary, opacity: 0.5 },
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
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '-9deg' }],
  },
  front: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 6,
    justifyContent: 'flex-end',
    gap: 3,
  },
  stripe: {
    height: StyleSheet.hairlineWidth * 2,
    width: '76%',
  },
  stripeShort: {
    width: '46%',
  },
});
