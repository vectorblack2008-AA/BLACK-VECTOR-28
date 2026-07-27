'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, loading, isAdmin, initialized } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!loading && initialized) {
      if (!firebaseUser) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
      else setChecked(true);
    }
  }, [loading, initialized, firebaseUser, isAdmin, router]);

  if (loading || !initialized || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="terminal-window max-w-sm">
          <div className="terminal-window-header">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
            <span className="text-text-muted text-xs font-mono mr-auto">bv@admin:~$</span>
          </div>
          <div className="p-8 text-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-muted font-mono text-sm">loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex pt-16 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
