import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, fontFamily } from '../theme';

type FieldNoteDividerProps = {
  label?: string;
};

export function FieldNoteDivider({ label }: FieldNoteDividerProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.line} />
      {label ? (
        <>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.line} />
        </>
      ) : (
        <View style={styles.line} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: typography.overline.fontSize,
    lineHeight: typography.overline.lineHeight,
    letterSpacing: typography.overline.letterSpacing,
    color: colors.accent,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
  },
});
