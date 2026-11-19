export type Lang = 'en' | 'pt' | 'es' | 'fr' | 'ar' | 'hi' | 'zh';
export type ReviewLevel = 'professional' | 'official' | 'common' | 'draft';
export type Plan = 'free' | 'premium';
export type Kind = 'guide' | 'scenario' | 'kit';

export interface Review { date: string; level: ReviewLevel; source: string }

export interface Guide {
  id: string;
  kind: Kind;
  category: string;
  plan: Plan;
  vital: boolean;
  /** draft = hidden outside developer mode */
  status: 'published' | 'draft';
  needsReview: boolean;
  title: string;
  summary: string;
  minutes: number;
  difficulty?: number;
  warning?: string;
  now: string[];
  materials: string[];
  related: string[];
  mistakes: string[];
  understand: string[];
  /** optional action timeline per stage (10min,1h,24h,72h,7d,30d) */
  timeline?: Partial<Record<'10min' | '1h' | '24h' | '72h' | '7d' | '30d', string[]>>;
  review: Review;
  tags: string[];
}

export interface Pack {
  lang: Lang;
  version: string;
  guides: Guide[];
}
