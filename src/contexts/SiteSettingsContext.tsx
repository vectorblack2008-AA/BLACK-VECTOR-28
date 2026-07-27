'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SiteSettings } from '@/lib/types';

const SETTINGS_COLLECTION = 'siteSettings';
const SETTINGS_DOC_ID = 'site';

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (data: Partial<SiteSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const defaultSettings: SiteSettings = {
  siteName: 'Black Vector',
  siteNameAr: 'بلاك فيكتور',
  siteAbbr: 'B.V',
  siteAbbrAr: 'ب.ف',
  description: 'Master the terminal. Interactive Linux & cybersecurity courses with hands-on training, real command execution, and step-by-step lessons.',
  descriptionAr: 'أتقن التيرمينال. دورات تفاعلية في لينكس والأمن السيبراني مع تطبيق عملي للأوامر، تدريب تفاعلي، ودروس خطوة بخطوة.',
  logoUrl: '',
  primaryColor: '#00ff41',
  premiumPrice: 19,
  currency: '$',
  supportEmail: '',
  footerText: 'All rights reserved. Made for the Linux community.',
  footerTextAr: 'جميع الحقوق محفوظة. صُنع من أجل مجتمع لينكس.',
  socialGithub: '',
  socialTwitter: '',
  socialYoutube: '',
  updatedAt: Date.now(),
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
  updateSettings: async () => {},
  refreshSettings: async () => {},
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteSettings>;
          setSettings(prev => ({ ...prev, ...data }));
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('SiteSettings onSnapshot error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const updateSettings = useCallback(async (data: Partial<SiteSettings>) => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, data, { merge: true });
  }, []);

  const refreshSettings = useCallback(async () => {
    const { getDoc } = await import('firebase/firestore');
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<SiteSettings>;
      setSettings(prev => ({ ...prev, ...data }));
    }
    setLoading(false);
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, updateSettings, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
