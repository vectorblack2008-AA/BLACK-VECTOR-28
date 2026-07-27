'use client';

import Link from 'next/link';
import { FiTerminal, FiGithub, FiYoutube, FiTwitter, FiFacebook, FiHeart, FiInstagram, FiSend } from 'react-icons/fi';
import { useT } from '@/contexts/LangContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function Footer() {
  const { t, lang } = useT();
  const { settings } = useSiteSettings();
  const siteName = settings ? (lang === 'ar' ? settings.siteNameAr : settings.siteName) : 'Black Vector';
  const siteAbbr = settings ? (lang === 'ar' ? settings.siteAbbrAr || settings.siteAbbr : settings.siteAbbr) : 'BV';
  const siteDesc = settings ? (lang === 'ar' ? settings.descriptionAr || settings.description : settings.description) : '';
  return (
    <footer className="bg-surface border-t border-border mt-20">
      {/* ASCII art divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <pre className="text-center text-[0.5rem] leading-tight text-border font-mono select-none">
{`╔══════════════════════════════════════════════════════════╗
║  ██████   ██████  ██████      ████████ ██    ██ ██████   ║
║  ██   ██ ██    ██ ██   ██        ██    ██    ██ ██   ██  ║
║  ██████  ██    ██ ██████         ██    ██    ██ ██████   ║
║  ██   ██ ██    ██ ██   ██        ██    ██    ██ ██   ██  ║
║  ██████   ██████  ██████         ██     ██████  ██████   ║
╚══════════════════════════════════════════════════════════╝`}
        </pre>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-primary font-bold text-xl mb-4 font-mono inline-block">
              &gt; B.V
            </Link>
            <p className="text-text-muted text-sm leading-relaxed font-mono">
              $ cat /etc/bv/description
              <br />
              <span className="text-primary">{siteDesc || t('footer.brand')}</span>
            </p>
          </div>

          <div>
            <h3 className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
              <FiTerminal size={12} /> $ ls courses/
            </h3>
            <ul className="space-y-2">
              <li><Link href="/courses/free" className="text-text-muted hover:text-primary text-sm transition-colors font-mono flex items-center gap-2"><span className="text-primary">├──</span> free/</Link></li>
              <li><Link href="/courses/premium" className="text-text-muted hover:text-primary text-sm transition-colors font-mono flex items-center gap-2"><span className="text-primary">├──</span> premium/</Link></li>
              <li><Link href="/pricing" className="text-text-muted hover:text-primary text-sm transition-colors font-mono flex items-center gap-2"><span className="text-primary">└──</span> pricing/</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
              <FiTerminal size={12} /> $ ls support/
            </h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-text-muted hover:text-primary text-sm transition-colors font-mono flex items-center gap-2"><span className="text-primary">├──</span> about.md</Link></li>
              <li><Link href="/contact" className="text-text-muted hover:text-primary text-sm transition-colors font-mono flex items-center gap-2"><span className="text-primary">└──</span> contact.md</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-mono text-sm mb-4 flex items-center gap-2">
              <FiTerminal size={12} /> $ cat /etc/social
            </h3>
            <div className="flex gap-3 flex-wrap">
              {settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" title="YouTube"><FiYoutube size={20} /></a>
              )}
              {settings?.socialGithub && (
                <a href={settings.socialGithub} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" title="GitHub"><FiGithub size={20} /></a>
              )}
              {settings?.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" title="X (Twitter)"><FiTwitter size={20} /></a>
              )}
              {!settings?.socialGithub && !settings?.socialTwitter && !settings?.socialYoutube && (
                <span className="text-text-muted text-xs font-mono">{t('footer.noSocial')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm font-mono">
            <span className="text-primary">$</span> echo &quot;© {new Date().getFullYear()} {siteName} - {t('footer.rights')}. Made with <FiHeart size={10} className="inline text-accent" /> for the Linux community&quot;
          </p>
          <div className="mt-2">
            <span className="text-primary text-xs font-mono">B.V@terminal:~$</span>
            <span className="text-text-muted text-xs font-mono"> _ — — — — — — — — — — — — — — — _</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
