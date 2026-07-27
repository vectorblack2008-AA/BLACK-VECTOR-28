'use client';

import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FiShield className="text-primary text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-text mb-4">سياسة <span className="text-primary">الخصوصية</span></h1>
          <p className="text-text-muted max-w-xl mx-auto">آخر تحديث: مايو 2026</p>
        </motion.div>

        <div className="bg-surface rounded-xl border border-border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-text mb-3">مقدمة</h2>
            <p className="text-text-muted leading-relaxed">
              نحن في ليرن تيرمينال نلتزم بحماية خصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها عند استخدام منصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2 leading-relaxed">
              <li>معلومات الحساب: الاسم، البريد الإلكتروني، صورة الملف الشخصي</li>
              <li>بيانات الاستخدام: الدروس التي تشاهدها، تقدمك التعليمي</li>
              <li>معلومات الدفع: إذا اشتركت في الباقة المدفوعة (نستخدم Stripe ولا نخزن معلومات بطاقتك)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2 leading-relaxed">
              <li>تقديم وتخصيص تجربة التعلم الخاصة بك</li>
              <li>تحسين المنصة وإضافة ميزات جديدة</li>
              <li>التواصل معك بخصوص تحديثات الدروس والعروض</li>
              <li>معالجة الاشتراكات في الباقة المدفوعة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">حماية البيانات</h2>
            <p className="text-text-muted leading-relaxed">
              نستخدم إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفشاء أو التدمير.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">جهات خارجية</h2>
            <p className="text-text-muted leading-relaxed">
              لا نشارك معلوماتك الشخصية مع جهات خارجية إلا في الحالات التالية: مزودي الخدمة (مثل Firebase و Stripe)، الامتثال للقانون، أو بحماية حقوقنا.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">اتصل بنا</h2>
            <p className="text-text-muted leading-relaxed">
              إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة اتصل بنا.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
