export type Plan = 'free' | 'pro' | 'elite';
export type Platform = 'youtube' | 'shorts' | 'reels' | 'tiktok';
export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'error';
export type Verdict = 'viralized' | 'not_viralized';

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  plan: Plan;
  credits: number;
  created_at: string;
}

export interface RetentionPoint {
  second: number;
  retention: number;
}

export interface MetricScores {
  hook_score: number;
  retention_estimated: number;
  share_potential: number;
  audio_quality: number;
  cta_strength: number;
  title_optimization: number;
}

export interface StrongPoint {
  title: string;
  description: string;
}

export interface WeakPoint {
  title: string;
  description: string;
  suggestion: string;
}

export interface MentalTrigger {
  name: string;
  description: string;
  timestamp: string;
}

export interface TranscriptLine {
  timestamp: string;
  text: string;
  type: 'hook' | 'cta' | 'highlight' | 'normal';
}

export interface ScriptRecreation {
  hook: string;
  body: string;
  cta: string;
  plagiarism_risk: number;
  viral_potential: number;
}

export interface AnalysisResult {
  verdict: Verdict;
  overall_analysis: string;
  metrics: MetricScores;
  retention_data: RetentionPoint[];
  strong_points: StrongPoint[];
  weak_points: WeakPoint[];
  mental_triggers: MentalTrigger[];
  transcript: TranscriptLine[];
  script_recreation: ScriptRecreation;
  new_title_suggestion?: string;
  best_posting_times?: Record<Platform, string>;
  hook_suggestions?: string[];
}

export interface Analysis {
  id: string;
  user_id: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  viral_score: number;
  status: AnalysisStatus;
  result: AnalysisResult;
  created_at: string;
}
