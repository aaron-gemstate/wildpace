import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GetStarted'>;

export function GetStartedScreen() {
  const navigation = useNavigation<Nav>();
  const { setIntakeSkipped, signOut } = useApp();

  const handleSetUpPlan = () => {
    navigation.navigate('Intake');
  };

  const handleExploreFirst = async () => {
    await setIntakeSkipped(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>You're in.</Text>
        <Text style={styles.subtitle}>Set up your plan with your coach, or explore the app first.</Text>
        <View style={styles.actions}>
          <PrimaryButton title="Set up my plan" onPress={handleSetUpPlan} style={styles.btn} />
          <PrimaryButton title="Explore first" onPress={handleExploreFirst} variant="outline" style={styles.btn} />
        </View>
        <TouchableOpacity onPress={() => signOut()} style={styles.signOutWrap}>
          <Text style={styles.signOut}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.screen,
  },
  title: {
    fontFamily: fontFamily.h1,
    fontSize: typography.h1.fontSize,
    lineHeight: typography.h1.lineHeight,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  actions: { gap: spacing.md },
  btn: { marginTop: 0 },
  signOutWrap: { alignSelf: 'center', marginTop: spacing.xxl, padding: spacing.sm },
  signOut: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
  },
});
