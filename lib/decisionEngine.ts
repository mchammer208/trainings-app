import { DEFAULT_DECAY_CONFIG, clamp, type CheckInData, type DecayConfig, type RecommendationResult, type TrainingSessionRecord } from "./training";
import { TRAINING_TEMPLATES, type MuscleGroup, type TrainingTemplate } from "./templates";

export interface ScoreContext {
  checkIn: CheckInData;
  history: TrainingSessionRecord[];
  template: TrainingTemplate;
  decayConfig?: DecayConfig;
  now?: Date;
}

interface RecoveryState {
  znsFatigue: number;
  muscleFatigue: Partial<Record<MuscleGroup, number>>;
}

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

const getDaysAgo = (entryDate: string, now: Date): number => {
  const delta = now.getTime() - new Date(entryDate).getTime();
  if (!Number.isFinite(delta) || delta <= 0) return 0;
  return Math.floor(delta / ONE_DAY_MS);
};

const calculateRecoveryState = (
  history: TrainingSessionRecord[],
  decayConfig: DecayConfig,
  now: Date,
): RecoveryState => {
  return history.reduce<RecoveryState>(
    (acc, session) => {
      const daysAgo = getDaysAgo(session.date, now);
      const znsDecayFactor = Math.pow(1 - decayConfig.znsDailyDecay, daysAgo);
      const muscleDecayFactor = Math.pow(1 - decayConfig.muscleDailyDecay, daysAgo);

      acc.znsFatigue += session.znsLoad * znsDecayFactor;

      Object.entries(session.muscleLoad).forEach(([muscle, load]) => {
        if (!load) return;
        const key = muscle as MuscleGroup;
        const previous = acc.muscleFatigue[key] ?? 0;
        acc.muscleFatigue[key] = previous + load * muscleDecayFactor;
      });

      return acc;
    },
    { znsFatigue: 0, muscleFatigue: {} },
  );
};

const normalizeReadiness = (checkIn: CheckInData): number => {
  const positive = checkIn.energy * 0.35 + checkIn.sleepQuality * 0.25 + checkIn.motivation * 0.2;
  const negative = checkIn.stress * 0.1 + checkIn.soreness * 0.1;
  const readinessOnTen = positive - negative;
  return clamp(readinessOnTen / 10, 0, 1);
};

export const calculateTemplateScore = ({
  checkIn,
  history,
  template,
  decayConfig = DEFAULT_DECAY_CONFIG,
  now = new Date(),
}: ScoreContext): number => {
  const readiness = normalizeReadiness(checkIn);
  const recoveryState = calculateRecoveryState(history, decayConfig, now);

  const znsPenalty = clamp(recoveryState.znsFatigue * template.znsLoad * 0.15, 0, 0.35);

  const avgMuscleFatigue =
    template.primaryMuscles.reduce((sum, muscle) => {
      return sum + (recoveryState.muscleFatigue[muscle] ?? 0);
    }, 0) / template.primaryMuscles.length;

  const musclePenalty = clamp(avgMuscleFatigue * 0.2, 0, 0.35);
  const focusBonus = checkIn.preferredFocus === template.id ? 0.08 : 0;

  const score = (readiness + focusBonus - znsPenalty - musclePenalty) * 100;
  return clamp(score, 0, 100);
};

export const generateReasons = (
  template: TrainingTemplate,
  score: number,
  checkIn: CheckInData,
  history: TrainingSessionRecord[],
  decayConfig: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date(),
): string[] => {
  const reasons: string[] = [];
  const readiness = normalizeReadiness(checkIn);
  const recovery = calculateRecoveryState(history, decayConfig, now);

  if (readiness >= 0.7) {
    reasons.push("Dein aktueller Check-in zeigt hohe Bereitschaft für ein anspruchsvolles Training.");
  } else if (readiness >= 0.45) {
    reasons.push("Deine Tagesform ist solide, daher ist eine kontrollierte Belastung sinnvoll.");
  } else {
    reasons.push("Deine Tagesform ist reduziert – wir priorisieren eine besser verträgliche Einheit.");
  }

  const templateMuscleFatigue =
    template.primaryMuscles.reduce((sum, muscle) => sum + (recovery.muscleFatigue[muscle] ?? 0), 0) /
    template.primaryMuscles.length;

  if (templateMuscleFatigue < 0.8) {
    reasons.push(`Die primären Muskelgruppen (${template.primaryMuscles.join(", ")}) sind ausreichend regeneriert.`);
  } else {
    reasons.push("Ein Teil der primären Muskelgruppen zeigt noch Restermüdung, daher wird die Intensität konservativ bewertet.");
  }

  if (checkIn.preferredFocus === template.id) {
    reasons.push("Dein gewählter Fokus passt zur empfohlenen Einheit.");
  }

  if (recovery.znsFatigue > 1.5 && template.znsLoad >= 0.75) {
    reasons.push("Die ZNS-Belastung der letzten Tage ist erhöht; bei dieser Einheit auf Technik und Pausen achten.");
  }

  reasons.push(`Gesamtscore der Empfehlung: ${score.toFixed(1)} / 100.`);
  return reasons;
};

export const calculateConfidence = (scores: number[]): "hoch" | "mittel" | "niedrig" => {
  if (scores.length === 0) return "niedrig";

  const sorted = [...scores].sort((a, b) => b - a);
  const best = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  const delta = best - second;

  if (best >= 75 && delta >= 12) return "hoch";
  if (best >= 55 && delta >= 6) return "mittel";
  return "niedrig";
};

export const recommendTrainingTemplate = (
  checkIn: CheckInData,
  history: TrainingSessionRecord[],
  templates: TrainingTemplate[] = TRAINING_TEMPLATES,
  decayConfig: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date(),
): RecommendationResult => {
  const scored = templates.map((template) => ({
    template,
    score: calculateTemplateScore({ checkIn, history, template, decayConfig, now }),
  }));

  const sorted = scored.sort((a, b) => b.score - a.score);
  const best = sorted[0] ?? { template: templates[0], score: 0 };

  return {
    template: best.template,
    score: best.score,
    reasons: generateReasons(best.template, best.score, checkIn, history, decayConfig, now),
    confidence: calculateConfidence(sorted.map((entry) => entry.score)),
  };
};
