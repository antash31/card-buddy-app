// #genai: Enter what a card holds, in place.
//
// Balances live in the bank's app or on a statement; nothing Card Buddy reads can supply them. A
// blank field clears the saved balance, and zero is kept as a real balance, so the field always
// describes exactly what will be stored.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/providers/ThemeProvider';

import { initialBalanceText, parseBalance, serverBalanceError } from '../lib/pointsCopy';

export function BalanceForm({ balance, saving, error, onSave, onCancel }) {
  const theme = useTheme();
  const [text, setText] = useState(() => initialBalanceText(balance));
  const [fieldError, setFieldError] = useState(null);

  const submit = () => {
    const parsed = parseBalance(text);
    if (!parsed.ok) {
      setFieldError(parsed.error);
      return;
    }
    setFieldError(null);
    onSave(parsed.balance);
  };

  const fromServer = serverBalanceError(error);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <TextField
        label="Points balance"
        value={text}
        onChangeText={(next) => {
          setText(next);
          if (fieldError) setFieldError(null);
        }}
        keyboardType="decimal-pad"
        error={fieldError ?? fromServer}
        helperText="From your bank’s app or latest statement. Cashback cards: the rupees you hold."
      />

      {error && !fromServer ? <FormBanner message={error.message} /> : null}

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>Leave it blank to clear it.</Text>

      <PrimaryButton label="Save" loading={saving} onPress={submit} />
      <TextLink label="Cancel" onPress={onCancel} />
    </View>
  );
}
