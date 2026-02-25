import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { coachChat, buildAdvisorContext, type CoachChatMessage } from '../services/coachApi';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';
import type { CoachTone } from '../types';

export function CoachAdvisorScreen() {
  const navigation = useNavigation();
  const { intake, plan, logs, checkins, adjustPlan, planGenerationLoading } = useApp();
  const coachTone = (intake?.preferences?.coachTone ?? 'supportive') as CoachTone;

  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmHint, setConfirmHint] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const initialLoadDone = useRef(false);

  const context = buildAdvisorContext(plan ?? null, logs, checkins);

  useEffect(() => {
    if (!plan || initialLoadDone.current || loading) return;
    initialLoadDone.current = true;
    setLoading(true);
    setError(null);
    coachChat([], {
      mode: 'advisor',
      coachTone,
      context,
    })
      .then((res) => {
        setMessages([{ role: 'assistant', content: res.message }]);
        setConfirmHint(res.suggestedAction === 'confirm_plan_change');
        if (res.proceedPlanChange) {
          handleProceedPlanChange();
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [plan]);

  const handleProceedPlanChange = () => {
    Alert.alert(
      'Replace your plan?',
      'Your current plan will be replaced with an adjusted one based on your progress and feedback. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace plan',
          onPress: async () => {
            try {
              await adjustPlan();
              navigation.goBack();
            } catch {
              setError('Failed to adjust plan.');
            }
          },
        },
      ]
    );
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: CoachChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    setConfirmHint(false);
    try {
      const nextMessages: CoachChatMessage[] = [...messages, userMsg];
      const res = await coachChat(nextMessages, {
        mode: 'advisor',
        coachTone,
        context,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);
      setConfirmHint(res.suggestedAction === 'confirm_plan_change');
      if (res.proceedPlanChange) {
        handleProceedPlanChange();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Complete your intake and plan first, then come back to talk to your coach.</Text>
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
        {confirmHint ? (
          <View style={styles.hintWrap}>
            <Text style={styles.hintText}>Your coach is asking you to confirm a plan change. Your next message can commit to replacing your plan.</Text>
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            editable={!loading && !planGenerationLoading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading || planGenerationLoading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading || planGenerationLoading}
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
  keyboard: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: 'center',
  },
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
  hintWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hintText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
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
