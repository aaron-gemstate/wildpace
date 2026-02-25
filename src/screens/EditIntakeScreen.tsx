import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { CoachIntakeScreen } from './CoachIntakeScreen';
import { useApp } from '../store/AppContext';
import { colors, typography, fontFamily, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Intake } from '../types';

type Route = RouteProp<RootStackParamList, 'EditIntake'>;

export function EditIntakeScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { setIntake, generatePlan } = useApp();
  const existingIntake = route.params.existingIntake;

  const handleIntakeComplete = async (intake: Intake) => {
    await setIntake(intake);
    navigation.goBack();
    Alert.alert(
      'Intake updated',
      'Your intake was saved. Would you like to regenerate your plan with the new details?',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Regenerate plan', onPress: () => generatePlan() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.warning}>Editing and regenerating will replace your current plan.</Text>
      <View style={styles.screen}>
        <CoachIntakeScreen existingIntake={existingIntake} onIntakeComplete={handleIntakeComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  warning: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  screen: { flex: 1 },
});
