'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LangContext';
import { useLessons } from '@/contexts/LessonsContext';
import { useAuth } from '@/contexts/AuthContext';
import LessonCard from '@/components/LessonCard';
import { FREE_LESSONS } from '@/lib/constants';

export default function FreeCoursesPage() {
  const { t, lang } = useT();
  const { userProfile } = useAuth();
  const { lessons: firestoreLessons } = useLessons();

  const displayLessons = useMemo(() => {
    const firestoreFree = firestoreLessons
      .filter(l => l.type === 'free')
      .map(l => ({
        id: l.id,
        title: l.titleAr || l.title,
        description: l.descriptionAr || l.description,
        icon: l.icon || '📄',
        duration: l.duration || '—',
        type: 'free' as const,
      }));

    const constantIds = new Set(firestoreFree.map(l => l.id));
    const staticItems = FREE_LESSONS
      .filter(l => !constantIds.has(l.id))
      .map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        icon: l.icon,
        duration: l.duration,
        type: 'free' as const,
      }));

    return [...firestoreFree, ...staticItems];
  }, [firestoreLessons]);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-text mb-4">
            <span className="text-primary">{t('free.title')}</span>
          </h1>
          <p className="text-text-muted max-w-xl mx-auto">
            {t('free.desc')}
          </p>
        </motion.div>

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
                  type="free"
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
