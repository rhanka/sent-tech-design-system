import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptName = process.argv[2];
if (!scriptName) {
  console.error("Usage: node scripts/run-workspaces.mjs <script>");
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const workspacePatterns = Array.isArray(manifest.workspaces) ? manifest.workspaces : [];

let matched = 0;
let ran = 0;

for (const pattern of workspacePatterns) {
  const base = pattern.endsWith("/*") ? pattern.slice(0, -2) : pattern;
  const baseDir = join(root, base);
  if (!existsSync(baseDir)) continue;

  const entries = await import("node:fs").then(({ readdirSync }) =>
    readdirSync(baseDir, { withFileTypes: true }),
  );

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workspaceDir = join(baseDir, entry.name);
    const workspaceManifestPath = join(workspaceDir, "package.json");
    if (!existsSync(workspaceManifestPath)) continue;
    matched += 1;

    const workspaceManifest = JSON.parse(readFileSync(workspaceManifestPath, "utf8"));
    if (!workspaceManifest.scripts?.[scriptName]) continue;
    ran += 1;

    const result = spawnSync("npm", ["run", scriptName], {
      cwd: workspaceDir,
      stdio: "inherit",
      shell: false,
    });

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}

if (matched === 0) {
  console.log(`No workspace packages found for '${scriptName}'.`);
} else if (ran === 0) {
  console.log(`No workspace package defines '${scriptName}'.`);
}
