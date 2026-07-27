'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserProfile, updatePassword } from '@/lib/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiShield, FiSun, FiMoon, FiGlobe,
  FiTerminal, FiSave, FiArrowRight, FiCheck, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t, lang, setLang, dir } = useT();
  const { firebaseUser, userProfile, loading, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

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
        <div className="terminal-window max-w-md w-full text-center">
          <div className="terminal-window-header justify-center">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <div className="p-8">
            <FiTerminal className="text-primary text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text font-mono mb-2">{t('settings.loginRequired')}</h2>
            <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-primary text-secondary font-bold rounded-lg font-mono text-sm">
              $ {t('dash.loginBtn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEditName = () => {
    setEditName(userProfile.displayName || '');
    setEditing(true);
  };

  const handleSaveName = async () => {
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

  const handlePasswordChange = async () => {
    if (!pwCurrent || !pwNew) {
      toast.error(t('settings.fillFields'));
      return;
    }
    if (pwNew.length < 6) {
      toast.error(t('settings.passwordShort'));
      return;
    }
    setPwSaving(true);
    try {
      await updatePassword(pwCurrent, pwNew);
      toast.success(t('settings.passwordChanged'));
      setPwCurrent('');
      setPwNew('');
    } catch {
      toast.error(t('settings.passwordFailed'));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="pt-24 pb-16" dir={dir}>
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FiTerminal className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text font-mono">{t('settings.title')}</h1>
              <p className="text-text-muted text-sm font-mono">{userProfile.email}</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ cat /etc/account</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-muted text-xs font-mono">{t('auth.name')}</span>
                  {editing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-surface border border-border rounded px-2 py-1 text-text font-mono text-sm w-48 outline-none focus:border-primary"
                        autoFocus
                      />
                      <button onClick={handleSaveName} className="text-primary hover:text-primary-dark" disabled={saving}>
                        {saving ? <FiTerminal className="animate-pulse" /> : <FiCheck size={16} />}
                      </button>
                      <button onClick={() => setEditing(false)} className="text-text-muted hover:text-text">
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-text font-mono text-sm mt-1 flex items-center gap-2">
                      {userProfile.displayName || '—'}
                      <button onClick={handleEditName} className="text-primary hover:text-primary-dark text-xs">
                        [{t('common.edit')}]
                      </button>
                    </p>
                  )}
                </div>
                <FiUser className="text-text-muted" size={20} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-muted text-xs font-mono">{t('profile.email')}</span>
                  <p className="text-text font-mono text-sm mt-1">{userProfile.email}</p>
                </div>
                <FiMail className="text-text-muted" size={20} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-muted text-xs font-mono">{t('profile.accountType')}</span>
                  <p className="text-text font-mono text-sm mt-1 flex items-center gap-2">
                    {userProfile.isPremium ? (
                      <span className="text-accent">{t('profile.premium')}</span>
                    ) : (
                      <span className="text-text-muted">{t('profile.free')}</span>
                    )}
                    {userProfile.role === 'admin' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">admin</span>
                    )}
                  </p>
                </div>
                <FiShield className="text-text-muted" size={20} />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ passwd</span>
            </div>
            <div className="p-5 space-y-3">
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder={t('settings.currentPassword')}
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text font-mono text-sm outline-none focus:border-primary"
              />
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder={t('settings.newPassword')}
                className="w-full bg-surface border border-border rounded px-3 py-2 text-text font-mono text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handlePasswordChange}
                disabled={pwSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-mono text-sm rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <FiSave size={14} />
                {pwSaving ? t('common.loading') : t('settings.changePasswordBtn')}
              </button>
            </div>
          </div>

          {/* Theme & Language */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ cat /etc/preferences</span>
            </div>
            <div className="p-5 space-y-4">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-muted text-xs font-mono">{t('settings.theme')}</span>
                  <p className="text-text font-mono text-sm mt-1">
                    {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-secondary border border-border text-text-muted hover:text-primary transition-colors"
                >
                  {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-muted text-xs font-mono">{t('settings.language')}</span>
                  <p className="text-text font-mono text-sm mt-1">
                    {lang === 'ar' ? t('settings.arabic') : t('settings.english')}
                  </p>
                </div>
                <button
                  onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                  className="p-2 rounded-lg bg-secondary border border-border text-text-muted hover:text-primary transition-colors"
                >
                  <FiGlobe size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-border rounded-lg text-text font-mono text-sm hover:border-primary/30 transition-all"
            >
              <FiUser size={14} />
              {t('settings.profile')}
              <FiArrowRight size={14} className="text-primary" />
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary border border-border rounded-lg text-text font-mono text-sm hover:border-primary/30 transition-all"
            >
              <FiTerminal size={14} />
              {t('settings.dashboard')}
              <FiArrowRight size={14} className="text-primary" />
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
