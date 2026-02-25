import type { PlanEngine } from './types';
import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../../types';
import { planSchema } from '../../types';

const SESSION_TYPES = ['easy', 'long', 'interval', 'tempo', 'strength', 'cross'] as const;

/** Mock description + instructions per type. Replace with LLM-generated content. */
function getMockSessionDetail(type: string): { description: string; instructions: string } {
  const details: Record<string, { description: string; instructions: string }> = {
    easy: {
      description: 'Low-intensity aerobic session to build base and promote recovery. Stay conversational.',
      instructions:
        '1. Warm up 5–10 min easy.\n2. Hold steady effort (RPE 4–5) for the main block. Nose breathing if possible.\n3. Cool down 5 min easy.\n4. Optional: add 4–6 strides in the last 10 min.',
    },
    long: {
      description: 'Extended aerobic session to develop endurance. Pace should feel sustainable for the full duration.',
      instructions:
        '1. Warm up 10–15 min easy, include a few pickups.\n2. Main set: steady zone 2 effort. Keep HR and effort even; fuel every 45–60 min if over 90 min.\n3. Last 10 min ease off slightly.\n4. Cool down 5–10 min easy.',
    },
    interval: {
      description: 'Structured intervals to improve speed and tolerance at higher intensities.',
      instructions:
        '1. Warm up 10 min easy, then 2–3 min at tempo.\n2. Intervals: 4 min hard (RPE 8) / 4 min easy. Repeat 4–5 times.\n3. Cool down 10–15 min easy.\n4. Focus on smooth form during hard efforts.',
    },
    tempo: {
      description: 'Sustained “comfortably hard” effort to raise lactate threshold.',
      instructions:
        '1. Warm up 10 min easy.\n2. Build to tempo (RPE 6–7) and hold 20–30 min. Should feel like you could say short sentences.\n3. Cool down 10 min easy.',
    },
    strength: {
      description: 'Strength and conditioning to support running/cycling and reduce injury risk.',
      instructions:
        '1. Warm up 5 min light movement.\n2. Circuit: squats, single-leg balance, hip hinges, core (plank, dead bug). 2–3 sets of 8–12 reps.\n3. Keep rest short (30–60 s).\n4. Cool down with mobility.',
    },
    cross: {
      description: 'Cross-training for aerobic fitness with lower impact (e.g. swim, bike, elliptical).',
      instructions:
        '1. Warm up 5–10 min at easy effort.\n2. Main: steady effort (RPE 4–6) for the prescribed duration.\n3. Vary cadence or resistance if on machine.\n4. Cool down 5 min easy.',
    },
  };
  return details[type] ?? {
    description: 'Structured session. Details will be personalized by your plan.',
    instructions: '1. Warm up.\n2. Main set at prescribed intensity.\n3. Cool down.',
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 16 weeks = 4 months */
const PLAN_WEEKS = 16;

function getNextFourMonths(): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay()); // start of week
  const dates: string[] = [];
  for (let i = 0; i < PLAN_WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export class MockPlanEngine implements PlanEngine {
  async generatePlan(intake: Intake): Promise<Plan> {
    const now = new Date().toISOString();
    const dates = getNextFourMonths();
    const hoursPerWeek = intake.weeklyHoursAvailable;
    const blockWeeks = [];

    for (let w = 0; w < PLAN_WEEKS; w++) {
      const weekDates = dates.slice(w * 7, (w + 1) * 7);
      const days = weekDates.map((date, i) => {
        const isRest = i === 0 || i === 3 || (w === 0 && i >= 5);
        if (isRest) {
          return {
            date,
            rest: true,
            session: { type: 'rest' as const, duration: 0 },
          };
        }
        const type = SESSION_TYPES[(w * 7 + i) % SESSION_TYPES.length];
        const duration = type === 'long' ? 90 : type === 'easy' ? 45 : type === 'interval' ? 60 : 50;
        const intensityRPE = type === 'easy' ? 4 : type === 'long' ? 5 : type === 'interval' ? 8 : 6;
        const { description, instructions } = getMockSessionDetail(type);
        return {
          date,
          rest: false,
          session: {
            type,
            duration: Math.min(duration, Math.floor((hoursPerWeek / 5) * 60)),
            intensityRPE,
            notes: type === 'long' ? 'Steady effort, keep HR in zone 2.' : undefined,
            description,
            instructions,
            structure:
              type === 'interval'
                ? { warmup: 10, main: 35, cooldown: 15, intervals: [{ duration: 4, intensity: 'hard' }, { duration: 4, intensity: 'easy' }] }
                : undefined,
          },
        };
      });
      blockWeeks.push({ weekNumber: w + 1, days });
    }

    const proteinGrams = intake.experienceLevel === 'elite' ? 180 : intake.experienceLevel === 'advanced' ? 160 : 140;
    const plan: Plan = {
      trainingPlan: { blockWeeks, generatedAt: now },
      nutritionPlan: {
        macroTargets: {
          proteinGrams,
          carbsTrainingMin: 4 * 70,
          carbsTrainingMax: 6 * 70,
          carbsRestMin: 2 * 70,
          carbsRestMax: 3 * 70,
          fatGrams: 60,
        },
        fuelingGuidance: {
          preWorkout: 'Light meal or snack 1–2 hours before: banana + nut butter, or toast + honey.',
          duringWorkout: 'For sessions over 75 min: 30–60g carbs/hour (gel, drink, or dried fruit).',
          postWorkout: 'Within 30–45 min: 20–25g protein + 50–70g carbs. Example: Greek yogurt + fruit + granola.',
          hydration: 'Aim for 2–3L daily. Add 400–600ml per hour of training. Weigh before/after long sessions to replace losses.',
        },
        mealExamples: [
          'Oatmeal with banana, almonds, and honey',
          'Grilled chicken, sweet potato, and greens',
          'Salmon, quinoa, and roasted vegetables',
          'Eggs on toast with avocado',
          'Rice bowl with beans, veggies, and salsa',
        ],
        raceDayNotes: intake.eventDate
          ? `For ${intake.eventName || 'your event'} on ${intake.eventDate}: carb load 24–36h before, light breakfast 2–3h before, practice race nutrition in key sessions.`
          : undefined,
      },
      generatedAt: now,
      version: 1,
    };

    const parsed = planSchema.safeParse(plan);
    if (!parsed.success) throw new Error('Mock plan validation failed: ' + parsed.error.message);
    return parsed.data;
  }

  async adjustPlan(
    _intake: Intake,
    plan: Plan,
    _logs: LogEntry[],
    _checkins: RecoveryCheckin[]
  ): Promise<Plan> {
    const adjusted: Plan = {
      ...plan,
      version: plan.version + 1,
      generatedAt: new Date().toISOString(),
    };
    const parsed = planSchema.safeParse(adjusted);
    if (!parsed.success) throw new Error('Adjusted plan validation failed: ' + parsed.error.message);
    return parsed.data;
  }
}
