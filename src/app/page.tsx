'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiTerminal, FiBook, FiUsers, FiShield, FiArrowLeft, FiArrowRight, FiStar, FiChevronDown, FiCode, FiCommand } from 'react-icons/fi';
import TerminalDemo from '@/components/TerminalDemo';
import LessonCard from '@/components/LessonCard';
import { useT } from '@/contexts/LangContext';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';

const terminalCommands = [
  { cmd: 'ls -la', output: 'total 64\ndrwxr-xr-x  12 root root  4096 May 30 10:00 .\ndrwxr-xr-x   5 root root  4096 May 30 09:50 ..\n-rw-r--r--   1 root root   220 May 30 09:50 .bashrc' },
  { cmd: 'whoami', output: 'lirne_user' },
  { cmd: 'echo "اهلاً بك في عالم لينكس!"', output: 'اهلاً بك في عالم لينكس!' },
];

const heroLines = [
  '> Initializing Black Vector environment...',
  '> Loading kernel modules...',
  '> System ready.',
  '> Welcome to the terminal.',
];

const stats = [
  { icon: FiBook, value: '50+', labelKey: 'stats.lessons' },
  { icon: FiUsers, value: '1000+', labelKey: 'stats.users' },
  { icon: FiTerminal, value: '200+', labelKey: 'stats.commands' },
  { icon: FiShield, value: '6', labelKey: 'stats.sections' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

function CodeIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary text-lg font-mono">
      {children}
    </span>
  );
}

