/**
 * WildPace theme — Clay, Forest, Charcoal, Sand, Off White.
 * Accent: Burnt Orange. Optional: Deep Navy.
 */

export const colors = {
  // Base — Charcoal
  background: '#1E1E1E',
  surface: '#252525',
  surfaceElevated: '#2E2E2E',

  // Text — Off White & Sand
  text: '#FAF7F2',
  textSecondary: '#F2E9DC',
  textMuted: 'rgba(242, 233, 220, 0.7)',

  // Primary accent — Burnt Orange
  accent: '#C45C2C',
  accentLight: '#D96B3A',
  accentMuted: '#A05A2C',

  // Brand palette
  clay: '#A05A2C',
  forest: '#1F3A2E',
  charcoal: '#1E1E1E',
  sand: '#F2E9DC',
  offWhite: '#FAF7F2',
  navy: '#1B2838',

  // Earth / UI
  earth: '#A05A2C',
  earthLight: '#B86B3C',
  stone: '#5C5248',

  // Session type badges
  badgeEasy: '#4A6B5A',
  badgeLong: '#8B6B4A',
  badgeInterval: '#A05A2C',
  badgeTempo: '#C45C2C',
  badgeStrength: '#5A5A6B',
  badgeCross: '#5A6B6B',
  badgeRest: '#5C5248',

  // UI
  border: '#3D3530',
  borderDark: '#2E2E2E',
  error: '#B84A4A',
  success: '#2F5A4A',
  warning: '#B88B4A',
} as const;

export type ColorKey = keyof typeof colors;
