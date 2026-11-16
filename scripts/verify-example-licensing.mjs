// Licensing gate for the examples that commit a REDISTRIBUTED build output.
//
// WHY THIS EXISTS
// scripts/verify-publishable-licensing.mjs covers the npm workspaces
// (`packages/*`, `apps/*`): what ships there is a tarball. An example under
// `examples/` is outside the workspaces and `private: true`, so that gate never
// sees it — yet examples/apps-script-demo commits `gas/demo.html`, one page
// that inlines minified third-party code and a font, and that is copied as-is
// to Google Apps Script. That file is a redistribution, with the same duty as a
// tarball: the copyright and licence notices travel with it.
//
// WHAT IT ASSERTS, FOR EVERY DIRECTORY UNDER examples/ THAT HAS A package.json
//   1. It is declared in EXAMPLES below (an example nobody declared is a
//      violation, not a silent pass).
//   2. `license` is declared and a LICENSE file exists and is not a stub.
//   3. The notices file exists next to the artifact, has an inventory, and
//      every inventory row has its licence text section.
//   4. Every inventory row is the version pinned by the example's own
//      package-lock.json (a bump without a rebuild fails here).
//   5. The artifact embeds the notices: it starts with the doctype, then one
//      comment whose body is the notices file (HTML comment delimiters inside
//      the reproduced files spaced out, as scripts/notices.ts of the example
//      writes them).
//   6. A licence family present in the inventory has its text: OFL-1.1 rows
//      require the SIL Open Font License 1.1 text, MIT rows the MIT permission
//      notice, ISC rows the ISC one.
//
// WHAT IT DOES NOT DO
// It does not re-measure the bundle: the inventory is measured by the example's
// own build (which packages own rendered code in the script chunk), and the
// `Apps Script demo` workflow rebuilds and requires the committed files to be
// byte-identical. This gate needs no install of the example, so it runs in the
// unsharded `licensing` job with everything else.
//
// `--generate` (used by `npm run notices:generate`) rebuilds the example when it
// is installed, which rewrites its notices; otherwise it says what was not run.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export const EXAMPLES = [
  {
    dir: "examples/apps-script-demo",
    artifact: "gas/demo.html",
    notices: "gas/THIRD-PARTY-NOTICES.md",
    // First-party scope and the minimum the page is known to embed.
    requiredPackages: [
      "@fontsource-variable/inter", "svelte", "@sentropic/design-system-svelte",
      // The compiled theme: the themes package and the tokens package its values come from.
      "@sentropic/design-system-themes", "@sentropic/design-system-tokens",
    ],
  },
];

const MIN_LICENSE_BYTES = 200;
const PLACEHOLDER_LICENSE_FIELDS = new Set(["UNLICENSED", "UNKNOWN", "NONE", ""]);
const FAMILY_MARKERS = [
  [/\bOFL-1\.1\b/, /SIL OPEN FONT LICENSE Version 1\.1/, "the SIL Open Font License 1.1 text"],
  [/\bMIT\b/, /Permission is hereby granted, free of charge/, "an MIT permission notice"],
  [/\bISC\b/, /Permission to use, copy, modify, and\/or distribute this software/, "the ISC permission notice"],
];

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readText = (path) => {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
};

/** The comment body the example build writes for a notices file. */
export function embeddedForm(notices) {
  return notices.replaceAll("<!--", "<!- -").replaceAll("-->", "- ->").replaceAll("--!>", "- -!>");
}

