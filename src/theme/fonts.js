// #genai: The one typeface and the map used to load it.
//
// Manrope is a semi-geometric grotesque with open apertures, a single-storey "g" and very even
// tabular numerals. Set heavy and tracked in, it gives the confident, rounded-but-precise headline
// voice of the reference design; set medium it stays calm in dense financial rows. One family keeps
// the payload small and means display and UI text can never drift apart in metrics.
//
// Weight is selected by FAMILY, never by `fontWeight`. Static Google Font instances are separate
// files, so asking for `fontWeight: '700'` on the 500 file gets you synthetic bolding on Android
// and nothing at all on iOS.
//
// The role names (`regular` / `medium` / `semibold` / `bold`) are kept stable so components never
// name a file directly. They sit one notch heavier than the usual mapping on purpose: at phone
// sizes on a pale glass ground, Manrope 400 looks anaemic, and 500 is the real "regular" here.
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

/** Passed straight to `Font.loadAsync`. */
export const fontAssets = {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

export const fonts = {
  /** Headlines, figures, the wordmark. Same family as `text`, heavier cuts. */
  display: {
    regular: 'Manrope_600SemiBold',
    medium: 'Manrope_700Bold',
    semibold: 'Manrope_800ExtraBold',
    bold: 'Manrope_800ExtraBold',
  },
  /** Everything else. */
  text: {
    regular: 'Manrope_500Medium',
    medium: 'Manrope_600SemiBold',
    semibold: 'Manrope_700Bold',
    bold: 'Manrope_800ExtraBold',
  },
};
