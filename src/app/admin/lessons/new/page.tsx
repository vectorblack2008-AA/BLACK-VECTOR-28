'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSave, FiX, FiUpload, FiTerminal, FiAlertTriangle, FiBook, FiEye, FiEyeOff } from 'react-icons/fi';
import { createLesson } from '@/lib/firestore';
import { useT } from '@/contexts/LangContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';
import { uploadVideo } from '@/lib/upload';
import toast from 'react-hot-toast';

function NewLessonForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get('preset');

  const { categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [form, setForm] = useState({
    title: '', titleAr: '', description: '', descriptionAr: '',
    content: '', contentAr: '', type: 'free' as 'free' | 'premium',
    categoryId: '', order: 0, duration: '', command: '', commandOutput: '',
    videoUrl: '', icon: '📄',
  });

  useEffect(() => {
    if (presetId) {
      const all = [...FREE_LESSONS, ...PREMIUM_LESSONS];
      const found = all.find(l => l.id === presetId);
      if (found) {
        const isPremium = found.id.startsWith('prem-') || found.id === 'free-5' || found.id === 'free-6';
        setForm({
          title: found.titleEn, titleAr: found.title, description: '', descriptionAr: '',
          content: found.descriptionEn, contentAr: found.description,
          type: isPremium ? 'premium' : 'free',
          categoryId: '', order: parseInt(presetId.split('-')[1]) || 0,
          duration: found.duration, command: '', commandOutput: '',
          videoUrl: '', icon: found.icon,
        });
      }
    }
  }, [presetId]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error(t('admin.lessons.new.videoRequired')); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadVideo(file, 'temp', (pct) => setUploadProgress(pct));
      setForm(f => ({ ...f, videoUrl: url }));
      toast.success(t('admin.lessons.new.videoSuccess'));
    } catch { toast.error(t('admin.lessons.new.videoError')); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.titleAr || !form.content) {
      toast.error(t('admin.lessons.new.formRequired'));
      return;
    }
    setSaving(true);
    try {
      await createLesson({
        ...form, order: Number(form.order) || 0,
      });
      toast.success(t('admin.lessons.new.createSuccess'));
      router.push('/admin/lessons');
    } catch { toast.error(t('admin.lessons.new.createError')); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# nano /admin/lessons/new</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <FiBook className="text-primary text-xl" />
            <div>
              <h1 className="text-2xl font-bold text-text font-mono">{presetId ? t('admin.lessons.new.clone') : t('admin.lessons.new.title')}</h1>
              <p className="text-text-muted text-sm font-mono mt-1"><span className="text-primary">$</span> touch lesson-{Date.now()}.md</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-bold text-text font-mono text-sm flex items-center gap-2"><FiTerminal className="text-primary" /> {t('admin.categories.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.titleEn')}</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.titleAr')}</label>
              <input type="text" value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.descEn')}</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.descAr')}</label>
              <input type="text" value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-bold text-text font-mono text-sm flex items-center gap-2"><FiTerminal className="text-primary" /> Content</h3>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.contentAr')}</label>
            <textarea rows={6} value={form.contentAr} onChange={e => setForm({...form, contentAr: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.contentEn')}</label>
            <textarea rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-bold text-text font-mono text-sm flex items-center gap-2"><FiTerminal className="text-primary" /> Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.type')}</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'free' | 'premium'})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm">
                <option value="free">{t('admin.categories.free')}</option>
                <option value="premium">{t('admin.categories.premium')}</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.category')}</label>
              <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm">
                <option value="">{t('admin.lessons.new.noCategory')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.order')}</label>
              <input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.duration')}</label>
              <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder={t('admin.lessons.new.durationPlaceholder')}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.command')}</label>
              <input type="text" value={form.command} onChange={e => setForm({...form, command: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.commandOutput')}</label>
              <input type="text" value={form.commandOutput} onChange={e => setForm({...form, commandOutput: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h3 className="font-bold text-text font-mono text-sm flex items-center gap-2"><FiUpload className="text-primary" /> {t('admin.lessons.new.video')}</h3>
          <div className="flex items-center gap-4">
            {form.videoUrl && (
              <div className="text-primary text-xs font-mono truncate flex-1">{form.videoUrl.split('/').pop()}</div>
            )}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-mono text-sm rounded-lg hover:bg-primary/20 transition-colors">
              <FiUpload size={14} />
              {uploading ? t('admin.lessons.new.uploading').replace('{pct}', String(uploadProgress)) : t('admin.lessons.new.uploadVideo')}
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button type="button" onClick={() => setShowDisclaimer(!showDisclaimer)} className="flex items-center gap-1.5 text-xs text-text-muted font-mono hover:text-text transition-colors">
              {showDisclaimer ? <FiEye size={12} /> : <FiEyeOff size={12} />}
              {showDisclaimer ? t('admin.lessons.new.showDisclaimer') : t('admin.lessons.new.hideDisclaimer')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-mono text-sm">
            <FiSave /> {saving ? t('admin.lessons.new.saving') : t('admin.lessons.new.save')}
          </button>
          <button type="button" onClick={() => router.push('/admin/lessons')}
            className="px-4 py-3 border border-border text-text-muted font-mono text-sm rounded-lg hover:text-text transition-colors">
            {t('admin.lessons.new.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
      <NewLessonForm />
    </Suspense>
  );
}
