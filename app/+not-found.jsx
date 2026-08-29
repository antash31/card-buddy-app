// #genai: Fallback route for unmatched deep links.
import { Link } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/primitives';
import { useTheme } from '@/providers/ThemeProvider';

export default function NotFound() {
  const theme = useTheme();

  return (
    <Screen>
      <Text variant="title">Page not found</Text>
      <Text variant="body" color={theme.colors.textMuted}>
        The screen you tried to open does not exist.
      </Text>
      <Link href="/" style={[theme.textStyles.bodyStrong, { color: theme.colors.primary }]}>
        Go back home
      </Link>
    </Screen>
  );
}
