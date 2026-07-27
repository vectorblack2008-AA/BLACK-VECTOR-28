'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import Link from 'next/link';
import { FiLock, FiTerminal } from 'react-icons/fi';

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { t } = useT();
  const { firebaseUser, userProfile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPremiumActive = userProfile?.isPremium && (!userProfile?.premiumExpiresAt || userProfile.premiumExpiresAt > Date.now());

  if (!firebaseUser || (!isPremiumActive && !isAdmin)) {
    return (
      <div className="max-w-md mx-auto my-20">
        <div className="terminal-window text-center">
          <div className="terminal-window-header justify-center">
            <FiLock className="text-accent" size={16} />
            <span className="text-accent text-sm font-mono">{t('guard.title')}</span>
          </div>
          <div className="p-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <FiTerminal className="text-accent" size={28} />
            </div>
            <p className="text-text-muted mb-6 font-mono text-sm leading-relaxed">
              {t('guard.desc')}
            </p>
            <Link
              href="/courses/premium"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors font-mono text-sm"
            >
              <span className="group-hover:animate-pulse">#</span> {t('guard.cta')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
