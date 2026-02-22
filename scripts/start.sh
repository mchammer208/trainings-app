#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔎 Starte Vorab-Prüfung..."
if ! npm run doctor; then
  echo
  echo "❌ Vorab-Prüfung fehlgeschlagen. Bitte Hinweise oben beachten."
  exit 1
fi

echo
if [ ! -d "node_modules" ]; then
  echo "📦 Installiere Abhängigkeiten (npm install)..."
  npm install
else
  echo "✅ node_modules vorhanden, überspringe Installation."
fi

echo
echo "🚀 Starte Entwicklungsserver..."
npm run dev
