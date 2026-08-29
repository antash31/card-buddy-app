// #genai: Password reset request.
//
// The confirmation is identical whether or not the address has an account — the screen must not
// become a way to discover who is registered.
import { useState } from 'react';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { MailIcon } from '@/components/icons';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Reveal } from '@/components/motion/Reveal';
import { haptics } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { stagger } from '@/theme/motion';

import { useForgotPassword } from '../hooks/useAuthActions';
import { validateEmail } from '../lib/validation';

export function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const forgotPassword = useForgotPassword();
  const sent = forgotPassword.isSuccess;

  const submit = () => {
    const validationError = validateEmail(email);
    setError(validationError);

    if (validationError) {
      haptics.error();
      return;
    }

    forgotPassword.mutate(email.trim());
  };

  return (
    <AuthLayout showBack>
      <ScreenHeader
        eyebrow="Password"
        title="Reset your password"
        description="Enter the email you signed up with and we'll send a link to choose a new one."
      />

      <Reveal delay={stagger(4)}>
        <View style={{ gap: theme.spacing.lg }}>
          {sent ? (
            <FormBanner
              tone="success"
              message={`If an account exists for ${email.trim()}, a reset link is on its way. Check your inbox and spam folder.`}
            />
          ) : (
            <>
              <FormBanner message={forgotPassword.error?.message} />

              <TextField
                label="Email"
                leftIcon={MailIcon}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError(null);
                }}
                error={error}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={submit}
                editable={!forgotPassword.isPending}
              />

              <PrimaryButton
                label="Send reset link"
                onPress={submit}
                loading={forgotPassword.isPending}
              />
            </>
          )}
        </View>
      </Reveal>
    </AuthLayout>
  );
}
