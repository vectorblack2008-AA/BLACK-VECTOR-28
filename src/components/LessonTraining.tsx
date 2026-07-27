'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { executeCommand, getInitialFS, type FileNode } from '@/lib/terminal-engine';
import { useT } from '@/contexts/LangContext';
import { FiTerminal, FiRefreshCw, FiTrash2, FiCheckCircle, FiHelpCircle } from 'react-icons/fi';

interface TrainingStep {
  instruction: string;
  instructionEn: string;
  hint: string;
  hintEn: string;
  expectedCmd?: string;
}

interface LessonTrainingProps {
  steps: TrainingStep[];
  lessonId?: string;
}

export default function LessonTraining({ steps, lessonId }: LessonTrainingProps) {
  const { lang, t } = useT();
  const [fs, setFs] = useState<FileNode>(() => getInitialFS());
  const [history, setHistory] = useState<{ input: string; output: string; error?: boolean }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const welcomeMsg = t('training.welcome');

  useEffect(() => {
    if (!history.length) {
      setHistory([{ input: '', output: welcomeMsg }]);
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const result = executeCommand(trimmed, lang, fs);

    if (result.output === '[[clear]]') {
      setHistory([]);
      setCurrentInput('');
      return;
    }

    if (result.fs) setFs(result.fs);

    setHistory(prev => [...prev, {
      input: trimmed,
      output: result.output,
      error: result.error,
    }]);
    setCurrentInput('');
  }, [fs, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const completeStep = (idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    if (idx < steps.length - 1) {
      setActiveStep(idx + 1);
      setShowHint(false);
    }
  };

  const resetTraining = useCallback(() => {
    setFs(getInitialFS());
    setHistory([{ input: '', output: welcomeMsg }]);
    setCurrentInput('');
    setCompletedSteps(new Set());
    setActiveStep(0);
    setShowHint(false);
  }, [welcomeMsg]);

  const promptStr = 'user@training:~$ ';

  return (
    <div className="terminal-window font-mono mt-4" dir="ltr">
      <div className="terminal-window-header">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="text-text-muted text-xs mr-auto">bv@training:~/lesson-{lessonId || 'practice'}</span>
        <span className="flex items-center gap-1">
          <button onClick={resetTraining} className="text-text-muted hover:text-primary transition-colors p-1" title={t('training.reset')}> 
            <FiRefreshCw size={12} />
          </button>
          <button onClick={() => setHistory([])} className="text-text-muted hover:text-primary transition-colors p-1" title={t('training.clear')}> 
            <FiTrash2 size={12} />
          </button>
          <FiTerminal size={12} className="text-primary ml-1" />
        </span>
      </div>

      <div className="bg-primary/5 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex items-center gap-1 text-xs font-bold text-text">
            <FiTerminal size={12} className="text-primary" />
            {t('training.header')} ({completedSteps.size}/{steps.length})
          </span>
        </div>
        <div className="flex gap-1 mb-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveStep(idx); setShowHint(false); }}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                completedSteps.has(idx)
                  ? 'bg-primary'
                  : idx === activeStep
                    ? 'bg-primary/50'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Active step instruction */}
        <div className="space-y-1">
          <p className="text-sm text-text font-semibold">
            {completedSteps.has(activeStep) && (
              <FiCheckCircle className="inline text-primary mr-1.5" size={14} />
            )}
            {lang === 'ar' ? steps[activeStep]?.instruction : steps[activeStep]?.instructionEn}
          </p>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition-colors"
          >
            <FiHelpCircle size={11} />
            {showHint ? t('training.hideHint') : t('training.showHint')}
          </button>
          {showHint && (
            <p className="text-[11px] text-accent leading-relaxed">
              {lang === 'ar' ? steps[activeStep]?.hint : steps[activeStep]?.hintEn}
            </p>
          )}
        </div>

        {!completedSteps.has(activeStep) && (
          <button
            onClick={() => completeStep(activeStep)}
            className="mt-2 text-xs text-primary hover:text-primary-dark transition-colors font-semibold"
          >
            {t('training.skipNext')}
          </button>
        )}
      </div>

      <div
        ref={terminalRef}
        className="p-3 h-[300px] overflow-y-auto bg-[#0d1117] text-sm leading-relaxed cursor-text"
        onClick={focusInput}
      >
        {history.map((entry, i) => (
          <div key={i}>
            {entry.input && (
              <div className="flex items-start whitespace-pre-wrap">
                <span className="text-primary shrink-0">{promptStr}</span>
                <span className="text-gray-200 break-all">{entry.input}</span>
              </div>
            )}
            {entry.output && (
              <pre className={`whitespace-pre-wrap text-xs leading-relaxed mb-2 ${
                entry.error ? 'text-red-400' : 'text-gray-400'
              }`}>
                {entry.output}
              </pre>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-primary shrink-0 whitespace-pre">{promptStr}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="w-2 h-5 bg-primary animate-pulse ml-0.5 shrink-0" />
        </div>
      </div>

      {completedSteps.size === steps.length && (
        <div className="px-4 py-3 bg-primary/5 border-t border-border">
          <p className="text-primary text-sm font-semibold flex items-center gap-2">
            <FiCheckCircle />
            {t('training.done')}
          </p>
        </div>
      )}
    </div>
  );
}
