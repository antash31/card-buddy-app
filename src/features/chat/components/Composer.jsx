// #genai: The ask field.
//
// Single-line on purpose: this is used one-handed at a counter, where the return key sending the
// question matters more than composing a paragraph. The field is a ruled baseline rather than a
// box, and the whole row is tappable so the 24pt-tall input is not the only hit target.
import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

export function Composer({ value, onSubmit, onChangeText, pending, ready, paddingBottom }) {
  const theme = useTheme();
  const inputRef = useRef(null);
  const canSend = Boolean(value.trim()) && ready && !pending;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingHorizontal: theme.metrics.gutter,
          paddingTop: theme.spacing.md,
          paddingBottom,
          gap: theme.spacing.md,
        },
      ]}
    >
      <Pressable
        accessibilityRole="none"
        onPress={() => inputRef.current?.focus()}
        style={[styles.field, { borderBottomColor: theme.colors.borderStrong }]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="Rs.4,000 groceries at a POS"
          placeholderTextColor={theme.colors.textFaint}
          onSubmitEditing={onSubmit}
          returnKeyType="send"
          submitBehavior="submit"
          editable={!pending}
          autoCorrect={false}
          accessibilityLabel="Your question"
          style={[
            theme.textStyles.body,
            styles.input,
            { color: theme.colors.text, outlineStyle: 'none' },
          ]}
        />
      </Pressable>

      <PressableScale
        accessibilityLabel="Send"
        onPress={onSubmit}
        disabled={!canSend}
        haptic="medium"
        style={[
          styles.send,
          { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md },
        ]}
      >
        {pending ? (
          <ActivityIndicator size="small" color={theme.colors.onPrimary} />
        ) : (
          <Text
            style={[
              theme.textStyles.label,
              { color: theme.colors.onPrimary, fontFamily: theme.fonts.text.semibold },
            ]}
          >
            Send
          </Text>
        )}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  field: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    paddingVertical: 10,
  },
  send: {
    height: 44,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
