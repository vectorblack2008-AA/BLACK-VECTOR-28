'use client';

import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi';

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FiFileText className="text-primary text-5xl mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-text mb-4">الشروط <span className="text-primary">والأحكام</span></h1>
          <p className="text-text-muted max-w-xl mx-auto">آخر تحديث: مايو 2026</p>
        </motion.div>

        <div className="bg-surface rounded-xl border border-border p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-text mb-3">قبول الشروط</h2>
            <p className="text-text-muted leading-relaxed">
              باستخدامك لمنصة ليرن تيرمينال، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">الحسابات</h2>
            <p className="text-text-muted leading-relaxed">
              يجب عليك إنشاء حساب للوصول إلى المحتوى. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">المحتوى التعليمي</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2 leading-relaxed">
              <li>الدروس المجانية متاحة للجميع بدون أي تكلفة</li>
              <li>الدروس المدفوعة متاحة فقط للمشتركين في الباقة المدفوعة</li>
              <li>ممنوع إعادة نشر أو بيع المحتوى التعليمي</li>
              <li>المحتوى للأغراض التعليمية فقط، ونحن غير مسؤولين عن سوء الاستخدام</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">الاشتراك المدفوع</h2>
            <ul className="list-disc list-inside text-text-muted space-y-2 leading-relaxed">
              <li>الاشتراك شهري ويتجدد تلقائياً</li>
              <li>يمكنك إلغاء الاشتراك في أي وقت</li>
              <li>عند الإلغاء، يبقى وصولك نشطاً حتى نهاية الفترة المدفوعة</li>
              <li>نحن غير مسؤولين عن أي انقطاع في الخدمة بسبب مشاكل تقنية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">السلوك المسموح به</h2>
            <p className="text-text-muted leading-relaxed">
              نهدف إلى خلق بيئة تعليمية آمنة وإيجابية. يرجى احترام المستخدمين الآخرين، وعدم استخدام المنصة لأي أنشطة غير قانونية أو ضارة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">تعديل الشروط</h2>
            <p className="text-text-muted leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إعلام المستخدمين المسجلين بالتغييرات المهمة.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text mb-3">اتصل بنا</h2>
            <p className="text-text-muted leading-relaxed">
              لأي استفسار بخصوص الشروط والأحكام، يرجى التواصل معنا عبر صفحة اتصل بنا.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
