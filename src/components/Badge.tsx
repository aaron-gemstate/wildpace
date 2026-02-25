import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontFamily, theme } from '../theme';

export type SessionType = 'easy' | 'long' | 'interval' | 'tempo' | 'strength' | 'cross' | 'rest';

const badgeColors: Record<SessionType, string> = {
  easy: colors.badgeEasy,
  long: colors.badgeLong,
  interval: colors.badgeInterval,
  tempo: colors.badgeTempo,
  strength: colors.badgeStrength,
  cross: colors.badgeCross,
  rest: colors.badgeRest,
};

const badgeLabels: Record<SessionType, string> = {
  easy: 'EASY',
  long: 'LONG',
  interval: 'INTERVAL',
  tempo: 'TEMPO',
  strength: 'STRENGTH',
  cross: 'CROSS',
  rest: 'REST',
};

type BadgeProps = {
  type: SessionType;
  size?: 'sm' | 'md';
};

export function Badge({ type, size = 'md' }: BadgeProps) {
  const bg = badgeColors[type];
  const label = badgeLabels[type];
  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSm && styles.badgeSm]}>
      <Text style={[styles.text, isSm && styles.textSm]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  badgeSm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.xs,
    color: colors.text,
    letterSpacing: 0.8,
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
