// #genai: The ground every screen sits on.
//
// Printed stock is never one flat value — it picks up a little more light at the top of the page.
// The three canvas stops encode that and nothing more; the difference between the first and last is
// about 2% lightness, which you feel rather than see. Anything stronger would read as "a gradient",
// which is precisely the tell we are avoiding.
//
// There are no drifting colour fields, no blobs and no animation here. The background's job is to
// be paper.
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/providers/ThemeProvider';

export function PaperBackground({ children, style }) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }, style]}>
      <LinearGradient
        colors={theme.materials.canvas}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
