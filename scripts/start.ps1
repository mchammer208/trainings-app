$ErrorActionPreference = 'Stop'
$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $rootDir

Write-Host "🔎 Starte Vorab-Prüfung..."
try {
  npm run doctor
} catch {
  Write-Host ""
  Write-Host "❌ Vorab-Prüfung fehlgeschlagen. Bitte Hinweise oben beachten."
  exit 1
}

Write-Host ""
if (-not (Test-Path "node_modules")) {
  Write-Host "📦 Installiere Abhängigkeiten (npm install)..."
  npm install
} else {
  Write-Host "✅ node_modules vorhanden, überspringe Installation."
}

Write-Host ""
Write-Host "🚀 Starte Entwicklungsserver..."
npm run dev
