// #genai: Renders the Markdown the model writes, on the Lumen type scale.
//
// Emphasis is expressed by switching font FAMILY, never `fontWeight` or `fontStyle`: the Google
// Fonts here are static instances with no italic file, so a synthetic slant does nothing on iOS and
// looks wrong on Android. Bold reads as Manrope Bold, italic as Manrope SemiBold.
import * as Linking from 'expo-linking';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

import { parseMarkdown, trimDanglingMarkers } from '../lib/markdown';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

function spanStyle(span, theme) {
  const style = {};

  if (span.strong && span.emphasis) style.fontFamily = theme.fonts.text.bold;
  else if (span.strong) style.fontFamily = theme.fonts.text.semibold;
  else if (span.emphasis) style.fontFamily = theme.fonts.text.medium;

  // Bold in a sentence is the model pointing at the thing that matters, so it takes full ink
  // against the muted body colour rather than only a heavier cut.
  if (span.strong) style.color = theme.colors.text;

  if (span.code) {
    style.fontFamily = MONO;
    style.fontSize = theme.textStyles.caption.fontSize;
    style.color = theme.colors.text;
  }

  if (span.href) {
    style.color = theme.colors.primary;
    style.textDecorationLine = 'underline';
  }

  return style;
}

function Spans({ spans }) {
  const theme = useTheme();

  return spans.map((span, index) => (
    <Text
      key={index}
      style={spanStyle(span, theme)}
      onPress={span.href ? () => Linking.openURL(span.href).catch(() => {}) : undefined}
    >
      {span.text}
    </Text>
  ));
}

function Block({ block, color }) {
  const theme = useTheme();
  // Body colour is the caller's call: a chat bubble wants full ink, a footnote wants muted.
  const body = color ?? theme.colors.textMuted;

  if (block.type === 'divider') return <Rule />;

  if (block.type === 'heading') {
    const style = block.level <= 2 ? theme.textStyles.bodyStrong : theme.textStyles.label;
    return (
      <Text style={[style, { color: theme.colors.text }]}>
        <Spans spans={block.spans} />
      </Text>
    );
  }

  if (block.type === 'quote') {
    return (
      <View style={[styles.edged, { borderLeftColor: theme.colors.border, paddingLeft: theme.spacing.md }]}>
        <Text style={[theme.textStyles.body, { color: body }]}>
          <Spans spans={block.spans} />
        </Text>
      </View>
    );
  }

  if (block.type === 'code') {
    return (
      <View style={[styles.edged, { borderLeftColor: theme.colors.border, paddingLeft: theme.spacing.md }]}>
        <Text
          style={[
            theme.textStyles.caption,
            { fontFamily: MONO, color: theme.colors.textMuted },
          ]}
        >
          {block.text}
        </Text>
      </View>
    );
  }

  if (block.type === 'list') {
    return (
      <View style={{ gap: theme.spacing.sm }}>
        {block.items.map((item, index) => (
          <View key={index} style={[styles.item, { gap: theme.spacing.sm }]}>
            <Text
              style={[
                theme.textStyles.body,
                styles.marker,
                { color: theme.colors.textMuted, fontVariant: ['tabular-nums'] },
              ]}
            >
              {item.marker}
            </Text>
            <Text style={[theme.textStyles.body, styles.grow, { color: body }]}>
              <Spans spans={item.spans} />
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Text style={[theme.textStyles.body, { color: body }]}>
      <Spans spans={block.spans} />
    </Text>
  );
}

export function Markdown({ text, streaming = false, color }) {
  const theme = useTheme();
  const blocks = parseMarkdown(streaming ? trimDanglingMarkers(text ?? '') : text);

  if (blocks.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marker: {
    minWidth: 16,
    textAlign: 'right',
  },
  grow: {
    flex: 1,
  },
  edged: {
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
});
