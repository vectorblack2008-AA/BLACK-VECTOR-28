'use client';

import { useState, useEffect, useRef } from 'react';
import { FiTerminal } from 'react-icons/fi';
import { useT } from '@/contexts/LangContext';

interface TerminalDemoProps {
  commands: { cmd: string; output: string }[];
  autoRun?: boolean;
}

export default function TerminalDemo({ commands, autoRun = false }: TerminalDemoProps) {
  const { lang, t } = useT();
  const [visibleLines, setVisibleLines] = useState<{ cmd: string; output: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCmd, setCurrentCmd] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!autoRun) return;
    if (indexRef.current >= commands.length) return;

    setIsTyping(true);
    const cmd = commands[indexRef.current].cmd;
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      charIndex++;
      setCurrentCmd(cmd.slice(0, charIndex));
      if (charIndex >= cmd.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowOutput(true);
          setTimeout(() => {
            setVisibleLines(prev => [...prev, { cmd, output: commands[indexRef.current].output }]);
            setCurrentCmd('');
            setShowOutput(false);
            indexRef.current++;
            setIsTyping(false);
          }, 800);
        }, 300);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [autoRun, commands]);

  return (
    <div className="terminal-window font-mono text-sm" dir="ltr">
      <div className="terminal-window-header">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="text-text-muted text-xs mr-auto">bv@terminal:~$</span>
        <FiTerminal size={12} className="text-primary" />
      </div>
      <div className="p-4 space-y-2">
        {visibleLines.map((line, i) => (
          <div key={i}>
            <div className="flex items-start">
              <span className="text-primary mr-2 shrink-0">$</span>
              <span className="text-white break-all">{line.cmd}</span>
            </div>
            <pre className="text-text-muted mt-1 whitespace-pre-wrap text-xs leading-relaxed ml-5">{line.output}</pre>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center">
            <span className="text-primary mr-2">$</span>
            <span className="text-white">{currentCmd}</span>
            <span className="w-2 h-5 bg-primary ml-0.5 animate-pulse" />
          </div>
        )}
        {showOutput && !isTyping && (
          <div className="flex items-center gap-2 text-text-muted ml-5">
            <span className="w-2 h-5 bg-primary animate-pulse" />
            <span className="text-xs">{t('terminal.executing')}</span>
          </div>
        )}
        {!autoRun && (
          <button
            onClick={() => {
              if (indexRef.current < commands.length) {
                const cmd = commands[indexRef.current];
                setVisibleLines(prev => [...prev, cmd]);
                indexRef.current++;
              }
            }}
            className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20 transition-colors font-mono"
          >
            $ {t('terminal.run')}
          </button>
        )}
      </div>
    </div>
  );
}
