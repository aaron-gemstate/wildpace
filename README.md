# WildPace

Endurance coaching app: personalized training + nutrition plan from an intake form. MVP mobile app (React Native + Expo).

## Tech

- **React Native** + **Expo** + **TypeScript**
- **React Navigation**: Stack (auth, intake, generating, main) + Bottom Tabs (Dashboard, Plan, Log, Profile)
- **Firebase**: Auth (email/password for MVP), Firestore for profile, intake, plan, logs, check-ins
- **AsyncStorage**: Local cache for offline reading; sync to Firestore when online
- **Plan generation**: Abstraction layer (`PlanEngine`) with **MockPlanEngine** (realistic JSON) and **HttpPlanEngine** (POST `/generatePlan`, POST `/adjustPlan`). Swap to OpenAI/Anthropic/Gemini/Bedrock later behind the same interface.

## How to run

1. **Clone and install**
   ```bash
   cd wildpace
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` (or set `EXPO_PUBLIC_*` in your shell).
   - Set Firebase env vars (see [Firebase setup](#firebase-setup) below).
   - Optionally set `EXPO_PUBLIC_PLAN_API_URL` to use the HTTP plan API instead of the mock.

3. **Assets**
   - Add `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`, or copy from a new Expo app:
     ```bash
     npx create-expo-app _tmp --template blank-typescript
     cp _tmp/assets/* assets/
     rm -rf _tmp
     ```

4. **Start**
   ```bash
   npx expo start
   ```
   Then scan QR (Expo Go) or press `i`/`a` for simulator/emulator.

## Firebase setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Create a **Firestore** database (start in test mode for dev).
4. In Project settings → General → Your apps, add a Web app and copy the config.
5. Set in `.env` (or `app.config.js` / EAS):
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

Firestore structure:

- `users/{uid}` – `profile` (name, email, createdAt), `intake`, `currentPlan` (trainingPlan + nutritionPlan + generatedAt + version)
- `users/{uid}/logs/{logId}` – workout logs
- `users/{uid}/checkins/{checkinId}` – recovery check-ins

## Plan API (optional)

If `EXPO_PUBLIC_PLAN_API_URL` is set, the app uses **HttpPlanEngine** and calls:

- `POST {url}/generatePlan` – body: `{ intake }`, response: full `Plan` (Zod-validated).
- `POST {url}/adjustPlan` – body: `{ intake, plan, logs, checkins }`, response: adjusted `Plan`.

Otherwise the app uses **MockPlanEngine** (no server).

## Brand kit (original design)

Visual direction is **rugged enduro/overland editorial**, Run Amok–adjacent: utilitarian, field-notes, no copying of existing brand assets.

- **Palette**: Earth tones, off-white background (`#E8E4DC`), charcoal text (`#2C2825`), muted browns/greens for accents and badges.
- **UI**: Utilitarian, clear hierarchy. Stamped-style badge chips for session types (EASY, LONG, TEMPO, etc.).
- **Details**: Subtle grain/noise overlay, simple monochrome line icons (e.g. lucide-react-native), topo-line accents where appropriate.
- **Components**: Badge, Stamp, FieldNoteDivider, IconTile, PrimaryButton, Card. Typography: system fonts, clear scale (xs → xxl).

## Folder structure

```
src/
  components/   # Badge, Stamp, Card, PrimaryButton, etc.
  navigation/   # RootNavigator, TabNavigator
  screens/     # Welcome, Auth, Intake, Dashboard, Plan, Log, Profile, SessionDetail, LogWorkout, RecoveryCheckin, GeneratingPlan
  services/    # firebase, storage, planEngine (Mock + Http)
  store/       # AppContext (user, intake, plan, logs, checkins, actions)
  theme/       # colors, typography, spacing
  types/       # Zod schemas + TypeScript types
```

## Scope (MVP)

- Onboarding → Auth → Intake (multi-step) → Generating plan → Dashboard / Plan / Log / Profile.
- No pricing or paywall (TBD).
- Profile: edit intake, regenerate plan, adjust plan (from logs), sign out, **seed demo data** for testing.
