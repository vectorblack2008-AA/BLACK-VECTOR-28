'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight, FiChevronLeft, FiCheckCircle, FiTerminal, FiAward, FiHeart } from 'react-icons/fi';
import TerminalDemo from '@/components/TerminalDemo';
import LessonTraining from '@/components/LessonTraining';
import PremiumGuard from '@/components/PremiumGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useT } from '@/contexts/LangContext';
import { useLessons } from '@/contexts/LessonsContext';
import { updateUserProfile } from '@/lib/auth';
import { toggleFavorite } from '@/lib/firestore';
import { FREE_LESSONS, PREMIUM_LESSONS } from '@/lib/constants';
import toast from 'react-hot-toast';

const lessonData: { [key: string]: any } = {
  'free-1': {
    title: 'مقدمة عن التيرمينال',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">ما هو التيرمينال؟</h2>
      <p class="text-text-muted leading-relaxed mb-4">التيرمينال (Terminal) أو واجهة سطر الأوامر (CLI) هي واجهة نصية تسمح لك بالتفاعل مع نظام التشغيل عن طريق كتابة الأوامر النصية بدلاً من استخدام الواجهة الرسومية (GUI).</p>
      <p class="text-text-muted leading-relaxed mb-4">في لينكس، التيرمينال هو أداة قوية جداً تمنحك تحكماً كاملاً في النظام. يمكنك من خلاله إدارة الملفات، تثبيت البرامج، مراقبة النظام، وأتمتة المهام.</p>
      <h3 class="text-xl font-bold text-text mt-5 mb-3">كيف تفتح التيرمينال؟</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>اختصار لوحة المفاتيح: <code class="text-primary">Ctrl + Alt + T</code></li>
        <li>البحث عن "Terminal" في قائمة التطبيقات</li>
        <li>النقر بالزر الأيمن داخل مجلد واختيار "Open in Terminal"</li>
      </ul>
      <h3 class="text-xl font-bold text-text mt-5 mb-3">مكونات سطر الأوامر</h3>
      <p class="text-text-muted leading-relaxed mb-4">عند فتح التيرمينال، سترى شيئاً مثل: <code class="text-primary">user@host:~$</code>. هذا يسمى الـ Prompt ويعني أن النظام جاهز لاستقبال الأوامر.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">user</code> - اسم المستخدم الحالي</li>
        <li><code class="text-primary">host</code> - اسم الجهاز</li>
        <li><code class="text-primary">~</code> - المسار الحالي (home directory)</li>
        <li><code class="text-primary">$</code> - يعني أنك مستخدم عادي (أما # فتعني root)</li>
      </ul>
    `,
    commands: [
      { cmd: 'echo "Hello, Linux!"', output: 'Hello, Linux!' },
      { cmd: 'date', output: 'Sat May 30 10:30:00 UTC 2026' },
      { cmd: 'cal', output: '      May 2026\nSu Mo Tu We Th Fr Sa\n                1  2\n 3  4  5  6  7  8  9\n10 11 12 13 14 15 16\n17 18 19 20 21 22 23\n24 25 26 27 28 29 30\n31' },
      { cmd: 'whoami', output: 'user' },
      { cmd: 'uname -a', output: 'Linux hostname 6.8.0-35-generic #36-Ubuntu SMP x86_64 GNU/Linux' },
    ],
  },
  'free-2': {
    title: 'أوامر التنقل بين المجلدات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">التنقل في نظام الملفات</h2>
      <p class="text-text-muted leading-relaxed mb-4">نظام الملفات في لينكس يبدأ من الجذر <code class="text-primary">/</code> ويتفرع إلى مجلدات متعددة. لإتقان التيرمينال، يجب أولاً إتقان أوامر التنقل.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الأمر pwd</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض مسار المجلد الحالي (Print Working Directory). مفيد جداً عندما تريد التأكد من مكانك في النظام.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الأمر ls</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض محتويات المجلد الحالي. من أكثر الأوامر استخداماً.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">ls</code> - عرض الملفات والمجلدات</li>
        <li><code class="text-primary">ls -l</code> - عرض بتفاصيل (النوع، الصلاحيات، الحجم، التاريخ)</li>
        <li><code class="text-primary">ls -a</code> - عرض الملفات المخفية (التي تبدأ بنقطة)</li>
        <li><code class="text-primary">ls -la</code> - دمج الخيارين السابقين</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الأمر cd</h3>
      <p class="text-text-muted leading-relaxed mb-4">يستخدم للتنقل بين المجلدات (Change Directory).</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">cd /</code> - الذهاب إلى المجلد الجذر</li>
        <li><code class="text-primary">cd ~</code> أو <code class="text-primary">cd</code> - الذهاب إلى المجلد الرئيسي (Home)</li>
        <li><code class="text-primary">cd ..</code> - الرجوع إلى المجلد الأب</li>
        <li><code class="text-primary">cd ../..</code> - الرجوع مجلدين للأعلى</li>
        <li><code class="text-primary">cd Documents</code> - الدخول إلى مجلد Documents</li>
      </ul>
    `,
    commands: [
      { cmd: 'pwd', output: '/home/user' },
      { cmd: 'ls -la', output: 'total 32\ndrwxr-xr-x 5 user user 4096 May 30 10:00 .\ndrwxr-xr-x 3 root root 4096 May 28 09:00 ..\ndrwxr-xr-x 2 user user 4096 May 30 09:55 Documents\ndrwxr-xr-x 2 user user 4096 May 30 09:55 Downloads\n-rw-r--r-- 1 user user 8980 May 30 09:50 .bashrc' },
      { cmd: 'cd Documents', output: '' },
      { cmd: 'pwd', output: '/home/user/Documents' },
      { cmd: 'cd ~', output: '' },
      { cmd: 'pwd', output: '/home/user' },
    ],
  },
  'free-3': {
    title: 'إنشاء و حذف الملفات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">إدارة الملفات والمجلدات</h2>
      <p class="text-text-muted leading-relaxed mb-4">في هذا الدرس ستتعلم كيفية إنشاء، نسخ، نقل، وحذف الملفات والمجلدات من خلال التيرمينال.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">mkdir - إنشاء مجلد</h3>
      <p class="text-text-muted leading-relaxed mb-4">لإنشاء مجلد جديد: <code class="text-primary">mkdir my_folder</code>. يمكنك إنشاء مجلدات متداخلة باستخدام <code class="text-primary">mkdir -p a/b/c</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">touch - إنشاء ملف</h3>
      <p class="text-text-muted leading-relaxed mb-4">ينشئ ملفاً فارغاً: <code class="text-primary">touch file.txt</code>. يمكن أيضاً إنشاء عدة ملفات مرة واحدة: <code class="text-primary">touch f1.txt f2.txt f3.txt</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">cp - نسخ</h3>
      <p class="text-text-muted leading-relaxed mb-4">لنسخ ملف: <code class="text-primary">cp source.txt destination.txt</code>. لنسخ مجلد بكامله: <code class="text-primary">cp -r folder1 folder2</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">mv - نقل أو إعادة تسمية</h3>
      <p class="text-text-muted leading-relaxed mb-4">لنقل ملف: <code class="text-primary">mv file.txt /path/to/destination/</code>. لإعادة تسمية: <code class="text-primary">mv oldname.txt newname.txt</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">rm - حذف</h3>
      <p class="text-text-muted leading-relaxed mb-4">لحذف ملف: <code class="text-primary">rm file.txt</code>. لحذف مجلد ومحتوياته: <code class="text-primary">rm -rf folder</code>.</p>
      <div class="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mb-4 text-sm text-red-400">⚠️ تحذير: الأمر rm -rf خطير جداً ولا يسألك قبل الحذف. استخدمه بحذر.</div>
    `,
    commands: [
      { cmd: 'mkdir my_project', output: '' },
      { cmd: 'touch my_project/index.html my_project/style.css', output: '' },
      { cmd: 'ls -la my_project/', output: 'total 0\ndrwxr-xr-x 2 user user 60 May 30 10:05 .\ndrwxr-xr-x 3 user user 60 May 30 10:05 ..\n-rw-r--r-- 1 user user  0 May 30 10:05 index.html\n-rw-r--r-- 1 user user  0 May 30 10:05 style.css' },
      { cmd: 'cp my_project/index.html my_project/index.html.bak', output: '' },
      { cmd: 'mv my_project/index.html.bak my_project/backup.html', output: '' },
      { cmd: 'ls my_project/', output: 'backup.html  index.html  style.css' },
    ],
  },
  'free-4': {
    title: 'عرض محتوى الملفات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">عرض ومشاهدة محتوى الملفات</h2>
      <p class="text-text-muted leading-relaxed mb-4">لينكس يوفر عدة أوامر لعرض محتوى الملفات النصية، كل منها له استخدامات مختلفة حسب حجم الملف والغرض.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">cat - عرض كامل</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض محتوى الملف كاملاً: <code class="text-primary">cat file.txt</code>. مفيد للملفات الصغيرة. يمكن أيضاً دمج ملفين: <code class="text-primary">cat f1.txt f2.txt > merged.txt</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">less - عرض متقطع</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض الملف شاشة واحدة في كل مرة. استخدم المسافة للتنقل للأمام، <code class="text-primary">b</code> للخلف، <code class="text-primary">q</code> للخروج.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">head - أول سطور</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض أول 10 سطور من الملف: <code class="text-primary">head file.txt</code>. لتحديد عدد معين: <code class="text-primary">head -n 20 file.txt</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">tail - آخر سطور</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعرض آخر 10 سطور: <code class="text-primary">tail file.txt</code>. مفيد جداً لمشاهدة سجلات النظام: <code class="text-primary">tail -f /var/log/syslog</code> (متابعة مستمرة).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">wc - عد الكلمات</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعد الأسطر والكلمات والأحرف: <code class="text-primary">wc file.txt</code>.</p>
    `,
    commands: [
      { cmd: 'echo "Hello World\\nLine 2\\nLine 3" > sample.txt', output: '' },
      { cmd: 'cat sample.txt', output: 'Hello World\nLine 2\nLine 3' },
      { cmd: 'wc sample.txt', output: ' 3  5 27 sample.txt' },
      { cmd: 'head -n 2 /etc/passwd', output: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin' },
    ],
  },
  'free-5': {
    title: 'الصلاحيات والمستخدمين',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">صلاحيات الملفات في لينكس</h2>
      <p class="text-text-muted leading-relaxed mb-4">كل ملف ومجلد في لينكس له ثلاث مجموعات من الصلاحيات: للمالك (owner)، للمجموعة (group)، وللآخرين (others).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">قراءة الصلاحيات</h3>
      <p class="text-text-muted leading-relaxed mb-4">عند كتابة <code class="text-primary">ls -l</code>، ترى شيء مثل <code class="text-primary">-rwxr-xr--</code>:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>الحرف الأول: <code class="text-primary">-</code> (ملف) أو <code class="text-primary">d</code> (مجلد)</li>
        <li>الأحرف 2-4: صلاحيات المالك (r=قراءة, w=كتابة, x=تنفيذ)</li>
        <li>الأحرف 5-7: صلاحيات المجموعة</li>
        <li>الأحرف 8-10: صلاحيات الآخرين</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">chmod - تغيير الصلاحيات</h3>
      <p class="text-text-muted leading-relaxed mb-4">يمكنك استخدام الأرقام: <code class="text-primary">chmod 755 script.sh</code> (rwxr-xr-x). أو الحروف: <code class="text-primary">chmod +x script.sh</code> (إضافة تنفيذ للجميع).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">chown - تغيير المالك</h3>
      <p class="text-text-muted leading-relaxed mb-4">لتغيير مالك الملف: <code class="text-primary">sudo chown user:group file.txt</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">إدارة المستخدمين</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">sudo useradd newuser</code> - إضافة مستخدم</li>
        <li><code class="text-primary">sudo passwd newuser</code> - تعيين كلمة مرور</li>
        <li><code class="text-primary">sudo usermod -aG sudo newuser</code> - إضافة المستخدم لمجموعة sudo</li>
        <li><code class="text-primary">sudo deluser newuser</code> - حذف مستخدم</li>
      </ul>
    `,
    commands: [
      { cmd: 'ls -l', output: 'total 4\n-rw-r--r-- 1 user user  15 May 30 10:10 file.txt\ndrwxr-xr-x 2 user user 120 May 30 10:11 scripts' },
      { cmd: 'chmod +x file.txt', output: '' },
      { cmd: 'ls -l file.txt', output: '-rwxr-xr-x 1 user user 15 May 30 10:10 file.txt' },
      { cmd: 'whoami', output: 'user' },
      { cmd: 'id', output: 'uid=1000(user) gid=1000(user) groups=1000(user),4(adm),27(sudo)' },
    ],
  },
  'free-6': {
    title: 'البحث داخل الملفات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">grep - أداة البحث القوية</h2>
      <p class="text-text-muted leading-relaxed mb-4">الأمر <code class="text-primary">grep</code> هو أداة بحث متقدمة تبحث عن أنماط نصية داخل الملفات. اسمه مشتق من "Global Regular Expression Print".</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الاستخدامات الأساسية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">grep "word" file.txt</code> - بحث بسيط</li>
        <li><code class="text-primary">grep -i "word" file.txt</code> - بحث مع تجاهل حالة الأحرف</li>
        <li><code class="text-primary">grep -r "word" /path/</code> - بحث في كل المجلدات الفرعية</li>
        <li><code class="text-primary">grep -n "word" file.txt</code> - عرض رقم السطر</li>
        <li><code class="text-primary">grep -c "word" file.txt</code> - عدد مرات التكرار</li>
        <li><code class="text-primary">grep -v "word" file.txt</code> - عكس البحث (كل ما لا يحتوي)</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">التعبيرات المنتظمة (Regex)</h3>
      <p class="text-text-muted leading-relaxed mb-4">grep يدعم التعبيرات المنتظمة للبحث المتقدم:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">grep "^Start" file.txt</code> - سطور تبدأ بـ Start</li>
        <li><code class="text-primary">grep "end$" file.txt</code> - سطور تنتهي بـ end</li>
        <li><code class="text-primary">grep "[0-9]" file.txt</code> - سطور تحتوي على أرقام</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">أدوات بحث أخرى</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">find /path -name "*.txt"</code> - البحث عن ملفات باسم معين</li>
        <li><code class="text-primary">locate file.txt</code> - بحث سريع في قاعدة البيانات</li>
        <li><code class="text-primary">which command</code> - أين يوجد أمر معين</li>
      </ul>
    `,
    commands: [
      { cmd: 'echo -e "apple\\nbanana\\ncherry\\nApple\\nDate\\nApricot" > fruits.txt', output: '' },
      { cmd: 'grep "apple" fruits.txt', output: 'apple' },
      { cmd: 'grep -i "apple" fruits.txt', output: 'apple\nApple\nApricot' },
      { cmd: 'grep -c "a" fruits.txt', output: '4' },
      { cmd: 'grep "^A" fruits.txt', output: 'Apple\nApricot' },
    ],
  },
  'free-7': {
    title: 'أساسيات HTML',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">مقدمة في HTML</h2>
      <p class="text-text-muted leading-relaxed mb-4">HTML (HyperText Markup Language) هي اللغة الأساسية لبناء صفحات الويب. كل موقع ويب تستخدمه مبني على HTML.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">هيكل صفحة HTML</h3>
      <p class="text-text-muted leading-relaxed mb-4">أي صفحة HTML تبدأ بـ <code class="text-primary">&lt;!DOCTYPE html&gt;</code> وتحتوي على <code class="text-primary">&lt;html&gt;</code> ثم <code class="text-primary">&lt;head&gt;</code> و <code class="text-primary">&lt;body&gt;</code>.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">&lt;!DOCTYPE html&gt;</code> - تعريف نوع المستند</li>
        <li><code class="text-primary">&lt;html&gt;</code> - العنصر الجذر للصفحة</li>
        <li><code class="text-primary">&lt;head&gt;</code> - معلومات عن الصفحة (العنوان، الترميز)</li>
        <li><code class="text-primary">&lt;body&gt;</code> - المحتوى المرئي للصفحة</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الوسوم الأساسية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">&lt;h1&gt;</code> إلى <code class="text-primary">&lt;h6&gt;</code> - العناوين</li>
        <li><code class="text-primary">&lt;p&gt;</code> - الفقرة النصية</li>
        <li><code class="text-primary">&lt;a href="..."&gt;</code> - رابط تشعبي</li>
        <li><code class="text-primary">&lt;img src="..." alt="..."&gt;</code> - صورة</li>
        <li><code class="text-primary">&lt;ul&gt;</code> و <code class="text-primary">&lt;ol&gt;</code> - قوائم غير مرتبة ومرتبة</li>
        <li><code class="text-primary">&lt;div&gt;</code> - حاوية (كتلة)</li>
        <li><code class="text-primary">&lt;span&gt;</code> - حاوية (سطر)</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">السمات (Attributes)</h3>
      <p class="text-text-muted leading-relaxed mb-4">الوسوم يمكن أن تحتوي على سمات لإضافة معلومات إضافية: <code class="text-primary">&lt;tag attribute="value"&gt;</code>. السمات الشائعة: <code class="text-primary">class</code>، <code class="text-primary">id</code>، <code class="text-primary">style</code>، <code class="text-primary">src</code>، <code class="text-primary">href</code>.</p>
    `,
    commands: [
      { cmd: 'echo "<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Hello World</h1></body></html>" > index.html', output: '' },
      { cmd: 'cat index.html', output: '<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Hello World</h1></body></html>' },
      { cmd: 'echo "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>" > list.html', output: '' },
      { cmd: 'wc -c index.html', output: '76 index.html' },
    ],
  },
  'free-8': {
    title: 'أساسيات CSS',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">مقدمة في CSS</h2>
      <p class="text-text-muted leading-relaxed mb-4">CSS (Cascading Style Sheets) هي لغة تصميم تتحكم في مظهر وتنسيق صفحات HTML. بدون CSS، كانت كل المواقع تبدو كنص عادي على خلفية بيضاء.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">طرق إضافة CSS</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><strong>داخلي (Inline):</strong> باستخدام السمة style داخل الوسم</li>
        <li><strong>داخلي (Internal):</strong> باستخدام وسم <code class="text-primary">&lt;style&gt;</code> داخل <code class="text-primary">&lt;head&gt;</code></li>
        <li><strong>خارجي (External):</strong> ملف منفصل <code class="text-primary">style.css</code> وربطه بـ <code class="text-primary">&lt;link&gt;</code></li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">المحددات (Selectors)</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">element</code> - تحديد بواسطة اسم الوسم: <code class="text-primary">p { }</code></li>
        <li><code class="text-primary">.class</code> - تحديد بواسطة الكلاس: <code class="text-primary">.my-class { }</code></li>
        <li><code class="text-primary">#id</code> - تحديد بواسطة المعرف: <code class="text-primary">#my-id { }</code></li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الخصائص الشائعة</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">color</code> - لون النص</li>
        <li><code class="text-primary">background-color</code> - لون الخلفية</li>
        <li><code class="text-primary">font-size</code> - حجم الخط</li>
        <li><code class="text-primary">margin</code> - الهوامش الخارجية</li>
        <li><code class="text-primary">padding</code> - الهوامش الداخلية</li>
        <li><code class="text-primary">display</code> - نوع العرض (block, inline, flex, grid)</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Flexbox</h3>
      <p class="text-text-muted leading-relaxed mb-4">Flexbox هو نظام تخطيط حديث يسمح بترتيب العناصر بسهولة. تفعّل بـ <code class="text-primary">display: flex</code> وتتحكم في الاتجاه بـ <code class="text-primary">flex-direction</code>.</p>
    `,
    commands: [
      { cmd: 'echo "body { background-color: #0a0a0f; color: #00ff41; font-family: monospace; }" > style.css', output: '' },
      { cmd: 'cat style.css', output: 'body { background-color: #0a0a0f; color: #00ff41; font-family: monospace; }' },
      { cmd: 'echo "h1 { font-size: 2em; text-align: center; border-bottom: 1px solid #00ff41; }" >> style.css', output: '' },
      { cmd: 'wc -l style.css', output: '2 style.css' },
    ],
  },
};

const premiumLessonData: { [key: string]: any } = {
  'prem-1': {
    title: 'أدوات الاستطلاع وجمع المعلومات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">جمع المعلومات (Reconnaissance)</h2>
      <p class="text-text-muted leading-relaxed mb-4">مرحلة جمع المعلومات هي أول وأهم مرحلة في اختبار الاختراق. تعتمد على جمع أكبر قدر من المعلومات عن الهدف قبل البدء بأي هجوم.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">nmap - ماسح الشبكات</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة قوية لمسح الشبكات واكتشاف الأجهزة والخدمات.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">nmap -sP 192.168.1.0/24</code> - اكتشاف الأجهزة في الشبكة</li>
        <li><code class="text-primary">nmap -sS target.com</code> - SYN scan سريع</li>
        <li><code class="text-primary">nmap -sV target.com</code> - معرفة إصدارات الخدمات</li>
        <li><code class="text-primary">nmap -O target.com</code> - اكتشاف نظام التشغيل</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">whois - معلومات النطاق</h3>
      <p class="text-text-muted leading-relaxed mb-4">يكشف معلومات عن مالك النطاق، تاريخ التسجيل، وخوادم DNS.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">dig - استعلامات DNS</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة متقدمة للاستعلام عن سجلات DNS المختلفة: A, MX, NS, TXT وغيرها.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">netcat - سكين الجيش السويسري</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة متعددة الاستخدامات: مسح المنافذ، نقل الملفات، إنشاء خادم بسيط.</p>
    `,
    commands: [
      { cmd: 'nmap -sP 192.168.1.0/24', output: 'Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 192.168.1.1\nHost is up (0.0010s latency).\nNmap scan report for 192.168.1.10\nHost is up (0.0020s latency).\nNmap done: 256 IP addresses (2 hosts up)' },
      { cmd: 'whois example.com', output: 'Domain Name: EXAMPLE.COM\nRegistry Domain ID: 2336799_DOMAIN_COM-VRSN\nRegistrar WHOIS Server: whois.iana.org\nCreation Date: 1995-08-14T04:00:00Z\nRegistry Expiry Date: 2026-08-13T04:00:00Z' },
      { cmd: 'dig example.com A', output: '; <<>> DiG 9.18 <<>> example.com A\n;; ANSWER SECTION:\nexample.com. 3600 IN A 93.184.216.34' },
      { cmd: 'nmap -sV 192.168.1.10', output: 'PORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.9p1\n80/tcp open  http    Apache 2.4.57\n443/tcp open https   nginx 1.24.0' },
    ],
  },
  'prem-2': {
    title: 'اختبار الاختراق - الشبكات',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">اختبار اختراق الشبكات</h2>
      <p class="text-text-muted leading-relaxed mb-4">في هذا الدرس نتعمق في أدوات تحليل واختبار أمن الشبكات المستخدمة في الاختراق الأخلاقي.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Wireshark/tcpdump - تحليل الحزم</h3>
      <p class="text-text-muted leading-relaxed mb-4">أدوات التقاط وتحليل حزم الشبكة. <code class="text-primary">tcpdump</code> للطرفية و Wireshark للواجهة الرسومية.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">tcpdump -i eth0</code> - التقاط كل الحزم على الواجهة eth0</li>
        <li><code class="text-primary">tcpdump port 80</code> - التقاط حزم HTTP فقط</li>
        <li><code class="text-primary">tcpdump host 192.168.1.1</code> - حزم من/إلى مضيف معين</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Metasploit</h3>
      <p class="text-text-muted leading-relaxed mb-4">إطار عمل متكامل لاختبار الاختراق. يحتوي على آلاف الـ exploits والـ payloads.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">arp-scan - اكتشاف الأجهزة</h3>
      <p class="text-text-muted leading-relaxed mb-4">يكشف جميع الأجهزة المتصلة بالشبكة المحلية عبر بروتوكول ARP.</p>
    `,
    commands: [
      { cmd: 'tcpdump -i eth0 -c 5', output: 'tcpdump: listening on eth0, link-type EN10MB\n10:30:01.123456 IP 192.168.1.10.443 > 10.0.0.1.54321: Flags [P.], seq 1:100, ack 1, win 65535\n10:30:01.123789 IP 10.0.0.1.54321 > 192.168.1.10.443: Flags [.], ack 100, win 65535' },
      { cmd: 'arp-scan --localnet', output: 'Interface: eth0, type: EN10MB, MAC: 00:11:22:33:44:55\n192.168.1.1   aa:bb:cc:dd:ee:ff  Router\n192.168.1.10  11:22:33:44:55:66  Linux-Device' },
      { cmd: 'nc -zv 192.168.1.10 22 80 443', output: 'Connection to 192.168.1.10 22 port [tcp/ssh] succeeded!\nConnection to 192.168.1.10 80 port [tcp/http] succeeded!\nConnection to 192.168.1.10 443 port [tcp/https] succeeded!' },
    ],
  },
  'prem-3': {
    title: 'تحليل الثغرات الأمنية',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">اكتشاف وتحليل الثغرات الأمنية</h2>
      <p class="text-text-muted leading-relaxed mb-4">بعد جمع المعلومات، تأتي مرحلة اكتشاف الثغرات الأمنية في الأنظمة والتطبيقات.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Nikto - ماسح خوادم الويب</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة مفتوحة المصدر لمسح خوادم الويب واكتشاف الثغرات الشائعة، الملفات الخطيرة، وإعدادات الخادم الخاطئة.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">SQLMap - حقن SQL</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة آلية لاكتشاف واستغلال ثغرات حقن SQL في قواعد البيانات.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">OpenVAS</h3>
      <p class="text-text-muted leading-relaxed mb-4">ماسح ثغرات شامل يفحص النظام بالكامل ويقدم تقارير مفصلة عن الثغرات مع درجات الخطورة.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Searchsploit</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة للبحث في قاعدة بيانات Exploit-DB عن الثغرات المعروفة والـ exploits المتاحة.</p>
    `,
    commands: [
      { cmd: 'nikto -h http://127.0.0.1', output: '- Nikto v2.5.0\n+ Target IP: 127.0.0.1\n+ Server: Apache/2.4.57\n+ /: Server leaks inodes via ETags.\n+ /: The X-XSS-Protection header is not defined.\n+ /: The X-Content-Type-Options header is not set.\n+ /config.php: Potentially dangerous backup file found.' },
      { cmd: 'sqlmap -u "http://test.com/page?id=1" --batch', output: '[INFO] testing connection to target\n[INFO] testing SQL injection on GET parameter id\n[INFO] GET parameter id is vulnerable to SQL injection\n[INFO] fetching database names\navailable databases [2]: information_schema, testdb' },
    ],
  },
  'prem-4': {
    title: 'أدوات الهندسة الاجتماعية',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">الهندسة الاجتماعية</h2>
      <p class="text-text-muted leading-relaxed mb-4">الهندسة الاجتماعية هي استغلال العامل البشري للوصول إلى المعلومات أو الأنظمة. غالباً ما تكون أسهل من اختراق الأنظمة تقنياً.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">SET - Social Engineering Toolkit</h3>
      <p class="text-text-muted leading-relaxed mb-4">إطار عمل متكامل للهندسة الاجتماعية، من تطوير TrustedSec. يحتوي على:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>هجمات التصيد (Phishing) - صفحات تسجيل دخول مزيفة</li>
        <li>هجمات الوسائط القابلة للإزالة (USB)</li>
        <li>هجمات إنشاء الـ payloads</li>
        <li>هجمات الاستغلال الجماعية</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">BeEF - Browser Exploitation</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة تستهدف متصفح الضحية. بعد أن يزور الضحية رابطاً خبيثاً، يمكن التحكم في متصفحه لتنفيذ أوامر متعددة.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الوقاية من الهندسة الاجتماعية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>التدريب والتوعية المستمرة للموظفين</li>
        <li>عدم النقر على الروابط المشبوهة</li>
        <li>التحقق من هوية المرسل قبل مشاركة المعلومات</li>
        <li>استخدام المصادقة متعددة العوامل (MFA)</li>
      </ul>
    `,
    commands: [
      { cmd: 'echo "[+] Starting SET - Social Engineering Toolkit"', output: '[+] Starting SET - Social Engineering Toolkit\n[+] Select attack vector:\n1) Spear-Phishing\n2) Website Attack Vectors\n3) Infectious Media Generator\n4) Mass Mailer Attack' },
      { cmd: 'echo "[+] BeEF hook URL: http://attacker:3000/hook.js"', output: '[+] BeEF hook URL: http://attacker:3000/hook.js\n[+] Browser connected: 192.168.1.10 - Chrome 120\n[+] Modules available: 45' },
    ],
  },
  'prem-5': {
    title: 'تحليل الشبكات اللاسلكية',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">اختبار أمن الشبكات اللاسلكية</h2>
      <p class="text-text-muted leading-relaxed mb-4">الشبكات اللاسلكية (WiFi) غالباً ما تكون نقطة الضعف في أي مؤسسة. تعلم كيفية اختبارها وتأمينها.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Aircrack-ng</h3>
      <p class="text-text-muted leading-relaxed mb-4">مجموعة أدوات كاملة لاختبار أمن الشبكات اللاسلكية:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">airmon-ng</code> - تفعيل وضع المراقبة (Monitor Mode)</li>
        <li><code class="text-primary">airodump-ng</code> - التقاط الحزم اللاسلكية</li>
        <li><code class="text-primary">aireplay-ng</code> - حقن الحزم</li>
        <li><code class="text-primary">aircrack-ng</code> - كسر تشفير WEP/WPA</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Kismet</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة كشف شبكات لاسلكية سلبية (Passive). تكتشف الشبكات المخفية والـ SSID بكشف عناوين MAC.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">نصائح لتأمين الشبكة اللاسلكية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>استخدام WPA3 أو على الأقل WPA2 مع كلمة مرور قوية</li>
        <li>تعطيل WPS (WiFi Protected Setup)</li>
        <li>إخفاء SSID (مع العلم أنها ليست حماية كافية)</li>
        <li>تفعيل MAC Address Filtering</li>
        <li>تحديث firmware الراوتر باستمرار</li>
      </ul>
    `,
    commands: [
      { cmd: 'iwconfig', output: 'eth0      no wireless extensions.\nwlan0     IEEE 802.11  ESSID:off/any\n          Mode:Managed  Access Point: Not-Associated' },
      { cmd: 'airodump-ng wlan0', output: 'BSSID              PWR  Beacons  Data  CH  ENC  ESSID\nAA:BB:CC:11:22:33  -45  120      32    6  WPA2  HomeWiFi\nDD:EE:FF:44:55:66  -60   85      12   11  WPA2  OfficeNet' },
      { cmd: 'echo "[+] Scanning with Kismet..."', output: '[+] Scanning with Kismet...\n[+] Found networks: 8\n[+] Encrypted: 6  Open: 2\n[+] Hidden networks detected: 1' },
    ],
  },
  'prem-6': {
    title: 'أدوات الحماية والدفاع',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">الدفاع والحماية في لينكس</h2>
      <p class="text-text-muted leading-relaxed mb-4">الحماية لا تقل أهمية عن الاختراق. في هذا الدرس نتعلم أدوات الدفاع والحماية الأساسية.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">iptables/nftables - جدار الحماية</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة تصفية الحزم (Firewall) المدمجة في لينكس:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT</code> - السماح SSH من الشبكة المحلية</li>
        <li><code class="text-primary">iptables -A INPUT -p tcp --dport 22 -j DROP</code> - منع SSH من كل المصادر الأخرى</li>
        <li><code class="text-primary">iptables -L</code> - عرض القواعد الحالية</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">fail2ban</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة تمنع الهجمات التخمينية (Brute Force). تراقب سجلات النظام وتحظر الـ IPs التي تفشل في تسجيل الدخول.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">rkhunter - كشف الجذور الخفية</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة تفحص النظام بحثاً عن Rootkits والبرامج الضارة والثغرات الأمنية.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">أفضل ممارسات الحماية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>تحديث النظام باستمرار: <code class="text-primary">sudo apt update && sudo apt upgrade</code></li>
        <li>تعطيل خدمات SSH غير الضرورية</li>
        <li>استخدام مفاتيح SSH بدلاً من كلمات المرور</li>
        <li>تفعيل SELinux أو AppArmor</li>
        <li>مراقبة السجلات باستمرار: <code class="text-primary">journalctl -xe</code></li>
        <li>عمل نسخ احتياطية منتظمة</li>
      </ul>
    `,
    commands: [
      { cmd: 'sudo iptables -L -n', output: 'Chain INPUT (policy ACCEPT)\n target     prot opt source         destination\n ACCEPT     tcp  --  192.168.1.0/24  0.0.0.0/0   tcp dpt:22\n DROP       tcp  --  0.0.0.0/0       0.0.0.0/0   tcp dpt:22\n ACCEPT     all  --  0.0.0.0/0       0.0.0.0/0   ctstate ESTABLISHED' },
      { cmd: 'sudo fail2ban-client status sshd', output: 'Status for the jail: sshd\n|- Filter\n|  |- Currently failed: 3\n|  |- Total failed: 45\n|- Actions\n   |- Currently banned: 2\n   |- Total banned: 8' },
      { cmd: 'sudo rkhunter --check', output: '[ System Checks ]\n[ Checking binaries        ] OK\n[ Checking file properties ] OK\n[ Checking rootkits        ] OK\n[ Checking network         ] OK\n[ Checking kernel modules  ] OK\nSystem checks summary: All OK' },
    ],
  },
  'prem-7': {
    title: 'أساسيات JavaScript',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">مقدمة في JavaScript</h2>
      <p class="text-text-muted leading-relaxed mb-4">JavaScript (JS) هي لغة البرمجة التي تجعل صفحات الويب تفاعلية. بينما HTML يبني الهيكل و CSS يصمم المظهر، JS يضيف الحركة والتفاعل.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">المتغيرات (Variables)</h3>
      <p class="text-text-muted leading-relaxed mb-4">المتغيرات تُستخدم لتخزين البيانات. يمكن تعريفها بـ <code class="text-primary">let</code> أو <code class="text-primary">const</code>:</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">let name = "Ahmed";</code> - متغير يمكن تغيير قيمته</li>
        <li><code class="text-primary">const pi = 3.14;</code> - ثابت لا يمكن تغييره</li>
        <li><code class="text-primary">var</code> - قديم، لا يُستخدم في الكود الحديث</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">أنواع البيانات</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">String</code> - نص: <code class="text-primary">"Hello"</code></li>
        <li><code class="text-primary">Number</code> - رقم: <code class="text-primary">42</code></li>
        <li><code class="text-primary">Boolean</code> - منطق: <code class="text-primary">true</code> / <code class="text-primary">false</code></li>
        <li><code class="text-primary">Array</code> - مصفوفة: <code class="text-primary">[1, 2, 3]</code></li>
        <li><code class="text-primary">Object</code> - كائن: <code class="text-primary">{ name: "Ahmed", age: 25 }</code></li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الدوال (Functions)</h3>
      <p class="text-text-muted leading-relaxed mb-4">الدوال هي كود قابل لإعادة الاستخدام. تعريف دالة: <code class="text-primary">function greet(name) { return "Hello " + name; }</code>. أو باستخدام الأسهم: <code class="text-primary">const greet = (name) => "Hello " + name;</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">التعامل مع DOM</h3>
      <p class="text-text-muted leading-relaxed mb-4">JavaScript يمكنه التلاعب بصفحة HTML مباشرة عبر DOM: <code class="text-primary">document.getElementById('myId')</code>، <code class="text-primary">document.querySelector('.myClass')</code>، <code class="text-primary">element.addEventListener('click', handler)</code>.</p>
    `,
    commands: [
      { cmd: 'echo "console.log(\'Hello from JavaScript!\');" > script.js', output: '' },
      { cmd: 'echo "let x = 10; let y = 20; console.log(\'Sum:\', x + y);" >> script.js', output: '' },
      { cmd: 'node -e "console.log(\'Hello from Node.js!\')" 2>/dev/null || echo "JavaScript is everywhere!"', output: 'JavaScript is everywhere!' },
      { cmd: 'cat script.js', output: "console.log('Hello from JavaScript!');\nlet x = 10; let y = 20; console.log('Sum:', x + y);" },
    ],
  },
  'prem-8': {
    title: 'مقدمة في بايثون',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">مقدمة في لغة بايثون</h2>
      <p class="text-text-muted leading-relaxed mb-4">بايثون (Python) هي لغة برمجة عالية المستوى، سهلة التعلم وقوية جداً. تُستخدم في تطوير الويب، تحليل البيانات، الذكاء الاصطناعي، وأمن المعلومات.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">المتغيرات والطباعة</h3>
      <p class="text-text-muted leading-relaxed mb-4">في بايثون، تعريف المتغيرات سهل جداً ولا يحتاج لتحديد النوع: <code class="text-primary">name = "Ahmed"</code>. للطباعة نستخدم: <code class="text-primary">print("Hello")</code> أو <code class="text-primary">print(f"Hello {name}")</code> (f-strings).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">أنواع البيانات الأساسية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">int</code> - عدد صحيح: <code class="text-primary">42</code></li>
        <li><code class="text-primary">float</code> - عدد عشري: <code class="text-primary">3.14</code></li>
        <li><code class="text-primary">str</code> - نص: <code class="text-primary">"Hello"</code></li>
        <li><code class="text-primary">list</code> - قائمة: <code class="text-primary">[1, 2, 3]</code></li>
        <li><code class="text-primary">dict</code> - قاموس: <code class="text-primary">{"key": "value"}</code></li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الجمل الشرطية والحلقات</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">if x > 0: print("Positive")</code> - شرط</li>
        <li><code class="text-primary">for i in range(5): print(i)</code> - حلقة تكرار</li>
        <li><code class="text-primary">while x > 0: x -= 1</code> - حلقة شرطية</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الدوال في بايثون</h3>
      <p class="text-text-muted leading-relaxed mb-4">تعريف دالة: <code class="text-primary">def greet(name): return f"Hello {name}"</code>. بايثون تدعم الوسائط الافتراضية والدوال المجهولة (lambda).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">مكتبات أمن المعلومات</h3>
      <p class="text-text-muted leading-relaxed mb-4">بايثون مشهورة في الأمن السيبراني بمكتبات مثل: <code class="text-primary">scapy</code> (التلاعب بالحزم)، <code class="text-primary">requests</code> (HTTP)، <code class="text-primary">beautifulsoup4</code> (تحليل HTML)، <code class="text-primary">cryptography</code> (التشفير).</p>
    `,
    commands: [
      { cmd: 'echo \'print("Hello from Python!")\' > hello.py', output: '' },
      { cmd: 'echo \'name = input("Enter name: ")\' >> hello.py', output: '' },
      { cmd: 'echo \'print(f"Welcome, {name}!")\' >> hello.py', output: '' },
      { cmd: 'python3 -c "import this" 2>/dev/null || echo "Python Zen: Beautiful is better than ugly."', output: 'Python Zen: Beautiful is better than ugly.' },
    ],
  },
  'prem-9': {
    title: 'Burp Suite - اختبار تطبيقات الويب',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">Burp Suite - منصة اختبار الويب</h2>
      <p class="text-text-muted leading-relaxed mb-4">Burp Suite هي المنصة الأشهر لاختبار اختراق تطبيقات الويب. طورتها PortSwigger، وتستخدم على نطاق واسع في اختراق الـ Web Application.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Proxy - اعتراض الطلبات</h3>
      <p class="text-text-muted leading-relaxed mb-4">يعمل Burp Proxy كـ وسيط بين المتصفح والخادم. يمكنك اعتراض وتعديل الـ HTTP Requests قبل إرسالها. هذا مفيد جداً لتحليل الـ API endpoints وتعديل الـ payloads.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Repeater - إعادة الطلبات</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة Repeater تسمح بإرسال نفس الطلب مراراً مع تعديلات. تستخدم لاختبار الـ parameters والـ headers.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Intruder - هجمات آلية</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة Intruder تنفذ هجمات آلية مثل Fuzzing و Brute Force على الـ parameters. تدعم الـ Payload positions والـ Attack types المتعددة (Sniper, Battering Ram, Pitchfork, Cluster Bomb).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Scanner - الماسح الآلي</h3>
      <p class="text-text-muted leading-relaxed mb-4">إصدار Burp Professional يوفر ماسح آلي يكتشف الثغرات مثل SQL Injection, XSS, SSRF, وغيرها. يغطي Top 10 OWASP.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Extensions - الإضافات</h3>
      <p class="text-text-muted leading-relaxed mb-4">Burp يدعم إضافات (BApp Store) مثل: <code class="text-primary">JSON Web Tokens</code> لتحليل JWT، <code class="text-primary">Autorize</code> لاختبار الصلاحيات، <code class="text-primary">Logger++</code> لتسجيل الطلبات.</p>
    `,
    commands: [
      { cmd: 'curl -x http://127.0.0.1:8080 https://example.com -v', output: '*   Trying 127.0.0.1:8080...\n* Connected to 127.0.0.1 (127.0.0.1) port 8080 (#0)\n> GET / HTTP/1.1\n> Host: example.com\n> User-Agent: curl/8.4.0\n> Accept: */*\n>' },
      { cmd: 'echo "[+] Burp Suite Proxy listening on 127.0.0.1:8080"', output: '[+] Burp Suite Proxy listening on 127.0.0.1:8080\n[+] Configure your browser to use HTTP proxy 127.0.0.1:8080' },
      { cmd: 'echo "[+] Captured Request: GET /admin HTTP/1.1"', output: 'GET /admin HTTP/1.1\nHost: target.com\nCookie: session=abc123\n\n[+] Send to Repeater? [Y/n]: Y' },
    ],
  },
  'prem-10': {
    title: 'Hydra - هجمات القوة العمياء',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">Hydra - أداة التخمين المتعددة</h2>
      <p class="text-text-muted leading-relaxed mb-4">Hydra (THC-Hydra) هي أداة قوية جداً لهجمات القوة العمياء (Brute Force) ضد خدمات متعددة. طورتها مجموعة THC وتدعم أكثر من 50 بروتوكول مختلف.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">البروتوكولات المدعومة</h3>
      <p class="text-text-muted leading-relaxed mb-4">Hydra يدعم: SSH، FTP، HTTP/HTTPS (GET/POST)، MySQL، PostgreSQL، SMB، RDP، VNC، SMTP، POP3، IMAP، Telnet، وغيرها.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الاستخدام الأساسي</h3>
      <p class="text-text-muted leading-relaxed mb-4">الأمر الأساسي: <code class="text-primary">hydra -l username -P wordlist.txt ssh://target.com</code>. يستخدم قائمة كلمات مرور ويجربها على المستخدم المحدد.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">قوائم المستخدمين والكلمات</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">-l user</code> - مستخدم واحد</li>
        <li><code class="text-primary">-L users.txt</code> - قائمة مستخدمين</li>
        <li><code class="text-primary">-p pass</code> - كلمة مرور واحدة</li>
        <li><code class="text-primary">-P passwords.txt</code> - قائمة كلمات مرور</li>
        <li><code class="text-primary">-C combo.txt</code> - ملف user:pass مجمع</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">نصائح وحيل</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">-t 4</code> - عدد المهام المتوازية (قلل لتجنب الحظر)</li>
        <li><code class="text-primary">-f</code> - أوقف بعد أول نجاح</li>
        <li><code class="text-primary">-vV</code> - عرض تفصيلي (verbose)</li>
        <li><code class="text-primary">-I</code> - تجاهل الاستئناف (ابدأ من جديد)</li>
      </ul>
    `,
    commands: [
      { cmd: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.10 -t 4 -f', output: 'Hydra v9.6 (c) 2023 by van Hauser/THC\n[DATA] max 4 tasks per 1 server, overall 4 tasks, 14344398 login tries\n[STATUS] 1208.00 tries/min, 1208 tries in 00:01h, 14343190 todo\n[22][ssh] host: 192.168.1.10   login: admin   password: password123\n[STATUS] attack finished for 192.168.1.10 (waiting for children to complete)\n1 of 1 target successfully completed, 1 valid password found' },
      { cmd: 'hydra -L users.txt -P passwords.txt ftp://192.168.1.10 -vV', output: 'Hydra v9.6\n[DATA] max 16 tasks per 1 server, overall 16 tasks, 12 login tries\n[ATTEMPT] target 192.168.1.10 - login "ftpuser" - pass "pass123" - 1 of 12\n[ATTEMPT] target 192.168.1.10 - login "admin" - pass "admin123" - 2 of 12\n[21][ftp] host: 192.168.1.10   login: admin   password: admin123' },
      { cmd: 'echo "[+] Common Hydra protocols: ssh, ftp, http-post-form, rdp, smb, mysql, vnc"', output: '[+] Common Hydra protocols: ssh, ftp, http-post-form, rdp, smb, mysql, vnc' },
    ],
  },
  'prem-11': {
    title: 'John & Hashcat - كسر التشفير',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">كسر كلمات المرور - Password Cracking</h2>
      <p class="text-text-muted leading-relaxed mb-4">John the Ripper و Hashcat هما أقوى أدوات كسر كلمات المرور في عالم الأمن السيبراني. John يستخدم الـ CPU بينما Hashcat يستخدم الـ GPU لتسريع العملية.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">John the Ripper</h3>
      <p class="text-text-muted leading-relaxed mb-4">أداة مفتوحة المصدر لكسر التجزئة (Hashes). تدعم العشرات من أنواع التشفير: MD5, SHA1, SHA256, bcrypt, NTML, وغيرها. تعمل على جميع أنظمة التشغيل.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">john --wordlist=passwords.txt hash.txt</code> - هجوم بالقاموس</li>
        <li><code class="text-primary">john --incremental hash.txt</code> - هجوم شامل (بطيء)</li>
        <li><code class="text-primary">john --show hash.txt</code> - عرض الكلمات المكسورة</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Hashcat</h3>
      <p class="text-text-muted leading-relaxed mb-4">أسرع أداة كسر كلمات مرور في العالم. تستخدم قوة معالجة GPU (NVIDIA/AMD). تدعم أكثر من 300 نوع Hash مع سرعة تصل إلى مليارات المحاولات في الثانية.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">hashcat -m 0 -a 0 hash.txt wordlist.txt</code> - MD5 بالقاموس</li>
        <li><code class="text-primary">hashcat -m 1000 -a 3 hash.txt ?a?a?a?a?a?a?a?a</code> - NTML brute force</li>
        <li><code class="text-primary">hashcat -m 3200 -a 6 hash.txt wordlist.txt ?d?d</code> - bcrypt + mask</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">أنماط الهجوم في Hashcat</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">-a 0</code> - هجوم بالقاموس (Straight)</li>
        <li><code class="text-primary">-a 3</code> - هجوم شامل (Brute-force)</li>
        <li><code class="text-primary">-a 6</code> - هجوم كلمة مع نمط (Wordlist + Mask)</li>
        <li><code class="text-primary">-a 7</code> - نمط مع كلمة (Mask + Wordlist)</li>
        <li><code class="text-primary">-a 1</code> - دمج قاموسين (Combination)</li>
      </ul>
    `,
    commands: [
      { cmd: 'echo "admin:$1$admin$7b9c3a5c8b9d4e0a1f2c3d4e5f6a7b8c" > hash.txt', output: '' },
      { cmd: 'echo -e "password123\\n123456\\nadmin\\nqwerty\\nletmein" > wordlist.txt', output: '' },
      { cmd: 'john --wordlist=wordlist.txt hash.txt 2>/dev/null || echo "Loaded 1 password hash (MD5 Crypt)" && john --show hash.txt 2>/dev/null', output: 'Loaded 1 password hash (MD5 Crypt [128/128 SSE2 4x])\nPress q to abort\nadmin             (admin)\n1 password hash cracked, 0 left' },
      { cmd: 'hashcat -m 0 -a 0 hash.txt wordlist.txt --show 2>/dev/null || echo "Hashcat example: MD5 dictionary attack with --force flag on CPU"', output: 'hashcat (v6.2.6) starting\nOpenCL API (OpenCL 3.0) - Platform #1\n* Device #1: CPU, 16MB\nSession..........: hashcat\nHash.Target......: hash.txt\nGuess.Base.......: wordlist.txt\nadmin:admin:password123\n\nSession..........: completed' },
    ],
  },
  'prem-12': {
    title: 'Gobuster & Dirb - استكشاف الدليل',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">استكشاف الدلائل والملفات المخفية</h2>
      <p class="text-text-muted leading-relaxed mb-4">Gobuster و Dirb هما أدوات لاكتشاف الدلائل والملفات المخفية في خوادم الويب. هذه خطوة أساسية في مرحلة جمع المعلومات وجمع الأهداف.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Gobuster - الأداة الحديثة</h3>
      <p class="text-text-muted leading-relaxed mb-4">Gobuster مكتوب بلغة Go ويعتبر أسرع بكثير من Dirb. يدعم ثلاث أوضاع: استكشاف الدلائل (dir)، استكشاف النطاقات الفرعية (dns)، واستكشاف الـ S3 buckets.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">gobuster dir -u https://target.com -w wordlist.txt</code> - استكشاف دليل</li>
        <li><code class="text-primary">gobuster dns -d target.com -w subdomains.txt</code> - استكشاف نطاقات فرعية</li>
        <li><code class="text-primary">gobuster dir -u https://target.com -w wordlist.txt -x php,txt,html</code> - استكشاف بامتدادات</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">Dirb - الأداة الكلاسيكية</h3>
      <p class="text-text-muted leading-relaxed mb-4">Dirb أداة قديمة لكنها لا تزال مفيدة. تأتي مع قاعدة بيانات كلمات مدمجة ويمكنها اكتشاف أنواع محددة من الملفات.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">dirb https://target.com</code> - فحص بالقائمة الافتراضية</li>
        <li><code class="text-primary">dirb https://target.com /path/to/wordlist.txt</code> - فحص بقائمة مخصصة</li>
        <li><code class="text-primary">dirb https://target.com -X .php,.asp</code> - فحص بامتدادات</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">قوائم الكلمات الشهيرة</h3>
      <p class="text-text-muted leading-relaxed mb-4">أفضل قوائم الكلمات موجودة في: <code class="text-primary">/usr/share/wordlists/dirbuster/</code> (Linux) أو في مشروع SecLists على GitHub. قائمة <code class="text-primary">directory-list-2.3-medium.txt</code> تحتوي على ~220,000 كلمة.</p>
    `,
    commands: [
      { cmd: 'gobuster dir -u https://target.com -w /usr/share/wordlists/dirb/common.txt -t 50', output: '===============================================================\nGobuster v3.6 by OJ Reeves & Christian Mehlmauer\n===============================================================\n[+] Url:                     https://target.com\n[+] Wordlist:                /usr/share/wordlists/dirb/common.txt\n[+] Threads:                 50\n===============================================================\n/admin                (Status: 200) [Size: 2451]\n/backup               (Status: 301) [Size: 312]\n/config.php           (Status: 200) [Size: 1542]\n/login                (Status: 200) [Size: 3210]\n/wp-admin             (Status: 301) [Size: 0]' },
      { cmd: 'gobuster dns -d example.com -w subdomains.txt -t 30', output: '===============================================================\nGobuster v3.6 by OJ Reeves & Christian Mehlmauer\n===============================================================\n[+] Domain:     example.com\n[+] Wordlist:   subdomains.txt\n[+] Threads:    30\n===============================================================\nFound: admin.example.com\nFound: mail.example.com\nFound: dev.example.com\nFound: api.example.com\nFound: staging.example.com' },
      { cmd: 'dirb http://testphp.vulnweb.com /usr/share/dirb/wordlists/common.txt 2>/dev/null || echo "DIRB scan would reveal: /admin, /images, /cgi-bin, .htaccess files"', output: 'DIRB v2.22 By The Dark Raver\nSTART_TIME: Scanning with http://testphp.vulnweb.com/\n---- Scanning URL: http://testphp.vulnweb.com/ ----\n==> DIRECTORY: http://testphp.vulnweb.com/admin/\n==> DIRECTORY: http://testphp.vulnweb.com/images/\n+ http://testphp.vulnweb.com/server-status (CODE:403)\n+ http://testphp.vulnweb.com/cgi-bin/ (CODE:403)' },
    ],
  },
  'prem-13': {
    title: 'Recon-ng - أتمتة الاستطلاع',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">Recon-ng - إطار الاستطلاع المتكامل</h2>
      <p class="text-text-muted leading-relaxed mb-4">Recon-ng هو إطار عمل مفتوح المصدر لأتمتة مرحلة جمع المعلومات (Reconnaissance). صُمم ليكون سهل الاستخدام مع واجهة تشبه Metasploit.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">الوحدات (Modules)</h3>
      <p class="text-text-muted leading-relaxed mb-4">Recon-ng يحتوي على أكثر من 100 وحدة مقسمة إلى أقسام: الاستطلاع (Recon)، الاستغلال (Exploitation)، تقارير (Reporting)، استيراد/تصدير (Import/Export).</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">recon/domains-hosts/google_site_web</code> - بحث Google عن نطاقات</li>
        <li><code class="text-primary">recon/domains-hosts/builtwith</code> - معلومات عن التقنيات المستخدمة</li>
        <li><code class="text-primary">recon/contacts/contacts_harvester</code> - جمع جهات الاتصال</li>
        <li><code class="text-primary">reporting/html</code> - إنشاء تقرير HTML</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">API Keys</h3>
      <p class="text-text-muted leading-relaxed mb-4">للاستفادة القصوى من Recon-ng، تحتاج إلى API Keys من خدمات مثل Shodan, VirusTotal, HaveIBeenPwned, GitHub. تضاف عبر الأمر <code class="text-primary">keys add</code>.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">سير العمل النموذجي</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>إضافة النطاق المستهدف: <code class="text-primary">db insert domains</code></li>
        <li>تشغيل وحدات الاستطلاع لجمع الـ hosts والـ contacts</li>
        <li>جمع المعلومات من المصادر المفتوحة (OSINT)</li>
        <li>تصدير النتائج إلى تقرير HTML أو CSV</li>
      </ul>
    `,
    commands: [
      { cmd: 'recon-ng', output: '[recon-ng][default] > ' },
      { cmd: 'echo "[+] Working in Recon-ng" && echo "db insert domains" && echo "run"', output: '[+] Working in Recon-ng\n[recon-ng][default] > db insert domains\n[recon-ng][default] > domain (TEXT): target.com\n[+] Added domain: target.com\n[recon-ng][default] > marketplace search google\n[recon-ng][default] > marketplace install recon/domains-hosts/google_site_web\n[recon-ng][default] > run' },
      { cmd: 'echo "[+] Recon-ng modules installed: 68/120" && echo "[+] Dataset: 15 hosts, 23 contacts, 8 locations"', output: '[+] Recon-ng modules installed: 68/120\n[+] Dataset: 15 hosts, 23 contacts, 8 locations\n[+] Report generated: /root/.recon-ng/workspaces/default/results.html' },
    ],
  },
  'prem-14': {
    title: 'Bettercap - هجمات الشبكة',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">Bettercap - إطار هجمات الشبكة</h2>
      <p class="text-text-muted leading-relaxed mb-4">Bettercap هو إطار عمل متقدم لتنفيذ هجمات MITM (Man-in-the-Middle) واستراق السمع والتلاعب بحركة مرور الشبكة. بديل حديث وأقوى لـ Ettercap.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">ARP Spoofing</h3>
      <p class="text-text-muted leading-relaxed mb-4">الهجوم الأساسي الذي يقوم به Bettercap هو تسمم ARP. يخدع الأجهزة لترسل حركة المرور عبر جهاز المهاجم بدلاً من الـ Gateway الحقيقي. كل حركة المرور تمر الآن عبر جهازك.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">net.probe on</code> - اكتشاف الأجهزة في الشبكة</li>
        <li><code class="text-primary">arp.spoof on</code> - بدء هجوم ARP spoofing</li>
        <li><code class="text-primary">net.sniff on</code> - التقاط الحزم</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">اعتراض HTTPS</h3>
      <p class="text-text-muted leading-relaxed mb-4">Bettercap يمكنه اعتراض حركة HTTPS عبر تقنية SSL Stripping وتحويل اتصالات HTTPS إلى HTTP (إذا كان الضحية يستخدم HTTP Strict Transport Security ضعيفاً).</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">اختراق كلمات المرور</h3>
      <p class="text-text-muted leading-relaxed mb-4">عند تفعيل <code class="text-primary">net.sniff</code>، Bettercap يلتقط كل حركة المرور ويبحث عن كلمات مرور، Cookies، توكنات، وبيانات حساسة في الـ HTTP traffic. يمكن أيضاً استخدام <code class="text-primary">http.proxy</code> لتعديل الصفحات في الوقت الحقيقي.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">وحدات إضافية</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">ble.recon on</code> - استكشاف أجهزة Bluetooth</li>
        <li><code class="text-primary">wifi.recon on</code> - استكشاف شبكات WiFi</li>
        <li><code class="text-primary">gps</code> - تتبع المواقع</li>
        <li><code class="text-primary">tcp.proxy</code> - اعتراض TCP</li>
      </ul>
    `,
    commands: [
      { cmd: 'sudo bettercap -eval "net.probe on; arp.spoof on; net.sniff on"', output: 'bettercap v2.33.0 (built for linux amd64 with go1.21)\n[10:30:01] [sys.log] [inf] network probing started\n[10:30:01] [sys.log] [inf] arp.spoof attack started for 192.168.1.10\n[10:30:01] [sys.log] [inf] network sniffer started\n[10:30:05] [net.sniff] http.request http://target.com/login (POST) | user=admin pass=secret123' },
      { cmd: 'echo "[+] Detected devices on network:" && sudo bettercap -eval "net.show" -silent 2>/dev/null || echo "Use net.show to list devices"', output: '[+] Detected devices on network:\nIP              MAC                Name\n192.168.1.1     aa:bb:cc:11:22:33  Router\n192.168.1.10    11:22:33:44:55:66  Victim-PC\n192.168.1.15    dd:ee:ff:aa:bb:cc  Smart-TV\n> You are 192.168.1.100' },
      { cmd: 'echo "[+] Captured credentials via Bettercap MITM" && echo "POST http://facebook.com/login.php [email=test@gmail.com pass=mypassword123]"', output: '[+] Captured credentials via Bettercap MITM\nPOST http://facebook.com/login.php [email=test@gmail.com pass=mypassword123]\nPOST http://instagram.com/accounts/login [username=hacker pass=iloveyou123]\nHTTP Cookie captured: sessionid=abc123def456' },
    ],
  },
  'prem-15': {
    title: 'WPScan - اختبار ووردبريس',
    content: `
      <h2 class="text-2xl font-bold text-text mt-6 mb-3">WPScan - ماسح ووردبريس</h2>
      <p class="text-text-muted leading-relaxed mb-4">WPScan هو ماسح ثغرات متخصص في أنظمة WordPress. طورته WPScan Team ويستخدم قاعدة بيانات ثغرات محدثة باستمرار. أداة أساسية لأي مختبِر اختراق.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">جمع المعلومات الأساسية</h3>
      <p class="text-text-muted leading-relaxed mb-4">الفحص الأساسي: <code class="text-primary">wpscan --url https://target.com</code>. يكشف إصدار ووردبريس، الثيمات، الإضافات، والمستخدمين.</p>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li><code class="text-primary">--enumerate u</code> - اكتشاف المستخدمين</li>
        <li><code class="text-primary">--enumerate vp</code> - الإضافات المعرضة للخطر</li>
        <li><code class="text-primary">--enumerate t</code> - الثيمات المثبتة</li>
        <li><code class="text-primary">--enumerate cb</code> - قواعد بيانات الإضافات</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">ثغرات شائعة في ووردبريس</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>حقن SQL عبر إضافات ضعيفة (مثل WooCommerce)</li>
        <li>XSS في الثيمات والإضافات</li>
        <li>رفع ملفات ضارة (File Upload)</li>
        <li>تجاوز المصادقة (Authentication Bypass)</li>
        <li>هجمات القوة العمياء على صفحة تسجيل الدخول</li>
        <li>XML-RPC - هجمات DDoS و Brute Force</li>
      </ul>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">API Token</h3>
      <p class="text-text-muted leading-relaxed mb-4">للحصول على أفضل نتائج، سجل في WPScan API (wpscan.com) واحصل على API Token. هذا يسمح لك بالوصول لقاعدة البيانات الكاملة للثغرات مع تواريخ الإصدار وروابط الـ CVE.</p>

      <h3 class="text-xl font-bold text-text mt-5 mb-3">تأمين ووردبريس</h3>
      <ul class="list-disc list-inside text-text-muted space-y-2 mb-4">
        <li>تحديث ووردبريس والثيمات والإضافات دائماً</li>
        <li>استخدام إضافات أمنية مثل Wordfence أو Sucuri</li>
        <li>تغيير بادئة جداول قاعدة البيانات (wp_ → custom_)</li>
        <li>تعطيل XML-RPC إن لم تستخدمه</li>
        <li>إخفاء إصدار ووردبريس</li>
        <li>تفعيل Two-Factor Authentication</li>
      </ul>
    `,
    commands: [
      { cmd: 'wpscan --url https://target.com --enumerate u,vp --api-token YOUR_API_TOKEN', output: '_______________________________________________________________\n         __          _______   _____\n         \\ \\        / /  __ \\ / ____|\n          \\ \\  /\\  / /| |__) | (___\n           \\ \\/  \\/ / |  ___/ \\___ \\\n            \\  /\\  /  | |     ____) |\n             \\/  \\/   |_|    |_____/\n         WordPress Security Scanner\n_______________________________________________________________\n[i] It seems like you have not set the API token\n[+] WordPress version 6.4.2 identified\n[+] Enumerating Users...\n[i] User(s) Identified:\n[+] admin\n[+] editor\n[+] Enumerating Vulnerable Plugins...\n[+] akismet 4.3.3\n | Found By: Urls In Homepage\n[+] jetpack 12.5\n | [!] 2 vulnerabilities identified' },
      { cmd: 'wpscan --url https://target.com --passwords rockyou.txt --usernames admin', output: '[+] Performing password attack on Xmlrpc\n[+] Progress: 1024 / 14344398 (0.01%)\n[+] Trying admin / password123 - Failed\n[+] Trying admin / 123456 - Failed\n[+] Trying admin / admin123 - Failed\n[\u2713] Valid password found: admin / letmein\n[+] XML-RPC successfully exploited: Valid credentials found' },
      { cmd: 'echo "[+] Common WP vulnerabilities: sql-injection, xss, file-upload, auth-bypass, brute-force"', output: '[+] Common WP vulnerabilities: sql-injection, xss, file-upload, auth-bypass, brute-force\n[+] WPScan DB last updated: 2026-05-30\n[+] Total vulnerabilities in DB: 48,231' },
    ],
  },
};

const trainingSteps: { [key: string]: { instruction: string; instructionEn: string; hint: string; hintEn: string }[] } = {
  'free-1': [
    { instruction: 'اكتب الأمر whoami لمعرفة اسم المستخدم', instructionEn: 'Type whoami to see your username', hint: 'اكتب whoami ثم اضغط Enter', hintEn: 'Type whoami and press Enter' },
    { instruction: 'استخدم الأمر pwd لمعرفة مسارك الحالي', instructionEn: 'Use pwd to see your current path', hint: 'اكتب pwd ثم Enter', hintEn: 'Type pwd then Enter' },
    { instruction: 'أظهر التاريخ والوقت باستخدام date', instructionEn: 'Show date and time using date', hint: 'الأمر هو: date', hintEn: 'The command is: date' },
  ],
  'free-2': [
    { instruction: 'استخدم pwd لترى أين أنت', instructionEn: 'Use pwd to see where you are', hint: 'اكتب pwd', hintEn: 'Type pwd' },
    { instruction: 'استخدم ls -la لعرض كل الملفات', instructionEn: 'Use ls -la to list all files', hint: 'اكتب ls -la', hintEn: 'Type ls -la' },
    { instruction: 'انتقل إلى مجلد Documents باستخدام cd', instructionEn: 'Navigate to Documents using cd', hint: 'اكتب cd Documents', hintEn: 'Type cd Documents' },
  ],
  'free-3': [
    { instruction: 'أنشئ مجلد باسم test_folder', instructionEn: 'Create a folder called test_folder', hint: 'استخدم mkdir test_folder', hintEn: 'Use mkdir test_folder' },
    { instruction: 'أنشئ ملفاً باسم myfile.txt', instructionEn: 'Create a file called myfile.txt', hint: 'استخدم touch myfile.txt', hintEn: 'Use touch myfile.txt' },
    { instruction: 'انسخ الملف myfile.txt إلى myfile_copy.txt', instructionEn: 'Copy myfile.txt to myfile_copy.txt', hint: 'cp myfile.txt myfile_copy.txt', hintEn: 'Use cp' },
    { instruction: 'احذف الملف myfile_copy.txt', instructionEn: 'Delete myfile_copy.txt', hint: 'rm myfile_copy.txt', hintEn: 'Use rm' },
  ],
  'free-4': [
    { instruction: 'اعرض محتوى ملف notes.txt', instructionEn: 'Show the content of notes.txt', hint: 'cat Documents/notes.txt', hintEn: 'Use cat with the path' },
    { instruction: 'اعرض أول سطرين من ملف .bashrc', instructionEn: 'Show the first 2 lines of .bashrc', hint: 'head -n 2 ~/.bashrc', hintEn: 'Use head -n 2' },
    { instruction: 'استخدم wc لعد سطور ملف notes.txt', instructionEn: 'Use wc to count lines in notes.txt', hint: 'wc Documents/notes.txt', hintEn: 'Use wc command' },
  ],
  'free-5': [
    { instruction: 'اعرض صلاحيات الملفات في المجلد الحالي', instructionEn: 'Show file permissions in current directory', hint: 'ls -l', hintEn: 'Use ls -l' },
    { instruction: 'أضف صلاحية التنفيذ لملف practice.sh', instructionEn: 'Add execute permission to practice.sh', hint: 'chmod +x practice.sh', hintEn: 'Use chmod +x' },
    { instruction: 'تحقق من صلاحيات practice.sh بعد التعديل', instructionEn: 'Check practice.sh permissions after change', hint: 'ls -l practice.sh', hintEn: 'Use ls -l' },
  ],
  'free-6': [
    { instruction: 'ابحث عن كلمة "Linux" في ملف notes.txt', instructionEn: 'Search for "Linux" in notes.txt', hint: 'grep "Linux" Documents/notes.txt', hintEn: 'Use grep' },
    { instruction: 'ابحث عن "todo" متجاهلاً حالة الأحرف', instructionEn: 'Search for "todo" case insensitive', hint: 'grep -i "todo" Documents/todo.md', hintEn: 'Use grep -i' },
    { instruction: 'ابحث عن كلمة "echo" في كل الملفات', instructionEn: 'Search for "echo" in all files', hint: 'grep -r "echo" .', hintEn: 'Use grep -r' },
  ],
  'prem-1': [
    { instruction: 'استخدم whois لاكتشاف معلومات عن example.com', instructionEn: 'Use whois to discover info about example.com', hint: 'example.com مدرج كبيانات تجريبية', hintEn: 'Use whois example.com' },
    { instruction: 'استخدم dig لاستعلام DNS', instructionEn: 'Use dig for DNS query', hint: 'dig example.com A', hintEn: 'Run dig example.com A' },
  ],
  'prem-2': [
    { instruction: 'استخدم tcpdump لالتقاط 3 حزم', instructionEn: 'Use tcpdump to capture 3 packets', hint: 'tcpdump -c 3', hintEn: 'Use tcpdump -c 3' },
    { instruction: 'استخدم netcat لفحص المنافذ', instructionEn: 'Use netcat to scan ports', hint: 'nc -zv 127.0.0.1 22 80', hintEn: 'Use nc -zv' },
  ],
  'prem-3': [
    { instruction: 'استخدم nikto لمسح localhost', instructionEn: 'Use nikto to scan localhost', hint: 'nikto -h http://127.0.0.1', hintEn: 'Use nikto -h' },
    { instruction: 'استخدم sqlmap لاختبار حقن SQL', instructionEn: 'Use sqlmap to test SQL injection', hint: 'sqlmap -u "http://test.com/page?id=1" --batch', hintEn: 'Use sqlmap command' },
  ],
  'prem-4': [
    { instruction: 'شغّل SET وأظهر قائمة الهجمات', instructionEn: 'Run SET and show attack list', hint: 'echo "[+] Starting SET..."', hintEn: 'Use the echo command' },
    { instruction: 'اعرض رابط BeEF hook', instructionEn: 'Show BeEF hook URL', hint: 'echo "[+] BeEF hook URL: ..."', hintEn: 'Use echo' },
  ],
  'prem-5': [
    { instruction: 'استخدم iwconfig لمشاهدة الواجهات', instructionEn: 'Use iwconfig to see interfaces', hint: 'iwconfig', hintEn: 'Type iwconfig' },
    { instruction: 'استخدم airodump-ng للمسح', instructionEn: 'Use airodump-ng to scan', hint: 'airodump-ng wlan0', hintEn: 'Use airodump-ng wlan0' },
  ],
  'prem-6': [
    { instruction: 'عرض قواعد iptables الحالية', instructionEn: 'Show current iptables rules', hint: 'sudo iptables -L -n', hintEn: 'Use iptables -L -n' },
    { instruction: 'اعرض حالة fail2ban لخدمة sshd', instructionEn: 'Show fail2ban status for sshd', hint: 'sudo fail2ban-client status sshd', hintEn: 'Use fail2ban-client' },
  ],
  'free-7': [
    { instruction: 'أنشئ ملف HTML أساسي', instructionEn: 'Create a basic HTML file', hint: 'echo "<h1>Hello World</h1>" > index.html', hintEn: 'Use echo to create index.html' },
    { instruction: 'اعرض محتوى الملف', instructionEn: 'Show the file content', hint: 'cat index.html', hintEn: 'Use cat' },
    { instruction: 'أضف رابط إلى الملف', instructionEn: 'Add a link to the file', hint: 'echo "<a href=\"https://example.com\">Link</a>" >> index.html', hintEn: 'Use echo with append' },
  ],
  'free-8': [
    { instruction: 'أنشئ ملف CSS وأضف أنماطاً', instructionEn: 'Create a CSS file with styles', hint: 'echo "body { color: red; }" > style.css', hintEn: 'Use echo to create style.css' },
    { instruction: 'أضف لون خلفية للملف', instructionEn: 'Add background color', hint: 'echo "body { background: #000; }" > style.css', hintEn: 'Use echo with background' },
    { instruction: 'اعرض محتوى الملف', instructionEn: 'Show the file content', hint: 'cat style.css', hintEn: 'Use cat' },
  ],
  'prem-7': [
    { instruction: 'أنشئ ملف JavaScript', instructionEn: 'Create a JavaScript file', hint: 'echo "console.log(1 + 1);" > app.js', hintEn: 'Use echo to create app.js' },
    { instruction: 'أضف دالة للملف', instructionEn: 'Add a function to the file', hint: 'echo "function greet() { return \'Hi!\'; }" >> app.js', hintEn: 'Use echo with append' },
    { instruction: 'اعرض محتوى الملف', instructionEn: 'Show the file content', hint: 'cat app.js', hintEn: 'Use cat' },
  ],
  'prem-8': [
    { instruction: 'أنشئ ملف بايثون', instructionEn: 'Create a Python file', hint: 'echo "print(2 + 2)" > test.py', hintEn: 'Use echo to create test.py' },
    { instruction: 'أضف متغيرات للملف', instructionEn: 'Add variables to the file', hint: 'echo "name = \'Ali\'; print(name)" >> test.py', hintEn: 'Use echo with append' },
    { instruction: 'اعرض محتوى الملف', instructionEn: 'Show the file content', hint: 'cat test.py', hintEn: 'Use cat' },
  ],
  'prem-9': [
    { instruction: 'استخدم curl عبر Burp Proxy', instructionEn: 'Use curl through Burp Proxy', hint: 'curl -x http://127.0.0.1:8080 https://example.com', hintEn: 'Use curl -x with proxy' },
    { instruction: 'اعرض الطلب الملتقط', instructionEn: 'Show the captured request', hint: 'echo the captured HTTP request', hintEn: 'Use echo to display' },
  ],
  'prem-10': [
    { instruction: 'هاجم SSH باستخدام Hydra', instructionEn: 'Attack SSH with Hydra', hint: 'hydra -l root -P wordlist.txt ssh://target', hintEn: 'Use hydra with ssh' },
    { instruction: 'هاجم FTP باستخدام Hydra', instructionEn: 'Attack FTP with Hydra', hint: 'hydra -L users.txt -P pass.txt ftp://target', hintEn: 'Use hydra with ftp' },
  ],
  'prem-11': [
    { instruction: 'جهز ملف hash للتجربة', instructionEn: 'Prepare a hash file', hint: 'echo "user:\$1\$salt\$hash" > hash.txt', hintEn: 'Use echo to create hash' },
    { instruction: 'شغّل John على الملف', instructionEn: 'Run John on the file', hint: 'john --wordlist=wordlist.txt hash.txt', hintEn: 'Use john with wordlist' },
  ],
  'prem-12': [
    { instruction: 'استخدم gobuster لاكتشاف الدلائل', instructionEn: 'Use gobuster to discover dirs', hint: 'gobuster dir -u https://target.com -w wordlist.txt', hintEn: 'Use gobuster dir' },
    { instruction: 'استخدم dirb للفحص', instructionEn: 'Use dirb to scan', hint: 'dirb https://target.com', hintEn: 'Use dirb' },
  ],
  'prem-13': [
    { instruction: 'أضف نطاقاً في recon-ng', instructionEn: 'Add a domain in recon-ng', hint: 'echo "db insert domains"', hintEn: 'Use echo to simulate' },
    { instruction: 'ابحث عن وحدات google', instructionEn: 'Search for google modules', hint: 'echo "marketplace search google"', hintEn: 'Use echo to simulate' },
  ],
  'prem-14': [
    { instruction: 'اكتشف الأجهزة في الشبكة', instructionEn: 'Discover devices on network', hint: 'echo "net.probe on"', hintEn: 'Use echo to simulate bettercap' },
    { instruction: 'التقط حركة المرور', instructionEn: 'Capture network traffic', hint: 'echo "net.sniff on"', hintEn: 'Use echo to simulate' },
  ],
  'prem-15': [
    { instruction: 'امسح موقع WordPress', instructionEn: 'Scan a WordPress site', hint: 'wpscan --url https://target.com', hintEn: 'Use wpscan with URL' },
    { instruction: 'اكتشف المستخدمين', instructionEn: 'Enumerate users', hint: 'wpscan --url https://target.com --enumerate u', hintEn: 'Use wpscan with enumerate' },
  ],
};

const allLessons = [...FREE_LESSONS, ...PREMIUM_LESSONS];

export default function LessonPage() {
  const { t, lang, dir } = useT();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { firebaseUser, userProfile, refreshProfile } = useAuth();
  const { getLesson: getFsLesson } = useLessons();

  const isPremium = id?.startsWith('prem-');
  const source = isPremium ? premiumLessonData : lessonData;
  const hardcoded = source[id];
  const fsLesson = !hardcoded ? getFsLesson(id) : undefined;
  const data = hardcoded || fsLesson;

  const isPremiumLesson = isPremium || (!!fsLesson && fsLesson.type === 'premium');
  const lessonMeta = (() => {
    if (hardcoded) return allLessons.find(l => l.id === id);
    if (fsLesson) return {
      id: fsLesson.id,
      title: fsLesson.titleAr || fsLesson.title,
      titleEn: fsLesson.title,
      description: fsLesson.descriptionAr || fsLesson.description,
      descriptionEn: fsLesson.description,
      icon: fsLesson.icon || '📄',
      duration: fsLesson.duration || t('lesson.durationFallback'),
    };
    return undefined;
  })();
  const isCompleted = userProfile?.progress?.[id] === 'completed';

  const allLessonMeta: { id: string; title: string; titleEn?: string }[] = [
    ...FREE_LESSONS, ...PREMIUM_LESSONS,
    ...(fsLesson ? [] : []),
  ];
  const currentIndex = allLessonMeta.findIndex(l => l.id === id);
  const prevLesson = currentIndex > 0 ? allLessonMeta[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessonMeta.length - 1 ? allLessonMeta[currentIndex + 1] : null;

  const isFavorited = userProfile?.favorites?.includes(id) || false;

  const handleToggleFavorite = useCallback(async () => {
    if (!firebaseUser) return;
    const updated = await toggleFavorite(firebaseUser.uid, id, userProfile?.favorites);
    await refreshProfile();
    toast.success(updated.includes(id) ? t('fav.added') : t('fav.removed'));
  }, [firebaseUser, id, userProfile, refreshProfile, t]);

  const handleMarkComplete = useCallback(async () => {
    if (!firebaseUser || !userProfile) {
      toast.error(t('error.loginRequired'));
      return;
    }
    try {
      const newProgress = { ...userProfile.progress, [id]: 'completed' as const };
      await updateUserProfile(firebaseUser.uid, { progress: newProgress });
      await refreshProfile();
      toast.success(t('lesson.completedToast'));
    } catch {
      toast.error(t('common.error'));
    }
  }, [firebaseUser, userProfile, id, refreshProfile, lang]);

  if (!data) {
    return (
      <div className="pt-24 text-center">
        <h1 className="text-2xl text-text">{t('lesson.notFound')}</h1>
        <Link href="/courses" className="mt-4 inline-block text-primary hover:underline">{t('lesson.backToCourses')}</Link>
      </div>
    );
  }

  const lessonContent = (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-text-muted text-sm mb-4">
            <FiClock />
            <span>{lessonMeta?.duration || t('lesson.durationFallback')}</span>
            <span className="mx-2">•</span>
            <span className={isPremiumLesson ? 'text-accent' : 'text-primary'}>
              {isPremiumLesson ? t('lesson.paid') : t('lesson.free')}
            </span>
            {isCompleted && (
              <>
                <span className="mx-2">•</span>
                <span className="text-primary flex items-center gap-1">
                  <FiCheckCircle /> {t('lesson.completed')}
                </span>
              </>
            )}
            {firebaseUser && (
              <>
                <span className="mx-2">•</span>
                <button onClick={handleToggleFavorite} className="flex items-center gap-1 hover:scale-110 transition-transform" title={isFavorited ? t('fav.remove') : t('fav.add')}>
                  <FiHeart size={14} className={isFavorited ? 'text-red-400 fill-red-400' : 'text-text-muted'} />
                </button>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-text mb-6">{hardcoded ? data.title : ((data as any).titleAr || (data as any).title)}</h1>

          {/* Security Disclaimer */}
          {(data.showDisclaimer || id.startsWith('prem-') || id === 'free-5' || id === 'free-6' || isPremiumLesson) && (
            <div className="mb-8 p-4 rounded-lg border border-accent/30 bg-accent/5">
              <div className="flex items-start gap-3">
                <span className="text-accent text-xl shrink-0 mt-0.5">⚠️</span>
                <div>
                  <h4 className="text-accent font-bold font-mono text-sm mb-1">{t('lesson.disclaimer')}</h4>
                  <p className="text-text-muted text-xs font-mono leading-relaxed">{t('lesson.disclaimerText')}</p>
                </div>
              </div>
            </div>
          )}

          <div
            className="prose prose-invert max-w-none mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: hardcoded ? data.content : ((data as any).contentAr || (data as any).content || '') }}
          />

          {data.videoUrl && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-text mb-4">{t('lesson.videoLesson')}</h3>
              <div className="rounded-lg overflow-hidden border border-border bg-black">
                <video src={data.videoUrl} controls className="w-full max-h-[500px]" />
              </div>
            </div>
          )}

          {(hardcoded ? data.commands?.length : (data as any).command) ? (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-text mb-4">{t('lesson.tryYourself')}</h3>
              <TerminalDemo
                commands={hardcoded ? data.commands : [{ cmd: (data as any).command, output: (data as any).commandOutput || '' }]}
                autoRun={false}
              />
            </div>
          ) : null}

          {hardcoded && trainingSteps[id] && trainingSteps[id].length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                <FiTerminal size={20} className="text-primary" />
                {t('training.title')}
              </h3>
              <LessonTraining steps={trainingSteps[id]} lessonId={id} />
            </div>
          )}

          {/* Mark complete + Quiz + Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
            <div className="flex gap-2">
              {prevLesson && (
                <Link
                  href={`/lessons/${prevLesson.id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors"
                >
                  {dir === 'rtl' ? <FiChevronRight /> : <FiChevronLeft />} {prevLesson.title}
                </Link>
              )}
            </div>

            <div className="flex gap-2">
              {firebaseUser && !isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-secondary font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <FiCheckCircle /> {t('lesson.markComplete')}
                </button>
              )}

              {firebaseUser && (
                <Link
                  href={`/quiz/${id}`}
                  className="flex items-center gap-2 px-6 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <FiAward /> {t('quiz.title')}
                </Link>
              )}
            </div>

            <div className="flex gap-2">
              {nextLesson && (
                <Link
                  href={`/lessons/${nextLesson.id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-light transition-colors"
                >
                  {nextLesson.title} {dir === 'rtl' ? <FiChevronLeft /> : <FiChevronRight />}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (isPremiumLesson) {
    return <PremiumGuard>{lessonContent}</PremiumGuard>;
  }

  return lessonContent;
}
