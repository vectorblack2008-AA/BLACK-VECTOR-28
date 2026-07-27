'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword, getAuthErrorMessage } from '@/lib/auth';
import { useT } from '@/contexts/LangContext';
import toast from 'react-hot-toast';
import { FiTerminal, FiMail, FiSend, FiArrowLeft, FiLoader } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const { t, lang } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('forgot.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err?.code || '', t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 py-12">
      <div className="w-full max-w-md">
        <div className="terminal-window mb-8 text-center">
          <div className="terminal-window-header justify-center">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto ml-auto">{'>'} auth/reset.sh</span>
          </div>
          <div className="p-6">
            <FiTerminal className="text-primary text-4xl mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-text font-mono">{t('auth.forgot.title')}</h1>
            <p className="text-text-muted text-sm mt-1 font-mono">{t('auth.forgot.subtitle')}</p>
          </div>
        </div>

        {sent ? (
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">mail_sent.ok</span>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <FiSend className="text-green-500 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-text font-mono">{t('auth.forgot.sentTitle')}</h2>
              <p className="text-text-muted text-sm font-mono">
                {t('auth.forgot.sentTo')}{' '}
                <span className="text-primary font-semibold" dir="ltr">{email}</span>
              </p>
              <p className="text-text-muted text-xs font-mono">{t('auth.forgot.checkSpam')}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-4 py-3 px-6 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-all font-mono text-sm"
              >
                <FiArrowLeft /> {t('auth.forgot.backToLogin')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="terminal-window">
              <div className="terminal-window-header">
                <span className="terminal-dot terminal-dot-red" />
                <span className="terminal-dot terminal-dot-yellow" />
                <span className="terminal-dot terminal-dot-green" />
                <span className="text-text-muted text-xs font-mono mr-auto">reset_request.sh</span>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-text text-sm mb-2 font-mono">
                    <FiMail size={14} className="text-primary" />
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-sm"
                >
                  {loading ? (
                    <><FiLoader className="animate-spin" /> {t('auth.forgot.sending')}</>
                  ) : (
                    <><FiSend /> {t('auth.forgot.button')}</>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center mt-6">
              <Link href="/login" className="text-text-muted hover:text-primary transition-colors text-sm font-mono inline-flex items-center gap-2">
                <FiArrowLeft /> {t('auth.forgot.backToLogin')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
