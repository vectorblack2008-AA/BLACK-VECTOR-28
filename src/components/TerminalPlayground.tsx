'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { executeCommand, getInitialFS, type FileNode } from '@/lib/terminal-engine';
import { useT } from '@/contexts/LangContext';
import { FiTerminal, FiRefreshCw, FiTrash2, FiInfo } from 'react-icons/fi';

interface HistoryEntry {
  input: string;
  output: string;
  error?: boolean;
}

export default function TerminalPlayground() {
  const { lang, t } = useT();
  const [cwd, setCwd] = useState('/home/user');
  const [fs, setFs] = useState<FileNode>(() => getInitialFS());
  const [history, setHistory] = useState<{ input: string; output: string; error?: boolean }[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const welcomeMessage = t('terminal.welcome');

  useEffect(() => {
    if (!history.length) {
      setHistory([{ input: '', output: welcomeMessage }]);
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
      setCommandHistory(prev => [...prev, trimmed]);
      return;
    }

    if (result.cwd) setCwd(result.cwd);
    if (result.fs) setFs(result.fs);

    setHistory(prev => [...prev, {
      input: trimmed,
      output: result.output,
      error: result.error,
    }]);
    setCommandHistory(prev => [...prev, trimmed]);
    setCurrentInput('');
    setHistoryIndex(-1);
  }, [fs, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIdx = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIdx);
        setCurrentInput(commandHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIdx = historyIndex + 1;
        if (newIdx >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIdx);
          setCurrentInput(commandHistory[newIdx]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const resetTerminal = useCallback(() => {
    setFs(getInitialFS());
    setCwd('/home/user');
    setHistory([{ input: '', output: welcomeMessage }]);
    setCurrentInput('');
    setCommandHistory([]);
    setHistoryIndex(-1);
  }, [welcomeMessage]);

  const promptStr = `user@bv:${cwd}$ `;

  return (
    <div
      className="terminal-window font-mono"
      dir="ltr"
      onClick={focusInput}
    >
      <div className="terminal-window-header">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="text-text-muted text-xs mr-auto">bv@terminal:~</span>
        <span className="flex items-center gap-1">
          <button
            onClick={resetTerminal}
            className="text-text-muted hover:text-primary transition-colors p-1"
            title={t('playground.reset')}
          >
            <FiRefreshCw size={12} />
          </button>
          <button
            onClick={() => setHistory([])}
            className="text-text-muted hover:text-primary transition-colors p-1"
            title={t('playground.clear')}
          >
            <FiTrash2 size={12} />
          </button>
          <FiTerminal size={12} className="text-primary ml-1" />
        </span>
      </div>
      <div
        ref={terminalRef}
        className="p-3 h-[500px] overflow-y-auto bg-[#0d1117] text-sm leading-relaxed cursor-text"
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
          {isFocused && (
            <span className="w-2 h-5 bg-primary animate-pulse ml-0.5 shrink-0" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-secondary/50">
        <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
          <FiInfo size={10} />
          {t('terminal.history')}
        </span>
        <span className="text-[10px] text-text-muted font-mono">
          {t('terminal.typeHelp')}
        </span>
      </div>
    </div>
  );
}
