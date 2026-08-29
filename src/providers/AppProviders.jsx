// #genai: Single composition point for app-wide providers.
// Order: gesture → safe area → gluestack → query → theme.
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaListener, SafeAreaProvider } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import { queryClient } from '@/api/queryClient';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

import { ThemeProvider, useTheme } from './ThemeProvider';

// #genai: Bridges Card Buddy theme preference into gluestack / UniWind.
function GluestackThemeBridge({ children }) {
  const theme = useTheme();
  return <GluestackUIProvider mode={theme.mode}>{children}</GluestackUIProvider>;
}

export function AppProviders({ children }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener
          onChange={({ insets }) => {
            Uniwind.updateInsets(insets);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <GluestackThemeBridge>{children}</GluestackThemeBridge>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
