'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiGrid, FiTerminal, FiFolder, FiClock } from 'react-icons/fi';
import { createCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { useT } from '@/contexts/LangContext';
import { useCategories } from '@/contexts/CategoriesContext';
import type { Category } from '@/lib/types';
import TimeStamp from '@/components/TimeStamp';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { t } = useT();
  const { categories, loading } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', description: '', descriptionAr: '', type: 'free' as 'free' | 'premium', order: 0, icon: '' });
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setForm({ name: '', nameAr: '', description: '', descriptionAr: '', type: 'free', order: 0, icon: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, nameAr: cat.nameAr, description: cat.description, descriptionAr: cat.descriptionAr, type: cat.type, order: cat.order, icon: cat.icon });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nameAr) { toast.error(t('admin.categories.formRequired')); return; }
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success(t('admin.categories.updateSuccess'));
      } else {
        await createCategory(form);
        toast.success(t('admin.categories.createSuccess'));
      }
      resetForm();
    } catch { toast.error(t('admin.categories.saveError')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm'))) return;
    try {
      await deleteCategory(id);
      toast.success(t('admin.categories.deleteSuccess'));
    } catch { toast.error(t('admin.categories.deleteError')); }
  };

  return (
    <div>
      <div className="terminal-window mb-6">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# ls -la /admin/categories/</span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text font-mono flex items-center gap-2">
                <FiGrid className="text-accent" /> {t('admin.categories.title')}
              </h1>
              <p className="text-text-muted text-sm font-mono mt-1">
                <span className="text-primary">$</span> ls categories/
                <span className="text-text-muted"> &rarr; {categories.length}</span>
              </p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm">
              <FiPlus /> {t('admin.categories.add')}
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-text font-mono">{editingId ? t('admin.categories.edit') : t('admin.categories.add')}</h3>
            <button onClick={resetForm} className="text-text-muted hover:text-text p-1 rounded hover:bg-surface-light"><FiX /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.name')}</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.nameAr')}</label>
              <input type="text" value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.desc')}</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" dir="ltr" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.descAr')}</label>
              <input type="text" value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.type')}</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'free' | 'premium'})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono text-sm">
                <option value="free">{t('admin.categories.free')}</option>
                <option value="premium">{t('admin.categories.premium')}</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.order')}</label>
              <input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-text-muted text-xs mb-1 font-mono">{t('admin.categories.icon')}</label>
              <input type="text" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="📁"
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-text focus:border-primary focus:outline-none font-mono" />
            </div>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors font-mono text-sm">
            <FiSave /> {t('admin.categories.save')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : categories.length === 0 ? (
        <div className="terminal-window text-center py-12">
          <div className="p-8">
            <FiFolder className="text-text-muted text-4xl mx-auto mb-3" />
            <p className="text-text-muted font-mono text-sm">{t('admin.categories.empty')}</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="mt-2 text-primary text-xs font-mono hover:underline">{t('admin.categories.add')}</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-surface rounded-xl border border-border p-4 hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon || '📁'}</span>
                  <div>
                    <h3 className="font-bold text-text font-mono text-sm">{cat.nameAr}</h3>
                    <p className="text-text-muted text-[10px] font-mono">{cat.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  cat.type === 'free' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                }`}>
                  {cat.type === 'free' ? t('admin.categories.free') : t('admin.categories.premium')}
                </span>
              </div>
              <p className="text-text-muted text-xs font-mono mb-3 line-clamp-2">{cat.descriptionAr || '—'}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <TimeStamp ts={(cat as any).updatedAt || (cat as any).createdAt} />
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(cat)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-accent hover:bg-accent/5 transition-colors">
                      <FiEdit2 size={11} /> {t('common.edit')}
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-red-400 hover:bg-red-400/5 transition-colors">
                      <FiTrash2 size={11} /> {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
