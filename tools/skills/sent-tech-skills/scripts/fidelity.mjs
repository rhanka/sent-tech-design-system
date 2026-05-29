#!/usr/bin/env node
// Wrapper portable installé hors-repo : résout le repo DS via SENT_TECH_DS_ROOT
// (défaut = chemin absolu du repo sur cette machine), puis lance la comparaison
// de fidélité pixel-perfect par bord `tools/compare/fidelity.mjs` avec les args
// transmis. Prérequis : Chrome système (/usr/bin/google-chrome) + build des docs
// (`npm run --workspace apps/docs build`). N'utilise JAMAIS le port 5173.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const root = process.env.SENT_TECH_DS_ROOT || "/home/antoinefa/src/sent-tech-design-system";
const candidates = [
  resolve(root, "tools/compare/fidelity.mjs"),
  "/home/antoinefa/src/sent-tech-design-system/tools/compare/fidelity.mjs"
];
const fidelityPath = candidates.find((c) => existsSync(c));
if (!fidelityPath) {
  process.stderr.write(
    "sent-tech-design: outil de fidélité introuvable. Clone le repo DS ou export SENT_TECH_DS_ROOT=<repo>.\n"
  );
  process.exit(2);
}

// cwd = racine du repo pour que les chemins de sortie (docs/, tools/compare/)
// et la résolution du build docs soient corrects.
const cwd = existsSync(resolve(root, "tools/compare/fidelity.mjs"))
  ? root
  : "/home/antoinefa/src/sent-tech-design-system";

const r = spawnSync("node", [fidelityPath, ...args], { cwd, stdio: "inherit" });
if (r.error) {
  process.stderr.write(`sent-tech-design: échec: ${r.error.message}\n`);
  process.exit(2);
}
process.exit(typeof r.status === "number" ? r.status : 0);
