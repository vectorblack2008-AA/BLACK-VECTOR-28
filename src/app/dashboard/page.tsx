'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiBook, FiShield, FiAward, FiTrendingUp, FiTerminal, FiStar } from 'react-icons/fi';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';

export default function DashboardPage() {
  const { t, lang } = useT();
  const { userProfile, firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <FiTerminal className="text-primary text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">{t('dash.welcomeHeading')}</h2>
          <p className="text-text-muted mb-4">{t('dash.loginRequired')}</p>
          <Link href="/login" className="px-6 py-3 bg-primary text-secondary font-bold rounded-lg inline-block">
            {t('dash.loginBtn')}
          </Link>
        </div>
      </div>
    );
  }

  const completedLessons = Object.values(userProfile.progress || {}).filter(v => v === 'completed').length;
  const totalLessons = FREE_LESSONS.length + PREMIUM_LESSONS.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <FiUser className="text-primary text-2xl" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">{t('dash.welcome')} {userProfile.displayName}</h1>
              <p className="text-text-muted text-sm">{userProfile.email}</p>
            </div>
            {userProfile.isPremium && (
              <div className="mr-auto flex items-center gap-1 px-3 py-1 bg-accent/10 rounded-full text-accent text-sm">
                <FiStar size={14} /> {t('dash.premium')}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-surface rounded-xl border border-border">
              <FiBook className="text-primary mb-2" />
              <div className="text-2xl font-bold text-text">{completedLessons}</div>
              <div className="text-text-muted text-sm">{t('dash.completed')}</div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <FiTrendingUp className="text-primary mb-2" />
              <div className="text-2xl font-bold text-text">{progressPercent}%</div>
              <div className="text-text-muted text-sm">{t('dash.progress')}</div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <FiAward className="text-primary mb-2" />
              <div className="text-2xl font-bold text-text">{userProfile.isPremium ? t('dash.subscribed') : t('dash.free')}</div>
              <div className="text-text-muted text-sm">{t('dash.subscription')}</div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <FiShield className="text-primary mb-2" />
              <div className="text-2xl font-bold text-text">{userProfile.isPremium ? '✓' : '—'}</div>
              <div className="text-text-muted text-sm">{t('dash.premiumStatus')}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-surface rounded-xl border border-border p-6 mb-8">
            <h3 className="font-bold text-text mb-3">{t('dash.yourProgress')}</h3>
            <div className="w-full bg-surface-lighter rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-text-muted text-sm mt-2">{completedLessons} {t('dash.of')} {totalLessons} {t('dash.completed2')}</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/courses/free" className="p-6 bg-surface rounded-xl border border-border hover:border-primary/30 transition-all group">
              <FiBook className="text-primary text-2xl mb-2" />
              <h3 className="font-bold text-text group-hover:text-primary transition-colors">{t('dash.freeCourses')}</h3>
              <p className="text-text-muted text-sm">{t('dash.freeDesc')}</p>
            </Link>
            <Link href="/courses/premium" className="p-6 bg-surface rounded-xl border border-border hover:border-accent/30 transition-all group">
              <FiShield className="text-accent text-2xl mb-2" />
              <h3 className="font-bold text-text group-hover:text-accent transition-colors">{t('dash.premiumCourses')}</h3>
              <p className="text-text-muted text-sm">{t('dash.premiumDesc')}</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
