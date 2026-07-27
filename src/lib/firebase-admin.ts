import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let cachedDb: Firestore | null = null;

function getAdminFirestore(): Firestore {
  if (cachedDb) return cachedDb;

  if (getApps().length === 0) {
    try {
      if (clientEmail && privateKey) {
        const pk = privateKey.replace(/\\n/g, '\n');
        initializeApp({
          credential: cert({ projectId, clientEmail, privateKey: pk }),
        });
      } else {
        initializeApp({ projectId });
      }
    } catch (e) {
      console.warn('Firebase Admin init error:', e);
      initializeApp({ projectId });
    }
  }

  cachedDb = getFirestore(getApps()[0]);
  return cachedDb;
}

export { getAdminFirestore };
