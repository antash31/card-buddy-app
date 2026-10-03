// #genai: The bottom navigation — a floating glass capsule with a lens under the active tab.
//
// The capsule is inset from the screen edges and hovers above the home indicator rather than being
// glued to the bottom. Content genuinely scrolls beneath it, so the blur has something real to
// work on; reduce-transparency (and Android, where live blur is costly) get an opaque capsule via
// `Glass`.
//
// The active tab is marked by a *lens*: a single tinted pill that springs sideways to sit behind
// whichever tab is current. One shared lens (rather than a marker per tab) is what makes the bar
// feel like one liquid object; it is driven by a spring on the UI thread so it can be re-aimed
// mid-flight, and it takes its geometry from one `onLayout` measurement, so it cannot desync from
// the real item widths on any device.
//
// Labels are always visible. Icon-only navigation asks the user to learn a legend, and this audience
// opens the app at a payment counter, not at leisure. Selection is carried by the lens, the accent
// colour AND a heavier label, so it never depends on colour alone.
//
// Secondary routes that are not tabs (Ask, Tracking, Card details, Wallet audit, CIBIL Protector, Points bank…) keep their parent tab lit, so
// the user always has an answer to "where am I?".
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NestIcon, PlusIcon, SwipeMaxIcon, UserIcon } from '@/components/icons';
import { Glass } from '@/components/surfaces/Glass';
import { useReduceMotion } from '@/hooks/useMotionPreferences';
import { fireHaptic } from '@/lib/haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { springs, timings } from '@/theme/motion';

// Keyed by route name so the bar's contents are declared here rather than inferred from options.
const TABS = {
  index: { label: 'Nest', Icon: NestIcon },
  swipemax: { label: 'SwipeMax', Icon: SwipeMaxIcon },
  'add-card': { label: 'Add', Icon: PlusIcon },
  profile: { label: 'Profile', Icon: UserIcon },
};

// Non-tab routes and the tab they live under.
const PARENT_TAB = {
  chat: 'swipemax',
  tracking: 'profile',
  'transaction-review': 'profile',
  'card-details': 'index',
  'wallet-audit': 'index',
  'wallet-categories': 'index',
  'credit-health': 'index',
  'points-bank': 'index',
};

const INNER_PADDING = 6;

function TabItem({ config, focused, onPress, onLongPress, accessibilityLabel }) {
  const theme = useTheme();
  const { Icon, label } = config;
  const color = focused ? theme.colors.primary : theme.colors.textMuted;

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
      <View style={[styles.itemContent, { gap: 3 }]}>
        <Icon size={22} color={color} strokeWidth={focused ? 2.1 : 1.8} />
        <Text
          style={[
            styles.label,
            {
              color,
              fontFamily: focused ? theme.fonts.text.semibold : theme.fonts.text.medium,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

  const visible = state.routes.filter((route) => TABS[route.name]);
  const focusedRoute = state.routes[state.index];
  const focusedName = TABS[focusedRoute?.name] ? focusedRoute.name : PARENT_TAB[focusedRoute?.name];
  const activeIndex = visible.findIndex((route) => route.name === focusedName);

  const [innerWidth, setInnerWidth] = useState(0);
  const itemWidth = visible.length ? innerWidth / visible.length : 0;

  const lensX = useSharedValue(0);
  const lensOpacity = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (!itemWidth) return;
    const target = Math.max(activeIndex, 0) * itemWidth;

    if (!placed.current) {
      // First measurement: put the lens in place without sliding in from the left edge.
      lensX.value = target;
      placed.current = true;
    } else {
      lensX.value = reduceMotion
        ? withTiming(target, { duration: timings.fast })
        : withSpring(target, springs.liquid);
    }

    lensOpacity.value = withTiming(activeIndex >= 0 ? 1 : 0, { duration: timings.base });
  }, [activeIndex, itemWidth, lensOpacity, lensX, reduceMotion]);

  const lensStyle = useAnimatedStyle(() => ({
    opacity: lensOpacity.value,
    transform: [{ translateX: lensX.value }],
  }));

  const barBottom = Math.max(insets.bottom - 6, theme.metrics.tabBarGap);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { left: theme.metrics.gutter, right: theme.metrics.gutter, bottom: barBottom }]}
    >
      <Glass
        variant="thick"
        radius={theme.metrics.tabBarHeight / 2}
        shadow="lg"
        style={{ height: theme.metrics.tabBarHeight }}
        contentStyle={styles.fill}
      >
        <View
          style={[styles.row, { padding: INNER_PADDING }]}
          onLayout={(event) => setInnerWidth(event.nativeEvent.layout.width - INNER_PADDING * 2)}
        >
          {itemWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.lens,
                {
                  left: INNER_PADDING,
                  top: INNER_PADDING,
                  bottom: INNER_PADDING,
                  width: itemWidth,
                  borderRadius: theme.metrics.tabBarHeight / 2 - INNER_PADDING,
                  backgroundColor: theme.colors.primarySubtle,
                  borderColor: theme.colors.primaryEdge,
                },
                lensStyle,
              ]}
            />
          )}

          {visible.map((route) => {
            const config = TABS[route.name];
            const { options } = descriptors[route.key];
            const focused = route.name === focusedName;

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

                  if (!event.defaultPrevented) {
                    // Tapping the parent tab from one of its sub-screens must still navigate.
                    if (!focused || route.key !== focusedRoute?.key) navigation.navigate(route.name);
                  }
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              />
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
  fill: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  lens: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
});
