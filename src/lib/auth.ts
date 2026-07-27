import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as firebaseUpdatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from './types';

export const createUserDocument = async (user: FirebaseUser): Promise<User> => {
  const existing = await getUserProfile(user.uid);
  if (existing) return existing;

  const now = Date.now();
  const newUser: User = {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'مستخدم',
    photoURL: user.photoURL || undefined,
    role: 'user',
    createdAt: now,
    lastLoginAt: now,
    isPremium: false,
    progress: {},
  };

  await setDoc(doc(db, 'users', user.uid), newUser);
  return newUser;
};

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });

  const now = Date.now();
  const newUser: User = {
    id: result.user.uid,
    email,
    displayName,
    role: 'user',
    createdAt: now,
    lastLoginAt: now,
    isPremium: false,
    progress: {},
  };

  await setDoc(doc(db, 'users', result.user.uid), newUser);
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const existing = await getUserProfile(result.user.uid);
  if (existing) {
    await updateDoc(doc(db, 'users', result.user.uid), { lastLoginAt: Date.now() });
    return { ...existing, lastLoginAt: Date.now() };
  }
  return createUserDocument(result.user);
};

const saveGoogleUser = async (user: FirebaseUser): Promise<User> => {
  const existing = await getUserProfile(user.uid);
  if (existing) {
    await updateDoc(doc(db, 'users', user.uid), {
      lastLoginAt: Date.now(),
      displayName: user.displayName || existing.displayName,
      photoURL: user.photoURL || existing.photoURL,
    });
    return {
      ...existing,
      lastLoginAt: Date.now(),
      displayName: user.displayName || existing.displayName,
      photoURL: user.photoURL || existing.photoURL,
    };
  }
  return createUserDocument(user);
};

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return saveGoogleUser(result.user);
  } catch (popupErr: any) {
    if (popupErr?.code === 'auth/popup-blocked' || popupErr?.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, provider);
      return new Promise(() => {});
    }
    throw popupErr;
  }
};

export const handleGoogleRedirect = async (): Promise<User | null> => {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  return saveGoogleUser(result.user);
};

export const logoutUser = () => signOut(auth);

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await firebaseUpdatePassword(user, newPassword);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'البريد الإلكتروني مطلوب';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'البريد الإلكتروني غير صالح';
  return null;
};

export const validatePassword = (password: string): { valid: boolean; score: number; messages: string[] } => {
  const messages: string[] = [];
  let score = 0;

  if (password.length < 6) {
    messages.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  } else if (password.length >= 8) {
    score += 1;
  }
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (messages.length === 0 && score < 3) {
    messages.push('يفضل استخدام أحرف كبيرة وصغيرة وأرقام ورموز');
  }

  return { valid: messages.length === 0, score, messages };
};

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 1) return '#ff3355';
  if (score <= 2) return '#ff6b35';
  if (score <= 3) return '#ffaa00';
  if (score <= 4) return '#00ff41';
  return '#00ff41';
};

export const getPasswordStrengthLabel = (score: number, t: (k: string) => string): string => {
  if (score <= 1) return t('password.weak');
  if (score <= 2) return t('password.medium');
  if (score <= 3) return t('password.good');
  if (score <= 4) return t('password.strong');
  return t('password.excellent');
};

export const getAuthErrorMessage = (code: string, t: (k: string) => string): string => {
  const messages: Record<string, { ar: string; en: string }> = {
    'auth/invalid-credential': { ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
    'auth/user-not-found': { ar: 'لا يوجد حساب بهذا البريد الإلكتروني', en: 'No account with this email' },
    'auth/wrong-password': { ar: 'كلمة المرور غير صحيحة', en: 'Wrong password' },
    'auth/email-already-in-use': { ar: 'هذا البريد الإلكتروني مستخدم بالفعل', en: 'Email already in use' },
    'auth/weak-password': { ar: 'كلمة المرور ضعيفة جداً', en: 'Password is too weak' },
    'auth/too-many-requests': { ar: 'تم حظر الحساب مؤقتاً. حاول لاحقاً', en: 'Account temporarily blocked. Try again later' },
    'auth/invalid-email': { ar: 'البريد الإلكتروني غير صالح', en: 'Invalid email address' },
    'auth/user-disabled': { ar: 'تم تعطيل هذا الحساب', en: 'This account has been disabled' },
    'auth/requires-recent-login': { ar: 'يرجى إعادة تسجيل الدخول', en: 'Please re-authenticate' },
    'auth/popup-closed-by-user': { ar: 'تم إغلاق النافذة', en: 'Popup was closed' },
    'auth/popup-blocked': { ar: 'تم حظر النافذة المنبثقة. اسمح للنوافذ المنبثقة لهذا الموقع', en: 'Popup was blocked. Please allow popups for this site' },
    'auth/cancelled-popup-request': { ar: 'تم إلغاء الطلب', en: 'Request was cancelled' },
    'auth/network-request-failed': { ar: 'خطأ في الشبكة. تأكد من اتصالك بالإنترنت', en: 'Network error. Check your internet connection' },
  };
  return messages[code]?.['ar'] || t('common.error');
};
