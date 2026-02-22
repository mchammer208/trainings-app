import type { CheckInData, TrainingSessionRecord } from "./training";

const CHECKIN_KEY = "training:last-checkin";
const HISTORY_KEY = "training:history";

const isBrowser = (): boolean => typeof window !== "undefined";

export const saveCheckIn = (checkIn: CheckInData): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkIn));
};

export const loadCheckIn = (): CheckInData | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(CHECKIN_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CheckInData;
  } catch {
    return null;
  }
};

export const saveTrainingHistory = (history: TrainingSessionRecord[]): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const loadTrainingHistory = (): TrainingSessionRecord[] => {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TrainingSessionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const appendTrainingSession = (session: TrainingSessionRecord): void => {
  const history = loadTrainingHistory();
  history.unshift(session);
  saveTrainingHistory(history.slice(0, 60));
};
