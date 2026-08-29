// #genai: The bottom navigation bar.
//
// This is the one surface in the product allowed to be translucent, and it earns it: content
// genuinely scrolls beneath it, so a blurred backdrop communicates depth that a solid fill would
// hide. Reduce-transparency (and Android, where a real blur is expensive) gets the opaque fill.
//
// The active marker is a short pine bar sitting *on* the top hairline, like the raised tab of a
// file divider — the aesthetic conceit of the whole app, at 2pt. Each tab owns its own marker and
// springs it in, rather than one shared indicator sliding between measured positions: a per-tab
// spring is interruptible, needs no layout measurement, and cannot desync from the route.
//
// Labels are always visible. Icon-only navigation asks the user to learn a legend, and this audience
// opens the app at a payment counter, not at leisure.
import { BlurView } from 'expo-blur';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NestIcon, PlusIcon, UserIcon } from '@/components/icons';
import { useReduceMotion, useReduceTransparency } from '@/hooks/useMotionPreferences';
import { fireHaptic } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { springs, timings } from '@/theme/motion';

// Keyed by route name so the bar's contents are declared here rather than inferred from options.
const TABS = {
  index: { label: 'Nest', Icon: NestIcon },
  'add-card': { label: 'Add', Icon: PlusIcon },
  profile: { label: 'Profile', Icon: UserIcon },
};

function TabItem({ config, focused, onPress, onLongPress, accessibilityLabel }) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();

  const progress = useDerivedValue(
    () =>
      reduceMotion
        ? withTiming(focused ? 1 : 0, { duration: timings.fast })
        : withSpring(focused ? 1 : 0, springs.snappy),
    [focused, reduceMotion],
  );

  const markerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    // Scaling from the centre makes the marker read as being drawn outward from the tab, which is
    // cheaper than animating width and never triggers layout.
    transform: [{ scaleX: reduceMotion ? 1 : 0.4 + progress.value * 0.6 }],
  }));

  const { Icon, label } = config;
  const color = focused ? theme.colors.primary : theme.colors.textFaint;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        // Selection, not impact: switching tabs is a navigation, not a commitment.
        if (!focused) fireHaptic('selection');
        onPress();
      }}
      onLongPress={onLongPress}
      style={styles.item}
    >
      <Animated.View
        style={[
          styles.marker,
          { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xs },
          markerStyle,
        ]}
        pointerEvents="none"
      />

      <View style={[styles.itemContent, { gap: theme.spacing.xs }]}>
        <Icon size={21} color={color} />
        <Text style={[theme.textStyles.micro, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceTransparency = useReduceTransparency();

  const { chrome } = theme.materials;
  const solid = reduceTransparency || Platform.OS === 'android';

  return (
    <View
      style={[
        styles.bar,
        {
          height: theme.metrics.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: solid ? chrome.opaque : chrome.background,
        },
        theme.materials.elevated,
      ]}
    >
      {!solid && (
        <BlurView
          intensity={chrome.intensity}
          tint={chrome.tint}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}

      {/* The rule the active marker sits on. */}
      <View style={[styles.topRule, { backgroundColor: chrome.rule }]} pointerEvents="none" />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const config = TABS[route.name];
          if (!config) return null;

          const { options } = descriptors[route.key];
          const focused = state.index === index;

          return (
            <TabItem
              key={route.key}
              config={config}
              focused={focused}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  topRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
  },
  marker: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 2,
  },
});
