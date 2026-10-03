// #genai: The ground every screen sits on — a lit canvas with pools of coloured light behind it.
//
// This replaces the old paper ground. The point of the orbs is not decoration: glass only reads as
// glass when there is something behind it to blur and tint, and a flat fill gives it nothing. So the
// canvas carries three large, low-contrast radial pools (blue, violet, a touch of lime) positioned
// at the screen's corners where content is sparse, and the panes that float over them pick the
// colour up.
//
// It is static. Nothing drifts or breathes — animated ambient backgrounds cost battery on a screen
// people open at a payment counter, and they read as a screensaver rather than a tool. Every screen
// mounts its own copy (rather than one at the root) because native-stack transitions slide two
// screens past each other, and transparent screens would show each other's text through.
import { useId } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/providers/ThemeProvider';

export function AmbientBackground({ children, style }) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const { canvas, orbs } = theme.materials;

  // SVG ids are document-global on web; two mounted screens must not share gradient ids.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      <LinearGradient
        colors={canvas}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          {orbs.map((orb, index) => (
            <RadialGradient
              key={index}
              id={`orb${uid}${index}`}
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor={orb.color} stopOpacity={orb.opacity} />
              <Stop offset="55%" stopColor={orb.color} stopOpacity={orb.opacity * 0.35} />
              <Stop offset="100%" stopColor={orb.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>

        {orbs.map((orb, index) => (
          <Circle
            key={index}
            cx={orb.cx * width}
            cy={orb.cy * height}
            r={orb.r * width}
            fill={`url(#orb${uid}${index})`}
          />
        ))}
      </Svg>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
