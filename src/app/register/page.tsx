'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, signInWithGoogle, validatePassword, getPasswordStrengthColor, getPasswordStrengthLabel, getAuthErrorMessage } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import toast from 'react-hot-toast';
import { FiTerminal, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiLoader } from 'react-icons/fi';

export default function RegisterPage() {
  const { t, lang } = useT();
  const { firebaseUser, initialized } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const passwordStrength = password ? validatePassword(password) : null;
  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (initialized && firebaseUser) {
      router.replace('/dashboard');
    }
  }, [initialized, firebaseUser, router]);

  const validate = (): boolean => {
    let valid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    if (!displayName.trim()) {
      setNameError(t('register.nameRequired'));
      valid = false;
    }

    if (!email.trim()) {
      setEmailError(t('register.emailRequired'));
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('register.emailInvalid'));
      valid = false;
    }

    if (!password) {
      setPasswordError(t('register.passwordRequired'));
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(t('register.passwordLength'));
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError(t('register.confirmRequired'));
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError(t('register.passwordsNotMatch'));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser(email, password, displayName);
      toast.success(t('register.created'));
      router.push('/dashboard');
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code || '', t);
      toast.error(msg);
      if (err?.code?.includes('email')) {
        setEmailError(msg);
      } else if (err?.code?.includes('password') || err?.code?.includes('weak')) {
        setPasswordError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success(t('register.googleSuccess'));
      router.push('/dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        toast.error(getAuthErrorMessage('auth/popup-blocked', t));
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        toast.error(getAuthErrorMessage(err?.code || '', t));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <FiLoader className="text-primary text-3xl animate-spin" />
      </div>
    );
  }

  if (firebaseUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 py-12">
      <div className="w-full max-w-md">
        <div className="terminal-window mb-8 text-center">
          <div className="terminal-window-header justify-center">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto ml-auto">{'>'} auth/register.sh</span>
          </div>
          <div className="p-6">
            <FiTerminal className="text-primary text-4xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-text font-mono">{t('auth.register.title')}</h1>
            <p className="text-text-muted text-sm mt-1 font-mono">{t('auth.register.subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="terminal-window w-full mb-6 cursor-pointer disabled:opacity-50 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-center gap-3 p-4">
            {googleLoading ? (
              <FiLoader className="animate-spin text-gray-500" size={20} />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-800 dark:text-gray-200 font-mono text-sm font-semibold">
              {googleLoading
                ? t('register.connecting')
                : t('auth.register.google')}
            </span>
          </div>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-3 text-text-muted font-mono">{t('auth.or')}</span>
          </div>
        </div>

        <div className="terminal-window">
          <div className="terminal-window-header">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto">user_setup.sh</span>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-text text-sm mb-2 font-mono">
                <FiUser size={14} className="text-primary" />
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setNameError(''); }}
                placeholder={t('register.namePlaceholder')}
                className={`w-full bg-secondary border rounded-lg py-3 px-4 text-text font-mono text-sm focus:outline-none transition-colors ${
                  nameError ? 'border-red-500' : 'border-border focus:border-primary'
                }`}
              />
              {nameError && <p className="text-red-500 text-xs mt-1 font-mono">✗ {nameError}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-text text-sm mb-2 font-mono">
                <FiMail size={14} className="text-primary" />
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="user@example.com"
                className={`w-full bg-secondary border rounded-lg py-3 px-4 text-text font-mono text-sm focus:outline-none transition-colors ${
                  emailError ? 'border-red-500' : 'border-border focus:border-primary'
                }`}
                dir="ltr"
              />
              {emailError && <p className="text-red-500 text-xs mt-1 font-mono">✗ {emailError}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-text text-sm mb-2 font-mono">
                <FiLock size={14} className="text-primary" />
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="••••••••"
                  className={`w-full bg-secondary border rounded-lg py-3 px-4 text-text font-mono text-sm focus:outline-none transition-colors ${
                    passwordError ? 'border-red-500' : 'border-border focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1 font-mono">✗ {passwordError}</p>}

              {/* Password Strength Meter */}
              {password && passwordStrength && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor: level <= passwordStrength.score
                            ? getPasswordStrengthColor(passwordStrength.score)
                            : 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono" style={{ color: getPasswordStrengthColor(passwordStrength.score) }}>
                    {getPasswordStrengthLabel(passwordStrength.score, t)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-text text-sm mb-2 font-mono">
                <FiLock size={14} className="text-primary" />
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(''); }}
                  placeholder="••••••••"
                  className={`w-full bg-secondary border rounded-lg py-3 px-4 text-text font-mono text-sm focus:outline-none transition-colors ${
                    confirmError ? 'border-red-500' : confirmPassword && passwordsMatch ? 'border-green-500/50' : 'border-border focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {confirmError && <p className="text-red-500 text-xs mt-1 font-mono">✗ {confirmError}</p>}
              {confirmPassword && passwordsMatch && !confirmError && (
                <p className="text-green-500 text-xs mt-1 font-mono">✓ {t('auth.passwordsMatch')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-sm"
            >
              {loading ? (
                <><FiLoader className="animate-spin" /> {t('auth.register.loading')}</>
              ) : (
                <><FiUserPlus /> {t('auth.register.button')}</>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-text-muted text-sm font-mono">
            {t('auth.register.haveAccount')}{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              {t('auth.register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
