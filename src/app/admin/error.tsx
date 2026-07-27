'use client';

import { useT } from '@/contexts/LangContext';
import { FiTerminal } from 'react-icons/fi';

export default function AdminErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="terminal-window max-w-md w-full">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# cat /var/log/error.log</span>
        </div>
        <div className="p-6 text-center">
          <div className="text-red-400 text-4xl mb-4 font-mono">error</div>
          <h1 className="text-xl font-bold text-text font-mono mb-2">{t('admin.error.title')}</h1>
          <p className="text-text-muted text-sm font-mono mb-6">{error.message || t('admin.error.desc')}</p>
          <button onClick={reset} className="px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono">
            {t('admin.error.restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
