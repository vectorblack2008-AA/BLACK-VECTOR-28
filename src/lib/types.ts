export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: number;
  lastLoginAt?: number;
  isPremium: boolean;
  premiumExpiresAt?: number;
  progress: { [lessonId: string]: 'started' | 'completed' };
  certificateEarned?: boolean;
  certificateIssuedAt?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  favorites?: string[];
  achievements?: string[];
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'free' | 'premium';
  order: number;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface Lesson {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  content: string;
  contentAr: string;
  categoryId: string;
  type: 'free' | 'premium';
  order: number;
  duration: string;
  command?: string;
  commandOutput?: string;
  videoUrl?: string;
  showDisclaimer?: boolean;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteNameAr: string;
  siteAbbr: string;
  siteAbbrAr: string;
  description: string;
  descriptionAr: string;
  logoUrl: string;
  primaryColor: string;
  premiumPrice: number;
  currency: string;
  supportEmail: string;
  footerText: string;
  footerTextAr: string;
  socialGithub: string;
  socialTwitter: string;
  socialYoutube: string;
  updatedAt: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  stripeSessionId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionEn: string;
  options: string[];
  optionsEn: string[];
  correct: number;
}

export interface QuizData {
  lessonId: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  lessonId: string;
  score: number;
  total: number;
  percentage: number;
  answers: number[];
  completedAt: number;
  passed: boolean;
}

export interface CertificateData {
  userId: string;
  displayName: string;
  issuedAt: number;
  averageScore: number;
  lessonsPassed: number;
  totalLessons: number;
  certificateId: string;
}
