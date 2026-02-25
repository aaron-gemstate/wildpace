import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Activity, Moon } from 'lucide-react-native';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SessionType } from '../components/Badge';

type Route = RouteProp<RootStackParamList, 'SessionDetail'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function SessionDetailScreen() {
  const route = useRoute<Route>();
  const { plan } = useApp();
  const { weekIndex, dayIndex } = route.params;

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No plan.</Text>
      </View>
    );
  }

  const day = plan.trainingPlan.blockWeeks[weekIndex]?.days[dayIndex];
  if (!day) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Session not found.</Text>
      </View>
    );
  }

  const session = day.rest ? null : day.session;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{formatDate(day.date)}</Text>

      {day.rest ? (
        <Card>
          <View style={styles.restTitleRow}>
            <Moon size={20} color={colors.accentLight} strokeWidth={2} />
            <Text style={styles.restTitle}>Rest day</Text>
          </View>
          <Text style={styles.muted}>Recovery and easy movement only. No structured session.</Text>
        </Card>
      ) : session ? (
        <>
          <Card>
            <View style={styles.sessionHeader}>
              <Activity size={20} color={colors.accent} strokeWidth={2} />
              <View style={styles.badgeRow}>
                <Badge type={(session.type as SessionType) || 'easy'} />
              </View>
            </View>
            <Text style={styles.duration}>{session.duration} min</Text>
            {session.intensityRPE != null && (
              <Text style={styles.rpe}>RPE: {session.intensityRPE}/10</Text>
            )}
            {session.notes ? (
              <Text style={styles.notes}>{session.notes}</Text>
            ) : null}
            {session.structure && (
              <View style={styles.structure}>
                <Text style={styles.structureTitle}>Structure</Text>
                {session.structure.warmup != null && (
                  <Text style={styles.structureLine}>Warmup: {session.structure.warmup} min</Text>
                )}
                {session.structure.main != null && (
                  <Text style={styles.structureLine}>Main: {session.structure.main} min</Text>
                )}
                {session.structure.cooldown != null && (
                  <Text style={styles.structureLine}>Cooldown: {session.structure.cooldown} min</Text>
                )}
                {session.structure.intervals?.map((int, i) => (
                  <Text key={i} style={styles.structureLine}>
                    Interval: {int.duration} min {int.intensity ? `(${int.intensity})` : ''}
                  </Text>
                ))}
              </View>
            )}
          </Card>
          {(session.description ?? session.instructions) ? (
            <Card style={styles.workoutCard}>
              <Text style={styles.workoutTitle}>Workout</Text>
              {session.description ? (
                <Text style={styles.description}>{session.description}</Text>
              ) : null}
              {session.instructions ? (
                <Text style={styles.instructions}>{session.instructions}</Text>
              ) : null}
            </Card>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.textMuted },
  date: { fontFamily: fontFamily.medium, fontSize: typography.scale.lg, color: colors.text, marginBottom: spacing.base },
  restTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  badgeRow: {},
  duration: { fontFamily: fontFamily.medium, fontSize: typography.scale.base, color: colors.text },
  rpe: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textSecondary, marginTop: spacing.xs },
  notes: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.text, marginTop: spacing.md },
  restTitle: { fontFamily: fontFamily.medium, fontSize: typography.scale.md, color: colors.text, marginBottom: spacing.sm },
  muted: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.textMuted },
  structure: { marginTop: spacing.md },
  structureTitle: { fontFamily: fontFamily.medium, fontSize: typography.scale.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  structureLine: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.text },
  workoutCard: { marginTop: spacing.base },
  workoutTitle: { fontFamily: fontFamily.h3, fontSize: typography.h3.fontSize, lineHeight: typography.h3.lineHeight, color: colors.accent, marginBottom: spacing.sm },
  description: { fontFamily: fontFamily.regular, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, color: colors.text, marginBottom: spacing.md },
  instructions: { fontFamily: fontFamily.regular, fontSize: typography.bodySmall.fontSize, lineHeight: typography.bodySmall.lineHeight, color: colors.textSecondary },
});
