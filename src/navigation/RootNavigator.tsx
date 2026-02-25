import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useApp } from '../store/AppContext';
import { colors } from '../theme';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CoachIntakeScreen } from '../screens/CoachIntakeScreen';
import { GeneratingPlanScreen } from '../screens/GeneratingPlanScreen';
import { TabNavigator } from './TabNavigator';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { LogWorkoutScreen } from '../screens/LogWorkoutScreen';
import { LogDetailScreen } from '../screens/LogDetailScreen';
import { RecoveryCheckinScreen } from '../screens/RecoveryCheckinScreen';
import { EditIntakeScreen } from '../screens/EditIntakeScreen';
import { CoachAdvisorScreen } from '../screens/CoachAdvisorScreen';
import { GetStartedScreen } from '../screens/GetStartedScreen';
import type { Intake } from '../types';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  GetStarted: undefined;
  Intake: undefined;
  GeneratingPlan: undefined;
  MainTabs: undefined;
  SessionDetail: { dayIndex: number; weekIndex: number };
  LogWorkout: undefined;
  LogDetail: { logId: string };
  RecoveryCheckin: undefined;
  EditIntake: { existingIntake: Intake };
  CoachAdvisor: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );
}

export function RootNavigator() {
  const { user, authReady, intake, plan, planGenerationLoading, intakeSkipped } = useApp();

  if (!authReady) return <LoadingScreen />;

  const showAuthFlow = !user;
  const showGetStartedFlow = user && !intake && !plan && !planGenerationLoading && !intakeSkipped;
  const showGeneratingFlow = user && !!intake && planGenerationLoading;
  const showMainFlow = user && (!!plan || intakeSkipped) && !planGenerationLoading;

  if (showAuthFlow) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Sign in' }} />
      </Stack.Navigator>
    );
  }

  if (showGetStartedFlow) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ title: "What's next?" }} />
        <Stack.Screen name="Intake" component={CoachIntakeScreen} options={{ title: 'Your coach' }} />
      </Stack.Navigator>
    );
  }

  if (showGeneratingFlow) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GeneratingPlan" component={GeneratingPlanScreen} />
      </Stack.Navigator>
    );
  }

  if (showMainFlow) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session' }} />
        <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} options={{ title: 'Log Workout' }} />
        <Stack.Screen name="LogDetail" component={LogDetailScreen} options={{ title: 'Workout' }} />
        <Stack.Screen name="RecoveryCheckin" component={RecoveryCheckinScreen} options={{ title: 'Recovery Check-in' }} />
        <Stack.Screen name="EditIntake" component={EditIntakeScreen} options={{ title: 'Edit intake' }} />
        <Stack.Screen name="CoachAdvisor" component={CoachAdvisorScreen} options={{ title: 'Your coach' }} />
      </Stack.Navigator>
    );
  }

  // user + intake but no plan yet and not loading: e.g. just finished intake, need to trigger generation
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GeneratingPlan" component={GeneratingPlanScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
