// #genai: A selectable pill — bank filters, option sets, the appearance switch.
//
// Unselected is a soft white pill; selected is the accent, solid, with its glow. Selection is a
// binary state and deserves an unambiguous signal, so it changes fill *and* text colour rather
// than only a border. The check glyph rides along when `showCheck` is set, which keeps selection
// legible without colour (the glyph appears or it does not).
import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function Chip({
  label,
  selected = false,
  onPress,
  icon: Icon,
  showCheck = false,
  disabled = false,
  accessibilityRole = 'button',
  style,
}) {
  const theme = useTheme();
  const color = selected ? theme.colors.onPrimary : theme.colors.textMuted;

  return (
    <PressableScale
      accessibilityLabel={label}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.95}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: selected ? theme.colors.primary : theme.materials.card.background,
          borderColor: selected ? 'transparent' : theme.colors.border,
        },
        selected ? theme.materials.button.glow : theme.materials.shadow.sm,
        // The glow is a button-sized effect; at chip scale it needs to be tighter and fainter.
        selected && { shadowRadius: 10, shadowOpacity: 0.28, shadowOffset: { width: 0, height: 5 } },
        style,
      ]}
    >
      <View style={[styles.row, { gap: theme.spacing.xs + 2 }]}>
        {Icon ? <Icon size={16} color={color} /> : null}
        {selected && showCheck ? <CheckIcon size={14} color={color} strokeWidth={2.6} /> : null}
        <Text style={[theme.textStyles.label, { color, fontFamily: theme.fonts.text.semibold }]}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
