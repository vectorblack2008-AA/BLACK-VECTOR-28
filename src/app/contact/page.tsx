'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/contexts/LangContext';
import { FiSend, FiMail, FiMapPin, FiMessageSquare } from 'react-icons/fi';
import { createContactMessage } from '@/lib/firestore';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { t, lang } = useT();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t('contact.fillRequired'));
      return;
    }
    setLoading(true);
    try {
      await createContactMessage({ ...form, subject: form.subject || t('contact.noSubject') });
      toast.success(t('contact.success'));
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error(t('contact.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FiMessageSquare className="text-primary text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-text mb-4">{t('contact.title')} <span className="text-primary">{t('contact.titleHighlight')}</span></h1>
          <p className="text-text-muted max-w-xl mx-auto">{t('contact.desc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-4">
              <div>
                <label className="block text-text text-sm mb-1">{t('contact.name')}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">{t('contact.email')}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">{t('contact.subject')}</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">{t('contact.message')}</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <FiSend /> {loading ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {[
              { icon: FiMail, title: t('contact.infoEmail'), desc: t('contact.emailInfo') },
              { icon: FiMapPin, title: t('contact.infoLocation'), desc: t('contact.location') },
              { icon: FiMessageSquare, title: t('contact.infoHours'), desc: t('contact.hours') },
            ].map((item, i) => (
              <div key={i} className="p-4 bg-surface rounded-xl border border-border flex items-center gap-4">
                <item.icon className="text-primary text-2xl" />
                <div>
                  <h3 className="font-bold text-text">{item.title}</h3>
                  <p className="text-text-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
