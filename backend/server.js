import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { intakeSchema, planSchema } from './schema.js';

const app = express();
app.use(cors());
app.use(express.json());

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const COACH_TONE_PROMPTS = {
  supportive: 'You are a warm, encouraging coach. Use positive language and affirm the user\'s goals. Be empathetic and patient.',
  no_nonsense: 'You are a direct, no-nonsense coach. Be concise and focused. Skip small talk; get the information you need efficiently.',
  science_focused: 'You are a coach who emphasizes evidence and training science. Reference principles briefly when relevant. Stay professional and clear.',
  brief: 'You are a coach who keeps replies short. Ask one question at a time. Use minimal words while staying friendly.',
};

const INTAKE_COLLECTION_PROMPT = `You are a training coach collecting intake information to build a personalized plan. Collect the following (ask naturally, one or two at a time):
- age (number, 13-120)
- weightKg (number)
- heightCm (number)
- gender (male, female, non_binary, or prefer_not)
- sport (running, cycling, triathlon, other)
- experienceLevel (beginner, intermediate, advanced, elite)
- weeklyHoursAvailable (2-25)
- goals (array of strings, at least one)
- eventDate (optional, ISO date YYYY-MM-DD)
- eventName (optional)
- injuries (optional array of strings)
- includeLifting (boolean)
- preferMorning (boolean, in preferences)
- dietaryRestrictions (optional string, in preferences)

When you have enough to build a plan (at minimum: sport, experienceLevel, weeklyHoursAvailable, goals), call the submit_intake tool with the complete intake object. Include submittedAt as current ISO timestamp. If the user is editing existing intake, merge their answers with existingIntake and only ask about what they want to change or confirm.`;

function buildSystemPrompt(coachTone, existingIntake) {
  const tone = COACH_TONE_PROMPTS[coachTone] || COACH_TONE_PROMPTS.supportive;
  let sys = tone + '\n\n' + INTAKE_COLLECTION_PROMPT;
  if (existingIntake && Object.keys(existingIntake).length > 0) {
    sys += `\n\nCurrent intake (user is editing): ${JSON.stringify(existingIntake)}. Ask what they want to change or confirm.`;
  }
  return sys;
}

const submitIntakeTool = {
  type: 'function',
  function: {
    name: 'submit_intake',
    description: 'Call when you have collected enough intake to build a training plan.',
    parameters: {
      type: 'object',
      properties: {
        intake: {
          type: 'object',
          description: 'Full intake object with sport, experienceLevel, weeklyHoursAvailable, goals, submittedAt, and any optional fields collected.',
        },
      },
      required: ['intake'],
    },
  },
};

app.post('/coach/chat', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: 'OpenAI not configured (OPENAI_API_KEY)' });
  }
  const { messages = [], coachTone = 'supportive', existingIntake } = req.body;
  const systemPrompt = buildSystemPrompt(coachTone, existingIntake || null);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools: [submitIntakeTool],
      tool_choice: 'auto',
    });

    const choice = completion.choices[0];
    let assistantContent = choice.message?.content || '';
    let intake = null;
    let intakeComplete = false;

    if (choice.message?.tool_calls?.length) {
      for (const tc of choice.message.tool_calls) {
        if (tc.function?.name === 'submit_intake') {
          try {
            const args = JSON.parse(tc.function.arguments || '{}');
            const withSubmittedAt = { ...args.intake, submittedAt: args.intake.submittedAt || new Date().toISOString() };
            const parsed = intakeSchema.safeParse(withSubmittedAt);
            if (parsed.success) {
              intake = parsed.data;
              intakeComplete = true;
            }
          } catch (_) {}
        }
      }
    }

    return res.json({
      message: assistantContent,
      intakeComplete,
      intake: intake || undefined,
    });
  } catch (e) {
    console.error('coach/chat error', e);
    return res.status(500).json({
      error: e.message || 'Chat failed',
    });
  }
});

const PLAN_WEEKS = 16; // 4 months

function getNextFourMonthsDates() {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  const dates = [];
  for (let i = 0; i < PLAN_WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function fillPlanDates(plan) {
  const dates = getNextFourMonthsDates();
  const out = { ...plan };
  out.trainingPlan = {
    ...plan.trainingPlan,
    blockWeeks: plan.trainingPlan.blockWeeks.map((week, wi) => ({
      ...week,
      days: week.days.map((day, di) => ({
        ...day,
        date: dates[wi * 7 + di],
      })),
    })),
  };
  return out;
}

const PLAN_GEN_PROMPT = `You are a training coach. Given the user's intake, generate a 4-month (16-week) training plan as JSON.

Output a single JSON object matching this structure (no markdown, no explanation):
{
  "trainingPlan": {
    "blockWeeks": [16 weeks],
    "generatedAt": "<ISO string>"
  },
  "nutritionPlan": {
    "macroTargets": { "proteinGrams", "carbsTrainingMin", "carbsTrainingMax", "carbsRestMin", "carbsRestMax", "fatGrams" },
    "fuelingGuidance": { "preWorkout", "duringWorkout", "postWorkout", "hydration" },
    "mealExamples": [3-10 strings],
    "raceDayNotes": "<optional string>"
  },
  "generatedAt": "<ISO string>",
  "version": 1
}

Each week in blockWeeks: { "weekNumber": 1-16, "days": [7 days] }.
Each day: { "date": "" (leave empty, server fills), "rest": boolean, "session": optional }. If not rest, session: { "type": "easy"|"long"|"interval"|"tempo"|"strength"|"cross", "duration": minutes, "intensityRPE": 1-10, "notes": optional, "description": "1-2 sentence workout focus", "instructions": "step-by-step instructions" }.
Vary session types across the 4-month block. Include rest days. Match weekly hours to intake.weeklyHoursAvailable. If includeLifting is true, include strength sessions. Build progression over the 16 weeks.`;

app.post('/generatePlan', async (req, res) => {
  if (!openai) {
    return res.status(503).json({ error: 'OpenAI not configured (OPENAI_API_KEY)' });
  }
  const { intake } = req.body;
  if (!intake) {
    return res.status(400).json({ error: 'Missing intake' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: PLAN_GEN_PROMPT },
        { role: 'user', content: `Intake:\n${JSON.stringify(intake, null, 2)}\n\nRespond with only the plan JSON.` },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No plan in response' });
    }

    let raw = JSON.parse(content);
    raw.generatedAt = new Date().toISOString();
    if (raw.trainingPlan) {
      raw.trainingPlan.generatedAt = raw.generatedAt;
    }
    const filled = fillPlanDates(raw);
    const parsed = planSchema.safeParse(filled);
    if (!parsed.success) {
      console.error('Plan validation failed', parsed.error.flatten());
      return res.status(500).json({ error: 'Generated plan invalid: ' + parsed.error.message });
    }
    return res.json(parsed.data);
  } catch (e) {
    console.error('generatePlan error', e);
    return res.status(500).json({
      error: e.message || 'Plan generation failed',
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WildPace backend listening on http://localhost:${PORT}`);
  if (!openai) console.warn('OPENAI_API_KEY not set: /coach/chat and /generatePlan will return 503');
});
