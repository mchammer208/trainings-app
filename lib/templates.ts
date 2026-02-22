export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export interface TrainingTemplate {
  id: "push" | "pull" | "legs" | "hypertrophy";
  name: string;
  znsLoad: number;
  primaryMuscles: MuscleGroup[];
  defaultVolume: number;
  defaultIntensity: number;
}

export const TRAINING_TEMPLATES: TrainingTemplate[] = [
  {
    id: "push",
    name: "Push",
    znsLoad: 0.7,
    primaryMuscles: ["chest", "shoulders", "triceps"],
    defaultVolume: 14,
    defaultIntensity: 0.78,
  },
  {
    id: "pull",
    name: "Pull",
    znsLoad: 0.65,
    primaryMuscles: ["back", "biceps", "core"],
    defaultVolume: 14,
    defaultIntensity: 0.75,
  },
  {
    id: "legs",
    name: "Legs",
    znsLoad: 0.8,
    primaryMuscles: ["quads", "hamstrings", "glutes", "calves"],
    defaultVolume: 16,
    defaultIntensity: 0.8,
  },
  {
    id: "hypertrophy",
    name: "Hypertrophy",
    znsLoad: 0.55,
    primaryMuscles: ["chest", "back", "quads", "hamstrings", "shoulders"],
    defaultVolume: 20,
    defaultIntensity: 0.65,
  },
];

export const TEMPLATE_MAP: Record<TrainingTemplate["id"], TrainingTemplate> =
  TRAINING_TEMPLATES.reduce((acc, template) => {
    acc[template.id] = template;
    return acc;
  }, {} as Record<TrainingTemplate["id"], TrainingTemplate>);
