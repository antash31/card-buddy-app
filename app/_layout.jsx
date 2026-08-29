// #genai: Root route layout. Owns providers, splash gating, auth routing and the status bar.
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';

import { BootSplash } from '@/components/layout/BootSplash';
import { useAuthGate } from '@/features/auth/hooks/useAuthGate';
import { useAppReady } from '@/hooks/useAppReady';
import { AppProviders } from '@/providers/AppProviders';
import { useTheme } from '@/providers/ThemeProvider';

// #genai: UniWind CSS entry (project root; @ alias points at src/).
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore: the splash screen may already be hidden during fast refresh.
});

function RootNavigator() {
  const theme = useTheme();
  const isReady = useAppReady();
  const authStatus = useAuthGate();

  // Layout fires again on rotation, keyboard and font-scale changes. Hiding once keeps us from
  // asking the native module to dismiss a splash screen that is already gone.
  const splashHidden = useRef(false);

  const onLayout = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;

    try {
      // The synchronous `hide` is deliberate: `hideAsync` rejects when no splash is registered
      // for the view controller — which is the norm after an Expo Go reload — and expo-router
      // races us with its own unguarded hide, so a rejection here surfaces as an uncaught error.
      SplashScreen.hide();
    } catch {
      // Already dismissed; there is nothing left to hide.
    }
  }, []);

  if (!isReady) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={onLayout}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />

      {/* The session check is fast, but it is still async — hold on the brand rather than
          flashing a screen the user may not belong on. */}
      {authStatus === 'loading' ? (
        <BootSplash />
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            // Screens enter and leave along the same path, so going back retraces the way in.
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        </Stack>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
