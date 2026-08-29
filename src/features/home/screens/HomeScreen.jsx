// #genai: Starter screen that also doubles as a live backend + Supabase connectivity check.
import { useState } from 'react';
import { Image, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Button, Card, Text } from '@/components/primitives';
import { env } from '@/config/env';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

import { useConnectionStatus } from '../hooks/useHealth';

export function HomeScreen() {
  const theme = useTheme();
  const [checkEnabled, setCheckEnabled] = useState(false);
  const { data, error, isFetching, refetch, isFetched } = useConnectionStatus({
    enabled: checkEnabled,
  });

  const profile = useAuthStore((state) => state.profile);
  const signOut = useSignOut();

  const themePreference = useSettingsStore((state) => state.themePreference);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);

  const cycleTheme = () => {
    const order = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(themePreference) + 1) % order.length];
    setThemePreference(next);
  };

  const backendOk = data?.backend?.status === 'ready';
  const supabaseViaApi = data?.backend?.checks?.supabase === 'up';
  const supabaseDirectOk = data?.supabaseDirect?.ok === true;

  return (
    <Screen scrollable>
      <Text variant="display">
        {profile?.fullName ? `Hey, ${profile.fullName.split(' ')[0]}` : 'Card Buddy'}
      </Text>
      <Text variant="body" color={theme.colors.textMuted}>
        Expo Router + React Query + Zustand starter. Replace this screen with your first feature.
      </Text>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          {profile?.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text variant="heading">{profile?.fullName ?? 'Your account'}</Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              {profile?.email ?? '—'}
            </Text>
          </View>
        </View>

        <Button
          label={signOut.isPending ? 'Signing out…' : 'Sign out'}
          variant="secondary"
          loading={signOut.isPending}
          onPress={() => signOut.mutate()}
        />
      </Card>

      <Card>
        <Text variant="heading">Connections</Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          API: {env.apiUrl}
        </Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          Supabase: {env.supabaseUrl || '(not configured)'}
        </Text>

        {error ? (
          <Text variant="body" color={theme.colors.danger}>
            {error.message}
          </Text>
        ) : null}

        {isFetched && data ? (
          <>
            <Text variant="body" color={backendOk ? theme.colors.success : theme.colors.danger}>
              Backend: {backendOk ? 'ready' : (data.backend?.status ?? 'failed')}
            </Text>
            <Text
              variant="body"
              color={supabaseViaApi ? theme.colors.success : theme.colors.danger}
            >
              Supabase (via API): {supabaseViaApi ? 'up' : 'down'}
            </Text>
            <Text
              variant="body"
              color={supabaseDirectOk ? theme.colors.success : theme.colors.danger}
            >
              Supabase (direct anon): {supabaseDirectOk ? 'up' : data.supabaseDirect?.message}
            </Text>
          </>
        ) : null}

        <Button
          label={isFetching ? 'Checking…' : isFetched ? 'Recheck connections' : 'Check connections'}
          loading={isFetching}
          onPress={() => {
            if (checkEnabled) {
              refetch();
            } else {
              setCheckEnabled(true);
            }
          }}
        />
      </Card>

      <Card>
        <Text variant="heading">Appearance</Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          Preference: {themePreference} (active: {theme.mode})
        </Text>
        <Button label="Cycle theme" variant="secondary" onPress={cycleTheme} />
      </Card>
    </Screen>
  );
}
