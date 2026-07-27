'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLesson, updateLesson } from '@/lib/firestore';
import { useT } from '@/contexts/LangContext';
import { useCategories } from '@/contexts/CategoriesContext';
import { uploadVideo } from '@/lib/upload';
import toast from 'react-hot-toast';
import { FiSave, FiX, FiBook, FiTerminal, FiUpload, FiTrash2 } from 'react-icons/fi';

export default function EditLessonPage() {
  const { t } = useT();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { categories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      try {
        const lesson = await getLesson(id);
        if (lesson) {
          setForm({
            title: lesson.title || '',
            titleAr: lesson.titleAr || '',
            description: lesson.description || '',
            descriptionAr: lesson.descriptionAr || '',
            content: lesson.content || '',
            contentAr: lesson.contentAr || '',
            type: lesson.type || 'free',
            categoryId: lesson.categoryId || '',
            order: lesson.order || 0,
            duration: lesson.duration || '',
            command: lesson.command || '',
            commandOutput: lesson.commandOutput || '',
            videoUrl: lesson.videoUrl || '',
            showDisclaimer: lesson.showDisclaimer || false,
          });
        }
      } catch { toast.error(t('admin.lessons.new.loadError')); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error(t('admin.lessons.new.videoRequired')); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadVideo(file, `lesson_${id}`, setUploadProgress);
      setForm({ ...form, videoUrl: url });
      toast.success(t('admin.lessons.new.videoSuccess'));
    } catch { toast.error(t('admin.lessons.new.videoError')); }
    finally { setUploading(false); }
  };

  const handleRemoveVideo = () => setForm({ ...form, videoUrl: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLesson(id, form);
      toast.success(t('admin.lessons.new.updateSuccess'));
      router.push('/admin/lessons');
    } catch { toast.error(t('admin.lessons.new.updateError')); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# nano /admin/lessons/{id}</span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
            <FiBook className="text-accent" /> {t('admin.lessons.title')}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.titleEn')}</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.titleAr')}</label>
            <input type="text" value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.descEn')}</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none resize-none font-mono text-sm" dir="ltr" />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.descAr')}</label>
            <textarea rows={3} value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none resize-none font-mono text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.contentAr')}</label>
          <textarea rows={10} value={form.contentAr} onChange={e => setForm({...form, contentAr: e.target.value})}
            className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none resize-none font-mono text-sm leading-relaxed" />
        </div>

        <div>
          <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.contentEn')}</label>
          <textarea rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
            className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none resize-none font-mono text-sm leading-relaxed" dir="ltr" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.type')}</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono text-sm">
              <option value="free">{t('admin.categories.free')}</option>
              <option value="premium">{t('admin.categories.premium')}</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.category')}</label>
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono text-sm">
              <option value="">{t('admin.lessons.new.noCategory')}</option>
              {categories.filter(c => c.type === form.type).map(c => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.order')}</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono" />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.duration')}</label>
            <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.command')}</label>
            <input type="text" value={form.command} onChange={e => setForm({...form, command: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
          </div>
          <div>
            <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.commandOutput')}</label>
            <textarea rows={3} value={form.commandOutput} onChange={e => setForm({...form, commandOutput: e.target.value})}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none font-mono text-sm" dir="ltr" />
          </div>
        </div>

        <div>
          <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.lessons.new.video')}</label>
          {form.videoUrl ? (
            <div className="space-y-2">
              <video src={form.videoUrl} controls className="w-full max-h-64 rounded-lg bg-black" />
              <div className="flex items-center gap-2">
                <input type="text" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})}
                  className="flex-1 bg-secondary border border-border rounded-lg py-2 px-3 text-text text-xs font-mono focus:border-primary focus:outline-none" dir="ltr" />
                <button type="button" onClick={handleRemoveVideo}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 bg-secondary border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              {uploading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-primary text-xs font-mono">{t('admin.lessons.new.uploading').replace('{pct}', String(uploadProgress))}</span>
                </div>
              ) : (
                <div className="text-center">
                  <FiUpload className="text-text-muted mx-auto mb-2" size={24} />
                  <span className="text-text-muted text-xs font-mono">{t('admin.lessons.new.uploadVideo')}</span>
                </div>
              )}
              <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        <div className="flex items-center gap-3 py-2">
          <input type="checkbox" id="showDisclaimer" checked={form.showDisclaimer}
            onChange={e => setForm({...form, showDisclaimer: e.target.checked})}
            className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary" />
          <label htmlFor="showDisclaimer" className="text-text-muted text-xs font-mono cursor-pointer select-none">
            {form.showDisclaimer ? t('admin.lessons.new.showDisclaimer') : t('admin.lessons.new.hideDisclaimer')}
          </label>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-mono">
            <FiSave /> {saving ? t('admin.lessons.new.saving') : t('admin.lessons.new.saveChanges')}
          </button>
          <button type="button" onClick={() => router.push('/admin/lessons')}
            className="flex items-center gap-2 px-6 py-3 border border-border text-text rounded-lg hover:bg-surface-light transition-colors font-mono">
            <FiX /> {t('admin.lessons.new.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
