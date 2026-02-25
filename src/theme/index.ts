export { colors } from './colors';
export type { ColorKey } from './colors';
export { fontFamily, fontFamilyFallback, typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';

import { colors } from './colors';
import { typography, fontFamily } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  fontFamily,
  spacing,
  shadows,
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  /** Motion (for Animated / Reanimated) */
  motion: {
    durationFast: 150,
    durationNormal: 250,
    durationSlow: 400,
  },
} as const;
