import { Platform } from 'react-native';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type User,
  type ActionCodeSettings,
  type Unsubscribe,
  type Auth,
  type OAuthCredential,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  type Firestore,
} from 'firebase/firestore';
import type { Intake, Plan, LogEntry, RecoveryCheckin } from '../types';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0] as FirebaseApp;
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const firebaseApp = getApp();
    if (Platform.OS === 'web') {
      authInstance = getAuth(firebaseApp);
    } else {
      try {
        authInstance = initializeAuth(firebaseApp, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
      } catch (e) {
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : '';
        if (/already (been )?initialized/i.test(msg)) {
          authInstance = getAuth(firebaseApp);
        } else {
          throw e;
        }
      }
    }
  }
  return authInstance;
}

// Register auth as soon as this module loads on native so nothing calls getAuth() first
if (Platform.OS !== 'web') {
  try {
    getApp();
    getFirebaseAuth();
  } catch (_) {
    // env or config not ready yet
  }
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getApp());
  return db;
}

export const auth = {
  get currentUser(): User | null {
    return getFirebaseAuth().currentUser;
  },

  async signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  },

  async signIn(email: string, password: string) {
    return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  },

  async sendMagicLink(email: string) {
    const actionCodeSettings: ActionCodeSettings = {
      url: 'wildpace://auth',
      handleCodeInApp: true,
    };
    return sendSignInLinkToEmail(getFirebaseAuth(), email, actionCodeSettings);
  },

  isMagicLink(url: string) {
    return isSignInWithEmailLink(getFirebaseAuth(), url);
  },

  async signInWithMagicLink(email: string, url: string) {
    return signInWithEmailLink(getFirebaseAuth(), email, url);
  },

  async signInWithGoogle(): Promise<void> {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getFirebaseAuth(), provider);
    } else {
      throw new Error('Google Sign-In on mobile: use web or configure native Google Sign-In.');
    }
  },

  async signInWithGoogleCredential(credential: OAuthCredential): Promise<void> {
    await signInWithCredential(getFirebaseAuth(), credential);
  },

  async signOut() {
    return firebaseSignOut(getFirebaseAuth());
  },
};

export const firestore = {
  async getUserProfile(uid: string) {
    const ref = doc(getFirebaseDb(), 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  async setUserProfile(uid: string, data: { profile?: { name: string; email: string; createdAt: string }; intake?: Intake; currentPlan?: Plan }) {
    const ref = doc(getFirebaseDb(), 'users', uid);
    await setDoc(ref, data, { merge: true });
  },

  async setIntake(uid: string, intake: Intake) {
    const ref = doc(getFirebaseDb(), 'users', uid);
    await setDoc(ref, { intake }, { merge: true });
  },

  async setCurrentPlan(uid: string, plan: Plan) {
    const ref = doc(getFirebaseDb(), 'users', uid);
    await setDoc(ref, { currentPlan: plan }, { merge: true });
  },

  async getLogs(uid: string): Promise<LogEntry[]> {
    const ref = collection(getFirebaseDb(), 'users', uid, 'logs');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LogEntry));
  },

  async addLog(uid: string, entry: Omit<LogEntry, 'id' | 'createdAt'>) {
    const ref = collection(getFirebaseDb(), 'users', uid, 'logs');
    const docRef = await addDoc(ref, {
      ...entry,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...entry, createdAt: new Date().toISOString() } as LogEntry;
  },

  async getCheckins(uid: string): Promise<RecoveryCheckin[]> {
    const ref = collection(getFirebaseDb(), 'users', uid, 'checkins');
    const snap = await getDocs(ref);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RecoveryCheckin));
  },

  async addCheckin(uid: string, checkin: Omit<RecoveryCheckin, 'id' | 'createdAt'>) {
    const ref = collection(getFirebaseDb(), 'users', uid, 'checkins');
    const docRef = await addDoc(ref, {
      ...checkin,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...checkin, createdAt: new Date().toISOString() } as RecoveryCheckin;
  },
};
