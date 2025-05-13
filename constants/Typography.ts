// Typography constants based on the tailwind configuration

// Font families
export const FONTS = {
  // For headlines: sharp, modern
  heading: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    bold: 'SpaceGrotesk_700Bold',
  },
  // For UI text: friendly, clean
  body: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
  },
  // Keep mono for code snippets
  mono: 'SpaceMono',
};

// Font sizes - mapping to tailwind size names
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128,
};

// Line heights
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Create common text styles
export const TEXT_STYLES = {
  h1: {
    fontFamily: FONTS.heading.bold,
    fontSize: FONT_SIZES['4xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  h2: {
    fontFamily: FONTS.heading.bold,
    fontSize: FONT_SIZES['3xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  h3: {
    fontFamily: FONTS.heading.bold,
    fontSize: FONT_SIZES['2xl'],
    lineHeight: LINE_HEIGHTS.tight,
  },
  h4: {
    fontFamily: FONTS.heading.medium,
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.tight,
  },
  body: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.normal,
  },
  bodyBold: {
    fontFamily: FONTS.body.bold,
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.normal,
  },
  small: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: LINE_HEIGHTS.normal,
  },
  button: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.tight,
  },
};

// Common app component text styles
export const APP_TEXT_STYLES = {
  screenTitle: {
    fontFamily: FONTS.heading.bold,
    fontSize: FONT_SIZES['2xl'],
    color: 'white',
  },
  sectionTitle: {
    fontFamily: FONTS.heading.medium,
    fontSize: FONT_SIZES.xl,
    color: 'white',
  },
  cardTitle: {
    fontFamily: FONTS.heading.medium,
    fontSize: FONT_SIZES.lg,
    color: 'white',
  },
  bodyText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    color: 'white',
  },
  bodyTextMuted: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    color: '#9CA3AF', // muted color
  },
  buttonText: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.base,
    color: 'white',
  },
  inputText: {
    fontFamily: FONTS.body.regular,
    fontSize: FONT_SIZES.base,
    color: 'white',
  },
  labelText: {
    fontFamily: FONTS.body.medium,
    fontSize: FONT_SIZES.sm,
    color: '#9CA3AF', // muted color
  },
}; 