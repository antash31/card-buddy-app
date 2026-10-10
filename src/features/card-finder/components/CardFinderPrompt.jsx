// #genai: "Not sure which card to get?" — the way into Card Finder from places where someone is
// looking for a card (the Add tab, an empty Card Nest).
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { TextLink } from '@/components/actions/TextLink';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

export function CardFinderPrompt() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Surface tone="inset" contentStyle={{ gap: theme.spacing.sm }}>
      <Text style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}>Not sure which card to get?</Text>
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>
        Tell Card Finder roughly what you spend and it ranks the cards it can price by what they would earn you.
      </Text>
      <TextLink label="Find a card for my spending" onPress={() => router.push('/card-finder')} align="start" />
    </Surface>
  );
}
