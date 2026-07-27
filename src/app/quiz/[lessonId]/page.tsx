'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiCheck, FiX, FiArrowLeft, FiArrowRight, FiTerminal, FiAward, FiRefreshCw, FiBook } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { getQuizData, PASS_THRESHOLD } from '@/lib/quiz-data';
import { saveQuizResult } from '@/lib/firestore';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';
import toast from 'react-hot-toast';

const allLessons = [...FREE_LESSONS, ...PREMIUM_LESSONS];

export default function QuizPage() {
  const { t, lang, dir } = useT();
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;
  const { firebaseUser, userProfile } = useAuth();

  const quizData = getQuizData(lessonId);
  const lessonMeta = allLessons.find((l) => l.id === lessonId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!quizData || !lessonMeta) {
    return (
      <div className="pt-28 pb-16 text-center">
        <h1 className="text-2xl text-text font-mono">{t('quiz.notFound')}</h1>
        <Link href="/courses" className="mt-4 inline-block text-primary hover:underline font-mono">{t('lesson.backToCourses')}</Link>
      </div>
    );
  }

  const questions = quizData.questions;
  const totalQuestions = questions.length;
  const selectedAnswer = answers[currentQuestion];

  const handleSelect = (index: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const isAllAnswered = answers.length === totalQuestions && answers.every((a) => a !== undefined);

  const handleSubmit = async () => {
    if (!isAllAnswered) {
      toast.error(t('quiz.required'));
      return;
    }
    setSubmitted(true);

    if (!firebaseUser) return;

    setSaving(true);
    try {
      const correct = answers.filter((a, i) => a === questions[i].correct).length;
      const percentage = Math.round((correct / totalQuestions) * 100);
      await saveQuizResult(firebaseUser.uid, {
        lessonId,
        score: correct,
        total: totalQuestions,
        percentage,
        answers,
        completedAt: Date.now(),
        passed: percentage >= PASS_THRESHOLD,
      });
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setSubmitted(false);
  };

  const correctAnswers = submitted
    ? answers.filter((a, i) => a === questions[i].correct).length
    : 0;
  const percentage = submitted ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = submitted && percentage >= PASS_THRESHOLD;

  if (submitted) {
    return (
      <div className="pt-28 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <motion.div className={`terminal-window text-center ${passed ? 'border-primary/30' : 'border-red-500/30'}`}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`terminal-window-header justify-center ${passed ? '' : 'border-red-500/20'}`}>
              {passed ? (
                <FiAward className="text-primary" size={16} />
              ) : (
                <FiX className="text-red-400" size={16} />
              )}
              <span className={`text-sm font-mono ${passed ? 'text-primary' : 'text-red-400'}`}>
                {t('quiz.result')}
              </span>
            </div>
            <div className="p-8">
              {passed ? (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <FiAward className="text-primary" size={28} />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <FiX className="text-red-400" size={28} />
                </div>
              )}

              <h2 className="text-2xl font-bold text-text mb-2 font-mono">
                {percentage}%
              </h2>
              <p className="text-text-muted text-sm mb-1 font-mono">
                {correctAnswers}/{totalQuestions} {t('quiz.correct')}
              </p>

              {passed ? (
                <p className="text-primary font-mono text-sm mt-3 mb-6">{t('quiz.passed')}</p>
              ) : (
                <p className="text-red-400 font-mono text-sm mt-3 mb-6">{t('quiz.failed')}</p>
              )}

              {/* Review */}
              <div className="space-y-3 mb-6 text-right">
                {questions.map((q, i) => (
                  <div key={q.id} className={`p-3 rounded-lg text-xs font-mono border ${
                    answers[i] === q.correct
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {answers[i] === q.correct ? (
                        <FiCheck className="text-primary shrink-0" size={12} />
                      ) : (
                        <FiX className="text-red-400 shrink-0" size={12} />
                      )}
                      <span className="text-text">{lang === 'ar' ? q.question : q.questionEn}</span>
                    </div>
                    <p className="text-text-muted mt-1 mr-5">
                      {t('quiz.answerLabel')}{(lang === 'ar' ? q.options : q.optionsEn)[q.correct]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {!passed && (
                  <button onClick={handleRetry}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-sm">
                    <FiRefreshCw /> {t('quiz.retry')}
                  </button>
                )}
                <Link href={`/lessons/${lessonId}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm">
                  <FiBook /> {t('quiz.back')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="terminal-window mb-6">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ ./quiz --lesson={lessonId}</span>
              <FiTerminal size={12} className="text-primary" />
            </div>
            <div className="p-5">
              <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
                <FiBook className="text-primary" /> {lessonMeta.title} — {t('quiz.title')}
              </h1>
              <p className="text-text-muted text-sm mt-1 font-mono">{t('quiz.desc')}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((answers.filter((a) => a !== undefined).length) / totalQuestions) * 100}%` }} />
            </div>
            <span className="text-xs text-text-muted font-mono shrink-0">
              {answers.filter((a) => a !== undefined).length}/{totalQuestions}
            </span>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface rounded-xl border border-border p-6 mb-6"
            >
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono mb-4">
                <FiTerminal size={12} />
                <span>{t('quiz.question')} {currentQuestion + 1}/{totalQuestions}</span>
              </div>
              <h2 className="text-lg font-bold text-text mb-6 font-mono">
                {lang === 'ar' ? questions[currentQuestion].question : questions[currentQuestion].questionEn}
              </h2>
              <div className="space-y-3">
                {(lang === 'ar' ? questions[currentQuestion].options : questions[currentQuestion].optionsEn).map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-right p-4 rounded-lg border text-sm font-mono transition-all ${
                      selectedAnswer === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text hover:border-primary/30 hover:bg-surface-light'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        selectedAnswer === i ? 'bg-primary text-secondary' : 'bg-secondary text-text-muted'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-sm disabled:opacity-30"
            >
              {dir === 'rtl' ? <FiArrowRight /> : <FiArrowLeft />} {t('quiz.prev')}
            </button>

            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={selectedAnswer === undefined}
                className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono text-sm disabled:opacity-30"
              >
                {t('quiz.next')} {dir === 'rtl' ? <FiArrowLeft /> : <FiArrowRight />}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered || saving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm disabled:opacity-50"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" /> {t('common.loading')}</>
                ) : (
                  <><FiAward /> {t('quiz.submit')}</>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
