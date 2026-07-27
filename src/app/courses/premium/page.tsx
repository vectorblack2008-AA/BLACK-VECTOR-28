'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useT } from '@/contexts/LangContext';
import { useLessons } from '@/contexts/LessonsContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import LessonCard from '@/components/LessonCard';
import { PREMIUM_LESSONS } from '@/lib/constants';
import { FiStar, FiShield, FiCheck } from 'react-icons/fi';

export default function PremiumCoursesPage() {
  const { t } = useT();
  const { userProfile } = useAuth();
  const { lessons: firestoreLessons } = useLessons();
  const { settings } = useSiteSettings();
  const isPremium = userProfile?.isPremium;

  const displayLessons = useMemo(() => {
    const firestorePremium = firestoreLessons
      .filter(l => l.type === 'premium')
      .map(l => ({
        id: l.id,
        title: l.titleAr || l.title,
        description: l.descriptionAr || l.description,
        icon: l.icon || '📄',
        duration: l.duration || '—',
        type: 'premium' as const,
      }));

    const constantIds = new Set(firestorePremium.map(l => l.id));
    const staticItems = PREMIUM_LESSONS
      .filter(l => !constantIds.has(l.id))
      .map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        icon: l.icon,
        duration: l.duration,
        type: 'premium' as const,
      }));

    return [...firestorePremium, ...staticItems];
  }, [firestoreLessons]);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm mb-4">
            <FiStar size={14} /> {t('premium.header.title')}
          </div>
          <h1 className="text-4xl font-bold text-text mb-4">
            <span className="text-accent">{t('premium.header.title')}</span> {t('premium.header.subtitle')}
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            {t('premium.header.desc')}
          </p>
        </motion.div>

        {!isPremium && (
          <motion.div
            className="max-w-md mx-auto mb-12 p-8 bg-gradient-to-br from-accent/5 via-surface to-accent/10 rounded-2xl border border-accent/30 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FiShield className="text-accent text-4xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-text mb-2">{t('premium.pricing.title')}</h3>
            <div className="text-4xl font-bold text-accent mb-2">{settings.currency}{settings.premiumPrice}<span className="text-lg text-text-muted">{t('premium.pricing.monthly')}</span></div>
            <ul className="text-right space-y-2 mb-6 text-sm text-text-muted">
              <li className="flex items-center gap-2"><FiCheck className="text-accent" /> {t('premium.pricing.allLessons')}</li>
              <li className="flex items-center gap-2"><FiCheck className="text-accent" /> {t('premium.pricing.updates')}</li>
              <li className="flex items-center gap-2"><FiCheck className="text-accent" /> {t('premium.pricing.support')}</li>
              <li className="flex items-center gap-2"><FiCheck className="text-accent" /> {t('premium.pricing.certificate')}</li>
            </ul>
            <Link
              href={userProfile ? '/pricing' : '/register'}
              className="block w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors"
            >
              {userProfile ? t('premium.pricing.cta') : t('premium.pricing.cta2')}
            </Link>
          </motion.div>
        )}

        {isPremium && (
          <motion.div
            className="max-w-md mx-auto mb-12 p-6 bg-primary/10 rounded-xl border border-primary/30 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FiShield className="text-primary text-3xl mx-auto mb-2" />
            <p className="text-primary font-bold">{t('premium.active.title')} {t('premium.active.desc')}</p>
          </motion.div>
        )}

        {displayLessons.length === 0 ? (
          <div className="text-center py-20 text-text-muted font-mono">
            {t('courses.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayLessons.map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <LessonCard
                  id={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  icon={lesson.icon}
                  duration={lesson.duration}
                  type="premium"
                  isCompleted={userProfile?.progress?.[lesson.id] === 'completed'}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
