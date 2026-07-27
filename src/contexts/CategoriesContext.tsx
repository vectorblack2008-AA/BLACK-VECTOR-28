'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  loading: true,
  error: null,
});

export const useCategories = () => useContext(CategoriesContext);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
        setCategories(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Categories onSnapshot error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
};
