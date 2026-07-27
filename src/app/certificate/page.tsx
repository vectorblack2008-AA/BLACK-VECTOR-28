'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiAward, FiDownload, FiTerminal, FiCheck, FiShield, FiStar, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { getAllQuizResults, getCertificate as getExistingCert, saveCertificate } from '@/lib/firestore';
import { getQuizData, PASS_THRESHOLD, TOTAL_LESSONS } from '@/lib/quiz-data';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';
import type { QuizResult, CertificateData } from '@/lib/types';

const allLessons = [...FREE_LESSONS, ...PREMIUM_LESSONS];

function generateCertId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BV-';
  for (let i = 0; i < 12; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export default function CertificatePage() {
  const { t, lang, dir } = useT();
  const { firebaseUser, userProfile, loading } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firebaseUser) { setLoadingData(false); return; }
    const load = async () => {
      try {
        const existing = await getExistingCert(firebaseUser.uid);
        if (existing) {
          setCertificate(existing);
        }
        const results = await getAllQuizResults(firebaseUser.uid);
        setQuizResults(results);
      } catch { /* ignore */ }
      finally { setLoadingData(false); }
    };
    load();
  }, [firebaseUser]);

  useEffect(() => {
    if (!certificate && !loadingData && firebaseUser && quizResults.length > 0) {
      const allPassed = quizResults.length >= TOTAL_LESSONS &&
        quizResults.every((r) => r.passed);
      const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((s, r) => s + r.percentage, 0) / quizResults.length)
        : 0;

      if (allPassed && !certificate) {
        const cert: CertificateData = {
          userId: firebaseUser.uid,
          displayName: userProfile?.displayName || 'User',
          issuedAt: Date.now(),
          averageScore: avgScore,
          lessonsPassed: quizResults.length,
          totalLessons: TOTAL_LESSONS,
          certificateId: generateCertId(),
        };
        saveCertificate(firebaseUser.uid, cert).catch(() => {});
        setCertificate(cert);
      }
    }
  }, [quizResults, loadingData, firebaseUser, certificate, userProfile]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return (
      <div className="pt-28 pb-16 text-center">
        <div className="terminal-window max-w-md mx-auto">
          <div className="p-8">
            <FiTerminal className="text-primary text-5xl mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text font-mono">{t('dash.loginRequired')}</h2>
            <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-primary text-secondary font-bold rounded-lg font-mono text-sm">
              $ {t('dash.loginBtn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedQuizzes = quizResults.length;
  const passedQuizzes = quizResults.filter((r) => r.passed).length;
  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((s, r) => s + r.percentage, 0) / quizResults.length)
    : 0;
  const allCompleted = completedQuizzes >= TOTAL_LESSONS;
  const allPassed = allCompleted && quizResults.every((r) => r.passed);

  // Build lesson statuses
  const lessonStatuses = allLessons.map((l) => {
    const result = quizResults.find((r) => r.lessonId === l.id);
    return {
      lesson: l,
      result,
      attempted: !!result,
      passed: result?.passed || false,
      score: result?.percentage || 0,
    };
  });

  const handlePrint = () => {
    if (!certRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>${t('cert.title')} - ${certificate?.displayName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'JetBrains Mono', sans-serif;
            background: #0a0a0f;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .cert-container {
            max-width: 800px;
            width: 100%;
          }
          .cert {
            border: 2px solid #00ff41;
            background: linear-gradient(135deg, #0a0a0f 0%, #0d1a0d 50%, #0a0a0f 100%);
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .cert::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background:
              linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px),
              linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .cert-content { position: relative; z-index: 1; }
          .badge { font-size: 48px; margin-bottom: 10px; }
          h1 { color: #00ff41; font-size: 24px; font-family: 'JetBrains Mono', monospace; margin-bottom: 5px; }
          .subtitle { color: #8888aa; font-size: 12px; font-family: 'JetBrains Mono', monospace; margin-bottom: 30px; }
          .awarded { color: #aaaacc; font-size: 14px; margin-bottom: 10px; font-family: 'Cairo', sans-serif; }
          .name { color: #ffffff; font-size: 32px; font-weight: 700; margin-bottom: 15px; font-family: 'Cairo', sans-serif; }
          .desc { color: #aaaacc; font-size: 14px; margin-bottom: 30px; font-family: 'Cairo', sans-serif; }
          .details { display: flex; justify-content: center; gap: 40px; margin-bottom: 30px; flex-wrap: wrap; }
          .detail-item { text-align: center; }
          .detail-label { color: #8888aa; font-size: 11px; font-family: 'JetBrains Mono', monospace; }
          .detail-value { color: #00ff41; font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
          .footer { color: #555577; font-size: 10px; font-family: 'JetBrains Mono', monospace; border-top: 1px solid #1a1a2e; padding-top: 20px; }
          .footer span { color: #00ff41; }
          @media print {
            body { background: #0a0a0f; padding: 0; }
            .cert { border: 2px solid #00ff41 !important; }
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert">
            <div class="cert-content">
              <div class="badge">🏆</div>
              <h1>Black Vector</h1>
              <div class="subtitle">${t('cert.subtitle')}</div>
              <div class="awarded">${t('cert.presented')}</div>
              <div class="name">${certificate?.displayName || ''}</div>
              <div class="desc">${t('cert.completed')}</div>
              <div class="details">
                <div class="detail-item">
                  <div class="detail-label">${t('cert.score')}</div>
                  <div class="detail-value">${certificate?.averageScore || 0}%</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">${t('cert.issued')}</div>
                  <div class="detail-value">${certificate ? new Date(certificate.issuedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">${t('cert.id')}</div>
                  <div class="detail-value" style="font-size:12px">${certificate?.certificateId || ''}</div>
                </div>
              </div>
              <div class="footer">
                <span>Black Vector</span> — ${t('footer.copyright')} ${new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="pt-28 pb-16" dir={dir}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Header */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ cat /certificate/status</span>
              <FiAward size={12} className="text-primary" />
            </div>
            <div className="p-5">
              <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
                <FiAward className="text-accent" /> {t('cert.progress')}
              </h1>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="terminal-window">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-text font-mono">{completedQuizzes}/{TOTAL_LESSONS}</div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('cert.quizzes')}</div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <div className={`text-2xl font-bold font-mono ${passedQuizzes === TOTAL_LESSONS ? 'text-primary' : 'text-text'}`}>
                  {passedQuizzes}/{TOTAL_LESSONS}
                </div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('cert.passed')}</div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <div className={`text-2xl font-bold font-mono ${avgScore >= PASS_THRESHOLD ? 'text-primary' : 'text-text'}`}>
                  {avgScore}%
                </div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('cert.score')}</div>
              </div>
            </div>
            <div className="terminal-window">
              <div className="p-4 text-center">
                <div className={`text-2xl font-bold font-mono ${allPassed ? 'text-primary' : 'text-text-muted'}`}>
                  {allPassed ? <FiCheck size={24} className="mx-auto" /> : <FiX size={24} className="mx-auto" />}
                </div>
                <div className="text-xs text-text-muted font-mono mt-0.5">{t('cert.title')}</div>
              </div>
            </div>
          </div>

          {/* Lesson Quiz Statuses */}
          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">{'>'} ls -la /quizzes/</span>
            </div>
            <div className="p-5">
              <div className="space-y-2">
                {lessonStatuses.map((s) => (
                  <div key={s.lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{s.lesson.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-text font-mono truncate">
                          {lang === 'ar' ? s.lesson.title : s.lesson.titleEn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {s.attempted ? (
                        <>
                          <span className={`text-xs font-mono ${s.passed ? 'text-primary' : 'text-red-400'}`}>
                            {s.score}%
                          </span>
                          {s.passed ? (
                            <FiCheck className="text-primary" size={14} />
                          ) : (
                            <FiX className="text-red-400" size={14} />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-text-muted font-mono">{t('cert.locked')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Display */}
          {certificate && (
            <div className="terminal-window border-primary/30">
              <div className="terminal-window-header justify-center border-primary/20">
                <FiAward className="text-primary" size={16} />
                <span className="text-primary text-sm font-mono">{t('cert.title')}</span>
              </div>
              <div className="p-6" ref={certRef}>
                <div className="max-w-2xl mx-auto border border-primary/30 rounded-xl bg-gradient-to-br from-surface via-[#0d1a0d]/50 to-surface p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00ff41 1px, transparent 1px), linear-gradient(#00ff41 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }} />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">🏆</div>
                    <h1 className="text-2xl font-bold text-primary font-mono">Black Vector</h1>
                    <p className="text-text-muted text-xs font-mono mt-1">{t('cert.subtitle')}</p>
                    <div className="w-16 h-0.5 bg-primary/30 mx-auto my-5" />
                    <p className="text-text-muted text-sm font-mono mb-2">{t('cert.presented')}</p>
                    <h2 className="text-3xl font-bold text-text mb-3">{certificate.displayName}</h2>
                    <p className="text-text-muted text-sm font-mono mb-6">{t('cert.completed')}</p>
                    <div className="flex justify-center gap-8 mb-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-text-muted text-xs font-mono">{t('cert.score')}</p>
                        <p className="text-primary text-lg font-bold font-mono">{certificate.averageScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted text-xs font-mono">{t('cert.issued')}</p>
                        <p className="text-text text-sm font-mono">
                          {new Date(certificate.issuedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-muted text-xs font-mono">{t('cert.id')}</p>
                        <p className="text-text text-xs font-mono">{certificate.certificateId}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-text-muted text-xs font-mono">
                        <span className="text-primary">Black Vector</span> — {t('footer.copyright')} {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <button onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm">
                    <FiDownload /> {t('cert.download')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Not Earned Yet */}
          {!certificate && (
            <div className="terminal-window">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
                  <FiAward className="text-accent" size={28} />
                </div>
                <h2 className="text-xl font-bold text-text font-mono mb-2">{t('cert.notEarned')}</h2>
                <p className="text-text-muted text-sm font-mono mb-6 max-w-md mx-auto">{t('cert.notEarnedDesc')}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm">
                    <FiTerminal /> {t('profile.courses')}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/profile"
              className="px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-xs">
              {t('profile.title')}
            </Link>
            <Link href="/courses"
              className="px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-xs">
              {t('nav.courses')}
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
