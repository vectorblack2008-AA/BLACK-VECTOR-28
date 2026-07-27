'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lesson } from '@/lib/types';

interface LessonsContextType {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  getLessonsByType: (type?: 'free' | 'premium', categoryId?: string) => Lesson[];
  getLesson: (id: string) => Lesson | undefined;
}

const LessonsContext = createContext<LessonsContextType>({
  lessons: [],
  loading: true,
  error: null,
  getLessonsByType: () => [],
  getLesson: () => undefined,
});

export const useLessons = () => useContext(LessonsContext);

export const LessonsProvider = ({ children }: { children: ReactNode }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'lessons'), orderBy('order', 'asc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
        setLessons(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Lessons onSnapshot error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const getLessonsByType = (type?: 'free' | 'premium', categoryId?: string) => {
    let filtered = lessons;
    if (type) filtered = filtered.filter(l => l.type === type);
    if (categoryId) filtered = filtered.filter(l => l.categoryId === categoryId);
    return filtered;
  };

  const getLesson = (id: string) => lessons.find(l => l.id === id);

  return (
    <LessonsContext.Provider value={{ lessons, loading, error, getLessonsByType, getLesson }}>
      {children}
    </LessonsContext.Provider>
  );
};
