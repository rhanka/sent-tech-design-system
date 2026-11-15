// Self-check of the built page. Compares a build in dist/ with the COMMITTED
// outputs and asserts that the page is self-contained and offline:
//   - dist/demo.html is byte-identical to gas/demo.html, and so are the notices
//     and the size report. After `npm run build:fresh` (which writes dist/ only)
//     this proves that the committed files are what the sources build to.
//   - the third-party notices are embedded at the top of the page
//   - no external resource, no network API, no navigation, no runtime code
//     generation, no storage (rules and their fixtures: scripts/verify-html.ts,
//     scripts/self-check.test.ts)
// Exits with a non-zero status when any assertion fails.
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NOTICES_FILENAME } from "./notices.js";
import { verifyDemoHtml, type Check } from "./verify-html.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = async (path: string): Promise<string | null> => {
  try {
    return await readFile(resolve(root, path), "utf8");
  } catch {
    return null;
  }
};

const html = await read("dist/demo.html");
if (html === null) {
  console.error("dist/demo.html is missing: run `npm run build:fresh` (or `npm run build`) first.");
  process.exit(1);
}
const checks: Check[] = verifyDemoHtml({
  html,
  gasHtml: (await read("gas/demo.html")) ?? "",
  notices: (await read(`gas/${NOTICES_FILENAME}`)) ?? "",
});
const same = async (name: string, built: string, committed: string) => {
  const a = await read(built);
  const b = await read(committed);
  checks.push({ name, found: a !== null && a === b ? 0 : 1, samples: [] });
};
await same(`built notices differ from the committed gas/${NOTICES_FILENAME}`, `dist/${NOTICES_FILENAME}`, `gas/${NOTICES_FILENAME}`);
await same("built size report differs from the committed size-report.json", "dist/size-report.json", "size-report.json");

let failed = 0;
for (const { name, found, samples } of checks) {
  if (found > 0) failed += 1;
  console.log(`${found === 0 ? "PASS" : "FAIL"}  ${name}: ${found}`);
  for (const sample of samples) console.log(`        … ${sample} …`);
}
console.log(`\n${checks.length - failed}/${checks.length} assertions passed`);
if (failed > 0) process.exit(1);
