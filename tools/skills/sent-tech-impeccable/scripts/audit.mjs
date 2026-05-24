#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve, parse } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

function printUsage() {
  process.stdout.write(
    "Usage: node scripts/audit.mjs <url | file.html | inline-html>\\n" +
      "Runs @sentropic/design-system-impeccable and streams the AuditReport JSON result.\\n"
  );
}

function findRepoRoot(startDir) {
  let cursor = startDir;
  for (let i = 0; i < 12; i++) {
    const pkgPath = resolve(cursor, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const raw = readFileSync(pkgPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed?.name === "@sentropic/design-system-root") {
          return cursor;
        }
      } catch {
        // ignore parse/read errors
      }
    }

    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return startDir;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(scriptDir);
const target = args[0];
const forwardedArgs = args.slice(1);

const cliCandidates = [
  resolve(repoRoot, "packages/impeccable/dist/cli.js"),
  resolve(repoRoot, "node_modules/.bin/impeccable-sent-tech"),
  resolve(scriptDir, "../../../../../packages/impeccable/dist/cli.js")
];

const cliPath = cliCandidates.find((candidate) => existsSync(candidate));
if (!cliPath) {
  process.stderr.write(
    "sent-tech-impeccable: CLI non trouvée. Lance d'abord: npm run --workspace packages/impeccable build\\n"
  );
  process.exit(2);
}

const isNodeFile = cliPath.endsWith(".js");
const command = isNodeFile ? "node" : cliPath;
const cliArgs = isNodeFile
  ? [cliPath, "audit", target, ...forwardedArgs]
  : ["audit", target, ...forwardedArgs];

const result = spawnSync(command, cliArgs, {
  cwd: repoRoot,
  stdio: "inherit"
});

if (result.error) {
  process.stderr.write(`sent-tech-impeccable: échec d'exécution: ${result.error.message}\\n`);
  process.exit(2);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(0);
