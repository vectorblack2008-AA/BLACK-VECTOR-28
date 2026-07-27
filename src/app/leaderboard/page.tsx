'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiTerminal, FiAward, FiStar, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { getLeaderboard } from '@/lib/firestore';

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const { t, lang, dir } = useT();
  const { userProfile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="pt-28 pb-16" dir={dir}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div className="terminal-window">
            <div className="terminal-window-header">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
              <span className="text-text-muted text-xs font-mono mr-auto">$ ./leaderboard.sh --sort=score</span>
              <FiStar size={12} className="text-yellow-400" />
            </div>
            <div className="p-5">
              <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
                <FiTrendingUp className="text-primary" /> {t('leader.title')}
              </h1>
              <p className="text-text-muted text-sm mt-1 font-mono">{t('leader.subtitle')}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="terminal-window text-center p-8">
              <FiTerminal className="text-primary text-4xl mx-auto mb-3" />
              <p className="text-text-muted font-mono text-sm">{t('leader.empty')}</p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary border-b border-border text-xs text-text-muted font-mono">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">{t('leader.user')}</div>
                <div className="col-span-2 text-center">{t('leader.lessons')}</div>
                <div className="col-span-2 text-center">{t('leader.achievements')}</div>
                <div className="col-span-2 text-center">{t('cert.title')}</div>
              </div>

              {users.map((u, i) => {
                const isMe = userProfile?.id === u.id;
                const rank = i + 1;
                return (
                  <div key={u.id} className={`grid grid-cols-12 gap-4 px-4 md:px-6 py-4 items-center border-b border-border/50 last:border-0 transition-colors ${isMe ? 'bg-primary/5' : 'hover:bg-surface-light'}`}>
                    {/* Rank */}
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      {rank <= 3 ? (
                        <FiStar className={`${RANK_COLORS[rank - 1]} text-lg`} />
                      ) : (
                        <span className="text-text-muted font-mono text-sm">{rank}</span>
                      )}
                    </div>

                    {/* User */}
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-border">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <FiTerminal className="text-primary text-xs" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text font-mono truncate flex items-center gap-1.5">
                          {u.displayName}
                          {u.isPremium && <FiStar size={10} className="text-accent shrink-0" />}
                          {isMe && <span className="text-xs text-primary">({t('leader.me')})</span>}
                        </p>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="col-span-2 md:col-span-2 text-center">
                      <span className="text-sm text-text font-mono">{u.completedCount}</span>
                    </div>

                    {/* Achievements */}
                    <div className="col-span-2 md:col-span-2 text-center">
                      <span className="text-sm text-text font-mono">{u.achievementsCount}</span>
                    </div>

                    {/* Certificate */}
                    <div className="col-span-2 md:col-span-2 text-center">
                      {u.certificateEarned ? (
                        <FiAward className="text-primary mx-auto" size={16} />
                      ) : (
                        <span className="text-text-muted text-xs font-mono">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/profile" className="px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light font-mono text-xs">{t('profile.title')}</Link>
            <Link href="/courses" className="px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light font-mono text-xs">{t('nav.courses')}</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