export function parseInventory(notices) {
  const rows = [];
  for (const line of notices.split("\n")) {
    const match = /^\| `([^`]+)` \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$/.exec(line);
    if (match) rows.push({ name: match[1], version: match[2], license: match[3] });
  }
  return rows;
}

function lockVersions(lock, name) {
  const versions = new Set();
  for (const [path, entry] of Object.entries(lock.packages ?? {})) {
    if (path === `node_modules/${name}` || path.endsWith(`/node_modules/${name}`)) versions.add(entry.version);
  }
  return versions;
}

export function collectViolations(rootDir = root, examples = EXAMPLES) {
  const violations = [];
  const examplesDir = join(rootDir, "examples");
  const present = existsSync(examplesDir)
    ? readdirSync(examplesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(examplesDir, entry.name, "package.json")))
        .map((entry) => `examples/${entry.name}`)
    : [];
  const declared = new Set(examples.map((example) => example.dir));
  for (const dir of present) {
    if (!declared.has(dir)) violations.push(`${dir}: not declared in scripts/verify-example-licensing.mjs (EXAMPLES) — its licensing is not checked.`);
  }

  for (const example of examples) {
    const dir = join(rootDir, example.dir);
    const label = example.dir;
    if (!existsSync(join(dir, "package.json"))) {
      violations.push(`${label}: declared in EXAMPLES but has no package.json.`);
      continue;
    }
    const manifest = readJson(join(dir, "package.json"));
    const license = typeof manifest.license === "string" ? manifest.license.trim() : "";
    if (PLACEHOLDER_LICENSE_FIELDS.has(license.toUpperCase()) || /^SEE LICEN[SC]E IN/i.test(license)) {
      violations.push(`${label}: manifest declares no usable "license" field (found ${JSON.stringify(manifest.license ?? null)}).`);
    }
    const licensePath = join(dir, "LICENSE");
    if (!existsSync(licensePath)) violations.push(`${label}: no LICENSE file.`);
    else if (statSync(licensePath).size < MIN_LICENSE_BYTES) violations.push(`${label}: LICENSE is below ${MIN_LICENSE_BYTES} bytes — a placeholder, not a licence text.`);

    const notices = readText(join(dir, example.notices));
    const artifact = readText(join(dir, example.artifact));
    if (notices === null) violations.push(`${label}: no ${example.notices}. Run \`npm run notices:generate\` (rebuilds the example).`);
    if (artifact === null) violations.push(`${label}: no ${example.artifact}.`);
    if (notices === null || artifact === null) continue;

    const rows = parseInventory(notices);
    if (rows.length === 0) violations.push(`${label}: ${example.notices} has no inventory row.`);
    const names = new Set(rows.map((row) => row.name));
    for (const required of example.requiredPackages) {
      if (!names.has(required)) violations.push(`${label}: ${example.notices} does not list ${required}, which the page embeds.`);
    }
    const lock = readText(join(dir, "package-lock.json"));
    if (lock === null) violations.push(`${label}: no package-lock.json — the inventory versions cannot be checked.`);
    const lockJson = lock === null ? null : JSON.parse(lock);
    for (const row of rows) {
      if (!notices.includes(`\n### ${row.name} ${row.version} — ${row.license}\n`)) {
        violations.push(`${label}: ${example.notices} lists ${row.name} ${row.version} but has no licence text section for it.`);
      }
      if (lockJson !== null) {
        const versions = lockVersions(lockJson, row.name);
        if (!versions.has(row.version)) {
          violations.push(`${label}: ${example.notices} lists ${row.name} ${row.version}, but package-lock.json pins ${versions.size > 0 ? [...versions].join(", ") : "no such package"}. Rebuild the example.`);
        }
      }
    }
    for (const [family, marker, what] of FAMILY_MARKERS) {
      if (rows.some((row) => family.test(row.license)) && !marker.test(notices)) {
        violations.push(`${label}: ${example.notices} lists a ${family.source.replace(/\\b|\\/g, "")} package but lacks ${what}.`);
      }
    }

    const open = "<!doctype html>\n<!--\n";
    const end = artifact.indexOf("-->");
    if (!artifact.startsWith(open) || end < 0) {
      violations.push(`${label}: ${example.artifact} does not start with the third-party notices comment.`);
    } else if (!artifact.slice(open.length, end).endsWith(`\n\n${embeddedForm(notices)}`)) {
      violations.push(`${label}: the notices comment at the top of ${example.artifact} is not the content of ${example.notices}. Rebuild the example.`);
    }
  }
  return { violations, examples };
}

function generate() {
  for (const example of EXAMPLES) {
    const dir = join(root, example.dir);
    if (!existsSync(join(dir, "node_modules"))) {
      console.log(`not run  ${example.dir}: not installed. Run \`npm ci && npm run build\` in that folder to regenerate ${example.notices}.`);
      continue;
    }
    const result = spawnSync("npm", ["run", "build"], { cwd: dir, stdio: "inherit" });
    if (result.status !== 0) {
      console.error(`${example.dir}: build failed, ${example.notices} was not regenerated.`);
      process.exitCode = 1;
    }
  }
}

function main() {
  if (process.argv.includes("--generate")) {
    generate();
    return;
  }
  const { violations, examples } = collectViolations(root);
  if (violations.length > 0) {
    console.error(`Example licensing gate FAILED: ${violations.length} violation(s).\n`);
    for (const violation of violations) console.error(`  - ${violation}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Example licensing gate OK: ${examples.length} example(s) carry a license field, a LICENSE and third-party notices embedded in their redistributed page.`);
  for (const example of examples) console.log(`  ${example.dir} (${example.artifact} + ${example.notices})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
