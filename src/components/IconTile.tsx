import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, fontFamily, theme } from '../theme';

type IconTileProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
};

export function IconTile({ icon, title, subtitle, style }: IconTileProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.iconWrap}>{icon}</View>
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: colors.accentMuted + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.base,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: typography.scale.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
