'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheck, FiStar, FiShield, FiTerminal, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import toast from 'react-hot-toast';

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly';
const YEARLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly';

function PricingPageInner() {
  const { t, lang } = useT();
  const { firebaseUser, userProfile, refreshProfile } = useAuth();
  const { settings } = useSiteSettings();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(false);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (success === 'true' && sessionId) {
      const verify = async () => {
        try {
          const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await res.json();
          if (data.success) {
            await refreshProfile();
            toast.success(t('pricing.activated'));
          } else {
            setError(true);
          }
        } catch {
          setError(true);
        } finally {
          setVerifying(false);
        }
      };
      verify();
    } else {
      setVerifying(false);
    }
  }, [success, sessionId, refreshProfile, lang]);

  const handleSubscribe = async (priceId: string) => {
    if (!firebaseUser) {
      router.push('/register');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          userEmail: firebaseUser.email,
          priceId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const stripeConfigured =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'your_stripe_pk';

  if (success === 'true') {
    return (
      <div className="pt-28 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          {verifying ? (
            <div className="terminal-window text-center p-12">
              <div className="terminal-window-header justify-center">
                <FiRefreshCw className="text-primary animate-spin" size={16} />
                <span className="text-primary text-sm font-mono">
                  {t('pricing.verifying')}
                </span>
              </div>
              <div className="py-12">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </div>
          ) : error ? (
            <div className="terminal-window text-center border-red-500/30">
              <div className="terminal-window-header justify-center border-red-500/20">
                <FiX className="text-red-400" size={16} />
                <span className="text-red-400 text-sm font-mono">
                  {t('pricing.errorShort')}
                </span>
              </div>
              <div className="p-8">
                <p className="text-text-muted mb-6">{t('pricing.verifyError')}</p>
                <Link href="/courses/premium" className="text-primary hover:underline font-mono">{t('pricing.backToPremium')}</Link>
              </div>
            </div>
          ) : (
            <div className="terminal-window text-center border-primary/30">
              <div className="terminal-window-header justify-center border-primary/20">
                <FiCheck className="text-primary" size={16} />
                <span className="text-primary text-sm font-mono">
                  {t('pricing.successShort')}
                </span>
              </div>
              <div className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <FiShield className="text-primary" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-text mb-2 font-mono">{t('pricing.success.title')}</h2>
                <p className="text-text-muted mb-6 font-mono text-sm">{t('pricing.success.desc')}</p>
                <Link
                  href="/courses/premium"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono"
                >
                  <FiTerminal /> {t('pricing.success.btn')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (canceled === 'true') {
    return (
      <div className="pt-28 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <div className="terminal-window text-center border-yellow-500/30">
            <div className="terminal-window-header justify-center border-yellow-500/20">
              <FiX className="text-yellow-400" size={16} />
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-text mb-2 font-mono">{t('pricing.canceled.title')}</h2>
              <p className="text-text-muted mb-6 font-mono text-sm">{t('pricing.canceled.desc')}</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono"
              >
                {t('pricing.canceled.btn')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-4 font-mono">
            <FiTerminal size={14} /> $ ./pricing.sh
          </div>
          <h1 className="text-4xl font-bold text-text mb-4 font-mono">{t('pricing.title')}</h1>
          <p className="text-text-muted max-w-xl mx-auto font-mono text-sm">{t('pricing.desc')}</p>
        </motion.div>

        {!stripeConfigured && (
          <motion.div className="max-w-lg mx-auto mb-10 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-yellow-400 text-sm font-mono">{t('pricing.configure')}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div className="terminal-window" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ free.sh</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-primary mb-2 font-mono text-sm">$ ls plans/</div>
              <h3 className="text-2xl font-bold text-text mb-2">{t('pricing.free.title')}</h3>
              <div className="text-4xl font-bold text-text mb-1">
                {settings.currency}{0}
                <span className="text-lg text-text-muted">/{t('pricing.month')}</span>
              </div>
              <p className="text-text-muted text-sm mb-6 font-mono">{t('pricing.free.desc')}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-primary shrink-0" /> {t('pricing.free.feature1')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-primary shrink-0" /> {t('pricing.free.feature2')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-primary shrink-0" /> {t('pricing.free.feature3')}</li>
              </ul>
              <Link
                href="/courses/free"
                className="block w-full py-3 text-center border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-sm"
              >
                {t('pricing.free.cta')}
              </Link>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div className="terminal-window border-accent/30 relative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="terminal-window-header bg-accent/5">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-accent text-xs font-mono mr-auto"># premium.sh</span>
              <div className="absolute -top-3 right-4 px-3 py-0.5 bg-accent text-secondary text-xs font-bold rounded-full font-mono">
                <FiStar size={10} className="inline mr-1" /> {t('courses.premium.badge')}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-accent mb-2 font-mono text-sm"># ./pro_setup.sh</div>
              <h3 className="text-2xl font-bold text-text mb-2">{t('pricing.pro.title')}</h3>
              <div className="text-4xl font-bold text-accent mb-1">
                {settings.currency}{settings.premiumPrice}
                <span className="text-lg text-text-muted">/{t('pricing.month')}</span>
              </div>
              <p className="text-text-muted text-sm mb-6 font-mono">{t('pricing.pro.desc')}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-accent shrink-0" /> {t('pricing.pro.feature1')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-accent shrink-0" /> {t('pricing.pro.feature2')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-accent shrink-0" /> {t('pricing.pro.feature3')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-accent shrink-0" /> {t('pricing.pro.feature4')}</li>
                <li className="flex items-center gap-2 text-sm text-text-muted"><FiCheck className="text-accent shrink-0" /> {t('pricing.pro.feature5')}</li>
              </ul>
              {userProfile?.isPremium ? (
                <Link
                  href="/courses/premium"
                  className="block w-full py-3 text-center bg-primary/10 text-primary rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors font-mono text-sm"
                >
                  {t('pricing.viewPremium')}
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(MONTHLY_PRICE_ID)}
                  disabled={loading || !stripeConfigured}
                  className="block w-full py-3 text-center bg-accent text-secondary font-bold rounded-lg hover:bg-accent/90 transition-colors font-mono text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      {t('pricing.loading')}
                    </span>
                  ) : (
                    t('pricing.pro.cta')
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="pt-28 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PricingPageInner />
    </Suspense>
  );
}
