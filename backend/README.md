# WildPace Backend

Node service for the AI coach chat and plan generation. Requires an OpenAI API key.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
npm install
```

## Run

```bash
npm run dev   # with --watch
# or
npm start
```

Runs on port 3001 by default (set `PORT` in `.env` to change).

## Endpoints

- **POST /coach/chat** — Conversational intake. Body: `{ messages, coachTone?, existingIntake? }`. Returns `{ message, intakeComplete?, intake? }`.
- **POST /generatePlan** — Generate a 4-week plan. Body: `{ intake }`. Returns a validated `Plan` JSON (same shape the app expects).

## App configuration

In the Expo app, set `EXPO_PUBLIC_PLAN_API_URL` (e.g. in `.env.local`) to this backend:

```
EXPO_PUBLIC_PLAN_API_URL=http://localhost:3001
```

For web, use your machine’s IP or a tunnel if testing on a device.
