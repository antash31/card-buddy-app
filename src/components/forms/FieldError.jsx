// #genai: Inline validation message below a field.
//
// Validation is shown in place, next to the control it refers to, rather than collected into a
// summary at the top of the form — proximity is what makes the message obviously *about* that
// field. Helper text occupies the same slot so the layout does not jump when an error appears.
import { StyleSheet, Text, View } from 'react-native';

import { AlertIcon } from '@/components/icons';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';

export function FieldError({ message, helperText }) {
  const theme = useTheme();
  const text = message || helperText;

  if (!text) return null;

  const isError = Boolean(message);

  return (
    <Reveal key={text} distance={6}>
      <View style={[styles.row, { paddingHorizontal: theme.spacing.xs, gap: theme.spacing.xs }]}>
        {isError && <AlertIcon size={14} color={theme.colors.danger} />}
        <Text
          accessibilityLiveRegion={isError ? 'polite' : 'none'}
          style={[
            theme.textStyles.caption,
            styles.text,
            { color: isError ? theme.colors.danger : theme.colors.textMuted },
          ]}
        >
          {text}
        </Text>
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
});
