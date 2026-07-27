'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Lang, translations, getLangDir, getFontFamily } from '@/lib/translations';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextType>({
  lang: 'ar',
  setLang: () => {},
  t: (key) => key,
  dir: 'rtl',
});

export const useT = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored) setLangState(stored);
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || key;
  }, [lang]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = getLangDir(lang);
      document.documentElement.lang = lang;
      document.documentElement.style.fontFamily = getFontFamily(lang);
    }
  }, [lang, mounted]);

  if (!mounted) return <>{children}</>;

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir: getLangDir(lang) }}>
      {children}
    </LangContext.Provider>
  );
};
