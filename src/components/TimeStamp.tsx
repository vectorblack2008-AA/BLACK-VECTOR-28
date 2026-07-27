'use client';

import { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';

export function formatTime(ts: number | undefined | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

interface TimeStampProps {
  ts: number | undefined | null;
  label?: string;
}

export default function TimeStamp({ ts, label }: TimeStampProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    setDisplay(formatTime(ts));
    const interval = setInterval(() => setDisplay(formatTime(ts)), 60000);
    return () => clearInterval(interval);
  }, [ts]);

  if (!display) return null;

  return (
    <span className="inline-flex items-center gap-1 text-text-muted text-[10px] font-mono" title={ts ? new Date(ts).toLocaleString() : ''}>
      <FiClock size={9} />
      {label ? `${label} ${display}` : display}
    </span>
  );
}
