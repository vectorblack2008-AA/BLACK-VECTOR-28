'use client';

import { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiTerminal, FiImage, FiRotateCcw } from 'react-icons/fi';
import { resetSiteSettings } from '@/lib/firestore';
import { useSiteSettings, defaultSettings } from '@/contexts/SiteSettingsContext';
import { useT } from '@/contexts/LangContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { t } = useT();
  const { settings, loading: contextLoading, updateSettings } = useSiteSettings();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form, setForm] = useState({
    siteName: '', siteNameAr: '', siteAbbr: '', siteAbbrAr: '',
    logoUrl: '', description: '', descriptionAr: '',
    primaryColor: '#00ff41', premiumPrice: 19, currency: 'USD',
    supportEmail: '', footerText: '', footerTextAr: '',
    socialGithub: '', socialTwitter: '', socialYoutube: '',
  });

  useEffect(() => {
    if (settings) {
      setForm(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success(t('admin.settings.saveSuccess'));
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error(t('admin.settings.saveError') + (err instanceof Error ? `: ${err.message}` : ''));
    }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm(t('admin.settings.resetConfirm'))) return;
    setResetting(true);
    try {
      await resetSiteSettings(defaultSettings);
      setForm(prev => ({ ...prev, ...defaultSettings }));
      toast.success(t('admin.settings.resetSuccess'));
    } catch (err) {
      console.error('Reset settings error:', err);
      toast.error(t('admin.settings.resetError'));
    }
    finally { setResetting(false); }
  };

  if (contextLoading) return <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  const enLabel = (key: string) => key + ' (EN)';
  const arLabel = (key: string) => key + ' (AR)';

  return (
    <div>
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# nano /etc/bv-config</span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
            <FiSettings className="text-primary" /> {t('admin.settings.title')}
          </h1>
        </div>
      </div>

      <div className="space-y-6">
        <Section title={t('admin.settings.branding')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={enLabel(t('admin.settings.siteName'))}>
              <input type="text" value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label={arLabel(t('admin.settings.siteName'))}>
              <input type="text" value={form.siteNameAr} onChange={e => setForm({...form, siteNameAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
            </Field>
            <Field label={enLabel(t('admin.settings.abbr'))}>
              <input type="text" value={form.siteAbbr} onChange={e => setForm({...form, siteAbbr: e.target.value})} placeholder="B.V"
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label={arLabel(t('admin.settings.abbr'))}>
              <input type="text" value={form.siteAbbrAr} onChange={e => setForm({...form, siteAbbrAr: e.target.value})} placeholder="ب.ف"
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
            </Field>
            <div className="md:col-span-2">
              <Field label={enLabel(t('admin.settings.description'))}>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label={arLabel(t('admin.settings.description'))}>
                <textarea rows={3} value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})}
                  className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
              </Field>
            </div>
          </div>
        </Section>

        <Section title={t('admin.settings.logo')}>
          <div className="flex items-center gap-4">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center"><FiImage className="text-text-muted" size={20} /></div>
            )}
            <input type="text" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} placeholder={t('admin.settings.imageUrl')}
              className="flex-1 bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
          </div>
        </Section>

        <Section title={t('admin.settings.contact')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('admin.settings.supportEmail')}>
              <input type="email" value={form.supportEmail} onChange={e => setForm({...form, supportEmail: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label={enLabel(t('admin.settings.footer'))}>
              <input type="text" value={form.footerText} onChange={e => setForm({...form, footerText: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label={arLabel(t('admin.settings.footer'))}>
              <input type="text" value={form.footerTextAr} onChange={e => setForm({...form, footerTextAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
            </Field>
          </div>
        </Section>

        <Section title={t('admin.settings.social')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="GitHub">
              <input type="text" value={form.socialGithub} onChange={e => setForm({...form, socialGithub: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label="Twitter / X">
              <input type="text" value={form.socialTwitter} onChange={e => setForm({...form, socialTwitter: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
            <Field label="YouTube">
              <input type="text" value={form.socialYoutube} onChange={e => setForm({...form, socialYoutube: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
          </div>
        </Section>

        <Section title={t('admin.settings.primaryColor')}>
          <div className="flex items-center gap-4">
            <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})}
              className="w-12 h-12 rounded-lg cursor-pointer bg-secondary border border-border" />
            <input type="text" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})}
              className="w-32 bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            <Field label={t('admin.settings.price')}>
              <input type="number" value={form.premiumPrice} onChange={e => setForm({...form, premiumPrice: parseInt(e.target.value) || 0})}
                className="w-24 bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
            </Field>
            <Field label={t('admin.settings.currency')}>
              <input type="text" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className="w-24 bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
            </Field>
          </div>
        </Section>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-mono">
            <FiSave /> {saving ? t('common.loading') : t('admin.settings.saveBtn')}
          </button>
          <button onClick={handleReset} disabled={resetting}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 font-mono border border-red-500/20">
            <FiRotateCcw /> {resetting ? t('common.loading') : t('admin.settings.resetBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      <h3 className="font-bold text-text font-mono text-sm flex items-center gap-2"><FiTerminal className="text-primary" /> {title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-text-muted text-xs mb-1 font-mono">{label}</label>
      {children}
    </div>
  );
}
