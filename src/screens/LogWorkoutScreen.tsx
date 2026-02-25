import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';

export function LogWorkoutScreen() {
  const navigation = useNavigation();
  const { addLog } = useApp();
  const [sport, setSport] = useState('running');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async () => {
    const dur = parseInt(duration, 10);
    if (!dur || dur <= 0) return;
    await addLog({
      date: new Date().toISOString().slice(0, 10),
      sport,
      duration: dur,
      distance: distance ? parseFloat(distance) : undefined,
      rpe: rpe ? Math.min(10, Math.max(1, parseInt(rpe, 10))) : undefined,
      notes: notes.trim() || undefined,
    });
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Sport</Text>
        <TextInput
          style={styles.input}
          value={sport}
          onChangeText={setSport}
          placeholder="e.g. running, cycling"
        />
        <Text style={styles.label}>Duration (min)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
          placeholder="45"
        />
        <Text style={styles.label}>Distance (optional, km)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
          placeholder="8.5"
        />
        <Text style={styles.label}>RPE 1–10 (optional)</Text>
        <TextInput
          style={styles.input}
          value={rpe}
          onChangeText={setRpe}
          keyboardType="number-pad"
          placeholder="6"
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How it felt, conditions..."
          multiline
        />
        <PrimaryButton title="Save workout" onPress={submit} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: typography.scale.base,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  textArea: { minHeight: 80 },
  btn: { marginTop: spacing.xl },
});
