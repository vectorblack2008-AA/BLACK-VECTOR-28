import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, Lesson, ContactMessage, SiteSettings, QuizResult, CertificateData } from './types';

// Categories
export const getCategories = async (type?: 'free' | 'premium'): Promise<Category[]> => {
  const constraints: any[] = [orderBy('order', 'asc')];
  if (type) constraints.unshift(where('type', '==', type));
  const q = query(collection(db, 'categories'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

export const getCategory = async (id: string): Promise<Category | null> => {
  const snap = await getDoc(doc(db, 'categories', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Category) : null;
};

export const createCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Date.now();
  return addDoc(collection(db, 'categories'), { ...data, createdAt: now, updatedAt: now });
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  await updateDoc(doc(db, 'categories', id), { ...data, updatedAt: Date.now() });
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id));
};

// Lessons
export const getLessons = async (type?: 'free' | 'premium', categoryId?: string): Promise<Lesson[]> => {
  const constraints: any[] = [orderBy('order', 'asc')];
  if (type) constraints.unshift(where('type', '==', type));
  if (categoryId) constraints.unshift(where('categoryId', '==', categoryId));
  const q = query(collection(db, 'lessons'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
};

export const getLesson = async (id: string): Promise<Lesson | null> => {
  const snap = await getDoc(doc(db, 'lessons', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Lesson) : null;
};

export const createLesson = async (data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = Date.now();
  return addDoc(collection(db, 'lessons'), { ...data, createdAt: now, updatedAt: now });
};

export const updateLesson = async (id: string, data: Partial<Lesson>) => {
  await updateDoc(doc(db, 'lessons', id), { ...data, updatedAt: Date.now() });
};

export const deleteLesson = async (id: string) => {
  await deleteDoc(doc(db, 'lessons', id));
};

// Contact Messages
export const createContactMessage = async (data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => {
  return addDoc(collection(db, 'messages'), { ...data, read: false, createdAt: Date.now() });
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactMessage));
};

// Site Settings — collection: siteSettings, doc ID: site
const SETTINGS_COLLECTION = 'siteSettings';
const SETTINGS_DOC_ID = 'site';

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as SiteSettings;
};

export const updateSiteSettings = async (data: Partial<SiteSettings>) => {
  await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), { ...data, updatedAt: Date.now() }, { merge: true });
};

export const resetSiteSettings = async (defaults: SiteSettings) => {
  await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), { ...defaults, updatedAt: Date.now() });
};

// Quiz Results
export const saveQuizResult = async (userId: string, result: QuizResult) => {
  await setDoc(doc(db, 'users', userId, 'quizResults', result.lessonId), result);
};

export const getQuizResult = async (userId: string, lessonId: string): Promise<QuizResult | null> => {
  const snap = await getDoc(doc(db, 'users', userId, 'quizResults', lessonId));
  return snap.exists() ? (snap.data() as QuizResult) : null;
};

export const getAllQuizResults = async (userId: string): Promise<QuizResult[]> => {
  const snap = await getDocs(collection(db, 'users', userId, 'quizResults'));
  return snap.docs.map((d) => d.data() as QuizResult);
};

// Certificates
export const saveCertificate = async (userId: string, cert: CertificateData) => {
  await setDoc(doc(db, 'users', userId, 'certificates', cert.certificateId), cert);
  await updateDoc(doc(db, 'users', userId), { certificateEarned: true, certificateIssuedAt: Date.now() });
};

export const getCertificate = async (userId: string): Promise<CertificateData | null> => {
  const snap = await getDocs(collection(db, 'users', userId, 'certificates'));
  if (snap.empty) return null;
  return snap.docs[0].data() as CertificateData;
};

// Favorites
export const toggleFavorite = async (userId: string, lessonId: string, currentFavorites: string[] = []) => {
  const exists = currentFavorites.includes(lessonId);
  const updated = exists
    ? currentFavorites.filter((id) => id !== lessonId)
    : [...currentFavorites, lessonId];
  await updateDoc(doc(db, 'users', userId), { favorites: updated });
  return updated;
};

// Achievements
export const saveAchievements = async (userId: string, achievements: string[]) => {
  await updateDoc(doc(db, 'users', userId), { achievements });
};

interface LeaderboardEntry {
  id: string;
  displayName: string;
  photoURL: string | null;
  completedCount: number;
  achievementsCount: number;
  isPremium: boolean;
  certificateEarned: boolean;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const snap = await getDocs(collection(db, 'users'));
  const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return users
    .map((u: any) => ({
      id: u.id,
      displayName: u.displayName || 'User',
      photoURL: u.photoURL || null,
      completedCount: Object.values(u.progress || {}).filter((v: any) => v === 'completed').length,
      achievementsCount: (u.achievements || []).length,
      isPremium: u.isPremium || false,
      certificateEarned: u.certificateEarned || false,
    }))
    .sort((a, b) => b.completedCount - a.completedCount || b.achievementsCount - a.achievementsCount)
    .slice(0, 50);
};
