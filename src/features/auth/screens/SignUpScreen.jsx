// #genai: Account creation.
//
// Password requirements are shown as they are met rather than thrown back after submission, so
// the policy reads as guidance instead of rejection.
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { SocialButton } from '@/components/actions/SocialButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { PasswordStrength } from '@/components/forms/PasswordStrength';
import { TextField } from '@/components/forms/TextField';
import { LockIcon, MailIcon, UserIcon } from '@/components/icons';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useOAuthSignIn, useSignUp } from '../hooks/useAuthActions';
import { validateEmail, validateFullName, validateNewPassword } from '../lib/validation';

export function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const signUp = useSignUp();
  const oauth = useOAuthSignIn();

  const pendingProvider = oauth.isPending ? oauth.variables : null;
  const busy = signUp.isPending || oauth.isPending;

  const bannerMessage =
    signUp.error?.message ??
    (oauth.error?.code === 'OAUTH_CANCELLED' ? null : oauth.error?.message);

  const clearError = (field) =>
    setErrors((previous) => (previous[field] ? { ...previous, [field]: null } : previous));

  const submit = () => {
    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validateNewPassword(password),
    };

    setErrors(nextErrors);

    if (nextErrors.fullName || nextErrors.email || nextErrors.password) {
      haptics.error();
      return;
    }

    signUp.mutate(
      { fullName: fullName.trim(), email: email.trim(), password },
      {
        onSuccess: (data) => {
          // With email confirmation enabled Supabase issues no session; the user has to verify
          // first. Otherwise the store is already updated and routing takes over.
          if (data?.requiresEmailConfirmation) {
            router.replace({ pathname: '/verify-email', params: { email: email.trim() } });
          }
        },
      },
    );
  };

  return (
    <AuthLayout showBack>
      <ScreenHeader eyebrow="Create account" title="Get more from the cards you already hold" />

      <Reveal delay={stagger(4)} style={{ gap: theme.spacing.lg }}>
        <FormBanner message={bannerMessage} />

        <TextField
          label="Full name"
          leftIcon={UserIcon}
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            clearError('fullName');
          }}
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!busy}
        />

        <TextField
          ref={emailRef}
          label="Email"
          leftIcon={MailIcon}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearError('email');
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

        <View style={{ gap: theme.spacing.md }}>
          <TextField
            ref={passwordRef}
            label="Password"
            leftIcon={LockIcon}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              clearError('password');
            }}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!busy}
          />

          <PasswordStrength value={password} />
        </View>

        <PrimaryButton
          label="Create account"
          onPress={submit}
          loading={signUp.isPending}
          disabled={busy}
        />

        <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </Text>
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
            Already have an account?
          </Text>
          <TextLink label="Sign in" onPress={() => router.replace('/sign-in')} />
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
