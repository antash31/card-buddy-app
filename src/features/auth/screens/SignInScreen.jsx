// #genai: Email + password sign-in, with OAuth alternatives.
//
// The form is no longer wrapped in a panel. A panel around a login form is a container drawn for no
// reason — nothing sits beside it that it needs separating from, and on a page this sparse the
// fields already group themselves.
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SocialButton } from '@/components/actions/SocialButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { LockIcon, MailIcon } from '@/components/icons';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useOAuthSignIn, useSignIn } from '../hooks/useAuthActions';
import { validateEmail, validateExistingPassword } from '../lib/validation';

export function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const signIn = useSignIn();
  const oauth = useOAuthSignIn();

  const pendingProvider = oauth.isPending ? oauth.variables : null;
  const busy = signIn.isPending || oauth.isPending;

  const bannerMessage =
    signIn.error?.message ??
    // A cancelled OAuth sheet is a deliberate user action, not an error worth reporting.
    (oauth.error?.code === 'OAUTH_CANCELLED' ? null : oauth.error?.message);

  const submit = () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validateExistingPassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      // One haptic for the whole form: a buzz per invalid field trains people to ignore them.
      haptics.error();
      return;
    }

    signIn.mutate({ email: email.trim(), password });
  };

  return (
    <AuthLayout showBack>
      <ScreenHeader eyebrow="Sign in" title="Welcome back" />

      <Reveal delay={stagger(4)} style={{ gap: theme.spacing.lg }}>
        <FormBanner message={bannerMessage} />

        <TextField
          label="Email"
          leftIcon={MailIcon}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (errors.email) setErrors((previous) => ({ ...previous, email: null }));
          }}
          error={errors.email}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
        />

        <TextField
          ref={passwordRef}
          label="Password"
          leftIcon={LockIcon}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (errors.password) setErrors((previous) => ({ ...previous, password: null }));
          }}
          error={errors.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
        />

        <TextLink
          label="Forgot password?"
          align="start"
          tone="muted"
          onPress={() => router.push('/forgot-password')}
        />

        <PrimaryButton
          label="Sign in"
          onPress={submit}
          loading={signIn.isPending}
          disabled={busy}
        />
      </Reveal>

      <Reveal delay={stagger(5)} style={{ gap: theme.spacing.lg }}>
        <View style={[styles.divider, { gap: theme.spacing.md }]}>
          <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
          <Text style={[theme.textStyles.micro, { color: theme.colors.textMuted }]}>or</Text>
          <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SocialButton
            provider="apple"
            onPress={() => oauth.mutate('apple')}
            loading={pendingProvider === 'apple'}
            disabled={busy}
          />
          <SocialButton
            provider="google"
            onPress={() => oauth.mutate('google')}
            loading={pendingProvider === 'google'}
            disabled={busy}
          />
        </View>
      </Reveal>

      <Reveal delay={stagger(6)}>
        <View style={[styles.footerRow, { gap: theme.spacing.sm }]}>
          <Text style={[theme.textStyles.label, { color: theme.colors.textMuted }]}>
            New to Card Buddy?
          </Text>
          <TextLink label="Create an account" onPress={() => router.replace('/sign-up')} />
        </View>
      </Reveal>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
