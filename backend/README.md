# WildPace Backend

Node service for the AI coach chat and plan generation. Requires an OpenAI API key.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
npm install
```

Note: `@openai/agents` declares a peer dependency on `zod@^4`; the project uses `zod@^3`. `backend/.npmrc` sets `legacy-peer-deps=true` so install succeeds. The workflow uses Zod 3 for the sport schema; if you upgrade to Zod 4 later, you can remove that.

## Run

```bash
npm run dev   # with --watch
# or
npm start
```

Runs on port 3001 by default (set `PORT` in `.env` to change).

## OpenAI Agents workflow (optional)

If you built a coach in the OpenAI Agents dashboard, you can use it here:

1. Set `USE_AGENTS_WORKFLOW=true` or set `OPENAI_WORKFLOW_ID` to your workflow ID (e.g. `wf_...`) in `.env`.
2. The backend will use the sport classifier + sport-specific coaches (Mark/Susan/Ryan/Eric/Aaron) for normal chat turns.
3. When the app sends `requestIntakeComplete: true`, the backend still uses Chat Completions to return a structured intake so the app can show "Thank you" + Continue and generate the plan.

Optional: `OPENAI_COACH_MODEL` (default `gpt-4o`) to override the model used by workflow agents.

## Endpoints

- **POST /coach/chat** — Conversational intake. Body: `{ messages, coachTone?, existingIntake?, requestIntakeComplete? }`. Returns `{ message, intakeComplete?, intake?, quickReplies? }`.
- **POST /generatePlan** — Generate a 4-week plan. Body: `{ intake }`. Returns a validated `Plan` JSON (same shape the app expects).

## App configuration

In the Expo app, set `EXPO_PUBLIC_PLAN_API_URL` (e.g. in `.env.local`) to this backend:

```
EXPO_PUBLIC_PLAN_API_URL=http://localhost:3001
```

For web, use your machine’s IP or a tunnel if testing on a device.
