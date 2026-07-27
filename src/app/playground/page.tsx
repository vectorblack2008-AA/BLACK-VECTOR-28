'use client';

import { useT } from '@/contexts/LangContext';
import TerminalPlayground from '@/components/TerminalPlayground';
import { FiTerminal, FiFolder, FiFile, FiInfo } from 'react-icons/fi';

export default function PlaygroundPage() {
  const { t, lang, dir } = useT();

  const initialFiles = [
    { name: 'Documents/', type: 'dir' },
    { name: 'Documents/project/', type: 'dir' },
    { name: 'Documents/project/index.html', type: 'file' },
    { name: 'Documents/project/style.css', type: 'file' },
    { name: 'Documents/project/script.js', type: 'file' },
    { name: 'Documents/notes.txt', type: 'file' },
    { name: 'Documents/todo.md', type: 'file' },
    { name: 'Downloads/', type: 'dir' },
    { name: 'Downloads/linux-guide.pdf', type: 'file' },
    { name: 'Desktop/', type: 'dir' },
    { name: 'Desktop/readme.md', type: 'file' },
    { name: 'practice.sh', type: 'file' },
    { name: 'secret.txt', type: 'file' },
  ];

  return (
    <div className="pt-24 pb-16" dir={dir}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FiTerminal className="text-primary text-xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text font-mono">{t('playground.title')}</h1>
            <p className="text-text-muted text-sm font-mono">{t('playground.desc')}</p>
          </div>
        </div>

        <div className="terminal-window mb-6">
          <div className="terminal-window-header">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto">{'>'} ls -la /home/user</span>
          </div>
          <div className="p-4">
            <p className="text-text-muted text-sm mb-3 flex items-center gap-2 font-mono">
              <FiInfo size={14} className="text-primary" />
              {t('playground.help')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {initialFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono text-text hover:text-primary transition-colors">
                  {f.type === 'dir' ? (
                    <FiFolder size={12} className="text-accent shrink-0" />
                  ) : (
                    <FiFile size={12} className="text-text-muted shrink-0" />
                  )}
                  <span className={f.type === 'dir' ? 'text-accent' : 'text-text-muted'}>{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TerminalPlayground />
      </div>
    </div>
  );
}
