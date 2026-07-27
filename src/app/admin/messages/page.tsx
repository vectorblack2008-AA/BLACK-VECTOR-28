'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare, FiMail, FiTrash2, FiCheck, FiSend, FiTerminal, FiClock, FiUser, FiChevronRight } from 'react-icons/fi';
import { getContactMessages } from '@/lib/firestore';
import { useT } from '@/contexts/LangContext';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ContactMessage } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminMessagesPage() {
  const { t } = useT();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch { toast.error(t('admin.messages.loadError')); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (msg: ContactMessage) => {
    try {
      await updateDoc(doc(db, 'messages', msg.id!), { read: true });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      if (selected?.id === msg.id) setSelected({ ...selected, read: true });
      toast.success(t('admin.messages.markRead'));
    } catch { toast.error(t('admin.messages.updateError')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success(t('admin.messages.deleteSuccess'));
    } catch { toast.error(t('admin.messages.deleteError')); }
  };

  if (loading) return <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div>
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# cat /var/mail/inbox</span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
            <FiMail className="text-yellow-400" /> {t('admin.messages.title')}
            {messages.filter(m => !m.read).length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded font-mono">
                +{messages.filter(m => !m.read).length} {t('admin.messages.new')}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {messages.length === 0 ? (
            <div className="terminal-window text-center py-12">
              <FiMessageSquare className="text-text-muted text-3xl mx-auto mb-3" />
              <p className="text-text-muted text-sm font-mono">{t('admin.messages.empty')}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} onClick={() => setSelected(msg)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selected?.id === msg.id
                      ? 'border-primary bg-primary/5'
                      : msg.read ? 'border-border bg-surface hover:bg-surface-light' : 'border-primary/30 bg-primary/5'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    <span className="text-sm text-text font-mono truncate flex-1">{msg.name}</span>
                    <span className="text-[10px] text-text-muted font-mono shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-text-muted font-mono truncate">{msg.subject || '(no subject)'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text font-mono mb-1">{selected.name}</h3>
                  <p className="text-text-muted text-sm font-mono">{selected.email}</p>
                  {selected.subject && <p className="text-text text-sm font-mono mt-2">{selected.subject}</p>}
                </div>
                <span className="text-xs text-text-muted font-mono">{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <p className="text-text text-sm font-mono leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="flex items-center gap-2">
                {!selected.read && (
                  <button onClick={() => handleMarkRead(selected)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-mono text-xs rounded-lg hover:bg-primary/20 transition-colors">
                    <FiCheck size={12} /> {t('admin.messages.markRead')}
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 text-red-400 font-mono text-xs rounded-lg hover:bg-red-400/20 transition-colors">
                  <FiTrash2 size={12} /> {t('admin.messages.delete')}
                </button>
                <a href={`mailto:${selected.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent font-mono text-xs rounded-lg hover:bg-accent/20 transition-colors">
                  <FiSend size={12} /> {t('admin.messages.reply')}
                </a>
              </div>
            </div>
          ) : (
            <div className="terminal-window text-center py-20">
              <FiMail className="text-text-muted text-4xl mx-auto mb-3" />
              <p className="text-text-muted font-mono text-sm">{t('admin.messages.select')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
