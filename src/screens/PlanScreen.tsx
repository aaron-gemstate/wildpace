import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { FieldNoteDivider } from '../components/FieldNoteDivider';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SessionType } from '../components/Badge';
import type { Day } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function DayRow({
  day,
  weekIndex,
  dayIndex,
  onPress,
}: {
  day: Day;
  weekIndex: number;
  dayIndex: number;
  onPress: () => void;
}) {
  const session = day.rest ? null : day.session;
  const type = (session?.type as SessionType) || 'rest';

  return (
    <TouchableOpacity style={styles.dayRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
      <View style={styles.dayRight}>
        {day.rest ? (
          <Text style={styles.restLabel}>Rest</Text>
        ) : (
          <>
            <Badge type={type} size="sm" />
            <Text style={styles.dayDuration}>{session?.duration} min</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function PlanScreen() {
  const navigation = useNavigation<Nav>();
  const { plan } = useApp();

  if (!plan) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No plan yet.</Text>
      </View>
    );
  }

  const weeks = plan.trainingPlan.blockWeeks;
  const nextSevenDays: { day: Day; weekIndex: number; dayIndex: number }[] = [];
  const today = new Date().toISOString().slice(0, 10);
  let found = false;
  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < weeks[w].days.length; d++) {
      if (weeks[w].days[d].date >= today && nextSevenDays.length < 7) {
        nextSevenDays.push({ day: weeks[w].days[d], weekIndex: w, dayIndex: d });
      }
    }
  }

  const stackNav = navigation.getParent()?.getParent() as any;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <FieldNoteDivider label="Next 7 days" />
      <Card noPadding style={styles.card}>
        {nextSevenDays.length === 0 ? (
          <Text style={styles.muted}>No upcoming days in this block.</Text>
        ) : (
          nextSevenDays.map(({ day, weekIndex, dayIndex }) => (
            <DayRow
              key={day.date}
              day={day}
              weekIndex={weekIndex}
              dayIndex={dayIndex}
              onPress={() => stackNav?.navigate('SessionDetail', { weekIndex, dayIndex })}
            />
          ))
        )}
      </Card>

      <FieldNoteDivider label="4-month plan" />
      {weeks.map((week, weekIndex) => (
        <Card key={week.weekNumber} style={styles.weekCard}>
          <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
          {week.days.map((day, dayIndex) => (
            <TouchableOpacity
              key={day.date}
              style={styles.weekDay}
              onPress={() => stackNav?.navigate('SessionDetail', { weekIndex, dayIndex })}
              activeOpacity={0.7}
            >
              <Text style={styles.weekDayDate}>{formatDate(day.date)}</Text>
              {day.rest ? (
                <Text style={styles.restLabel}>Rest</Text>
              ) : (
                <Badge type={(day.session?.type as SessionType) || 'easy'} size="sm" />
              )}
            </TouchableOpacity>
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.textMuted },
  card: { marginBottom: spacing.base },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayDate: { fontFamily: fontFamily.medium, fontSize: typography.scale.sm, color: colors.text },
  dayRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayDuration: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textSecondary },
  restLabel: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textMuted },
  weekCard: { marginBottom: spacing.base },
  weekTitle: { fontFamily: fontFamily.medium, fontSize: typography.scale.base, color: colors.text, marginBottom: spacing.sm },
  weekDay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  weekDayDate: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textSecondary },
  muted: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textMuted, padding: spacing.base },
});
