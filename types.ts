
export interface Job {
  title: string;
  company: string;
  location: string;
  link: string;
  descriptionSnippet: string;
  matchPercentage?: number;
}

export interface Experience {
  role: string;
  company: string;
  dates: string;
  location: string;
  description: string;
  achievements: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface EnhancedCV {
  fullName: string;
  jobTitle: string;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  summary: string;
  experience: Experience[];
  education: {
    degree: string;
    institution: string;
    locationAndDates: string;
    specialization?: string;
  }[];
  certifications: {
    name: string;
    issuerAndYear: string;
  }[];
  skills: SkillCategory[];
  techStack: string;
  languages: string;
  score: number;
  analysis: string;
}

export interface SavedCV {
  id: string;
  data: EnhancedCV;
  rawText: string;
  jobDescription: string;
  timestamp: number;
  userImage?: string;
}

export type AppView = 'home' | 'resumes' | 'cv-enhancer' | 'job-board' | 'interview' | 'settings' | 'login' | 'register' | 'pricing' | 'admin';
export type Theme = 'light' | 'dark';
export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type Language = 'en' | 'nl' | 'de' | 'es' | 'pt' | 'zh' | 'ar' | 'fr' | 'sr';

export interface User {
  name: string;
  email: string;
  tier: SubscriptionTier;
  paymentMethod?: {
    type: 'stripe' | 'paypal';
    details: string; // last 4 for stripe, email for paypal
  };
}

export enum InterviewStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended'
}

export interface AdminStats {
  totalUsers: number;
  plusUsers: number;
  proUsers: number;
  monthlyRevenue: number;
  stripeRevenue: number;
  paypalRevenue: number;
}
