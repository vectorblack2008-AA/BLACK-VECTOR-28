// Seed script: run once to create an admin user in Firestore
// Usage: after creating an admin account via /register, run this
// script logic in a useEffect or via Firebase console

/*
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const makeUserAdmin = async (uid: string) => {
  await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
  console.log('User promoted to admin');
};
*/

// To create admin manually from Firebase Console:
// 1. Go to Firestore Database
// 2. Find 'users' collection
// 3. Edit the user document
// 4. Add field: "role" = "admin"
