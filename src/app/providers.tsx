'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider, useT } from '@/contexts/LangContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import { CategoriesProvider } from '@/contexts/CategoriesContext';
import { LessonsProvider } from '@/contexts/LessonsContext';
import HeadUpdater from '@/components/HeadUpdater';
import { Toaster } from 'react-hot-toast';

const ToastWrapper = () => {
  const { dir } = useT();
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#e0e0e0',
          border: '1px solid #2a2a2a',
          direction: dir,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: '#00ff41', secondary: '#0a0a0a' } },
        error: { iconTheme: { primary: '#ff4444', secondary: '#0a0a0a' } },
      }}
    />
  );
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <LangProvider>
        <SiteSettingsProvider>
          <CategoriesProvider>
            <LessonsProvider>
          <AuthProvider>
            {children}
            <ToastWrapper />
            <HeadUpdater />
          </AuthProvider>
            </LessonsProvider>
          </CategoriesProvider>
        </SiteSettingsProvider>
      </LangProvider>
    </ThemeProvider>
  );
};
