import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth, firestore, subscribeAuth } from '../services/firebase';
import { storage } from '../services/storage';
import { createPlanEngine } from '../services/planEngine';
import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../types';
import { intakeSchema } from '../types';

type AppState = {
  user: User | null;
  loading: boolean;
  authReady: boolean;
  intake: Intake | null;
  plan: Plan | null;
  logs: LogEntry[];
  checkins: RecoveryCheckin[];
  planGenerationLoading: boolean;
  planGenerationError: string | null;
  /** User chose "Explore first" and hasn't completed intake yet. */
  intakeSkipped: boolean;
};

type AppContextValue = AppState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setIntake: (intake: Intake | null) => Promise<void>;
  generatePlan: () => Promise<void>;
  adjustPlan: () => Promise<void>;
  addLog: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => Promise<void>;
  addCheckin: (checkin: Omit<RecoveryCheckin, 'id' | 'createdAt'>) => Promise<void>;
  refreshFromStorage: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  clearPlanError: () => void;
  setIntakeSkipped: (skipped: boolean) => Promise<void>;
};

const defaultState: AppState = {
  user: null,
  loading: false,
  authReady: false,
  intake: null,
  plan: null,
  logs: [],
  checkins: [],
  planGenerationLoading: false,
  planGenerationError: null,
  intakeSkipped: false,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const planEngine = createPlanEngine();

  const refreshFromStorage = useCallback(async () => {
    const [intake, plan, logs, checkins, intakeSkipped] = await Promise.all([
      storage.getIntake(),
      storage.getPlan(),
      storage.getLogs(),
      storage.getCheckins(),
      storage.getIntakeSkipped(),
    ]);
    setState((s) => ({
      ...s,
      intake,
      plan,
      logs,
      checkins,
      intakeSkipped,
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setState((s) => ({ ...s, user, authReady: true }));
      if (user) {
        await refreshFromStorage();
        try {
          const profile = await firestore.getUserProfile(user.uid);
          const localPlan = await storage.getPlan();
          if (!profile?.currentPlan && localPlan) {
            await firestore.setCurrentPlan(user.uid, localPlan);
          }
          const remoteLogs = await firestore.getLogs(user.uid);
          const remoteCheckins = await firestore.getCheckins(user.uid);
          if (remoteLogs.length > 0 || remoteCheckins.length > 0) {
            setState((s) => ({
              ...s,
              logs: remoteLogs.length > 0 ? remoteLogs : s.logs,
              checkins: remoteCheckins.length > 0 ? remoteCheckins : s.checkins,
            }));
            await storage.setLogs(remoteLogs.length > 0 ? remoteLogs : state.logs);
            await storage.setCheckins(remoteCheckins.length > 0 ? remoteCheckins : state.checkins);
          }
        } catch {
          // offline or no profile
        }
      }
    });
    return () => unsubscribe();
  }, [refreshFromStorage]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      await auth.signIn(email, password);
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const cred = await auth.signUp(email, password);
      if (cred.user) {
        await firestore.setUserProfile(cred.user.uid, {
          profile: {
            name: '',
            email: cred.user.email ?? '',
            createdAt: new Date().toISOString(),
          },
        });
      }
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      await auth.signInWithGoogle();
      const user = auth.currentUser;
      if (user) {
        const profile = await firestore.getUserProfile(user.uid);
        if (!profile?.profile) {
          await firestore.setUserProfile(user.uid, {
            profile: {
              name: user.displayName ?? '',
              email: user.email ?? '',
              createdAt: new Date().toISOString(),
            },
          });
        }
      }
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setState((s) => ({ ...s, user: null, intakeSkipped: false }));
  }, []);

  const setIntake = useCallback(async (intake: Intake | null) => {
    await storage.setIntake(intake);
    if (intake) {
      await storage.setIntakeSkipped(false);
      setState((s) => ({ ...s, intake, intakeSkipped: false }));
    } else {
      setState((s) => ({ ...s, intake }));
    }
    const user = auth.currentUser;
    if (user && intake) await firestore.setIntake(user.uid, intake).catch(() => {});
  }, []);

  const generatePlan = useCallback(async () => {
    const intake = await storage.getIntake();
    if (!intake) {
      setState((s) => ({ ...s, planGenerationError: 'Complete intake first.' }));
      return;
    }
    setState((s) => ({ ...s, planGenerationLoading: true, planGenerationError: null }));
    try {
      const plan = await planEngine.generatePlan(intake);
      await storage.setPlan(plan);
      setState((s) => ({ ...s, plan, planGenerationLoading: false }));
      const user = auth.currentUser;
      if (user) await firestore.setCurrentPlan(user.uid, plan).catch(() => {});
    } catch (e) {
      setState((s) => ({
        ...s,
        planGenerationLoading: false,
        planGenerationError: e instanceof Error ? e.message : 'Failed to generate plan.',
      }));
    }
  }, [planEngine]);

  const adjustPlan = useCallback(async () => {
    const intake = await storage.getIntake();
    const plan = await storage.getPlan();
    const logs = await storage.getLogs();
    const checkins = await storage.getCheckins();
    if (!intake || !plan) {
      setState((s) => ({ ...s, planGenerationError: 'Intake and plan required.' }));
      return;
    }
    setState((s) => ({ ...s, planGenerationLoading: true, planGenerationError: null }));
    try {
      const newPlan = await planEngine.adjustPlan(intake, plan, logs, checkins);
      await storage.setPlan(newPlan);
      setState((s) => ({ ...s, plan: newPlan, planGenerationLoading: false }));
      const user = auth.currentUser;
      if (user) await firestore.setCurrentPlan(user.uid, newPlan).catch(() => {});
    } catch (e) {
      setState((s) => ({
        ...s,
        planGenerationLoading: false,
        planGenerationError: e instanceof Error ? e.message : 'Failed to adjust plan.',
      }));
    }
  }, [planEngine]);

  const addLog = useCallback(async (entry: Omit<LogEntry, 'id' | 'createdAt'>) => {
    const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const full: LogEntry = { ...entry, id, createdAt };
    const nextLogs = [...state.logs, full];
    await storage.setLogs(nextLogs);
    setState((s) => ({ ...s, logs: nextLogs }));
    const user = auth.currentUser;
    if (user) await firestore.addLog(user.uid, entry).catch(() => {});
  }, [state.logs]);

  const addCheckin = useCallback(async (checkin: Omit<RecoveryCheckin, 'id' | 'createdAt'>) => {
    const id = `checkin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const full: RecoveryCheckin = { ...checkin, id, createdAt };
    const next = [...state.checkins, full];
    await storage.setCheckins(next);
    setState((s) => ({ ...s, checkins: next }));
    const user = auth.currentUser;
    if (user) await firestore.addCheckin(user.uid, checkin).catch(() => {});
  }, [state.checkins]);

  const seedDemoData = useCallback(async () => {
    const demoIntake = intakeSchema.parse({
      sport: 'running',
      experienceLevel: 'intermediate',
      weeklyHoursAvailable: 8,
      goals: ['Build base', 'Half marathon'],
      eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      eventName: 'Local Half',
      submittedAt: new Date().toISOString(),
    });
    await storage.setIntake(demoIntake);
    setState((s) => ({ ...s, intake: demoIntake }));
    await generatePlan();
  }, [generatePlan]);

  const clearPlanError = useCallback(() => {
    setState((s) => ({ ...s, planGenerationError: null }));
  }, []);

  const setIntakeSkipped = useCallback(async (skipped: boolean) => {
    await storage.setIntakeSkipped(skipped);
    setState((s) => ({ ...s, intakeSkipped: skipped }));
  }, []);

  const value: AppContextValue = {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    setIntake,
    generatePlan,
    adjustPlan,
    addLog,
    addCheckin,
    refreshFromStorage,
    seedDemoData,
    clearPlanError,
    setIntakeSkipped,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
