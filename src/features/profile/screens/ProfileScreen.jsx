// #genai: Account, appearance and sign-out.
//
// Sign-out used to sit at the bottom of the Card Nest, below the card list, where it was both easy
// to hit by accident and impossible to find on purpose. It belongs here.
//
// The detail rows are label-left / value-right with a rule between them — the layout a printed
// statement uses for account particulars, and the reason this screen needs no panels at all.
import { Image, StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/actions/SecondaryButton';
import { DeviceIcon, LogOutIcon, MoonIcon, SunIcon } from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { PressableScale } from '@/components/motion/PressableScale';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { useMyCards } from '@/features/card-nest/hooks/useNest';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { stagger } from '@/theme/motion';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', Icon: DeviceIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

export function ProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useSignOut();
  const nest = useMyCards();

  const preference = useSettingsStore((state) => state.themePreference);
  const setPreference = useSettingsStore((state) => state.setThemePreference);

  const cardCount = nest.data?.cards?.length;

  return (
    <AppScreen>
      <ScreenHeader eyebrow="Account" title={profile?.fullName ?? 'Your account'} titleLines={2} />

      <Reveal delay={stagger(4)}>
        <View style={[styles.identity, { gap: theme.spacing.lg }]}>
          <Avatar name={profile?.fullName} url={profile?.avatarUrl} />
          <View style={{ gap: theme.spacing.hair, flex: 1 }}>
            <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>
              Signed in as
            </Text>
            <Text
              numberOfLines={1}
              style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}
            >
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>
      </Reveal>

      {/* One bare ruled row, with no section heading above it. The name is already the page title,
          so listing it again as a "particular" would just be the screen repeating itself. */}
      <Reveal delay={stagger(5)}>
        <View>
          <Rule />
          <DetailRow label="Cards held" value={cardCount === undefined ? '—' : String(cardCount)} />
          <Rule />
        </View>
      </Reveal>

      <Reveal delay={stagger(6)}>
        <Section
          label="Appearance"
          hint="System follows your device. Pin it if you read the app in one lighting all day."
        >
          <View style={[styles.options, { gap: theme.spacing.sm }]}>
            {THEME_OPTIONS.map(({ value, label, Icon }) => {
              const selected = preference === value;

              return (
                <PressableScale
                  key={value}
                  accessibilityLabel={`${label} appearance`}
                  accessibilityState={{ selected }}
                  haptic="selection"
                  onPress={() => setPreference(value)}
                  scaleTo={0.97}
                  style={[
                    styles.option,
                    {
                      borderRadius: theme.radius.sm,
                      paddingVertical: theme.spacing.md,
                      gap: theme.spacing.sm,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                      backgroundColor: selected ? theme.colors.primarySubtle : 'transparent',
                    },
                  ]}
                >
                  <Icon
                    size={19}
                    color={selected ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text
                    style={[
                      theme.textStyles.micro,
                      { color: selected ? theme.colors.primary : theme.colors.textMuted },
                    ]}
                  >
                    {label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </Section>
      </Reveal>

      <Reveal delay={stagger(7)}>
        {/* Neutral, not red. Signing out destroys nothing — you sign back in — and spending the
            only alarming colour in the palette on a reversible action devalues it. */}
        <SecondaryButton
          label="Sign out"
          icon={LogOutIcon}
          loading={signOut.isPending}
          onPress={() => signOut.mutate()}
        />
      </Reveal>
    </AppScreen>
  );
}

function Section({ label, hint, children }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text style={[theme.textStyles.micro, { color: theme.colors.textFaint }]}>{label}</Text>
      {hint ? (
        <Text style={[theme.textStyles.caption, styles.prose, { color: theme.colors.textMuted }]}>
          {hint}
        </Text>
      ) : null}
      <View>{children}</View>
    </View>
  );
}

function DetailRow({ label, value }) {
  const theme = useTheme();

  return (
    <View style={[styles.detailRow, { paddingVertical: theme.spacing.md, gap: theme.spacing.lg }]}>
      <Text style={[theme.textStyles.body, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text
        numberOfLines={1}
        style={[theme.textStyles.bodyStrong, styles.detailValue, { color: theme.colors.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

function Avatar({ name, url, size = 60 }) {
  const theme = useTheme();

  // Two initials at most: three or more turns the mark into a word and stops reading as a monogram.
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        accessibilityIgnoresInvertColors
        style={{
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.border,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.primarySubtle,
          borderColor: theme.colors.primaryEdge,
        },
      ]}
    >
      {/* The monogram is the one place the Didone shows up outside a screen title. */}
      <Text
        style={[
          theme.textStyles.heading,
          { color: theme.colors.primary, fontFamily: theme.fonts.display.medium },
        ]}
      >
        {initials || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  options: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  prose: {
    maxWidth: 460,
  },
});
