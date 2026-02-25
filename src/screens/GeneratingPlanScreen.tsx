import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { useApp } from '../store/AppContext';
import { colors, typography, fontFamily, spacing } from '../theme';
import { GrainOverlay } from '../components/GrainOverlay';

export function GeneratingPlanScreen() {
  const { plan, planGenerationLoading, generatePlan } = useApp();

  useEffect(() => {
    if (!plan && !planGenerationLoading) generatePlan();
  }, [plan, planGenerationLoading, generatePlan]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GrainOverlay />
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.text} style={styles.spinner} />
        <Text style={styles.title}>Building Your Plan</Text>
        <Text style={styles.subtitle}>
          We’re generating your 4-month training plan and daily nutrition guidance. Your plan will appear in the Today tab and in Plan by day. This usually takes a few seconds.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.lg,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: typography.scale.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.scale.base * typography.lineHeight.relaxed,
  },
});
