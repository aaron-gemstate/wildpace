import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontFamily } from '../theme';

type StampProps = {
  label: string;
  variant?: 'default' | 'muted';
};

export function Stamp({ label, variant = 'default' }: StampProps) {
  return (
    <View style={[styles.wrapper, variant === 'muted' && styles.wrapperMuted]}>
      <Text style={[styles.text, variant === 'muted' && styles.textMuted]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.accentMuted,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  wrapperMuted: {
    borderColor: colors.border,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.xs,
    color: colors.text,
    letterSpacing: 1,
  },
  textMuted: {
    color: colors.textSecondary,
  },
});
