// #genai: The statement header — the one motif repeated on every screen in the product.
//
// Three parts, in the order a printed statement puts them:
//   1. An eyebrow in small tracked caps. This is where the *category* lives, so the title never has
//      to carry a qualifier ("Card Nest" instead of "Your Card Nest — Cards").
//   2. The title, set in the Didone. This is the only place the display serif appears on most
//      screens, which is what keeps it feeling like an occasion.
//   3. A rule closing the block off from the content below.
//
// Because the eyebrow does the labelling, the rest of the screen needs no section headings, which is
// how the layout stays quiet.
import { StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
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

  const Wrapper = animate ? Reveal : View;
  const wrap = (index, children) =>
    animate ? (
      <Wrapper delay={stagger(index)} key={index}>
        {children}
      </Wrapper>
    ) : (
      <View key={index}>{children}</View>
    );

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={[styles.row, { gap: theme.spacing.lg }]}>
        <View style={[styles.titleBlock, { gap: theme.spacing.sm }]}>
          {eyebrow
            ? wrap(
                0,
                <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
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

      {wrap(3, <Rule weight="strong" />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
