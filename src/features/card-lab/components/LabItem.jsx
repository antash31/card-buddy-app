// #genai: One rule of a card, in plain words. The first line says what you get; the rest say how.
import { Text, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { TermNote } from './TermNote';

export function LabItem({ item }) {
  const theme = useTheme();
  const [lead, ...rest] = item.lines;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{lead}</Text>
        {rest.map((line, index) => (
          <Text key={`${index}:${line}`} style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
            {line}
          </Text>
        ))}
        {item.dates.map((line) => (
          <Text key={line} style={[theme.textStyles.label, { color: theme.colors.primary }]}>
            {line}
          </Text>
        ))}
      </View>
      {item.terms.map((term) => (
        <TermNote key={term.key} word={term.word} text={term.text} />
      ))}
    </View>
  );
}
