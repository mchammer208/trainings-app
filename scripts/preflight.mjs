#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from "node:child_process";

const run = (command) => {
  try {
    execSync(command, { stdio: "pipe" });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

const checks = [
  {
    name: "Node.js Version >= 18",
    command: "node -e \"const m=Number(process.versions.node.split('.')[0]); if(m<18) process.exit(1)\"",
    fix: "Installiere Node.js 18 oder 20 (empfohlen: 20 LTS).",
  },
  {
    name: "npm erreichbar",
    command: "npm --version",
    fix: "Stelle sicher, dass npm installiert ist und im PATH liegt.",
  },
  {
    name: "npm Registry erreichbar",
    command: "npm view next version",
    fix:
      "Wenn hier 403/Proxy-Fehler kommen: im Unternehmensnetz Proxy/Registry freigeben oder außerhalb des geschützten Netzes installieren.",
  },
];

console.log("\n🔎 Preflight-Check für Trainings-App\n");

let hasError = false;
for (const check of checks) {
  const result = run(check.command);
  if (result.ok) {
    console.log(`✅ ${check.name}`);
  } else {
    hasError = true;
    console.log(`❌ ${check.name}`);
    console.log(`   → ${check.fix}`);
    console.log(`   → Fehlerdetails: ${result.message?.split("\n")[0]}`);
  }
}

console.log("\nNächste Schritte:");
console.log("1) npm install");
console.log("2) npm run dev");
console.log("3) Browser: http://localhost:3000\n");

if (hasError) {
  process.exit(1);
}
