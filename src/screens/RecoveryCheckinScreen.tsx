import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';

function SliderRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: number;
  onValueChange: (n: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{label}</Text>
      <View style={styles.sliderDots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.dot, value === n && styles.dotActive]}
            onPress={() => onValueChange(n)}
          >
            <Text style={[styles.dotText, value === n && styles.dotTextActive]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function RecoveryCheckinScreen() {
  const navigation = useNavigation();
  const { addCheckin } = useApp();
  const [sleep, setSleep] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');

  const submit = async () => {
    await addCheckin({
      date: new Date().toISOString().slice(0, 10),
      sleep,
      soreness,
      stress,
      mood,
      notes: notes.trim() || undefined,
    });
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>1 = low/poor, 5 = high/great</Text>
        <SliderRow label="Sleep quality" value={sleep} onValueChange={setSleep} />
        <SliderRow label="Soreness" value={soreness} onValueChange={setSoreness} />
        <SliderRow label="Stress" value={stress} onValueChange={setStress} />
        <SliderRow label="Mood" value={mood} onValueChange={setMood} />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything else..."
          multiline
        />
        <PrimaryButton title="Save check-in" onPress={submit} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: typography.scale.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  sliderRow: { marginBottom: spacing.lg },
  sliderLabel: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.base,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sliderDots: { flexDirection: 'row' },
  dot: {
    marginRight: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.text, borderColor: colors.text },
  dotText: { fontFamily: fontFamily.medium, fontSize: typography.scale.sm, color: colors.text },
  dotTextActive: { color: colors.background },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
  },
  textArea: { minHeight: 80 },
  btn: { marginTop: spacing.xl },
});
