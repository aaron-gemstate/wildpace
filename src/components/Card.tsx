import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, theme, shadows } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  /** Show 3px top accent bar (default true when padding, false when noPadding) */
  accentBar?: boolean;
};

export function Card({ children, style, noPadding, accentBar }: CardProps) {
  const showAccent = accentBar ?? !noPadding;
  return (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {showAccent ? <View style={styles.accentBar} /> : null}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
  },
  inner: {
    flex: 1,
  },
  padding: {
    paddingTop: (theme.borderRadius.lg + 4) + 6,
    paddingBottom: theme.borderRadius.lg + 4,
    paddingHorizontal: theme.borderRadius.lg + 4,
  },
});
