import { z } from 'zod';

// ——— Intake ———
const coachToneSchema = z.enum(['supportive', 'no_nonsense', 'science_focused', 'brief']);
export type CoachTone = z.infer<typeof coachToneSchema>;

export const intakeSchema = z.object({
  sport: z.enum(['running', 'cycling', 'triathlon', 'other']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  weeklyHoursAvailable: z.number().min(2).max(25),
  goals: z.array(z.string()).min(1),
  eventDate: z.string().optional(), // ISO date
  eventName: z.string().optional(),
  injuries: z.array(z.string()).optional(),
  // Agent-collected (optional for backward compatibility)
  age: z.number().min(13).max(120).optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  includeLifting: z.boolean().optional(),
  preferences: z.object({
    preferMorning: z.boolean().optional(),
    preferStrength: z.boolean().optional(),
    dietaryRestrictions: z.string().optional(),
    coachTone: coachToneSchema.optional(),
    /** Weight/distance units; coach should ask this first. */
    weightUnit: z.enum(['kg', 'lbs']).optional(),
  }).optional(),
  submittedAt: z.string(), // ISO
});

export type Intake = z.infer<typeof intakeSchema>;

// ——— Session ———
export const sessionSchema = z.object({
  type: z.enum(['easy', 'long', 'interval', 'tempo', 'strength', 'cross', 'rest']),
  duration: z.number(), // minutes
  intensityRPE: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  /** Short summary of the workout / focus. LLM-generated. */
  description: z.string().optional(),
  /** Step-by-step or markdown workout instructions. LLM-generated. */
  instructions: z.string().optional(),
  structure: z.object({
    warmup: z.number().optional(),
    main: z.number().optional(),
    cooldown: z.number().optional(),
    intervals: z.array(z.object({
      duration: z.number(),
      intensity: z.string().optional(),
    })).optional(),
  }).optional(),
});

export type Session = z.infer<typeof sessionSchema>;

// ——— Day (rest or session) ———
export const daySchema = z.object({
  date: z.string(), // ISO date
  rest: z.boolean(),
  session: sessionSchema.optional(),
});

export type Day = z.infer<typeof daySchema>;

// ——— Week ———
export const weekSchema = z.object({
  weekNumber: z.number(),
  days: z.array(daySchema).length(7),
});

export type Week = z.infer<typeof weekSchema>;

// ——— Training Plan ———
/** 16 weeks = 4 months */
export const TRAINING_PLAN_WEEKS = 16;
export const trainingPlanSchema = z.object({
  blockWeeks: z.array(weekSchema).length(TRAINING_PLAN_WEEKS),
  generatedAt: z.string(),
});

export type TrainingPlan = z.infer<typeof trainingPlanSchema>;

// ——— Nutrition ———
export const macroTargetsSchema = z.object({
  proteinGrams: z.number(),
  carbsTrainingMin: z.number(),
  carbsTrainingMax: z.number(),
  carbsRestMin: z.number(),
  carbsRestMax: z.number(),
  fatGrams: z.number().optional(),
});

export type MacroTargets = z.infer<typeof macroTargetsSchema>;

export const fuelingGuidanceSchema = z.object({
  preWorkout: z.string(),
  duringWorkout: z.string().optional(),
  postWorkout: z.string(),
  hydration: z.string(),
});

export type FuelingGuidance = z.infer<typeof fuelingGuidanceSchema>;

export const nutritionPlanSchema = z.object({
  macroTargets: macroTargetsSchema,
  fuelingGuidance: fuelingGuidanceSchema,
  mealExamples: z.array(z.string()).min(3).max(10),
  raceDayNotes: z.string().optional(),
});

export type NutritionPlan = z.infer<typeof nutritionPlanSchema>;

// ——— Plan (training + nutrition) ———
export const planSchema = z.object({
  trainingPlan: trainingPlanSchema,
  nutritionPlan: nutritionPlanSchema,
  generatedAt: z.string(),
  version: z.number(),
});

export type Plan = z.infer<typeof planSchema>;

// ——— Log Entry ———
export const logEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  sport: z.string(),
  duration: z.number(),
  distance: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  completedSessionId: z.string().optional(),
  createdAt: z.string(),
});

export type LogEntry = z.infer<typeof logEntrySchema>;

// ——— Recovery Check-in ———
export const recoveryCheckinSchema = z.object({
  id: z.string(),
  date: z.string(),
  sleep: z.number().min(1).max(5),
  soreness: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  mood: z.number().min(1).max(5),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export type RecoveryCheckin = z.infer<typeof recoveryCheckinSchema>;
