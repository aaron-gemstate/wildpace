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

/** Dev-only: tap to send common intake answers without typing. */
const TEST_PROMPTS = [
  'Metric',
  'Imperial',
  '30',
  '70',
  'male',
  'female',
  'running',
  '8',
  'half marathon',
  'Build base',
];
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { coachChat, type CoachChatMessage } from '../services/coachApi';

/** Assistant messages can include preset tap options. */
type IntakeMessage = CoachChatMessage & { quickReplies?: string[] };
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

/** Intro + unit question; content is built from selected tone so coach introduces itself. */
function getCoachIntroMessage(tone: CoachTone): IntakeMessage {
  const intros: Record<CoachTone, string> = {
    supportive:
      "Hello, I'm Mark, your coach during your journey. I'm here to support you every step of the way. Let's begin! Do you measure in imperial or metric system?",
    no_nonsense:
      "I'm Mark, your coach. Let's get to it. Do you measure in imperial or metric system?",
    science_focused:
      "Hello, I'm Mark, your coach. I'll keep things evidence-based and clear. Let's begin! Do you measure in imperial or metric system?",
    brief: "I'm Mark, your coach. Let's begin—do you measure in imperial or metric?",
  };
  return {
    role: 'assistant',
    content: intros[tone],
    quickReplies: ['Metric', 'Imperial'],
  };
}


