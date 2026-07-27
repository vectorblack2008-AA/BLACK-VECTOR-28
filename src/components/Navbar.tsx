'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/contexts/LangContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { logoutUser } from '@/lib/auth';
import { FiMenu, FiX, FiTerminal, FiLogOut, FiUser, FiSun, FiMoon, FiGlobe, FiCommand, FiChevronRight, FiChevronLeft, FiAward, FiTrendingUp, FiShield } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { firebaseUser, userProfile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, setLang, dir } = useT();
  const { settings } = useSiteSettings();
  const displayName = lang === 'ar' ? settings.siteNameAr || settings.siteName : settings.siteName;

  const handleLogout = async () => {
    await logoutUser();
    setIsOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/courses', label: t('nav.courses') },
    { href: '/courses/free', label: t('nav.free') },
    { href: '/courses/premium', label: t('nav.premium') },
    { href: '/pricing', label: t('pricing.nav') },
    { href: '/leaderboard', label: t('leader.nav') },
    { href: '/playground', label: t('playground.nav') },
  ];

  const ChevronIcon = dir === 'rtl' ? FiChevronLeft : FiChevronRight;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/90 nav-blur border-b border-border" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl font-mono shrink-0">
            <span>&gt;_ B.V</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm transition-all font-mono ${
                  isActive(link.href)
                    ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5'
                    : 'text-text-muted hover:text-text hover:bg-surface-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm transition-all font-mono flex items-center gap-1 ${
                  isActive('/admin') || pathname.startsWith('/admin')
                    ? 'text-accent bg-accent/10 border border-accent/20 shadow-sm shadow-accent/5'
                    : 'text-accent/70 hover:text-accent hover:bg-accent/5'
                }`}
              >
                <FiShield size={14} />
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-light transition-colors"
              title={t('nav.theme')}
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-light transition-colors font-mono border border-transparent hover:border-border"
            >
              <FiGlobe size={12} />
              {t('nav.langSwitch')}
            </button>

            {firebaseUser && userProfile?.certificateEarned && (
              <Link
                href="/certificate"
                className="p-2 text-accent hover:bg-surface-light rounded-lg transition-colors"
                title={t('cert.title')}
              >
                <FiAward size={16} />
              </Link>
            )}
            {firebaseUser ? (
              <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'mr-2 pr-2 border-r' : 'ml-2 pl-2 border-l'} border-border`}>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-text hover:text-primary transition-colors rounded-lg hover:bg-surface-light"
                >
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-5 h-5 rounded-full ring-1 ring-primary/20" />
                  ) : (
                    <FiUser size={14} />
                  )}
                  <span className="font-mono text-xs max-w-[100px] truncate">{userProfile?.displayName || t('nav.profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-text-muted hover:text-red-400 transition-colors text-xs font-mono px-2 py-1 rounded hover:bg-red-400/5"
                >
                  <FiLogOut size={14} />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 ${dir === 'rtl' ? 'mr-2 pr-2 border-r' : 'ml-2 pl-2 border-l'} border-border`}>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors font-mono"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-primary text-secondary font-semibold rounded-lg hover:bg-primary-dark transition-colors font-mono flex items-center gap-1"
                >
                  <FiCommand size={14} />
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right controls */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text transition-colors"
              title={t('nav.theme')}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-2 text-text-muted hover:text-text transition-colors"
              title={t('nav.langSwitch')}
            >
              <FiGlobe size={18} />
            </button>
            <button
              className="p-2 text-text hover:text-primary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-surface/95 border-t border-border nav-blur max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1 font-mono" dir={dir}>
            {navLinks.map((link) => (
              <MobileLink key={link.href} href={link.href} onClick={() => setIsOpen(false)} active={isActive(link.href)} dir={dir}>
                <span className="flex items-center gap-2">
                  {link.label}
                  <ChevronIcon className="text-text-muted opacity-50" size={12} />
                </span>
              </MobileLink>
            ))}
            
            <div className="border-t border-border my-2" />
            {firebaseUser ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FiUser className="text-primary" size={16} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-text text-sm font-medium truncate">{userProfile?.displayName}</p>
                    <p className="text-text-muted text-xs truncate">{firebaseUser.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <MobileLink href="/admin" onClick={() => setIsOpen(false)} active={pathname.startsWith('/admin')} dir={dir}>
                    <span className="flex items-center gap-2"><FiShield size={14} /> {t('nav.admin')}</span>
                  </MobileLink>
                )}
                <MobileLink href="/profile" onClick={() => setIsOpen(false)} active={isActive('/profile')} dir={dir}>
                  <span className="flex items-center gap-2"><FiUser size={14} /> {t('nav.profile')}</span>
                </MobileLink>
                <MobileLink href="/certificate" onClick={() => setIsOpen(false)} active={isActive('/certificate')} dir={dir}>
                  <span className="flex items-center gap-2"><FiAward size={14} /> {t('cert.title')}</span>
                </MobileLink>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-red-400 hover:bg-red-400/5 rounded-lg transition-colors flex items-center gap-2 text-sm">
                  <FiLogOut size={14} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 pb-1">
                <Link href="/login" className="flex-1 text-center py-2.5 border border-border rounded-lg text-text hover:bg-surface-light transition-colors text-sm" onClick={() => setIsOpen(false)}>{t('nav.login')}</Link>
                <Link href="/register" className="flex-1 text-center py-2.5 bg-primary text-secondary rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm" onClick={() => setIsOpen(false)}>{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ href, onClick, children, active, dir }: { href: string; onClick: () => void; children: React.ReactNode; active?: boolean; dir: string }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-2.5 px-3 rounded-lg transition-all text-sm ${
        active ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text hover:text-primary hover:bg-surface-light'
      }`}
    >
      {children}
    </Link>
  );
}
