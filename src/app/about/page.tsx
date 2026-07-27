'use client';

import { motion } from 'framer-motion';
import { useT } from '@/contexts/LangContext';
import { FiTerminal, FiTarget, FiEye, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  const { t } = useT();
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiTerminal className="text-primary text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-text mb-4">{t('about.title')} <span className="text-primary">{t('about.titleHighlight')}</span></h1>
          <p className="text-text-muted max-w-2xl mx-auto leading-relaxed">
            {t('about.desc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {[
            { icon: FiTarget, title: t('about.mission.title'), desc: t('about.mission.desc') },
            { icon: FiEye, title: t('about.vision.title'), desc: t('about.vision.desc') },
            { icon: FiHeart, title: t('about.values.title'), desc: t('about.values.desc') },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-6 bg-surface rounded-xl border border-border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <item.icon className="text-primary text-3xl mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
              <p className="text-text-muted text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-surface rounded-xl border border-border p-8 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-text mb-4">{t('about.story.title')}</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t('about.story.p1')}
          </p>
          <p className="text-text-muted leading-relaxed">
            {t('about.story.p2')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
