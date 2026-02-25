import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PenLine, Heart } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Card } from '../components/Card';
import { FieldNoteDivider } from '../components/FieldNoteDivider';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { LogEntry } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

function getPlanDayForDate(
  plan: { trainingPlan: { blockWeeks: { days: { date: string }[] }[] } },
  date: string
): { weekIndex: number; dayIndex: number } | null {
  for (let w = 0; w < plan.trainingPlan.blockWeeks.length; w++) {
    const days = plan.trainingPlan.blockWeeks[w].days;
    for (let d = 0; d < days.length; d++) {
      if (days[d].date === date) return { weekIndex: w, dayIndex: d };
    }
  }
  return null;
}

export function LogScreen() {
  const navigation = useNavigation<Nav>();
  const { logs, checkins, plan } = useApp();
  const stackNav = navigation.getParent()?.getParent() as any;

  const recentLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const recentCheckins = [...checkins].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  function onLogPress(log: LogEntry) {
    const match = plan ? getPlanDayForDate(plan, log.date) : null;
    if (match) {
      stackNav?.navigate('SessionDetail', match);
    } else {
      stackNav?.navigate('LogDetail', { logId: log.id });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.actionRow}>
        <PenLine size={18} color={colors.accent} strokeWidth={2} style={styles.actionIcon} />
        <PrimaryButton
          title="Log workout"
          onPress={() => stackNav?.navigate('LogWorkout')}
          style={styles.primaryBtn}
        />
      </View>
      <View style={styles.actionRow}>
        <Heart size={18} color={colors.accentLight} strokeWidth={2} style={styles.actionIcon} />
        <PrimaryButton
          title="Recovery check-in"
          onPress={() => stackNav?.navigate('RecoveryCheckin')}
          variant="outline"
          style={styles.secondaryBtn}
        />
      </View>

      <FieldNoteDivider label="Recent workouts" />
      {recentLogs.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No workouts logged yet.</Text>
        </View>
      ) : (
        <Card noPadding>
          {recentLogs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={styles.logRow}
              onPress={() => onLogPress(log)}
              activeOpacity={0.7}
            >
              <Text style={styles.logDate}>{log.date}</Text>
              <Text style={styles.logSport}>{log.sport} · {log.duration} min</Text>
              {log.distance != null && <Text style={styles.logDist}>{log.distance} km</Text>}
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <FieldNoteDivider label="Recent check-ins" />
      {recentCheckins.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No check-ins yet.</Text>
        </View>
      ) : (
        <Card noPadding>
          {recentCheckins.map((c) => (
            <View key={c.id} style={styles.logRow}>
              <Text style={styles.logDate}>{c.date}</Text>
              <Text style={styles.logSport}>Sleep {c.sleep} · Soreness {c.soreness} · Mood {c.mood}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  actionIcon: { marginRight: spacing.sm },
  primaryBtn: { flex: 1 },
  secondaryBtn: { flex: 1 },
  emptyWrap: { paddingVertical: spacing.lg },
  emptyText: { fontFamily: fontFamily.regular, fontSize: typography.bodySmall.fontSize, color: colors.accent },
  muted: { fontFamily: fontFamily.regular, fontSize: typography.bodySmall.fontSize, color: colors.textMuted },
  logRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logDate: { fontFamily: fontFamily.medium, fontSize: typography.scale.sm, color: colors.text },
  logSport: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textSecondary },
  logDist: { fontFamily: fontFamily.regular, fontSize: typography.scale.xs, color: colors.textMuted },
});
