'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { updateUserProfile } from '@/lib/auth';
import { getAllQuizResults, toggleFavorite } from '@/lib/firestore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiCalendar, FiAward, FiBook, FiTrendingUp,
  FiStar, FiTerminal, FiSettings, FiEdit2, FiCheck, FiX,
  FiShield, FiClock, FiLoader, FiSave, FiHeart, FiTarget, FiLock,
  FiServer,
} from 'react-icons/fi';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';
import { ACHIEVEMENTS, checkAchievements } from '@/lib/achievements';
import type { QuizResult } from '@/lib/types';
import toast from 'react-hot-toast';

const formatDate = (timestamp: number, lang: 'ar' | 'en'): string => {
  try {
    return new Date(timestamp).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return '—'; }
};

const formatDateTime = (timestamp: number, lang: 'ar' | 'en'): string => {
  try {
    return new Date(timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
};

const getRelativeTime = (timestamp: number, t: (k: string) => string): string => {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t('profile.today');
  if (days === 1) return t('profile.yesterday');
  if (days < 7) return t('profile.daysAgo').replace('{days}', String(days));
  return formatDate(timestamp, 'ar');
};

export default function ProfilePage() {
  const { t, lang, dir } = useT();
  const { firebaseUser, userProfile, loading, isAdmin, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;
    getAllQuizResults(firebaseUser.uid).then(setQuizResults).catch(() => {});
  }, [firebaseUser]);

  useEffect(() => {
    if (userProfile?.favorites) setFavorites(userProfile.favorites);
  }, [userProfile?.favorites]);

  // Check and save achievements
  const earnedAchievements = userProfile?.achievements || [];
  const newlyEarned = checkAchievements(
    userProfile?.progress || {},
    quizResults,
    favorites,
    userProfile,
    earnedAchievements,
  );

  useEffect(() => {
    if (newlyEarned.length > 0 && firebaseUser) {
      const all = [...earnedAchievements, ...newlyEarned];
      import('@/lib/firestore').then(({ saveAchievements }) => {
        saveAchievements(firebaseUser.uid, all).catch(() => {});
        toast.success(t('achieve.unlocked'));
        refreshProfile();
      });
    }
  }, [newlyEarned.length > 0]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedCount = Object.values(userProfile?.progress || {}).filter(v => v === 'completed').length;
  const totalLessons = FREE_LESSONS.length + PREMIUM_LESSONS.length;
  const freeCompleted = FREE_LESSONS.filter(l => userProfile?.progress?.[l.id] === 'completed').length;
  const premCompleted = PREMIUM_LESSONS.filter(l => userProfile?.progress?.[l.id] === 'completed').length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (!firebaseUser || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="terminal-window max-w-md w-full text-center">
          <div className="terminal-window-header justify-center">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <div className="p-8">
            <FiTerminal className="text-primary text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text font-mono mb-2">{t('profile.loginRequired')}</h2>
            <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-primary text-secondary font-bold rounded-lg font-mono text-sm hover:bg-primary-dark transition-colors">
              $ {t('dash.loginBtn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditName(userProfile.displayName);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(firebaseUser.uid, { displayName: editName.trim() });
      await refreshProfile();
      toast.success(t('profile.updated'));
      setEditing(false);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-24 pb-16" dir={dir}>
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Terminal Window - Profile Header */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ cat /home/{userProfile.displayName.replace(/\s+/g, '_').toLowerCase()}/profile</span>
              <FiTerminal size={12} className="text-primary" />
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="text-primary text-3xl" />
                  )}
                </div>
                {userProfile.isPremium && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <FiStar size={14} className="text-secondary" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-secondary border border-border rounded-lg px-3 py-2 text-text font-mono text-lg focus:outline-none focus:border-primary transition-colors flex-1 max-w-xs"
                      autoFocus
                    />
                    <button onClick={handleSave} disabled={saving} className="p-2 text-primary hover:text-primary-dark transition-colors">
                      {saving ? <FiLoader className="animate-spin" /> : <FiCheck size={18} />}
                    </button>
                    <button onClick={() => setEditing(false)} className="p-2 text-text-muted hover:text-text transition-colors">
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-text font-mono">{userProfile.displayName}</h1>
                    <button onClick={handleEdit} className="p-1.5 text-text-muted hover:text-primary transition-colors rounded hover:bg-surface-light">
                      <FiEdit2 size={14} />
                    </button>
                  </div>
                )}
                <p className="text-text-muted font-mono text-sm mt-0.5">{userProfile.email}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap justify-center md:justify-start">
                  <span className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full ${
                    userProfile.isPremium ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                  }`}>
                    {userProfile.isPremium ? <FiStar size={11} /> : <FiShield size={11} />}
                    {userProfile.isPremium ? t('profile.premium') : t('profile.free')}
                  </span>
                  <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                    <FiCalendar size={11} />
                    {t('profile.memberSince')} {formatDate(userProfile.createdAt, lang)}
                  </span>
                </div>
                {userProfile.lastLoginAt && (
                  <p className="text-xs text-text-muted mt-1.5 font-mono flex items-center gap-1 justify-center md:justify-start">
                    <FiClock size={11} />
                    {t('profile.lastLogin')}: {getRelativeTime(userProfile.lastLoginAt, t)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="terminal-window">
              <div className="p-4 text-center">
                <FiBook className="text-primary mx-auto mb-2" size={20} />
                <div className="text-2xl font-bold text-text font-mono">{completedCount}/{totalLessons}</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('profile.completedLessons')}</div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <FiTrendingUp className="text-primary mx-auto mb-2" size={20} />
                <div className="text-2xl font-bold text-text font-mono">{progressPercent}%</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('profile.totalProgress')}</div>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[120px] mx-auto">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <FiStar className={userProfile.isPremium ? 'text-accent mx-auto mb-2' : 'text-text-muted mx-auto mb-2'} size={20} />
                <div className="text-2xl font-bold text-text font-mono">{userProfile.isPremium ? '✓' : '—'}</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('profile.accountType')}</div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <FiAward className={`mx-auto mb-2 ${userProfile?.certificateEarned ? 'text-primary' : 'text-text-muted'}`} size={20} />
                <div className={`text-2xl font-bold font-mono ${userProfile?.certificateEarned ? 'text-primary' : 'text-text'}`}>
                  {userProfile?.certificateEarned ? <FiCheck size={24} className="mx-auto" /> : '—'}
                </div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('cert.title')}</div>
              </div>
            </div>
          </div>

          {/* Progress Breakdown + Account Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress */}
            <div className="terminal-window">
              <div className="terminal-window-header">
                <span className="terminal-dot terminal-dot-red" />
                <span className="terminal-dot terminal-dot-yellow" />
                <span className="terminal-dot terminal-dot-green" />
                <span className="text-text-muted text-xs font-mono mr-auto">{'>'} progress --all</span>
              </div>
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-text font-mono flex items-center gap-2">
                  <FiTrendingUp className="text-primary" size={14} />
                  {t('profile.stats')}
                </h3>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-text">{t('profile.freeLessons')}</span>
                    <span className="text-text-muted">{freeCompleted}/{FREE_LESSONS.length}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(freeCompleted / FREE_LESSONS.length) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-text">{t('profile.premiumLessons')}</span>
                    <span className="text-text-muted">{premCompleted}/{PREMIUM_LESSONS.length}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${premCompleted > 0 ? (premCompleted / PREMIUM_LESSONS.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="terminal-window">
              <div className="terminal-window-header">
                <span className="terminal-dot terminal-dot-red" />
                <span className="terminal-dot terminal-dot-yellow" />
                <span className="terminal-dot terminal-dot-green" />
                <span className="text-text-muted text-xs font-mono mr-auto">{'>'} cat account.conf</span>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-sm font-bold text-text font-mono flex items-center gap-2">
                  <FiSettings className="text-primary" size={14} />
                  {t('profile.accountInfo')}
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                      <FiMail size={11} /> {t('profile.email')}
                    </span>
                    <span className="text-xs text-text font-mono" dir="ltr">{userProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                      <FiAward size={11} /> {t('profile.subscription')}
                    </span>
                    <span className={`text-xs font-mono ${userProfile.isPremium ? 'text-accent' : 'text-text-muted'}`}>
                      {userProfile.isPremium ? t('profile.premium') : t('profile.free')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                      <FiCalendar size={11} /> {t('profile.memberSince')}
                    </span>
                    <span className="text-xs text-text font-mono">{formatDate(userProfile.createdAt, lang)}</span>
                  </div>
                  {userProfile.lastLoginAt && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                        <FiClock size={11} /> {t('profile.lastLogin')}
                      </span>
                      <span className="text-xs text-text font-mono">{formatDateTime(userProfile.lastLoginAt, lang)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">{'>'} ls /quick-links/</span>
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-text font-mono mb-3 flex items-center gap-2">
                <FiTerminal className="text-primary" size={14} />
                {t('profile.quickLinks')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/dashboard" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all group">
                  <FiTerminal size={20} className="text-primary group-hover:animate-pulse" />
                  <span className="text-xs font-mono text-text">{t('profile.dashboard')}</span>
                </Link>
                <Link href="/courses" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all group">
                  <FiBook size={20} className="text-primary group-hover:animate-pulse" />
                  <span className="text-xs font-mono text-text">{t('profile.courses')}</span>
                </Link>
                <Link href="/playground" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all group">
                  <FiTerminal size={20} className="text-accent group-hover:animate-pulse" />
                  <span className="text-xs font-mono text-text">{t('profile.playground')}</span>
                </Link>
                <Link href="/certificate" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary border border-border hover:border-accent/30 transition-all group">
                  <FiAward size={20} className="text-accent group-hover:animate-pulse" />
                  <span className="text-xs font-mono text-text">{t('cert.title')}</span>
                </Link>
                <Link href="/settings" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all group">
                  <FiSettings size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                  <span className="text-xs font-mono text-text">{t('profile.settings')}</span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="flex flex-col items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-all group">
                    <FiServer size={20} className="text-accent group-hover:animate-pulse" />
                    <span className="text-xs font-mono text-accent">{t('nav.admin')}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">{'>'} cat /achievements/{userProfile.displayName.replace(/\s+/g, '_').toLowerCase()}</span>
              <FiAward size={12} className="text-primary" />
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-text font-mono mb-3 flex items-center gap-2">
                <FiTarget className="text-primary" size={14} />
                {t('achieve.title')}
                <span className="text-xs text-text-muted font-mono">({earnedAchievements.length}/{ACHIEVEMENTS.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = earnedAchievements.includes(ach.id);
                  return (
                    <div key={ach.id} className={`p-3 rounded-lg border text-center transition-all ${
                      unlocked
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-secondary border-border opacity-50'
                    }`}>
                      <div className={`text-2xl mb-1 ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</div>
                      <p className={`text-xs font-mono ${unlocked ? 'text-text' : 'text-text-muted'}`}>
                        {unlocked ? (lang === 'ar' ? ach.title : ach.titleEn) : '???'}
                      </p>
                      {unlocked ? (
                        <p className="text-[10px] text-text-muted font-mono mt-0.5 leading-tight">
                          {lang === 'ar' ? ach.desc : ach.descEn}
                        </p>
                      ) : (
                        <p className="text-[10px] text-text-muted font-mono mt-0.5">{t('achieve.locked')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Favorite Lessons */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">{'>'} ls /favorites/</span>
              <FiHeart size={12} className="text-red-400" />
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-text font-mono mb-3 flex items-center gap-2">
                <FiHeart className="text-red-400" size={14} />
                {t('fav.title')}
                <span className="text-xs text-text-muted font-mono">({favorites.length})</span>
              </h3>
              {favorites.length === 0 ? (
                <p className="text-text-muted text-sm font-mono text-center py-6">{t('fav.empty')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {favorites.map((favId) => {
                    const lesson = [...FREE_LESSONS, ...PREMIUM_LESSONS].find((l) => l.id === favId);
                    if (!lesson) return null;
                    return (
                      <div key={favId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border group">
                        <Link href={`/lessons/${favId}`} className="text-sm text-text font-mono hover:text-primary transition-colors truncate max-w-[200px]">
                          {lesson.icon} {lang === 'ar' ? lesson.title : lesson.titleEn}
                        </Link>
                        <button
                          onClick={async () => {
                            if (!firebaseUser) return;
                            const updated = await toggleFavorite(firebaseUser.uid, favId, favorites);
                            setFavorites(updated);
                            await refreshProfile();
                            toast.success(t('fav.removed'));
                          }}
                          className="text-text-muted hover:text-red-400 transition-colors shrink-0"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
