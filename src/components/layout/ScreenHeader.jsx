// #genai: The screen header — the one motif repeated on every screen in the product.
//
// Three parts, top to bottom:
//   1. An eyebrow in small tracked caps, in the accent blue. This is where the *category* lives
//      ("Wallet", "Before you pay"), so the title never has to carry a qualifier.
//   2. The title, set heavy and tight in Manrope ExtraBold. Big, left-aligned and confident — the
//      same voice as "Bank made by users" in the reference.
//   3. An optional description in muted body text, capped to a readable measure.
//
// `trailing` takes the screen's one header action (an `IconButton`, usually) and aligns it with the
// top of the block. There is no closing rule: on a lit canvas, space does the separating.
import { StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

export function ScreenHeader({
  eyebrow,
  title,
  description,
  trailing,
  // Set this where the title comes from user data. An unusually long name at display size will
  // otherwise push everything below it off the screen.
  titleLines,
  animate = true,
}) {
  const theme = useTheme();

  const wrap = (index, children) =>
    animate ? (
      <Reveal delay={stagger(index)} key={index}>
        {children}
      </Reveal>
    ) : (
      <View key={index}>{children}</View>
    );

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={[styles.row, { gap: theme.spacing.lg }]}>
        <View style={[styles.titleBlock, { gap: theme.spacing.sm }]}>
          {eyebrow
            ? wrap(
                0,
                <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>
                  {eyebrow}
                </Text>,
              )
            : null}

          {wrap(
            1,
            <Text
              numberOfLines={titleLines}
              style={[theme.textStyles.display, { color: theme.colors.text }]}
            >
              {title}
            </Text>,
          )}
        </View>

        {trailing ? wrap(1, trailing) : null}
      </View>

      {description
        ? wrap(
            2,
            <Text
              style={[theme.textStyles.body, styles.description, { color: theme.colors.textMuted }]}
            >
              {description}
            </Text>,
          )
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  description: {
    // Body copy is capped so the eye can track it, even though the screen is only ~390pt wide.
    maxWidth: 460,
  },
});
