import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { FieldNoteDivider } from '../components/FieldNoteDivider';
import { Card } from '../components/Card';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';

export function ProfileScreen() {
  const navigation = useNavigation();
  const {
    user,
    intake,
    plan,
    planGenerationLoading,
    planGenerationError,
    signOut,
    generatePlan,
    adjustPlan,
    seedDemoData,
    clearPlanError,
  } = useApp();

  const handleRegenerate = () => {
    if (!intake) return;
    Alert.alert(
      'Regenerate plan',
      'This will replace your current plan with a new one. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', onPress: () => generatePlan() },
      ]
    );
  };

  const handleAdjust = () => {
    Alert.alert(
      'Adjust plan',
      'Generate an adjusted plan based on your logs and check-ins.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Adjust', onPress: () => adjustPlan() },
      ]
    );
  };

  const handleEditIntake = () => {
    if (!intake) return;
    (navigation.getParent() as any)?.navigate('EditIntake', { existingIntake: intake });
  };

  const handleTalkToCoach = () => {
    (navigation.getParent() as any)?.navigate('CoachAdvisor');
  };

  const handleSeedDemo = () => {
    Alert.alert(
      'Seed demo data',
      'This will set sample intake and generate a demo plan. Your current data will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Seed demo', onPress: () => seedDemoData() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <FieldNoteDivider label="Account" />
        <Card>
          <Text style={styles.email}>{user?.email ?? 'Not signed in'}</Text>
          <PrimaryButton title="Sign out" onPress={() => signOut()} variant="outline" style={styles.btn} />
        </Card>

        <FieldNoteDivider label="Plan" />
        {planGenerationError ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{planGenerationError}</Text>
            <PrimaryButton title="Dismiss" onPress={clearPlanError} variant="outline" style={styles.btnSm} />
          </View>
        ) : null}
        <PrimaryButton
          title="Regenerate plan"
          onPress={handleRegenerate}
          variant="outline"
          loading={planGenerationLoading}
          disabled={!intake || planGenerationLoading}
          style={styles.btn}
        />
        <PrimaryButton
          title="Adjust plan (from logs)"
          onPress={handleAdjust}
          variant="outline"
          loading={planGenerationLoading}
          disabled={!plan || planGenerationLoading}
          style={styles.btn}
        />
        <PrimaryButton title="Edit intake" onPress={handleEditIntake} variant="outline" disabled={!intake} style={styles.btn} />
        <PrimaryButton title="Talk to coach" onPress={handleTalkToCoach} variant="outline" disabled={!intake || !plan} style={styles.btn} />

        <FieldNoteDivider label="Testing" />
        <PrimaryButton title="Seed demo data" onPress={handleSeedDemo} variant="outline" style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base, paddingBottom: spacing.screen },
  email: { fontFamily: fontFamily.regular, fontSize: typography.body.fontSize, color: colors.text, marginBottom: spacing.md },
  btn: { marginTop: spacing.sm },
  btnSm: { marginTop: spacing.xs },
  errorRow: { marginBottom: spacing.sm },
  errorText: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.error },
});
