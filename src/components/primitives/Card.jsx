// #genai: Simple themed surface container.
import { View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function Card({ children, style, elevated = true }) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
        elevated && theme.shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}
