'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LangContext';
import { FiBook, FiShield, FiArrowLeft, FiStar } from 'react-icons/fi';

export default function CoursesPage() {
  const { t, lang } = useT();
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-text mb-4">{t('courses.title')}</h1>
          <p className="text-text-muted max-w-xl mx-auto">
            {t('courses.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/courses/free">
            <motion.div
              className="p-8 bg-surface rounded-xl border border-border hover:border-primary/50 transition-all hover:glow group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <FiBook className="text-primary text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-2 group-hover:text-primary transition-colors">{t('courses.free.title')}</h2>
              <p className="text-text-muted mb-4">{t('courses.free.desc')}</p>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-center gap-2">✓ {t('course.feature1')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature2')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature3')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature4')}</li>
                <li className="flex items-center gap-2">✓ HTML & CSS</li>
              </ul>
              <span className="inline-flex items-center gap-2 mt-6 text-primary font-semibold">
                {t('courses.free.cta')} <FiArrowLeft />
              </span>
            </motion.div>
          </Link>

          <Link href="/courses/premium">
            <motion.div
              className="p-8 bg-gradient-to-br from-surface to-surface-light rounded-xl border border-accent/30 hover:border-accent transition-all group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 bg-accent/20 rounded-full text-accent text-xs">
                <FiStar size={12} /> {t('courses.premium.badge')}
              </div>
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <FiShield className="text-accent text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-2 group-hover:text-accent transition-colors">{t('courses.premium.title')}</h2>
              <p className="text-text-muted mb-4">{t('courses.premium.desc')}</p>
              <ul className="space-y-2 text-sm text-text-muted">
                <li className="flex items-center gap-2">✓ {t('course.feature5')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature6')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature7')}</li>
                <li className="flex items-center gap-2">✓ {t('course.feature8')}</li>
                <li className="flex items-center gap-2">✓ JavaScript & Python</li>
              </ul>
              <span className="inline-flex items-center gap-2 mt-6 text-accent font-semibold">
                {t('courses.premium.cta')} <FiArrowLeft />
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
