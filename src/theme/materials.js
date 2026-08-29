// #genai: Surface materials.
//
// The previous version of this app treated translucency as decoration — aurora blobs behind every
// screen and a glass panel around every group of text. This one treats it as a scarce, functional
// resource. There is exactly one blurred surface in the product (the tab bar, which genuinely
// floats over moving content) and one gradient (a near-imperceptible tonal shift that makes the
// background read as stock rather than a flat fill).
//
// Everything else is paper and hairline rules.

const lightMaterials = {
  /**
   * Painted top-down. The stops are deliberately almost identical — printed paper is never one
   * flat value, but any visible band would read as a gradient, which is exactly what we're avoiding.
   */
  canvas: ['#FFFDFC', '#FCF9F5', '#F7F3EE'],

  /** The one blurred surface: the tab bar, floating over content that scrolls beneath it. */
  chrome: {
    tint: 'light',
    intensity: 64,
    background: 'rgba(252, 249, 245, 0.82)',
    // Opaque equivalent for reduce-transparency and for Android, where blur is expensive.
    opaque: '#FCF9F5',
    rule: 'rgba(37, 30, 24, 0.10)',
  },

  field: {
    background: '#FFFDFC',
    border: '#DEDAD5',
    borderFocused: '#326445',
    borderError: '#A83634',
    focusRing: 'rgba(50, 100, 69, 0.14)',
  },

  /**
   * Card plates on the welcome screen: tonal, not colourful. An engraved plate catches light across
   * its face; it does not glow.
   */
  plates: [
    ['#2C2A22', '#1A1813'],
    ['#33443A', '#1F2C24'],
    ['#4A443B', '#2E2A24'],
  ],
  /** Hairline the plates are inscribed with. */
  plateRule: 'rgba(252, 249, 245, 0.22)',
  onPlate: '#F1EEEA',

  /** Soft tint behind the brand mark and other small accents. */
  brandSubtle: 'rgba(50, 100, 69, 0.10)',

  /** Reserved for surfaces that truly float. Not for cards. */
  elevated: {
    shadowColor: '#120C07',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
};

const darkMaterials = {
  canvas: ['#181511', '#0E0C09', '#080604'],

  chrome: {
    tint: 'dark',
    intensity: 48,
    background: 'rgba(14, 12, 9, 0.84)',
    opaque: '#0E0C09',
    rule: 'rgba(241, 238, 234, 0.12)',
  },

  field: {
    background: '#181511',
    border: '#2C2824',
    borderFocused: '#6BB888',
    borderError: '#DB6C66',
    focusRing: 'rgba(107, 184, 136, 0.18)',
  },

  plates: [
    ['#2C2A22', '#141210'],
    ['#33443A', '#18211B'],
    ['#4A443B', '#231F1B'],
  ],
  plateRule: 'rgba(241, 238, 234, 0.18)',
  onPlate: '#F1EEEA',

  brandSubtle: 'rgba(107, 184, 136, 0.14)',

  elevated: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
};

export { lightMaterials, darkMaterials };
