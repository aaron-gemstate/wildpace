import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../types';

const getBaseUrl = (): string => {
  const url =
    typeof process !== 'undefined'
      ? (process.env.EXPO_PUBLIC_PLAN_API_URL || process.env.PLAN_API_URL)
      : '';
  let base = url ? url.replace(/\/$/, '') : '';
  // When running in browser (web), same machine as backend — use localhost so connection works
  if (typeof window !== 'undefined' && base && base !== 'http://localhost:3001' && !base.includes('localhost')) {
    const host = window.location?.hostname || 'localhost';
    base = `http://${host}:3001`;
  }
  return base;
};

export type CoachChatMessage = { role: 'user' | 'assistant'; content: string };

/** Request mode: intake (collect/edit) vs advisor (progress, pacing, optional plan-change verification). */
export type CoachMode = 'intake' | 'advisor';

/** Minimal plan summary for advisor context. */
export type PlanSummary = {
  currentWeekIndex?: number;
  currentDayIndex?: number;
  todayDate?: string;
  todayRest?: boolean;
  todaySessionType?: string;
  todayDurationMinutes?: number;
  nextSessionDate?: string;
  nextSessionType?: string;
  totalWeeks?: number;
};

/** Minimal recent log entry for advisor context. */
export type RecentLogSummary = {
  date: string;
  sport: string;
  duration: number;
  distance?: number;
  rpe?: number;
  notes?: string;
};

/** Minimal recent check-in for advisor context. */
export type RecentCheckinSummary = {
  date: string;
  sleep: number;
  soreness: number;
  stress: number;
  mood: number;
  notes?: string;
};

export type AdvisorContext = {
  planSummary?: PlanSummary;
  recentLogs?: RecentLogSummary[];
  recentCheckins?: RecentCheckinSummary[];
};

export type CoachChatResponse = {
  message: string;
  intakeComplete: boolean;
  intake?: Intake;
  /** Coach is asking user to confirm a plan change (advisor mode). */
  suggestedAction?: 'none' | 'confirm_plan_change';
  /** User explicitly confirmed in conversation; app may call adjustPlan after native confirm. */
  proceedPlanChange?: boolean;
  /** Optional preset buttons (e.g. ["kg", "lbs"]) so user can tap instead of type. */
  quickReplies?: string[];
};

export type CoachChatOptions = {
  coachTone?: string;
  existingIntake?: Intake | null;
  /** Defaults to 'intake' for backward compatibility. */
  mode?: CoachMode;
  /** Required when mode is 'advisor'. */
  context?: AdvisorContext;
  /** When set, backend should ask this first in intake (e.g. "Do you use lbs or kg?"). */
  intakeAskFirst?: 'weight_unit';
  /**
   * User already chose unit in-app. Backend must:
   * - Set preferences.weightUnit and continue intake.
   * - If 'lbs': ask for weight in pounds and convert to kg server-side for storage; do not ask the user to convert.
   * - If 'kg': ask for weight in kilograms as usual.
   */
  preferredWeightUnit?: 'kg' | 'lbs';
  /**
   * User says they're done. Backend should derive intake from the conversation and return
   * intakeComplete: true and intake so the app can show the thank-you and trigger plan generation.
   */
  requestIntakeComplete?: boolean;
};

export async function coachChat(
  messages: CoachChatMessage[],
  options?: CoachChatOptions
): Promise<CoachChatResponse> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('Coach API URL not set (EXPO_PUBLIC_PLAN_API_URL)');
  }
  const mode = options?.mode ?? 'intake';
  const body: Record<string, unknown> = {
    messages,
    coachTone: options?.coachTone ?? 'supportive',
    existingIntake: options?.existingIntake ?? undefined,
    mode,
  };
  if (mode === 'advisor' && options?.context) {
    body.context = options.context;
  }
  if (mode === 'intake') {
    body.intakeGuidelines =
      'For gender, only use or offer the options: male, female. Do not refer to or use any other terms.';
    if (messages.length === 0 && options?.intakeAskFirst) {
      body.intakeAskFirst = options.intakeAskFirst;
    }
    if (options?.preferredWeightUnit) {
      body.preferredWeightUnit = options.preferredWeightUnit;
      if (options.preferredWeightUnit === 'lbs') {
        body.intakeInstruction =
          'User chose pounds. Ask for their weight in pounds; convert to kg yourself for storage. Do not ask the user to convert or offer conversion help.';
      }
    }
    if (options?.requestIntakeComplete) {
      body.requestIntakeComplete = true;
    }
  }
  try {
    const res = await fetch(`${baseUrl}/coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Coach chat failed: ${res.status}`);
    }
    return res.json();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/network|failed to fetch|connection refused/i.test(msg)) {
      throw new Error(
        'Cannot reach the coach server. Check: (1) Backend is running (npm start in backend/). (2) On a phone, set EXPO_PUBLIC_PLAN_API_URL to your computer’s IP (e.g. http://192.168.x.x:3001) and use the same Wi‑Fi.'
      );
    }
    throw e;
  }
}

/** Build advisor context from current plan, logs, and check-ins (e.g. last 7–14 days). */
export function buildAdvisorContext(
  plan: Plan | null,
  logs: LogEntry[],
  checkins: RecoveryCheckin[],
  recentLogCount = 10,
  recentCheckinCount = 7
): AdvisorContext {
  const context: AdvisorContext = {};
  if (plan) {
    const today = new Date().toISOString().slice(0, 10);
    let currentWeekIndex: number | undefined;
    let currentDayIndex: number | undefined;
    let todayDay: { date: string; rest: boolean; session?: { type: string; duration: number } } | undefined;
    const weeks = plan.trainingPlan.blockWeeks;
    for (let w = 0; w < weeks.length; w++) {
      const days = weeks[w].days;
      for (let d = 0; d < days.length; d++) {
        if (days[d].date === today) {
          currentWeekIndex = w;
          currentDayIndex = d;
          todayDay = days[d];
          break;
        }
      }
      if (todayDay) break;
    }
    context.planSummary = {
      currentWeekIndex,
      currentDayIndex,
      todayDate: today,
      todayRest: todayDay?.rest,
      todaySessionType: todayDay?.session?.type,
      todayDurationMinutes: todayDay?.session?.duration,
      totalWeeks: weeks.length,
    };
    // Next session: first upcoming day with a session
    if (weeks.length > 0) {
      outer: for (let w = 0; w < weeks.length; w++) {
        for (let d = 0; d < weeks[w].days.length; d++) {
          const day = weeks[w].days[d];
          if (day.date > today && !day.rest && day.session) {
            context.planSummary!.nextSessionDate = day.date;
            context.planSummary!.nextSessionType = day.session.type;
            break outer;
          }
        }
      }
    }
  }
  context.recentLogs = logs
    .slice()
    .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date))
    .slice(0, recentLogCount)
    .map((e) => ({
      date: e.date,
      sport: e.sport,
      duration: e.duration,
      distance: e.distance,
      rpe: e.rpe,
      notes: e.notes,
    }));
  context.recentCheckins = checkins
    .slice()
    .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date))
    .slice(0, recentCheckinCount)
    .map((c) => ({
      date: c.date,
      sleep: c.sleep,
      soreness: c.soreness,
      stress: c.stress,
      mood: c.mood,
      notes: c.notes,
    }));
  return context;
}
