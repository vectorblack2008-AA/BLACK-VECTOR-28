'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { updateUserProfile } from '@/lib/auth';
import toast from 'react-hot-toast';
import { FiShield, FiAlertTriangle, FiLock } from 'react-icons/fi';

export default function SeedAdminPage() {
  const { t, dir } = useT();
  const { firebaseUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [seedKey, setSeedKey] = useState('');
  const [userKey, setUserKey] = useState('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADMIN_SEED_KEY && process.env.NEXT_PUBLIC_ADMIN_SEED_KEY !== 'your_seed_key') {
      setSeedKey(process.env.NEXT_PUBLIC_ADMIN_SEED_KEY || '');
    }
  }, []);

  const handleMakeAdmin = async () => {
    if (!firebaseUser) {
      toast.error(t('admin.seed.loginRequired'));
      return;
    }
    if (userProfile?.role === 'admin') {
      toast(t('admin.seed.alreadyAdminToast'));
      return;
    }
    if (seedKey && userKey !== seedKey) {
      toast.error(t('admin.seed.invalidKey'));
      return;
    }
    if (!confirm(t('common.confirm'))) return;

    setLoading(true);
    try {
      await updateUserProfile(firebaseUser.uid, { role: 'admin' });
      await refreshProfile();
      toast.success(t('admin.seed.success'));
    } catch {
      toast.error(t('admin.seed.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16" dir={dir}>
      <div className="max-w-md mx-auto px-4">
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-accent" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">{t('admin.seed.title')}</h1>
          <p className="text-text-muted text-sm mb-6">{t('admin.seed.desc')}</p>

          {userProfile?.role === 'admin' ? (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-primary font-bold">{t('admin.seed.alreadyAdmin')}</p>
              <p className="text-text-muted text-sm mt-1">{t('admin.seed.alreadyAdminDesc')}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-6 text-sm text-yellow-400 text-right">
                <FiAlertTriangle />
                <span>{t('admin.seed.securityWarning')}</span>
              </div>
              {seedKey && (
                <div className="mb-4">
                  <input
                    type="password"
                    value={userKey}
                    onChange={(e) => setUserKey(e.target.value)}
                    placeholder={t('admin.seed.placeholder')}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text font-mono text-sm text-center outline-none focus:border-primary"
                  />
                </div>
              )}
              <button
                onClick={handleMakeAdmin}
                disabled={loading || !firebaseUser}
                className="w-full py-3 border border-accent text-accent font-bold rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
              >
                {loading ? t('admin.seed.upgrading') : !firebaseUser ? t('admin.seed.loginFirst') : t('admin.seed.upgradeBtn')}
              </button>
            </>
          )}

          {!firebaseUser && (
            <p className="text-text-muted text-sm mt-4">{t('admin.seed.loginPrompt')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
