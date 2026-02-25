import { z } from 'zod';

const coachToneSchema = z.enum(['supportive', 'no_nonsense', 'science_focused', 'brief']);

export const intakeSchema = z.object({
  sport: z.enum(['running', 'cycling', 'triathlon', 'other']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  weeklyHoursAvailable: z.number().min(2).max(25),
  goals: z.array(z.string()).min(1),
  eventDate: z.string().optional(),
  eventName: z.string().optional(),
  injuries: z.array(z.string()).optional(),
  age: z.number().min(13).max(120).optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not']).optional(),
  includeLifting: z.boolean().optional(),
  preferences: z.object({
    preferMorning: z.boolean().optional(),
    preferStrength: z.boolean().optional(),
    dietaryRestrictions: z.string().optional(),
    coachTone: coachToneSchema.optional(),
  }).optional(),
  submittedAt: z.string(),
});

export const sessionSchema = z.object({
  type: z.enum(['easy', 'long', 'interval', 'tempo', 'strength', 'cross', 'rest']),
  duration: z.number(),
  intensityRPE: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
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

export const daySchema = z.object({
  date: z.string(),
  rest: z.boolean(),
  session: sessionSchema.optional(),
});

export const weekSchema = z.object({
  weekNumber: z.number(),
  days: z.array(daySchema).length(7),
});

/** 16 weeks = 4 months */
const TRAINING_PLAN_WEEKS = 16;
export const trainingPlanSchema = z.object({
  blockWeeks: z.array(weekSchema).length(TRAINING_PLAN_WEEKS),
  generatedAt: z.string(),
});

export const macroTargetsSchema = z.object({
  proteinGrams: z.number(),
  carbsTrainingMin: z.number(),
  carbsTrainingMax: z.number(),
  carbsRestMin: z.number(),
  carbsRestMax: z.number(),
  fatGrams: z.number().optional(),
});

export const fuelingGuidanceSchema = z.object({
  preWorkout: z.string(),
  duringWorkout: z.string().optional(),
  postWorkout: z.string(),
  hydration: z.string(),
});

export const nutritionPlanSchema = z.object({
  macroTargets: macroTargetsSchema,
  fuelingGuidance: fuelingGuidanceSchema,
  mealExamples: z.array(z.string()).min(3).max(10),
  raceDayNotes: z.string().optional(),
});

export const planSchema = z.object({
  trainingPlan: trainingPlanSchema,
  nutritionPlan: nutritionPlanSchema,
  generatedAt: z.string(),
  version: z.number(),
});
