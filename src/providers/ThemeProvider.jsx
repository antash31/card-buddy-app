// #genai: Resolves the active theme from the stored preference + OS appearance.
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { darkTheme, lightTheme } from '@/theme';

const ThemeContext = createContext(lightTheme);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((state) => state.themePreference);

  const theme = useMemo(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'light') : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
