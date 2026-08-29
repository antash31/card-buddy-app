// #genai: Gates the splash screen until async bootstrap work (persisted settings, fonts) is done.
//
// Fonts are part of the gate on purpose. Every text style in the theme names a custom family, so
// rendering before the files are resident either falls back to the system font for a frame — a
// visible reflow, since the Didone and the grotesque have very different metrics — or, on Android,
// draws nothing at all.
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import { useSettingsStore } from '@/store/settingsStore';
import { fontAssets } from '@/theme/fonts';

export function useAppReady() {
  const [settingsReady, setSettingsReady] = useState(false);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);

  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await hydrateSettings();
      } catch (error) {
        logger.error('bootstrap', 'failed to prepare app', error);
      } finally {
        if (!cancelled) setSettingsReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [hydrateSettings]);

  useEffect(() => {
    if (fontError) logger.error('bootstrap', 'failed to load fonts', fontError);
  }, [fontError]);

  // A font failure must not strand the user on the splash screen forever — better a system-font
  // fallback than an app that never opens.
  return settingsReady && (fontsLoaded || Boolean(fontError));
}
