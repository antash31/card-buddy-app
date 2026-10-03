// #genai: How full a limit is, with the 30% line marked on it.
//
// The marker is the point of the bar: "42%" means little until you can see where 30% sits. The fill
// changes colour past the line but is never the only signal — the caller prints the figure and the
// pill carries the word — so it survives a colour-vision deficiency and a greyscale screenshot.
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

import { formatPct } from '../lib/creditCopy';

const TRACK = 8;
const MARKER = 2;

export function UtilisationBar({ pct, thresholdPct = 30, label }) {
  const theme = useTheme();
  const used = Math.max(0, Math.min(Number.isFinite(pct) ? pct : 0, 100));
  const over = pct > thresholdPct;
  const severe = pct > thresholdPct + 20;

  const fill = severe ? theme.colors.danger : over ? theme.colors.warning : theme.colors.success;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? `${formatPct(pct)} of the limit used. The guideline is ${thresholdPct}%.`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(used) }}
      style={styles.wrap}
    >
      <View style={[styles.track, { backgroundColor: theme.materials.inset.background }]}>
        <View style={[styles.fill, { width: `${Math.max(used, used > 0 ? 2 : 0)}%`, backgroundColor: fill }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.marker, { left: `${thresholdPct}%`, backgroundColor: theme.colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: TRACK + 8,
    justifyContent: 'center',
  },
  track: {
    height: TRACK,
    borderRadius: TRACK / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: TRACK / 2,
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: MARKER,
    marginLeft: -MARKER / 2,
    borderRadius: MARKER / 2,
    opacity: 0.55,
  },
});
