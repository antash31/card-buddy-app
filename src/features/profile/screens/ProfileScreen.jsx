// #genai: Account, appearance and sign-out.
//
// Sign-out used to sit at the bottom of the Card Nest, below the card list, where it was both easy
// to hit by accident and impossible to find on purpose. It belongs here.
//
// The identity block is a pane of glass (this screen's header sits over the canvas's brightest
// light pool, so it is where the blur reads best). Everything below it is grouped rows on soft
// cards: an icon tile, a label, and either a value or a chevron — the same shape every time, so the
// screen scans like a settings list rather than a form.
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/actions/Chip';
import { SecondaryButton } from '@/components/actions/SecondaryButton';
import {
  ActivityIcon,
  ChevronRightIcon,
  DeviceIcon,
  LogOutIcon,
  MoonIcon,
  NestIcon,
  SunIcon,
} from '@/components/icons';
import { AppScreen } from '@/components/layout/AppScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { PressableScale } from '@/components/motion/PressableScale';
import { Reveal } from '@/components/motion/Reveal';
import { Rule } from '@/components/surfaces/Rule';
import { Surface } from '@/components/surfaces/Surface';
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

const TILE = 38;

export function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
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
        <Surface tone="glass" shadow="md" contentStyle={[styles.identity, { gap: theme.spacing.lg }]}>
          <Avatar name={profile?.fullName} url={profile?.avatarUrl} />
          <View style={{ gap: theme.spacing.xs, flex: 1 }}>
            <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>
              Signed in as
            </Text>
            <Text
              numberOfLines={1}
              style={[theme.textStyles.bodyStrong, { color: theme.colors.text }]}
            >
              {user?.email ?? '—'}
            </Text>
          </View>
        </Surface>
      </Reveal>

      <Reveal delay={stagger(5)}>
        <Surface padded={false}>
          <ListRow
            icon={NestIcon}
            label="Cards held"
            value={cardCount === undefined ? '—' : String(cardCount)}
          />
          <Rule inset={theme.spacing.lg + TILE + theme.spacing.md} />
          <ListRow
            icon={ActivityIcon}
            label="Transaction tracking"
            onPress={() => router.push('/tracking')}
          />
        </Surface>
      </Reveal>

      <Reveal delay={stagger(6)} style={{ gap: theme.spacing.md }}>
        <SectionLabel label="Appearance" />
        <View style={[styles.options, { gap: theme.spacing.sm }]}>
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <Chip
              key={value}
              label={label}
              icon={Icon}
              selected={preference === value}
              onPress={() => setPreference(value)}
              style={styles.option}
            />
          ))}
        </View>
        <Text style={[theme.textStyles.caption, styles.prose, { color: theme.colors.textMuted }]}>
          System follows your device. Pin it if you read the app in one lighting all day.
        </Text>
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

function ListRow({ icon: Icon, label, value, onPress }) {
  const theme = useTheme();

  const content = (
    <View style={[styles.row, { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <View
        style={[
          styles.tile,
          { backgroundColor: theme.colors.primarySubtle, borderRadius: theme.radius.sm },
        ]}
      >
        <Icon size={19} color={theme.colors.primary} />
      </View>

      <Text style={[theme.textStyles.bodyStrong, styles.rowLabel, { color: theme.colors.text }]}>
        {label}
      </Text>

      {value !== undefined ? (
        <Text style={[theme.textStyles.numeric, { color: theme.colors.textMuted }]}>{value}</Text>
      ) : null}
      {onPress ? <ChevronRightIcon size={18} color={theme.colors.textFaint} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      accessibilityLabel={label}
      haptic="selection"
      onPress={onPress}
      scaleTo={0.99}
      dimTo={0.96}
      hitSlop={0}
    >
      {content}
    </PressableScale>
  );
}

function Avatar({ name, url, size = 64 }) {
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
          borderWidth: 2,
          borderColor: theme.materials.glass.thick.edge,
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        theme.materials.shadow.sm,
        { width: size, height: size, borderRadius: theme.radius.full },
      ]}
    >
      <LinearGradient
        colors={theme.materials.button.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[theme.textStyles.title, { color: theme.colors.onPrimary }]}>
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  options: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
  },
  prose: {
    maxWidth: 460,
  },
});
