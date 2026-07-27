'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiShield, FiStar, FiTrash2, FiTerminal, FiChevronRight, FiChevronLeft, FiAward } from 'react-icons/fi';
import { useT } from '@/contexts/LangContext';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TimeStamp from '@/components/TimeStamp';
import type { User } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { t } = useT();
  const [users, setUsers] = useState<(User & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'premium' | 'free'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch { toast.error(t('admin.users.loadError')); }
    finally { setLoading(false); }
  };

  const togglePremium = async (userId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isPremium: !current });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: !current } : u));
      toast.success(t('admin.users.premiumUpdated'));
    } catch { toast.error(t('admin.users.updateError')); }
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: current ? 'user' : 'admin' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: current ? 'user' : 'admin' } : u));
      toast.success(t('admin.users.roleUpdated'));
    } catch { toast.error(t('admin.users.updateError')); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(t('admin.users.deleteSuccess'));
    } catch { toast.error(t('admin.users.deleteError')); }
  };

  const filtered = users
    .filter(u => filter === 'all' || (filter === 'admin' && u.role === 'admin') || (filter === 'premium' && u.isPremium) || (filter === 'free' && !u.isPremium && u.role !== 'admin'))
    .filter(u => !search || (u.displayName || '').includes(search) || u.email.includes(search));

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div>
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# cat /etc/passwd</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
                <FiUsers className="text-blue-400" /> {t('admin.users.title')}
              </h1>
              <p className="text-text-muted text-sm font-mono mt-1">
                <span className="text-primary">$</span> wc -l /etc/passwd
                <span className="text-text-muted"> &rarr; {users.length} {users.length === 1 ? t('admin.users.userCount') : t('admin.users.userCountPlural')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {(['all', 'admin', 'premium', 'free'] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  filter === f ? 'bg-primary text-secondary' : 'bg-surface-lighter text-text-muted hover:text-text'
                }`}>
                {f === 'all' ? t('admin.users.all') : f === 'admin' ? t('admin.users.admin') : f === 'premium' ? t('admin.categories.premium') : t('admin.categories.free')}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('admin.users.search')}
              className="w-full bg-surface-lighter border border-border rounded-lg pr-9 pl-3 py-1.5 text-text text-xs font-mono focus:border-primary focus:outline-none" />
          </div>
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="terminal-window text-center py-12">
          <FiUsers className="text-text-muted text-4xl mx-auto mb-3" />
          <p className="text-text-muted font-mono text-sm">{t('admin.users.empty')}</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-lighter">
              <tr>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.name')}</th>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.email')}</th>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.role')}</th>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.plan')}</th>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.lastSeen')}</th>
                <th className="text-right p-4 text-text text-sm font-mono">{t('admin.users.progress')}</th>
                <th className="text-left p-4 text-text text-sm font-mono">{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user.id} className="border-t border-border hover:bg-surface-light transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? <FiShield className="text-accent shrink-0" size={14} /> : user.isPremium ? <FiStar className="text-primary shrink-0" size={14} /> : <FiUsers className="text-text-muted shrink-0" size={14} />}
                      <span className="text-text font-mono text-sm">{user.displayName || '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted text-xs font-mono">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-surface-lighter text-text-muted'
                    }`}>
                      {user.role === 'admin' ? t('admin.users.admin') : t('admin.users.user')}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isPremium ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary">{t('admin.users.subscribed')}</span>
                    ) : <span className="text-text-muted text-xs font-mono">—</span>}
                  </td>
                  <td className="p-4"><TimeStamp ts={user.lastLoginAt} /></td>
                  <td className="p-4 text-text-muted text-xs font-mono">
                    {user.progress ? Object.values(user.progress).filter(v => v === 'completed').length : 0} {t('admin.users.lessonCount')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-start">
                      {!user.isPremium ? (
                        <button onClick={() => togglePremium(user.id, false)} className="p-2 text-primary hover:bg-primary/5 rounded transition-colors" title={t('admin.users.activatePlan')}>
                          <FiStar size={15} />
                        </button>
                      ) : (
                        <button onClick={() => togglePremium(user.id, true)} className="p-2 text-yellow-400 hover:bg-yellow-400/5 rounded transition-colors" title={t('admin.users.cancelPlan')}>
                          <FiAward size={15} />
                        </button>
                      )}
                      {user.role === 'admin' ? (
                        <button onClick={() => toggleAdmin(user.id, true)} className="p-2 text-accent hover:bg-accent/5 rounded transition-colors" title={t('admin.users.removeAdmin')}>
                          <FiShield size={15} />
                        </button>
                      ) : (
                        <button onClick={() => toggleAdmin(user.id, false)} className="p-2 text-text-muted hover:text-accent hover:bg-accent/5 rounded transition-colors" title={t('admin users.makeAdmin')}>
                          <FiAward size={15} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/5 rounded transition-colors" title={t('common.delete')}>
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:border-primary/30 disabled:opacity-30 transition-colors">
            <FiChevronRight size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-mono transition-colors ${
                page === p ? 'bg-primary text-secondary' : 'bg-surface border border-border text-text-muted hover:text-text'
              }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:border-primary/30 disabled:opacity-30 transition-colors">
            <FiChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
