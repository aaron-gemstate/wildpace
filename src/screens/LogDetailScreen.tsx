import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Activity } from 'lucide-react-native';
import { Card } from '../components/Card';
import { colors, typography, fontFamily, spacing } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'LogDetail'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function LogDetailScreen() {
  const route = useRoute<Route>();
  const { logs } = useApp();
  const { logId } = route.params;
  const log = logs.find((l) => l.id === logId);

  if (!log) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Workout log not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{formatDate(log.date)}</Text>
      <Card>
        <View style={styles.headerRow}>
          <Activity size={20} color={colors.accent} strokeWidth={2} />
          <Text style={styles.sport}>{log.sport}</Text>
        </View>
        <Text style={styles.duration}>{log.duration} min</Text>
        {log.distance != null && (
          <Text style={styles.line}>Distance: {log.distance} km</Text>
        )}
        {log.rpe != null && (
          <Text style={styles.line}>RPE: {log.rpe}/10</Text>
        )}
        {log.notes ? (
          <Text style={styles.notes}>{log.notes}</Text>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontFamily: fontFamily.regular, fontSize: typography.scale.base, color: colors.textMuted },
  date: {
    fontFamily: fontFamily.medium,
    fontSize: typography.scale.lg,
    color: colors.accent,
    marginBottom: spacing.base,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sport: {
    fontFamily: fontFamily.h3,
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
    color: colors.text,
    textTransform: 'capitalize',
  },
  duration: { fontFamily: fontFamily.medium, fontSize: typography.scale.base, color: colors.text },
  line: { fontFamily: fontFamily.regular, fontSize: typography.scale.sm, color: colors.textSecondary, marginTop: spacing.xs },
  notes: { fontFamily: fontFamily.regular, fontSize: typography.body.fontSize, color: colors.text, marginTop: spacing.md },
});
