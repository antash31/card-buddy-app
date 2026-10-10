// #genai: The three things CIBIL Protector needs from a card, entered in place.
//
// Credit limit, statement day and payment due day all live on the bank's statement and in its app,
// and none of them can be read from a transaction alert. A blank field clears the saved value, so
// the form always describes exactly what will be stored.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/actions/PrimaryButton';
import { TextLink } from '@/components/actions/TextLink';
import { FormBanner } from '@/components/forms/FormBanner';
import { TextField } from '@/components/forms/TextField';
import { useTheme } from '@/providers/ThemeProvider';

import { initialFormValues, parseCreditForm, serverFieldErrors } from '../lib/creditCopy';

export function CreditProfileForm({ profile, saving, error, onSave, onCancel }) {
  const theme = useTheme();
  const [values, setValues] = useState(() => initialFormValues(profile));
  const [errors, setErrors] = useState({});

  const set = (field) => (text) => {
    setValues((current) => ({ ...current, [field]: text }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = () => {
    const parsed = parseCreditForm(values);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    onSave(parsed.body);
  };

  const fromServer = serverFieldErrors(error);
  const shown = (field) => errors[field] ?? fromServer[field];

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <TextField
        label="Credit limit (Rs.)"
        value={values.limit}
        onChangeText={set('limit')}
        keyboardType="number-pad"
        error={shown('limit')}
        helperText="On your statement or in the bank’s app."
      />
      <TextField
        label="Statement day"
        value={values.statementDay}
        onChangeText={set('statementDay')}
        keyboardType="number-pad"
        maxLength={2}
        error={shown('statementDay')}
        helperText="The day of the month your statement is generated."
      />
      <TextField
        label="Payment due day"
        value={values.dueDay}
        onChangeText={set('dueDay')}
        keyboardType="number-pad"
        maxLength={2}
        error={shown('dueDay')}
        helperText="Optional. The day of the month the payment is due."
      />

      {error && Object.keys(fromServer).length === 0 ? <FormBanner message={error.message} /> : null}

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
        Leave a field blank to clear it.
      </Text>

      <PrimaryButton label="Save" loading={saving} onPress={submit} />
      <TextLink label="Cancel" onPress={onCancel} />
    </View>
  );
}
