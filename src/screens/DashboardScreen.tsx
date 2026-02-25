import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Activity, UtensilsCrossed, Moon, Calendar } from 'lucide-react-native';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { PrimaryButton } from '../components/PrimaryButton';
import { FieldNoteDivider } from '../components/FieldNoteDivider';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SessionType } from '../components/Badge';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

function getTodayDayIndex(plan: { trainingPlan: { blockWeeks: { days: { date: string }[] }[] } }): { weekIndex: number; dayIndex: number } | null {
  const today = new Date().toISOString().slice(0, 10);
  for (let w = 0; w < plan.trainingPlan.blockWeeks.length; w++) {
    const days = plan.trainingPlan.blockWeeks[w].days;
    for (let d = 0; d < days.length; d++) {
      if (days[d].date === today) return { weekIndex: w, dayIndex: d };
    }
  }
  return null;
}

function getTodayLabel() {
  const d = new Date();
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const short = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return { weekday, short };
}

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { plan, setIntakeSkipped } = useApp();
  const { weekday, short } = getTodayLabel();

  if (!plan) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIconWrap}>
          <Calendar size={40} color={colors.textMuted} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No plan yet</Text>
        <Text style={styles.emptySub}>
          Complete intake and we'll build your personalized training and nutrition plan.
        </Text>
        <PrimaryButton
          title="Set up my plan"
          onPress={() => setIntakeSkipped(false)}
          style={styles.emptyCta}
        />
      </View>
    );
  }

  const todayIdx = getTodayDayIndex(plan);
  const todayDay = todayIdx
    ? plan.trainingPlan.blockWeeks[todayIdx.weekIndex].days[todayIdx.dayIndex]
    : null;
  const nutrition = plan.nutritionPlan;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.todayHero}>
        <Text style={styles.todayLabel}>{weekday}</Text>
        <Text style={styles.todayDate}>{short}</Text>
      </View>

      <FieldNoteDivider label="Today" />

      <Card style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Activity size={20} color={colors.accent} strokeWidth={2} />
          <Text style={styles.cardTitle}>Today’s session</Text>
        </View>
        {todayDay?.rest || !todayDay?.session ? (
          <View style={styles.restRow}>
            <Moon size={18} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.muted}>Rest day. Easy movement optional.</Text>
          </View>
        ) : (
          <>
            <View style={styles.badgeRow}>
              <Badge type={(todayDay.session.type as SessionType) || 'easy'} />
            </View>
            <Text style={styles.duration}>{todayDay.session.duration} min</Text>
            {todayDay.session.notes ? (
              <Text style={styles.notes}>{todayDay.session.notes}</Text>
            ) : null}
            {todayIdx && (
              <PrimaryButton
                title="View session"
                onPress={() =>
                  navigation.getParent()?.getParent() &&
                  (navigation.getParent()?.getParent() as any).navigate('SessionDetail', {
                    weekIndex: todayIdx.weekIndex,
                    dayIndex: todayIdx.dayIndex,
                  })
                }
                variant="outline"
                style={styles.btn}
              />
            )}
          </>
        )}
      </Card>

      <FieldNoteDivider label="Fuel today" />

      <Card style={styles.card}>
        <View style={styles.cardTitleRow}>
          <UtensilsCrossed size={20} color={colors.accent} strokeWidth={2} />
          <Text style={styles.cardTitle}>Nutrition</Text>
        </View>
        <Text style={styles.line}>
          Protein: <Text style={styles.bold}>{nutrition.macroTargets.proteinGrams}g</Text>
        </Text>
        <Text style={styles.line}>
          Carbs (training): {nutrition.macroTargets.carbsTrainingMin}–{nutrition.macroTargets.carbsTrainingMax}g
        </Text>
        <Text style={styles.line}>
          Carbs (rest): {nutrition.macroTargets.carbsRestMin}–{nutrition.macroTargets.carbsRestMax}g
        </Text>
        <Text style={styles.hydration}>{nutrition.fuelingGuidance.hydration}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.base, paddingBottom: spacing.screen },
  todayHero: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  todayLabel: {
    fontFamily: fontFamily.medium,
    fontSize: typography.overline.fontSize,
    lineHeight: typography.overline.lineHeight,
    letterSpacing: typography.overline.letterSpacing,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  todayDate: {
    fontFamily: fontFamily.h1,
    fontSize: typography.h1.fontSize,
    lineHeight: typography.h1.lineHeight,
    letterSpacing: typography.h1.letterSpacing,
    color: colors.accent,
    marginTop: spacing.xxs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fontFamily.h2,
    fontSize: typography.h2.fontSize,
    lineHeight: typography.h2.lineHeight,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: typography.bodySmall.lineHeight,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  emptyCta: { marginTop: spacing.sm },
  card: { marginBottom: spacing.lg },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fontFamily.h3,
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
    color: colors.text,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeRow: { marginBottom: spacing.sm },
  duration: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
  },
  notes: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  muted: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
  },
  btn: { marginTop: spacing.lg },
  line: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bold: { fontFamily: fontFamily.medium },
  hydration: {
    fontFamily: fontFamily.regular,
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
