import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../types';
import { planSchema, intakeSchema } from '../types';

const KEYS = {
  intake: '@wildpace/intake',
  plan: '@wildpace/plan',
  logs: '@wildpace/logs',
  checkins: '@wildpace/checkins',
  intakeSkipped: '@wildpace/intakeSkipped',
} as const;

export const storage = {
  async getIntake(): Promise<Intake | null> {
    const raw = await AsyncStorage.getItem(KEYS.intake);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const parsed = intakeSchema.safeParse(data);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async setIntake(intake: Intake | null): Promise<void> {
    if (intake === null) await AsyncStorage.removeItem(KEYS.intake);
    else await AsyncStorage.setItem(KEYS.intake, JSON.stringify(intake));
  },

  async getPlan(): Promise<Plan | null> {
    const raw = await AsyncStorage.getItem(KEYS.plan);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      const parsed = planSchema.safeParse(data);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },

  async setPlan(plan: Plan | null): Promise<void> {
    if (plan === null) await AsyncStorage.removeItem(KEYS.plan);
    else await AsyncStorage.setItem(KEYS.plan, JSON.stringify(plan));
  },

  async getLogs(): Promise<LogEntry[]> {
    const raw = await AsyncStorage.getItem(KEYS.logs);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async setLogs(logs: LogEntry[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.logs, JSON.stringify(logs));
  },

  async getCheckins(): Promise<RecoveryCheckin[]> {
    const raw = await AsyncStorage.getItem(KEYS.checkins);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async setCheckins(checkins: RecoveryCheckin[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.checkins, JSON.stringify(checkins));
  },

  async getIntakeSkipped(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(KEYS.intakeSkipped);
    return raw === 'true';
  },

  async setIntakeSkipped(skipped: boolean): Promise<void> {
    if (skipped) await AsyncStorage.setItem(KEYS.intakeSkipped, 'true');
    else await AsyncStorage.removeItem(KEYS.intakeSkipped);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