export function CoachIntakeScreen({ existingIntake, onIntakeComplete }: CoachIntakeScreenProps = {}) {
  const navigation = useNavigation();
  const { setIntake, generatePlan, signOut } = useApp();
  const isOnboarding = !existingIntake && !onIntakeComplete;
  const savedTone = existingIntake?.preferences?.coachTone;

  useLayoutEffect(() => {
    if (!isOnboarding) return;
    const canGoBack = navigation.canGoBack();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => (canGoBack ? navigation.goBack() : signOut())}
          style={styles.headerClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color={colors.accent} strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isOnboarding, signOut]);

  const [coachTone, setCoachTone] = useState<CoachTone | null>(savedTone ?? null);
  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIntake, setPendingIntake] = useState<Intake | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const THANK_YOU_MESSAGE: IntakeMessage = {
    role: 'assistant',
    content: "Thank you for the info! I'm going to make your plan now.",
    quickReplies: ['Continue'],
  };

  /** Coach said they're submitting / have everything; we should request intake so we get thank-you + Continue. */
  const messageIndicatesSubmittingIntake = (content: string) => {
    const lower = content.toLowerCase();
    return (
      /submit your intake|submitting your intake/i.test(content) ||
      /all the necessary information/i.test(content) ||
      /create your training plan/i.test(content) ||
      /hold on.*(while|whilst|as) i submit/i.test(content) ||
      lower.includes('have everything') && lower.includes('plan')
    );
  };

  const toneValue = coachTone ?? 'supportive';

  useEffect(() => {
    if (!coachTone || messages.length > 0 || loading) return;
    if (!existingIntake) {
      setMessages([getCoachIntroMessage(toneValue)]);
      return;
    }
    setLoading(true);
    setError(null);
    coachChat([], {
      mode: 'intake',
      coachTone: toneValue,
      existingIntake: existingIntake ?? undefined,
    })
      .then((res) => {
        if (res.intakeComplete && res.intake) {
          setPendingIntake(res.intake);
          setMessages([
            { role: 'assistant', content: res.message, quickReplies: res.quickReplies },
            THANK_YOU_MESSAGE,
          ]);
        } else {
          setMessages([{ role: 'assistant', content: res.message, quickReplies: res.quickReplies }]);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => setLoading(false));
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

  const sendMessage = async (overrideText?: string) => {
    const raw = overrideText ?? (typeof input === 'string' ? input : '');
    const text = String(raw).trim();
    if (!text || loading) return;
    if (!overrideText) setInput('');
    const isUnitReply =
      !existingIntake &&
      messages.length === 1 &&
      messages[0].role === 'assistant' &&
      messages[0].quickReplies?.length &&
      (text === 'Metric' || text === 'Imperial');
    const unitForApi = isUnitReply ? (text === 'Metric' ? 'kg' : 'lbs') : text;
    const userMsg: CoachChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    const nextMessagesForApi: CoachChatMessage[] = [
      ...messages,
      { role: 'user', content: unitForApi },
    ];
    try {
      const res = await coachChat(nextMessagesForApi, {
        mode: 'intake',
        coachTone: toneValue,
        existingIntake: existingIntake ?? undefined,
        preferredWeightUnit: isUnitReply ? (unitForApi as 'kg' | 'lbs') : undefined,
      });
      if (res.intakeComplete && res.intake) {
        setPendingIntake(res.intake);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.message, quickReplies: res.quickReplies },
          THANK_YOU_MESSAGE,
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.message, quickReplies: res.quickReplies }]);
        if (messageIndicatesSubmittingIntake(res.message)) {
          const fullConvo: CoachChatMessage[] = [
            ...nextMessagesForApi,
            { role: 'assistant', content: res.message },
          ];
          try {
            const res2 = await coachChat(fullConvo, {
              mode: 'intake',
              coachTone: toneValue,
              existingIntake: existingIntake ?? undefined,
              requestIntakeComplete: true,
            });
            if (res2.intakeComplete && res2.intake) {
              setPendingIntake(res2.intake);
              setMessages((prev) => [...prev, THANK_YOU_MESSAGE]);
            }
          } catch {
            // Keep the coach message we already added; user can tap "I'm done" if needed
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (pendingIntake) {
      finishIntake(pendingIntake);
      setPendingIntake(null);
    }
  };

  const requestPlanBuild = async () => {
    if (loading || messages.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const conversationOnly: CoachChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await coachChat(conversationOnly, {
        mode: 'intake',
        coachTone: toneValue,
        existingIntake: existingIntake ?? undefined,
        requestIntakeComplete: true,
      });
      if (res.intakeComplete && res.intake) {
        setPendingIntake(res.intake);
        setMessages((prev) => [
          ...prev,
          ...(res.message ? [{ role: 'assistant' as const, content: res.message }] : []),
          THANK_YOU_MESSAGE,
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.message || "I'll need a bit more info to build your plan. Keep answering and tap again when you're done.", quickReplies: res.quickReplies },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
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
          {messages.map((m, i) => {
            const showQuickReplies =
              m.role === 'assistant' &&
              m.quickReplies?.length &&
              i === messages.length - 1 &&
              !loading;
            return (
              <View key={i}>
                <View
                  style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}
                >
                  <Text style={styles.bubbleText}>{m.content}</Text>
                </View>
                {showQuickReplies ? (
                  <View style={styles.quickReplyRow}>
                    {(m as IntakeMessage).quickReplies!.map((label) => (
                      <TouchableOpacity
                        key={label}
                        style={styles.quickReplyBtn}
                        onPress={() =>
                          label === 'Continue' && pendingIntake ? handleContinue() : sendMessage(label)
                        }
                        disabled={loading}
                      >
                        <Text style={styles.quickReplyBtnText}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
          {loading && (
            <View style={[styles.bubble, styles.bubbleAssistant]}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
        {!pendingIntake && messages.length > 1 ? (
          <TouchableOpacity
            style={styles.buildPlanWrap}
            onPress={requestPlanBuild}
            disabled={loading}
          >
            <Text style={styles.buildPlanText}>I'm done — build my plan</Text>
          </TouchableOpacity>
        ) : null}
        {!pendingIntake ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            editable={!loading}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
        ) : null}
        {__DEV__ && !pendingIntake ? (
          <View style={styles.testPromptsWrap}>
            <Text style={styles.testPromptsLabel}>Test (tap to send)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testPromptsScroll}>
              {TEST_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={styles.testPromptChip}
                  onPress={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  <Text style={styles.testPromptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
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
  quickReplyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  quickReplyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: theme.borderRadius.md,
  },
  quickReplyBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.error,
    marginTop: spacing.sm,
  },
  buildPlanWrap: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buildPlanText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.bodySmall.fontSize,
    color: colors.accent,
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
  testPromptsWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  testPromptsLabel: {
    fontFamily: fontFamily.regular,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  testPromptsScroll: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  testPromptChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testPromptChipText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
});
