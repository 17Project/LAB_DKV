import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LabSession, SchoolProfile } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operation types for standard error tracking
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on app boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'school_profile'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or unreachable.');
    }
    return false;
  }
}

const SETTINGS_COLLECTION = 'settings';
const PROFILE_DOC_ID = 'school_profile';
const SESSIONS_COLLECTION = 'sessions';

/**
 * Realtime sync listener for School Profile & Logos across devices
 */
export function subscribeSchoolProfile(
  onData: (profile: SchoolProfile) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SchoolProfile);
      }
    },
    (error) => {
      console.error('Error subscribing to school profile:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${PROFILE_DOC_ID}`);
    }
  );
}

/**
 * Save School Profile & custom Logos to Cloud Firestore
 */
export async function saveSchoolProfileToCloud(profile: SchoolProfile): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${PROFILE_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Realtime sync listener for all Lab Control Card sessions across devices
 */
export function subscribeSessions(
  onData: (sessions: LabSession[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, SESSIONS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: LabSession[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as LabSession);
      });
      // Sort newest first
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.rawDate).getTime();
        const timeB = new Date(b.createdAt || b.rawDate).getTime();
        return timeB - timeA;
      });
      onData(list);
    },
    (error) => {
      console.error('Error subscribing to sessions:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SESSIONS_COLLECTION);
    }
  );
}

/**
 * Save / Update a Lab Control Card session in Cloud Firestore
 */
export async function saveSessionToCloud(session: LabSession): Promise<void> {
  const path = `${SESSIONS_COLLECTION}/${session.id}`;
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, session.id);
    await setDoc(docRef, {
      ...session,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Lab Control Card session from Cloud Firestore
 */
export async function deleteSessionFromCloud(sessionId: string): Promise<void> {
  const path = `${SESSIONS_COLLECTION}/${sessionId}`;
  try {
    const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Bootstrap Cloud Firestore with default profile if not yet populated
 */
export async function seedInitialProfileIfEmpty(defaultProfile: SchoolProfile): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    await setDoc(docRef, defaultProfile, { merge: true });
  } catch (err) {
    console.warn('Initial profile seed notice:', err);
  }
}

/**
 * Bootstrap Cloud Firestore with initial sample sessions if database is completely empty
 */
export async function seedInitialSessionsIfEmpty(sampleSessions: LabSession[]): Promise<void> {
  try {
    const colRef = collection(db, SESSIONS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const sess of sampleSessions) {
        await setDoc(doc(db, SESSIONS_COLLECTION, sess.id), sess);
      }
    }
  } catch (err) {
    console.warn('Initial session seed notice:', err);
  }
}
