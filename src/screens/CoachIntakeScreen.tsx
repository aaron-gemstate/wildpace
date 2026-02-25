import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { coachChat, type CoachChatMessage } from '../services/coachApi';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';
import { intakeSchema } from '../types';
import type { Intake, CoachTone } from '../types';

export type CoachIntakeScreenProps = {
  existingIntake?: Intake | null;
  /** When provided (e.g. edit flow), called with updated intake instead of auto setIntake + generatePlan */
  onIntakeComplete?: (intake: Intake) => void | Promise<void>;
};

const TONE_OPTIONS: { value: CoachTone; label: string }[] = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'no_nonsense', label: 'No-nonsense' },
  { value: 'science_focused', label: 'Science-focused' },
  { value: 'brief', label: 'Brief' },
];

export function CoachIntakeScreen({ existingIntake, onIntakeComplete }: CoachIntakeScreenProps = {}) {
  const navigation = useNavigation();
  const { setIntake, generatePlan, signOut } = useApp();
  const isOnboarding = !existingIntake && !onIntakeComplete;
  const savedTone = existingIntake?.preferences?.coachTone;

  useLayoutEffect(() => {
    if (!isOnboarding) return;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => signOut()} style={styles.headerClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <X size={24} color={colors.accent} strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isOnboarding, signOut]);

  const [coachTone, setCoachTone] = useState<CoachTone | null>(savedTone ?? null);
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const toneValue = coachTone ?? 'supportive';

  useEffect(() => {
    if (coachTone && messages.length === 0 && !loading) {
      setLoading(true);
      setError(null);
      coachChat([], {
        mode: 'intake',
        coachTone: toneValue,
        existingIntake: existingIntake ?? undefined,
      })
        .then((res) => {
          setMessages([{ role: 'assistant', content: res.message }]);
          if (res.intakeComplete && res.intake) {
            finishIntake(res.intake);
          }
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
        .finally(() => setLoading(false));
    }
  }, [coachTone]);

  const finishIntake = async (intake: Intake) => {
    const withTone = {
      ...intake,
      preferences: { ...intake.preferences, coachTone: toneValue },
    };
    const parsed = intakeSchema.safeParse(withTone);
    if (!parsed.success) {
      setError('Invalid intake from coach.');
      return;
    }
    if (onIntakeComplete) {
      await onIntakeComplete(parsed.data);
      return;
    }
    await setIntake(parsed.data);
    await generatePlan();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: CoachChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const nextMessages: CoachChatMessage[] = [...messages, userMsg];
      const res = await coachChat(nextMessages, {
        mode: 'intake',
        coachTone: toneValue,
        existingIntake: existingIntake ?? undefined,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);
      if (res.intakeComplete && res.intake) {
        await finishIntake(res.intake);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  if (coachTone === null) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.toneWrap}>
          <Text style={styles.toneTitle}>How should your coach sound?</Text>
          <View style={styles.toneRow}>
            {TONE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.toneChip}
                onPress={() => setCoachTone(opt.value)}
              >
                <Text style={styles.toneChipText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}
            >
              <Text style={styles.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.bubbleAssistant]}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            editable={!loading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerClose: { padding: spacing.sm },
  keyboard: { flex: 1 },
  toneWrap: { padding: spacing.xl },
  toneTitle: {
    fontFamily: fontFamily.h3,
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toneChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toneChipText: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: spacing.lg },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: spacing.sm,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
  },
  bubbleText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.error,
    marginTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: theme.borderRadius.md,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.sm,
    color: colors.text,
  },
});
