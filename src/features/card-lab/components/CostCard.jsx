// #genai: "What it costs" — the yearly price as one big figure, then what it means in plain words.
import { Text, View } from 'react-native';

import { SectionLabel } from '@/components/layout/SectionLabel';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { TermNote } from './TermNote';

export function CostCard({ cost }) {
  const theme = useTheme();
  const [lead, ...rest] = cost.lines;
  const numeric = cost.figure.startsWith('Rs.');

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionLabel label="What it costs" />
      <Surface contentStyle={{ gap: theme.spacing.md }}>
        <Text
          accessibilityLabel={cost.unit ? `${cost.figure} ${cost.unit}` : cost.figure}
          style={[numeric ? theme.textStyles.figure : theme.textStyles.title, { color: theme.colors.text }]}
        >
          {cost.figure}
          {cost.unit ? <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>{`\u2002${cost.unit}`}</Text> : null}
        </Text>
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>{lead}</Text>
          {rest.map((line) => (
            <Text key={line} style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
              {line}
            </Text>
          ))}
        </View>
        {cost.terms.map((term) => (
          <TermNote key={term.key} word={term.word} text={term.text} />
        ))}
      </Surface>
    </View>
  );
}
