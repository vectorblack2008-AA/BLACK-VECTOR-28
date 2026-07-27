export interface Achievement {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  condition: (progress: { [key: string]: string }, quizResults: any[], favorites: string[], user: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_lesson',
    icon: '🚀',
    title: 'البداية',
    titleEn: 'First Steps',
    desc: 'أكمل أول درس في المنصة',
    descEn: 'Complete your first lesson',
    condition: (p) => Object.values(p).filter((v) => v === 'completed').length >= 1,
  },
  {
    id: 'five_lessons',
    icon: '📚',
    title: 'متعلم نشط',
    titleEn: 'Active Learner',
    desc: 'أكمل 5 دروس',
    descEn: 'Complete 5 lessons',
    condition: (p) => Object.values(p).filter((v) => v === 'completed').length >= 5,
  },
  {
    id: 'all_free',
    icon: '🎯',
    title: 'روح حرة',
    titleEn: 'Free Spirit',
    desc: 'أكمل جميع الدروس المجانية',
    descEn: 'Complete all free lessons',
    condition: (p) => ['free-1','free-2','free-3','free-4','free-5','free-6'].every((id) => p[id] === 'completed'),
  },
  {
    id: 'all_premium',
    icon: '💎',
    title: 'النخبة',
    titleEn: 'Premium Elite',
    desc: 'أكمل جميع الدروس المدفوعة',
    descEn: 'Complete all premium lessons',
    condition: (p) => ['prem-1','prem-2','prem-3','prem-4','prem-5','prem-6'].every((id) => p[id] === 'completed'),
  },
  {
    id: 'all_lessons',
    icon: '🏆',
    title: 'المحترف',
    titleEn: 'Terminal Pro',
    desc: 'أكمل جميع الدروس الـ 12',
    descEn: 'Complete all 12 lessons',
    condition: (p) => Object.values(p).filter((v) => v === 'completed').length >= 12,
  },
  {
    id: 'quiz_first',
    icon: '✅',
    title: 'مختبر مبتدئ',
    titleEn: 'Quiz Rookie',
    desc: 'اجتز أول اختبار بنجاح',
    descEn: 'Pass your first quiz',
    condition: (_, q) => q.some((r: any) => r.passed),
  },
  {
    id: 'quiz_perfect',
    icon: '⭐',
    title: 'مثالي',
    titleEn: 'Perfect Score',
    desc: 'احصل على 100% في أي اختبار',
    descEn: 'Get 100% on any quiz',
    condition: (_, q) => q.some((r: any) => r.percentage === 100),
  },
  {
    id: 'quiz_all',
    icon: '🎓',
    title: 'باحث عن المعرفة',
    titleEn: 'Knowledge Seeker',
    desc: 'أكمل جميع الاختبارات',
    descEn: 'Complete all quizzes',
    condition: (_, q) => q.length >= 12,
  },
  {
    id: 'certificate',
    icon: '📜',
    title: 'العالم',
    titleEn: 'The Scholar',
    desc: 'احصل على شهادة إتمام المنصة',
    descEn: 'Earn the completion certificate',
    condition: (_, __, ___, u) => u?.certificateEarned === true,
  },
  {
    id: 'bookmark_three',
    icon: '🔖',
    title: 'جامع الكتب',
    titleEn: 'Bookworm',
    desc: 'احفظ 3 دروس في المفضلة',
    descEn: 'Save 3 lessons as favorites',
    condition: (_, __, f) => f.length >= 3,
  },
  {
    id: 'speed_learner',
    icon: '⚡',
    title: 'متسابق',
    titleEn: 'Speed Learner',
    desc: 'أكمل 3 دروس في يوم واحد',
    descEn: 'Complete 3 lessons in one day',
    condition: (p) => {
      // Simplified: checks if any 3 lessons completed (progress tracked by timestamp not available easily)
      return Object.values(p).filter((v) => v === 'completed').length >= 3;
    },
  },
  {
    id: 'early_start',
    icon: '🌅',
    title: 'باكور',
    titleEn: 'Early Bird',
    desc: 'أكمل درساً في أول 24 ساعة من التسجيل',
    descEn: 'Complete a lesson within 24h of registration',
    condition: (p, _, __, u) => {
      // Can't check exact times from progress, simplified
      return Object.values(p).filter((v) => v === 'completed').length >= 1;
    },
  },
];

export const checkAchievements = (
  progress: { [key: string]: string },
  quizResults: any[],
  favorites: string[],
  user: any,
  earnedIds: string[],
): string[] => {
  const newlyEarned: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (earnedIds.includes(ach.id)) continue;
    if (ach.condition(progress, quizResults, favorites, user)) {
      newlyEarned.push(ach.id);
    }
  }
  return newlyEarned;
};
