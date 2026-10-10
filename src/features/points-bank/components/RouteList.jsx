// #genai: Every way a card's points can be redeemed, best first.
//
// Each route shows what a point yields through it and the limits it carries, because the headline
// figure is only true for someone who actually uses that route. A route with no published value is
// listed rather than hidden: "the catalog does not say" is information too.
import { StyleSheet, Text, View } from 'react-native';

import { Rule } from '@/components/surfaces/Rule';
import { useTheme } from '@/providers/ThemeProvider';

import { destinationLabel, humanizeCode, routeLimits, routeYield } from '../lib/pointsCopy';

export function RouteList({ routes }) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      {routes.map((route, index) => {
        const limits = routeLimits(route);
        const destination = destinationLabel(route.destination);

        return (
          <View key={route.code} style={{ gap: theme.spacing.md }}>
            {index > 0 ? <Rule /> : null}
            <View style={{ gap: 2 }}>
              <View style={styles.titleRow}>
                <Text style={[theme.textStyles.bodyStrong, styles.title, { color: theme.colors.text }]}>
                  {humanizeCode(route.code)}
                </Text>
                {route.isDefault ? (
                  <Text style={[theme.textStyles.micro, { color: theme.colors.primary }]}>DEFAULT</Text>
                ) : null}
              </View>
              <Text style={[theme.textStyles.label, { color: route.effectiveValue === null ? theme.colors.textMuted : theme.colors.text }]}>
                {routeYield(route)}
                {destination ? ` · ${destination}` : ''}
              </Text>
              {limits.map((limit) => (
                <Text key={limit} style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
                  {limit}
                </Text>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flexShrink: 1,
  },
});
