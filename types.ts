
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

export type AppView = 'home' | 'resumes' | 'cv-enhancer' | 'job-board' | 'interview' | 'settings' | 'login' | 'register' | 'pricing';
export type Theme = 'light' | 'dark';
export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type Language = 'en' | 'nl' | 'de' | 'es' | 'pt' | 'zh' | 'ar' | 'fr' | 'sr';

export interface User {
  name: string;
  email: string;
  tier: SubscriptionTier;
}

export enum InterviewStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended'
}
