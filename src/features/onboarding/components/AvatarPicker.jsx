// #genai: Circular avatar chooser.
//
// Optional by design — the ring shows the user's initials until they pick a photo, so skipping
// this never leaves an empty hole in the UI.
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { CameraIcon } from '@/components/icons';
import { PressableScale } from '@/components/motion/PressableScale';
import { useTheme } from '@/providers/ThemeProvider';

const SIZE = 116;

function initialsFrom(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function AvatarPicker({ value, onChange, name = '', disabled = false }) {
  const theme = useTheme();
  const initials = initialsFrom(name);

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access in Settings to choose a profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    const asset = result.canceled ? null : result.assets?.[0];
    if (asset) {
      onChange({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  return (
    <View style={styles.root}>
      <PressableScale
        accessibilityHint="Opens your photo library"
        accessibilityLabel={value ? 'Change profile picture' : 'Add a profile picture'}
        disabled={disabled}
        haptic="selection"
        onPress={pick}
        scaleTo={0.94}
      >
        <View style={[styles.ring, { borderColor: theme.colors.border }]}>
          {value?.uri ? (
            <Image
              source={{ uri: value.uri }}
              accessibilityIgnoresInvertColors
              style={styles.image}
            />
          ) : (
            // A flat tint with the monogram in the Didone, rather than a gradient fill — the same
            // treatment the Profile screen uses, so the two never look like different products.
            <View style={[styles.image, { backgroundColor: theme.colors.primarySubtle }]}>
              <Text
                style={[
                  styles.initials,
                  { color: theme.colors.primary, fontFamily: theme.fonts.display.medium },
                ]}
              >
                {initials || '·'}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.background,
              },
            ]}
          >
            <CameraIcon size={16} color={theme.colors.text} />
          </View>
        </View>
      </PressableScale>

      <Text style={[theme.textStyles.caption, { color: theme.colors.textMuted }]}>
        {value ? 'Tap to change' : 'Add a photo (optional)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 10,
  },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 38,
    letterSpacing: -1,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