export default function HomePage() {
  const { t, lang } = useT();

  const isRtl = lang === 'ar';
  const ArrowIcon = lang === 'ar' ? FiArrowLeft : FiArrowRight;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.05),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)'
        }} />

        {/* Floating code particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['{ }', '</>', '$_', 'sudo', 'apt', './run', 'ls', 'cd', '|', '&&', '#!/bin', 'chmod', 'grep', 'ssh', 'root@'].map((text, i) => (
            <motion.span
              key={i}
              className="absolute font-mono text-xs text-primary/10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.15, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              {text}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Typing animation header */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-6 font-mono"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="status-dot online" />
            <FiTerminal size={14} />
            {t('hero.badge')}
          </motion.div>

          <motion.h1 className="text-4xl md:text-7xl font-bold mb-6 font-mono leading-tight"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <span className="text-text">{t('hero.title1')}</span>{' '}
            <span className="text-primary glow-text">{t('hero.title2')}</span><br />
            <span className="text-text">{t('hero.title3')}</span>{' '}
            <span className="text-accent">{t('hero.title4')}</span>
          </motion.h1>

          <motion.p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-mono"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            {'>'} {t('hero.desc')}
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <Link href="/courses/free" className="group px-8 py-4 bg-primary text-secondary font-bold rounded-xl hover:bg-primary-dark transition-all hover:scale-105 flex items-center gap-2 font-mono">
              <span className="group-hover:animate-pulse">$</span> {t('hero.cta.free')} <ArrowIcon />
            </Link>
            <Link href="/pricing" className="group px-8 py-4 border border-accent text-accent font-bold rounded-xl hover:bg-accent/10 transition-all hover:scale-105 flex items-center gap-2 font-mono">
              <span className="text-accent">#</span> {t('hero.cta.premium')}
            </Link>
          </motion.div>

          {/* Terminal window with boot sequence */}
          <motion.div className="max-w-2xl mx-auto terminal-window"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">bv@terminal:~$</span>
              <FiTerminal size={12} className="text-primary" />
            </div>
            <div className="p-5 font-mono text-left" dir="ltr">
              {heroLines.map((line, i) => (
                <motion.div
                  key={i}
                  className="text-text-muted text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.4, duration: 0.3 }}
                >
                  {line}
                </motion.div>
              ))}
              <motion.div
                className="flex items-center gap-2 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.3 }}
              >
                <span className="text-primary">bv@terminal:~$</span>
                <span className="text-white">./start-learning.sh</span>
                <span className="w-2 h-5 bg-primary animate-pulse" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div className="mt-12 text-text-muted animate-bounce" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>
            <FiChevronDown size={24} className="mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} className="terminal-window text-center hover:border-primary/30 transition-all"
                {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <div className="p-6">
                  <stat.icon className="text-primary text-3xl mx-auto mb-3" />
                  <div className="text-3xl font-bold text-text mb-1 font-mono">{stat.value}</div>
                  <div className="text-text-muted text-sm font-mono">{'>'} {t(stat.labelKey)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-4 font-mono">
              <FiCode size={14} /> {'</>'} FREE
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 font-mono">
              <span className="text-primary">{t('section.free.title')}</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto font-mono">{t('section.free.desc')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FREE_LESSONS.map((lesson, i) => (
              <motion.div key={lesson.id} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <LessonCard {...lesson} type="free" />
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-8" {...fadeUp}>
            <Link href="/courses/free" className="group inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-mono">
              <span className="group-hover:animate-pulse">$</span> {t('section.free.viewAll')} <ArrowIcon />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/3 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm mb-4 font-mono">
              <FiStar size={14} /> {'</>'} PREMIUM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 font-mono"><span className="text-accent">{t('section.premium.title1')}</span> {t('section.premium.title2')}</h2>
            <p className="text-text-muted max-w-xl mx-auto font-mono">{t('section.premium.desc')}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_LESSONS.map((lesson, i) => (
              <motion.div key={lesson.id} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <LessonCard {...lesson} type="premium" />
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-8" {...fadeUp}>
            <Link href="/pricing" className="group inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all hover:scale-105 font-mono">
              <span className="group-hover:animate-pulse">#</span> {t('section.premium.cta')} <ArrowIcon />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm mb-4 font-mono">
              <FiCommand size={14} /> {'</>'} FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 font-mono">{t('features.title')} <span className="text-primary">{t('features.titleHighlight')}</span>?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('feature1.title'), desc: t('feature1.desc'), icon: '🌍', cmd: 'cat /etc/locale' },
              { title: t('feature2.title'), desc: t('feature2.desc'), icon: '📈', cmd: 'man --beginner' },
              { title: t('feature3.title'), desc: t('feature3.desc'), icon: '⚡', cmd: './practice.sh' },
              { title: t('feature4.title'), desc: t('feature4.desc'), icon: '🔄', cmd: 'apt update && upgrade' },
              { title: t('feature5.title'), desc: t('feature5.desc'), icon: '🎯', cmd: 'tail -f /var/log/help' },
              { title: t('feature6.title'), desc: t('feature6.desc'), icon: '🏆', cmd: 'echo "Certified!"' },
            ].map((feature, i) => (
              <motion.div key={i} className="terminal-window" {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="terminal-window-header">
                  <span className="terminal-dot terminal-dot-red" />
                  <span className="terminal-dot terminal-dot-yellow" />
                  <span className="terminal-dot terminal-dot-green" />
                  <span className="text-text-muted text-xs font-mono mr-auto">{feature.cmd}</span>
                </div>
                <div className="p-5">
                  <span className="text-3xl mb-3 block">{feature.icon}</span>
                  <h3 className="text-lg font-bold text-text mb-2 font-mono">{feature.title}</h3>
                  <p className="text-text-muted text-sm font-mono leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div className="max-w-3xl mx-auto px-4 text-center" {...fadeUp}>
          <div className="terminal-window p-0">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">install.sh</span>
            </div>
            <div className="p-10 bg-gradient-to-br from-primary/5 via-surface to-accent/5">
              <motion.div
                className="font-mono text-sm text-text-muted mb-6 text-left" dir="ltr"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="text-primary">$ cat welcome-message.txt</div>
                <div className="text-white mt-1">&quot;{t('cta.title')} <span className="text-primary">{t('cta.titleHighlight')}</span>&quot;</div>
                <div className="text-text-muted mt-1">{t('cta.desc')}</div>
              </motion.div>
              <Link href="/register" className="group inline-flex items-center gap-2 px-10 py-4 bg-primary text-secondary font-bold rounded-xl text-lg hover:bg-primary-dark transition-all hover:scale-105 font-mono">
                <span className="group-hover:animate-pulse">$</span> {t('cta.button')} <ArrowIcon />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
