'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/contexts/LangContext';
import { FiHome, FiBook, FiGrid, FiUsers, FiSettings, FiTerminal, FiArrowRight, FiMail, FiShield } from 'react-icons/fi';

export default function AdminSidebar() {
  const { t, dir } = useT();
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin', label: t('admin.dashboard'), icon: FiHome },
    { href: '/admin/lessons', label: t('admin.lessons'), icon: FiBook },
    { href: '/admin/categories', label: t('admin.categories'), icon: FiGrid },
    { href: '/admin/users', label: t('admin.users'), icon: FiUsers },
    { href: '/admin/messages', label: t('admin.messages'), icon: FiMail },
    { href: '/admin/settings', label: t('admin.settings'), icon: FiSettings },
    { href: '/admin/seed', label: 'Seed', icon: FiShield },
  ];

  return (
    <aside className="w-64 bg-surface border-l border-border min-h-screen p-4 hidden lg:block" dir={dir}>
      <Link href="/admin" className="flex items-center gap-2 text-primary font-bold text-lg mb-8">
        <FiTerminal />
        {t('admin.dashboard')}
      </Link>
      <nav className="space-y-1">
        {adminLinks.map((link) => {
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-surface-light'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="flex items-center gap-2 mt-8 px-4 py-3 text-text-muted hover:text-primary text-sm transition-colors"
      >
        <FiArrowRight />
        {t('admin.backToSite')}
      </Link>
    </aside>
  );
}
