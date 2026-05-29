#!/usr/bin/env node
// Wrapper portable installé hors-repo : résout le moteur DS via SENT_TECH_DS_ROOT
// (défaut = chemin absolu du repo sur cette machine), puis lance `design audit <target>`.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  process.stdout.write("Usage: node scripts/audit.mjs <url | file.html | inline-html>\n");
  process.exit(args.length === 0 ? 1 : 0);
}

const root = process.env.SENT_TECH_DS_ROOT || "/home/antoinefa/src/sent-tech-design-system";
const candidates = [
  resolve(root, "packages/skills/dist/cli.js"),
  "/home/antoinefa/src/sent-tech-design-system/packages/skills/dist/cli.js"
];
const cliPath = candidates.find((c) => existsSync(c));
if (!cliPath) {
  process.stderr.write("sent-tech-design: moteur introuvable. Dans le repo DS: npm run --workspace packages/skills build ; ou export SENT_TECH_DS_ROOT=<repo>.\n");
  process.exit(2);
}

const [target, ...forwarded] = args;
const r = spawnSync("node", [cliPath, "audit", target, ...forwarded], { stdio: "inherit" });
if (r.error) { process.stderr.write(`sent-tech-design: échec: ${r.error.message}\n`); process.exit(2); }
process.exit(typeof r.status === "number" ? r.status : 0);
