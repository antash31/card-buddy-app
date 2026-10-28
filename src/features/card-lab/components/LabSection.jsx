// #genai: A section of a card's page — a label, an optional explained word, and its rules in one card.
import { View } from 'react-native';

import { SectionLabel } from '@/components/layout/SectionLabel';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { LabItem } from './LabItem';
import { TermNote } from './TermNote';

export function LabSection({ section }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionLabel label={section.title} count={section.items.length} />
      <Surface contentStyle={{ gap: theme.spacing.lg }}>
        {section.intro ? <TermNote word="Lounge" text={section.intro} /> : null}
        {section.items.map((item, index) => (
          <View key={item.id} style={{ gap: theme.spacing.lg }}>
            {index > 0 ? <Rule /> : null}
            <LabItem item={item} />
          </View>
        ))}
      </Surface>
    </View>
  );
}
