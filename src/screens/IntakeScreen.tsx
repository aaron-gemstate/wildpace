import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { FieldNoteDivider } from '../components/FieldNoteDivider';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';
import type { Intake } from '../types';

const SPORTS = ['running', 'cycling', 'triathlon', 'other'] as const;
const LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'] as const;

export function IntakeScreen() {
  const { setIntake, generatePlan } = useApp();
  const [step, setStep] = useState(1);
  const [sport, setSport] = useState<Intake['sport']>('running');
  const [experienceLevel, setExperienceLevel] = useState<Intake['experienceLevel']>('intermediate');
  const [weeklyHoursAvailable, setWeeklyHoursAvailable] = useState(8);
  const [goals, setGoals] = useState('Build base, stay consistent');
  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [injuries, setInjuries] = useState('');
  const [preferMorning, setPreferMorning] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const submit = async () => {
    const intake: Intake = {
      sport,
      experienceLevel,
      weeklyHoursAvailable: Math.max(2, Math.min(25, weeklyHoursAvailable)),
      goals: goals.split(/[,;]/).map((g) => g.trim()).filter(Boolean),
      submittedAt: new Date().toISOString(),
    };
    if (eventDate) intake.eventDate = eventDate;
    if (eventName) intake.eventName = eventName;
    if (injuries.trim()) intake.injuries = injuries.split(/[,;]/).map((i) => i.trim()).filter(Boolean);
    intake.preferences = {};
    if (preferMorning) intake.preferences.preferMorning = true;
    if (dietaryRestrictions.trim()) intake.preferences.dietaryRestrictions = dietaryRestrictions.trim();

    await setIntake(intake);
    await generatePlan();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <FieldNoteDivider label={`Step ${step} of 3`} />

        {step === 1 && (
          <>
            <Text style={styles.label}>Primary sport</Text>
            <View style={styles.chipRow}>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, sport === s && styles.chipActive]}
                  onPress={() => setSport(s)}
                >
                  <Text style={[styles.chipText, sport === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Experience level</Text>
            <View style={styles.chipRow}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, experienceLevel === l && styles.chipActive]}
                  onPress={() => setExperienceLevel(l)}
                >
                  <Text style={[styles.chipText, experienceLevel === l && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Hours per week you can train</Text>
            <TextInput
              style={styles.input}
              value={String(weeklyHoursAvailable)}
              onChangeText={(t) => setWeeklyHoursAvailable(parseInt(t, 10) || 0)}
              keyboardType="number-pad"
              placeholder="8"
            />
            <PrimaryButton title="Next" onPress={() => setStep(2)} style={styles.next} />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>Goals (comma-separated)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={goals}
              onChangeText={setGoals}
              placeholder="e.g. Build base, Half marathon"
              multiline
            />
            <Text style={styles.label}>Event date (optional)</Text>
            <TextInput
              style={styles.input}
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.label}>Event name (optional)</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="e.g. Local Half Marathon"
              placeholderTextColor={colors.textMuted}
            />
            <PrimaryButton title="Back" variant="outline" onPress={() => setStep(1)} style={styles.next} />
            <PrimaryButton title="Next" onPress={() => setStep(3)} style={styles.next} />
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.label}>Injuries or limitations (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={injuries}
              onChangeText={setInjuries}
              placeholder="e.g. knee, lower back"
              multiline
            />
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setPreferMorning((v) => !v)}
            >
              <Text style={styles.checkLabel}>Prefer morning sessions</Text>
              <View style={[styles.checkBox, preferMorning && styles.checkBoxOn]} />
            </TouchableOpacity>
            <Text style={styles.label}>Dietary restrictions (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={dietaryRestrictions}
              onChangeText={setDietaryRestrictions}
              placeholder="e.g. vegetarian, no dairy"
            />
            <PrimaryButton title="Back" variant="outline" onPress={() => setStep(2)} style={styles.next} />
            <PrimaryButton title="Generate my plan" onPress={submit} style={styles.next} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxxl },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.text },
  chipTextActive: { color: colors.text },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  checkLabel: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.text, flex: 1 },
  checkBox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: colors.border },
  checkBoxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  next: { marginTop: spacing.lg },
});
