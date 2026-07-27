'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useT } from '@/contexts/LangContext';

export default function HeadUpdater() {
  const { settings } = useSiteSettings();
  const { t, lang } = useT();

  useEffect(() => {
    if (!settings) return;
    const name = lang === 'ar' ? settings.siteNameAr || settings.siteName : settings.siteName;
    const desc = lang === 'ar' ? settings.descriptionAr || settings.description : settings.description;

    document.title = `${name} - ${t('nav.home')}`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    let metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (!metaOgTitle) {
      metaOgTitle = document.createElement('meta');
      metaOgTitle.setAttribute('property', 'og:title');
      document.head.appendChild(metaOgTitle);
    }
    metaOgTitle.setAttribute('content', name);

    if (settings.logoUrl) {
      let linkIcon = document.querySelector('link[rel="icon"]');
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.setAttribute('rel', 'icon');
        document.head.appendChild(linkIcon);
      }
      linkIcon.setAttribute('href', settings.logoUrl);
    }
  }, [settings, t, lang]);

  return null;
}
