// #genai: The soft card — the container every grouped region of the product sits in.
//
// Where the old system used hairline rules to avoid containers, this one embraces them: a screen is
// a stack of soft, generously rounded cards floating over a lit canvas, each with its own long,
// low, blue-tinted shadow. The rule for keeping that from becoming a wall of boxes is rhythm —
// cards are separated by space (`spacing.lg`), not by borders, and a card is never put inside a
// card of the same tone. Nest an `inset` or `tinted` tile inside a `raised` card instead.
//
// Tones:
//   raised   white, shadowed. The default; for content you read or act on.
//   inset    a recessed wash, no shadow. For a tile inside a raised card, or a quiet group.
//   tinted   accent-stained. A selected or highlighted state.
//   danger   error-stained. A failed or destructive region.
//   glass / glassThick / glassClear   delegate to `Glass` — for things that float over content.
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { Glass } from './Glass';
import { SurfaceContext } from './SurfaceContext';

const GLASS_TONES = { glass: 'regular', glassThick: 'thick', glassClear: 'clear', glassTinted: 'tinted' };

export function Surface({
  children,
  tone = 'raised',
  radius,
  padded = true,
  shadow,
  style,
  contentStyle,
  ...rest
}) {
  const theme = useTheme();
  const borderRadius = radius ?? theme.radius.xl;

  const inner = [
    padded && { padding: theme.spacing.lg + theme.spacing.xs, gap: theme.spacing.md },
    contentStyle,
  ];

  if (GLASS_TONES[tone]) {
    return (
      <Glass
        variant={GLASS_TONES[tone]}
        radius={borderRadius}
        shadow={shadow ?? 'md'}
        style={style}
        contentStyle={inner}
        {...rest}
      >
        <SurfaceContext.Provider value="glass">{children}</SurfaceContext.Provider>
      </Glass>
    );
  }

  const { materials, colors } = theme;

  const tones = {
    raised: {
      backgroundColor: materials.card.background,
      borderColor: materials.card.rim,
      ...(materials.shadow[shadow ?? 'md'] ?? null),
    },
    inset: {
      backgroundColor: materials.inset.background,
      borderColor: 'transparent',
    },
    tinted: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primaryEdge,
    },
    danger: {
      backgroundColor: colors.dangerSubtle,
      borderColor: 'transparent',
    },
  };

  return (
    <View
      style={[styles.shell, { borderRadius }, tones[tone] ?? tones.raised, style]}
      {...rest}
    >
      <View style={[{ borderRadius, overflow: 'hidden' }, inner]}>
        <SurfaceContext.Provider value={tone === 'raised' ? 'card' : 'canvas'}>
          {children}
        </SurfaceContext.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
