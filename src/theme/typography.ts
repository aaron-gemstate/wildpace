import { Platform } from 'react-native';

/**
 * Headlines: Bebas Neue (display), Oswald (h1–h3).
 * Body: DM Sans.
 * Micro labels: DM Sans, uppercase, overline — e.g. "TODAY'S SESSION", "FIELD NOTES".
 */

const fallback = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  semibold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' }),
} as const;

/** After fonts load in App — Bebas Neue, Oswald, DM Sans. */
export const fontFamily = {
  display: 'BebasNeue_400Regular',
  h1: 'Oswald_600SemiBold',
  h2: 'Oswald_500Medium',
  h3: 'Oswald_500Medium',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

/** Fallback when custom fonts not yet loaded. */
export const fontFamilyFallback = fallback;

export const typography = {
  display: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  /** Uppercase micro labels: "TODAY'S SESSION", "FIELD NOTES", "WEEK 1 / BUILD" */
  overline: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  scale: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
} as const;
