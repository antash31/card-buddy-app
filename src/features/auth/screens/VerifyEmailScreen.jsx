// #genai: Shown after sign-up when the project requires email confirmation.
//
// Without this the flow dead-ends: Supabase returns no session, and the user is left on a form that
// appeared to do nothing. This names exactly what happened and what to do next.
//
// There is no large rounded icon above the heading. A decorative glyph in a tinted circle is the
// most templated pattern in this genre of screen and it pushes the one thing that matters — the
// address the mail went to — below the fold on a small phone.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useResendConfirmation } from '../hooks/useAuthActions';

export function VerifyEmailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const resend = useResendConfirmation();
  const address = typeof email === 'string' ? email : '';

  return (
    <AuthLayout>
      <ScreenHeader eyebrow="Verify" title="Check your inbox" />

      <Reveal delay={stagger(4)}>
        <Text style={[theme.textStyles.body, { color: theme.colors.textMuted, maxWidth: 460 }]}>
          We sent a confirmation link
          {address ? ' to ' : ''}
          {address ? (
            <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.text.semibold }}>
              {address}
            </Text>
          ) : null}
          . Open it to activate your account, then come back and sign in.
        </Text>
      </Reveal>

      <Reveal delay={stagger(5)}>
        <View style={{ gap: theme.spacing.lg }}>
          {resend.isSuccess && (
            <FormBanner tone="success" message="Sent. Give it a minute to arrive." />
          )}
          <FormBanner message={resend.error?.message} />

          <PrimaryButton label="Go to sign in" onPress={() => router.replace('/sign-in')} />

          <TextLink
            label={resend.isPending ? 'Resending…' : 'Resend confirmation email'}
            tone="muted"
            onPress={() => address && resend.mutate(address)}
          />
        </View>
      </Reveal>
    </AuthLayout>
  );
}
