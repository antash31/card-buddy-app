// #genai: The ask field — a floating glass pill with a glowing send button.
//
// Single-line on purpose: this is used one-handed at a counter, where the return key sending the
// question matters more than composing a paragraph. The whole pill is tappable so the 24pt-tall
// input is not the only hit target. It floats over the transcript (which scrolls beneath it) rather
// than sitting in a bar, which is also what lets the glass do its job.
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { IconButton } from '@/components/actions/IconButton';
import { ArrowUpIcon } from '@/components/icons';
import { Glass } from '@/components/surfaces/Glass';
import { useTheme } from '@/providers/ThemeProvider';

export function Composer({ value, onSubmit, onChangeText, pending, ready, paddingBottom }) {
  const theme = useTheme();
  const inputRef = useRef(null);
  const canSend = Boolean(value.trim()) && ready && !pending;
  const size = 46;

  return (
    <View
      style={{
        paddingHorizontal: theme.metrics.gutter,
        paddingTop: theme.spacing.sm,
        paddingBottom,
      }}
    >
      <Glass
        variant="thick"
        radius={theme.radius.full}
        shadow="md"
        contentStyle={[styles.bar, { padding: theme.spacing.xs + 2, gap: theme.spacing.sm }]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => inputRef.current?.focus()}
          style={[styles.field, { paddingLeft: theme.spacing.md }]}
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
            selectionColor={theme.colors.primary}
            accessibilityLabel="Your question"
            style={[
              theme.textStyles.body,
              styles.input,
              { color: theme.colors.text, outlineStyle: 'none' },
            ]}
          />
        </Pressable>

        <IconButton
          accessibilityLabel="Send"
          icon={ArrowUpIcon}
          iconSize={21}
          variant="solid"
          size={size}
          haptic="medium"
          disabled={!canSend}
          onPress={onSubmit}
        />
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  field: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  input: {
    paddingVertical: 10,
  },
});
