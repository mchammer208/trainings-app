import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { saveCheckIn } from "../lib/trainingPersistence";
import type { CheckInData } from "../lib/training";

const CheckInPage: NextPage = () => {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Omit<CheckInData, "date">>({
    energy: 6,
    sleepQuality: 6,
    stress: 4,
    soreness: 4,
    motivation: 6,
    preferredFocus: undefined,
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    saveCheckIn({ ...form, date: new Date().toISOString() });
    setSaved(true);
  };

  return (
    <Layout>
      <h2>Check-in</h2>
      <p>Bewerte kurz deine aktuelle Tagesform.</p>

      {([
        ["energy", "Energie"],
        ["sleepQuality", "Schlafqualität"],
        ["stress", "Stress"],
        ["soreness", "Muskelkater"],
        ["motivation", "Motivation"],
      ] as const).map(([field, label]) => (
        <label key={field} style={{ display: "block", marginBottom: "0.75rem" }}>
          {label}: {form[field]}
          <input
            type="range"
            min={1}
            max={10}
            value={form[field]}
            onChange={(event) => update(field, Number(event.target.value))}
            style={{ display: "block", width: "100%" }}
          />
        </label>
      ))}

      <label style={{ display: "block", marginBottom: "1rem" }}>
        Fokus (optional):
        <select
          value={form.preferredFocus ?? ""}
          onChange={(event) => update("preferredFocus", (event.target.value || undefined) as CheckInData["preferredFocus"])}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="">Kein Fokus</option>
          <option value="push">Push</option>
          <option value="pull">Pull</option>
          <option value="legs">Legs</option>
          <option value="hypertrophy">Hypertrophy</option>
        </select>
      </label>

      <button type="button" onClick={submit}>
        Check-in speichern
      </button>
      {saved && <p>Check-in gespeichert.</p>}

      <p>
        <Link href="/decision">Zur Trainingsentscheidung</Link>
      </p>
    </Layout>
  );
};

export default CheckInPage;
