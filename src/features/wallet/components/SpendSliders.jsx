// #genai: The monthly-spend sliders, grouped the way people think about money.
//
// The buckets (and each slider's range and step) come from the server, so the app and the API can
// never disagree about what a bucket is or how much it may hold.
import { View } from 'react-native';

import { Slider } from '@/components/forms/Slider';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Surface } from '@/components/surfaces/Surface';
import { useTheme } from '@/providers/ThemeProvider';

import { GROUP_LABELS } from '../lib/auditCopy';

const GROUP_ORDER = ['everyday', 'recurring', 'other'];

export function SpendSliders({ buckets, monthly, onChange, disabled }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xl }}>
      {GROUP_ORDER.map((group) => {
        const rows = buckets.filter((bucket) => bucket.group === group);
        if (rows.length === 0) return null;

        return (
          <View key={group} style={{ gap: theme.spacing.md }}>
            <SectionLabel label={GROUP_LABELS[group]} />
            <Surface contentStyle={{ gap: theme.spacing.xl - 4 }}>
              {rows.map((bucket) => (
                <Slider
                  key={bucket.id}
                  label={bucket.label}
                  hint={bucket.hint}
                  value={monthly[bucket.id] ?? 0}
                  max={bucket.max}
                  step={bucket.step}
                  disabled={disabled}
                  onChange={(value) => onChange(bucket.id, value)}
                />
              ))}
            </Surface>
          </View>
        );
      })}
    </View>
  );
}
