'use client';

import Link from 'next/link';
import { FiClock, FiLock, FiUnlock, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { useT } from '@/contexts/LangContext';

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  type: 'free' | 'premium';
  isCompleted?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

export default function LessonCard({ id, title, description, icon, duration, type, isCompleted, isFavorite, onToggleFavorite }: LessonCardProps) {
  const { t } = useT();

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(e, id);
  };

  return (
    <div className={`group relative block rounded-xl border transition-all duration-300 overflow-hidden
      ${type === 'free'
        ? 'bg-surface border-border hover:border-primary/50 hover:glow'
        : 'bg-surface border-border hover:border-accent/50'
      }`}
    >
      {/* Terminal-style header bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-lighter border-b border-border">
        <span className={`w-2.5 h-2.5 rounded-full ${type === 'free' ? 'bg-green-500' : 'bg-accent'}`} />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-text-muted text-xs font-mono mr-auto flex items-center gap-1">
          {type === 'free' ? <FiUnlock size={10} /> : <FiLock size={10} />}
          {type === 'free' ? t('lessonCard.free') : t('lessonCard.premium')}
        </span>
        {onToggleFavorite && (
          <button onClick={handleFav} className="p-0.5 hover:scale-110 transition-transform" title={isFavorite ? t('fav.remove') : t('fav.add')}>
            <FiHeart size={12} className={isFavorite ? 'text-red-400 fill-red-400' : 'text-text-muted'} />
          </button>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 text-primary text-xs font-mono">
            <FiCheckCircle size={10} /> {t('lessonCard.completed')}
          </span>
        )}
      </div>

      <Link href={`/lessons/${id}`} className="block">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{icon}</span>
            <span className={`font-mono text-xs px-2 py-1 rounded border
              ${type === 'free' ? 'text-primary bg-primary/10 border-primary/20' : 'text-accent bg-accent/10 border-accent/20'}`}
            >
              {type === 'free' ? t('lessonCard.freeTag') : t('lessonCard.premiumTag')}
            </span>
          </div>
          <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors font-mono">{title}</h3>
          <p className="text-text-muted text-sm mb-4 line-clamp-2 font-mono leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
            <FiClock size={12} />
            <span>{duration}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
