// #genai: Standard screen wrapper: themed background + safe-area padding.
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/providers/ThemeProvider';

export function Screen({ children, scrollable = false, padded = true, style }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.flex,
    {
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  ];

  const contentStyle = [padded && { padding: theme.spacing.xl, gap: theme.spacing.lg }, style];

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[...containerStyle, ...contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
