// #genai: Authenticated area — four tabs in a floating glass capsule.
import { Tabs } from 'expo-router';

import { TabBar } from '@/components/navigation/TabBar';
import { useTheme } from '@/providers/ThemeProvider';

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      // The capsule floats over the content and is translucent, so screens reserve their own bottom
      // padding (see `AppScreen`) instead of the navigator insetting them.
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="tracking" options={{ href: null }} />
      <Tabs.Screen name="transaction-review" options={{ href: null }} />
      <Tabs.Screen name="card-details" options={{ href: null }} />
      <Tabs.Screen name="wallet-audit" options={{ href: null }} />
      <Tabs.Screen name="wallet-categories" options={{ href: null }} />
      <Tabs.Screen name="credit-health" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ title: 'Nest' }} />
      <Tabs.Screen name="swipemax" options={{ title: 'SwipeMax' }} />
      <Tabs.Screen name="add-card" options={{ title: 'Add' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="chat" options={{ href: null, title: 'Ask' }} />
    </Tabs>
  );
}
