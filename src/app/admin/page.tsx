'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { useLessons } from '@/contexts/LessonsContext';
import { useCategories } from '@/contexts/CategoriesContext';
import Link from 'next/link';
import { FiBook, FiGrid, FiUsers, FiSettings, FiTerminal, FiMail, FiTrendingUp, FiShield, FiStar, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { getContactMessages } from '@/lib/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminDashboard() {
  const { t, lang } = useT();
  const { userProfile } = useAuth();
  const { lessons } = useLessons();
  const { categories } = useCategories();
  const [stats, setStats] = useState({ users: 0, admins: 0, premium: 0, messages: 0, unread: 0, todayUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, messages, qMessages] = await Promise.all([
          getDocs(collection(db, 'users')),
          getContactMessages(),
          getDocs(query(collection(db, 'messages'), where('read', '==', false))),
        ]);
        const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const today = Date.now() - 86400000;
        setStats({
          users: users.length,
          admins: users.filter((u: any) => u.role === 'admin').length,
          premium: users.filter((u: any) => u.isPremium).length,
          messages: messages.length,
          unread: qMessages.size,
          todayUsers: users.filter((u: any) => (u.createdAt || 0) > today).length,
        });
        setRecentUsers(users.slice(0, 5));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const freeCount = lessons.filter(l => l.type === 'free').length;
  const premiumCount = lessons.filter(l => l.type === 'premium').length;

  const statCards = [
    { icon: FiBook, label: `${t('admin.statLessons')}`, value: String(lessons.length), sub: `${freeCount} ${t('admin.statFree')} · ${premiumCount} ${t('admin.statPaid')}`, href: '/admin/lessons', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: FiGrid, label: `${t('admin.statCategories')}`, value: String(categories.length), sub: '', href: '/admin/categories', color: 'text-accent', bg: 'bg-accent/10' },
    { icon: FiUsers, label: `${t('admin.statUsers')}`, value: String(stats.users), sub: `${stats.admins} ${t('admin.statAdminLabel')} · ${stats.premium} ${t('admin.statPremiumLabel')}`, href: '/admin/users', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: FiMessageSquare, label: `${t('admin.statMessages')}`, value: String(stats.messages), sub: stats.unread > 0 ? `${stats.unread} ${t('admin.statUnread')}` : '', href: '/admin/messages', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: FiTrendingUp, label: `${t('admin.statToday')}`, value: String(stats.todayUsers), sub: '', href: '/admin/users', color: 'text-green-400', bg: 'bg-green-400/10' },
    { icon: FiStar, label: `${t('admin.statSubscribers')}`, value: String(stats.premium), sub: `${stats.users > 0 ? Math.round(stats.premium / stats.users * 100) : 0}%`, href: '/admin/users', color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="terminal-window mb-8">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# whoami</span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-3">
            <FiShield className="text-accent" />
            {t('admin.dashboard')}
            <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-mono">admin</span>
          </h1>
          <p className="text-text-muted text-sm font-mono mt-1">
            <span className="text-primary">$</span> echo "{t('admin.welcome')} {userProfile?.displayName} — {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}"
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((item, i) => (
            <Link key={i} href={item.href} className="terminal-window hover:border-primary/30 transition-all group">
              <div className="p-4">
                <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <item.icon className={`${item.color} text-lg`} />
                </div>
                <div className="text-2xl font-bold text-text font-mono">{item.value}</div>
                <div className="text-text-muted text-xs font-mono mt-0.5">{item.label}</div>
                {item.sub && <div className="text-text-muted text-[10px] font-mono mt-1 opacity-70">{item.sub}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="terminal-window">
          <div className="terminal-window-header">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto">$ ls /admin/quick-actions/</span>
          </div>
          <div className="p-5">
            <h2 className="text-lg font-bold text-text font-mono mb-4 flex items-center gap-2">
              <FiTerminal className="text-primary" size={16} />
              {t('admin.quickActions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/admin/lessons/new" className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors">
                <FiPlus className="text-primary shrink-0" />
                <div>
                  <div className="text-primary font-mono text-sm font-bold">{t('admin.addLesson')}</div>
                  <div className="text-text-muted text-xs font-mono">{t('admin.addLessonDesc')}</div>
                </div>
              </Link>
              <Link href="/admin/categories" className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20 hover:bg-accent/20 transition-colors">
                <FiGrid className="text-accent shrink-0" />
                <div>
                  <div className="text-accent font-mono text-sm font-bold">{t('admin.manageCategories')}</div>
                  <div className="text-text-muted text-xs font-mono">{t('admin.manageCategoriesDesc')}</div>
                </div>
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 p-3 bg-blue-400/10 rounded-lg border border-blue-400/20 hover:bg-blue-400/20 transition-colors">
                <FiUsers className="text-blue-400 shrink-0" />
                <div>
                  <div className="text-blue-400 font-mono text-sm font-bold">{t('admin.manageUsers')}</div>
                  <div className="text-text-muted text-xs font-mono">{t('admin.manageUsersDesc')}</div>
                </div>
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 p-3 bg-surface-lighter rounded-lg border border-border hover:bg-surface-light transition-colors">
                <FiSettings className="text-text shrink-0" />
                <div>
                  <div className="text-text font-mono text-sm font-bold">{t('admin.siteSettings')}</div>
                  <div className="text-text-muted text-xs font-mono">{t('admin.siteSettingsDesc')}</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="terminal-window">
          <div className="terminal-window-header">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto">$ tail -5 /var/log/users.log</span>
          </div>
          <div className="p-5">
            <h2 className="text-lg font-bold text-text font-mono mb-4 flex items-center gap-2">
              <FiUsers className="text-blue-400" size={16} />
              {t('admin.recentUsers')}
            </h2>
            {recentUsers.length === 0 ? (
              <p className="text-text-muted text-sm font-mono">{t('admin.noUsers')}</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-light transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      {u.role === 'admin' ? (
                        <FiShield className="text-accent shrink-0" size={14} />
                      ) : u.isPremium ? (
                        <FiStar className="text-primary shrink-0" size={14} />
                      ) : (
                        <FiUsers className="text-text-muted shrink-0" size={14} />
                      )}
                      <span className="text-text text-sm font-mono truncate">{u.displayName || u.email}</span>
                    </div>
                    <span className="text-text-muted text-[10px] font-mono shrink-0">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/admin/users" className="inline-flex items-center gap-1 mt-3 text-xs text-primary font-mono hover:underline">
              $ cat /etc/passwd | head -n {stats.users}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
