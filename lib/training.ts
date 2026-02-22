import type { MuscleGroup, TrainingTemplate } from "./templates";

export interface CheckInData {
  date: string;
  energy: number; // 1-10
  sleepQuality: number; // 1-10
  stress: number; // 1-10
  soreness: number; // 1-10
  motivation: number; // 1-10
  preferredFocus?: TrainingTemplate["id"];
}

export interface TrainingSessionRecord {
  date: string;
  templateId: TrainingTemplate["id"];
  znsLoad: number;
  muscleLoad: Partial<Record<MuscleGroup, number>>;
  volume: number;
  intensity: number;
}

export interface DecayConfig {
  znsDailyDecay: number;
  muscleDailyDecay: number;
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  znsDailyDecay: 0.3,
  muscleDailyDecay: 0.4,
};

export interface RecommendationResult {
  template: TrainingTemplate;
  score: number;
  reasons: string[];
  confidence: "hoch" | "mittel" | "niedrig";
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};
