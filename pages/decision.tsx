import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { recommendTrainingTemplate } from "../lib/decisionEngine";
import { appendTrainingSession, loadCheckIn, loadTrainingHistory } from "../lib/trainingPersistence";
import { TEMPLATE_MAP, TRAINING_TEMPLATES } from "../lib/templates";
import type { TrainingTemplate } from "../lib/templates";
import type { CheckInData, TrainingSessionRecord } from "../lib/training";

const DecisionPage: NextPage = () => {
  const [overrideId, setOverrideId] = useState<TrainingTemplate["id"] | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [history, setHistory] = useState<TrainingSessionRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    setCheckIn(loadCheckIn());
    setHistory(loadTrainingHistory());
    setLoaded(true);
  }, []);

  const recommendation = useMemo(() => {
    if (!checkIn) return null;
    return recommendTrainingTemplate(checkIn, history);
  }, [checkIn, history]);

  const overriddenTemplate = useMemo<TrainingTemplate | null>(() => {
    if (!overrideId) return null;
    return TEMPLATE_MAP[overrideId] ?? null;
  }, [overrideId]);

  const selectedTemplate: TrainingTemplate | null = overriddenTemplate ?? recommendation?.template ?? null;

  const saveCompletedTraining = () => {
    if (!selectedTemplate) return;

    const muscleLoad = selectedTemplate.primaryMuscles.reduce<TrainingSessionRecord["muscleLoad"]>((acc: TrainingSessionRecord["muscleLoad"], muscle) => {
      acc[muscle] = 1;
      return acc;
    }, {});

    const session: TrainingSessionRecord = {
      date: new Date().toISOString(),
      templateId: selectedTemplate.id,
      znsLoad: selectedTemplate.znsLoad,
      muscleLoad,
      volume: selectedTemplate.defaultVolume,
      intensity: selectedTemplate.defaultIntensity,
    };

    appendTrainingSession(session);
    const updatedHistory = loadTrainingHistory();
    setHistory(updatedHistory);
    setSavedMessage(`Einheit „${selectedTemplate.name}“ wurde als absolviert gespeichert.`);
  };

  return (
    <Layout>
      <h2>Trainingsentscheidung</h2>

      {!loaded ? (
        <p>Daten werden geladen…</p>
      ) : !checkIn || !recommendation ? (
        <p>
          Kein Check-in gefunden. <Link href="/checkin">Jetzt Check-in ausfüllen</Link>
        </p>
      ) : (
        <>
          <p>
            <strong>Empfohlene Einheit:</strong> {recommendation.template.name}
          </p>
          <p>
            <strong>Confidence-Level:</strong> {recommendation.confidence}
          </p>
          <p>
            <strong>Score:</strong> {recommendation.score.toFixed(1)} / 100
          </p>

          <h3>Begründung</h3>
          <ul>
            {recommendation.reasons.map((reason: string) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>

          <h3>Override</h3>
          <button type="button" onClick={() => setOverrideId(null)}>
            Empfehlung nutzen
          </button>{" "}
          {TRAINING_TEMPLATES.map((template) => (
            <button key={template.id} type="button" onClick={() => setOverrideId(template.id)}>
              {template.name}
            </button>
          ))}

          {overriddenTemplate && (
            <p>
              Aktiver Override: <strong>{overriddenTemplate.name}</strong>
            </p>
          )}

          <h3>Nächster Schritt</h3>
          <p>
            Als nächstes kannst du die geplante Einheit nach dem Training als absolviert speichern. Dadurch verbessert
            sich die nächste Empfehlung, weil der Verlauf berücksichtigt wird.
          </p>
          <p>
            <strong>Ausgewählte Einheit:</strong> {selectedTemplate?.name ?? "-"}
          </p>
          <button type="button" onClick={saveCompletedTraining}>
            Einheit als absolviert speichern
          </button>

          {savedMessage && <p>{savedMessage}</p>}

          <p>
            <strong>Gespeicherte Einheiten:</strong> {history.length}
          </p>
          {history.length > 0 && (
            <p>
              Letzte Einheit: {TEMPLATE_MAP[history[0].templateId].name} ({new Date(history[0].date).toLocaleDateString()})
            </p>
          )}
        </>
      )}
    </Layout>
  );
};

export default DecisionPage;
