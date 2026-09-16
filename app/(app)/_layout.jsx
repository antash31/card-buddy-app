// #genai: Authenticated area — three tabs across the bottom.
import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { useTheme } from '@/providers/ThemeProvider';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      // The bar is absolutely positioned and translucent, so screens reserve their own bottom
      // padding (see `AppScreen`) instead of the navigator insetting them.
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Nest' }} />
      <Tabs.Screen name="swipemax" options={{ title: 'SwipeMax' }} />
      <Tabs.Screen name="add-card" options={{ title: 'Add' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="chat" options={{ href: null, title: 'Ask' }} />
    </Tabs>
  );
}
