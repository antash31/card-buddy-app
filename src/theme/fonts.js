// #genai: The two typefaces and the map used to load them.
//
// Bodoni Moda is a Didone: extreme stroke contrast, flat unbracketed serifs. It reads as
// *engraving* — banknotes, share certificates — which is the whole premium signal. Its hairlines
// are fragile below ~20px, so it is only ever used at title size and above.
//
// Golos Text is a quiet Paratype grotesque with a generous x-height and even, steady numerals. Its
// job is to disappear: everything a user reads at a payment counter is set in it.
//
// Weight is selected by FAMILY, never by `fontWeight`. Static Google Font instances are separate
// files, so asking for `fontWeight: '600'` on the 400 file gets you synthetic bolding on Android
// and nothing at all on iOS.
import {
  BodoniModa_400Regular,
  BodoniModa_500Medium,
  BodoniModa_600SemiBold,
  BodoniModa_700Bold,
} from '@expo-google-fonts/bodoni-moda';
import {
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
} from '@expo-google-fonts/golos-text';

/** Passed straight to `Font.loadAsync`. */
export const fontAssets = {
  BodoniModa_400Regular,
  BodoniModa_500Medium,
  BodoniModa_600SemiBold,
  BodoniModa_700Bold,
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
};

export const fonts = {
  /** Display serif — titles, figures, the brand mark. Large sizes only. */
  display: {
    regular: 'BodoniModa_400Regular',
    medium: 'BodoniModa_500Medium',
    semibold: 'BodoniModa_600SemiBold',
    bold: 'BodoniModa_700Bold',
  },
  /** Everything else. */
  text: {
    regular: 'GolosText_400Regular',
    medium: 'GolosText_500Medium',
    semibold: 'GolosText_600SemiBold',
    bold: 'GolosText_700Bold',
  },
};
