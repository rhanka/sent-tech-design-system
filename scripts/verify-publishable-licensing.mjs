// Licensing gate for publishable packages.
//
// WHY THIS EXISTS
// Before it, no tool in this repository knew the word "license". A twelfth
// publishable package added tomorrow with no `license` field, no LICENSE file
// and no third-party notices would have passed check, test and pack:smoke
// without a murmur - and pack:smoke only ever looked at 7 of the 11 packages
// anyway. Declaring a licence in a commit message is not a gate; this is.
//
// WHAT IT ASSERTS, FOR EVERY WORKSPACE WHOSE MANIFEST IS NOT `private: true`
//   1. `license` is declared, non-empty, and is not the "I have not decided"
//      placeholder SPDX reserves for that (UNLICENSED / SEE LICENSE IN …).
//   2. A LICENSE file exists at the package root and is not a stub.
//   3. LICENSE.THIRD-PARTY.md exists at the package root.
//   4. The notices are current: re-derived from package-lock.json and from the
//      installed upstreams, they match what is committed. A dependency added,
//      bumped or dropped without regenerating fails here.
//   5. BOTH files are really inside the tarball npm would publish. This is
//      measured with `npm pack --dry-run --json`, not assumed from the
//      force-include rules - the rule that makes it work (npm-packlist
//      force-includes `/license{,.*}`) is npm's, can change, and a package
//      could also exclude the file some other way.
//
// SCOPE, STATED SO IT IS NOT MISREAD
// The root manifest is `private: true`: it is never packed, so a LICENSE or a
// notices file at the repository root would ship in nothing. That is why the
// gate is per package, and why the repository root deliberately carries
// neither a LICENSE file nor a `license` field - the tree holds measured
// clones of private brands and tracked state emblems that are not ours to
// relicense, and the manifest field, though inert for npm, is exactly what
// GitHub's licence detection and SBOM tools read.
// apps/docs is likewise private here; it is distributed through GitHub Pages,
// which is a separate question this gate does not answer.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { generateAll, NOTICES_FILENAME, publishableWorkspaces } from "./generate-third-party-notices.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const LICENSE_FILENAME = "LICENSE";
// Below this, a "licence file" is a placeholder, not a licence. The shortest
// real OSI text in common use (ISC) is ~750 bytes.
const MIN_LICENSE_BYTES = 300;
const PLACEHOLDER_LICENSE_FIELDS = new Set(["", "UNLICENSED"]);
// SPDX's "I have not decided, read the file" form is `SEE LICENSE IN <file>`,
// and the filename is free: `SEE LICENSE IN LICENSE`, `SEE LICENSE IN
// LICENSE.txt`, `SEE LICENSE IN ./COPYING` are all the same non-answer. An
// equality test against one spelling catches one spelling and waves the other
// two through, so match the PREFIX - case-insensitively, and after collapsing
// runs of whitespace so `SEE  LICENSE\tIN x` is not a way around it.
const DEFERRED_LICENSE_RE = /^see licen[cs]e in\b/i;

function fileSize(absPath) {
  try {
    const stats = statSync(absPath);
    return stats.isFile() ? stats.size : null;
  } catch {
    return null;
  }
}

/**
 * One `npm pack --dry-run` covering every publishable workspace at once:
 * npm resolves each manifest's `files` field and its own force-include rules
 * exactly as it would at publish time, and reports the real file list. One
 * invocation rather than eleven - measured at well under a second.
 */
function packedFileLists(rootDir, names) {
  // Own cache directory: a dry-run pack still touches npm's cache, and the
  // shared user cache is a cross-process write the gate has no business
  // racing on - it made this check fail under `node --test`, which runs test
  // files in parallel, for a reason that had nothing to do with licensing.
  const cache = join(tmpdir(), "sent-tech-licensing-npm-cache");
  mkdirSync(cache, { recursive: true });

  const args = ["pack", "--dry-run", "--json", "--cache", cache];
  for (const name of names) args.push("-w", name);
  const result = spawnSync("npm", args, {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`npm pack --dry-run failed (exit ${result.status}):\n${result.stderr}`);
  }
  // npm prints warnings on stdout before the JSON payload in some configs;
  // take the payload from the first bracket on.
  const start = result.stdout.indexOf("[");
  if (start === -1) throw new Error(`npm pack --dry-run produced no JSON:\n${result.stdout}`);
  const payload = JSON.parse(result.stdout.slice(start));
  return new Map(payload.map((entry) => [entry.name, new Set(entry.files.map((file) => file.path))]));
}

export function collectViolations(rootDir = root) {
  const violations = [];
  const packages = publishableWorkspaces(rootDir);

  if (packages.length === 0) {
    violations.push("No publishable workspace found - the gate would pass vacuously.");
    return { violations, packages };
  }

  for (const { dir, manifest } of packages) {
    const label = `${manifest.name} (${dir})`;

    const declared =
      typeof manifest.license === "string" ? manifest.license.replace(/\s+/g, " ").trim() : "";
    if (
      declared === "" ||
      PLACEHOLDER_LICENSE_FIELDS.has(declared.toUpperCase()) ||
      DEFERRED_LICENSE_RE.test(declared)
    ) {
      violations.push(
        `${label}: manifest declares no usable "license" field (found ${JSON.stringify(manifest.license ?? null)}).`,
      );
    }

    const licenseBytes = fileSize(join(rootDir, dir, LICENSE_FILENAME));
    if (licenseBytes === null) {
      violations.push(`${label}: no ${LICENSE_FILENAME} file at the package root.`);
    } else if (licenseBytes < MIN_LICENSE_BYTES) {
      violations.push(
        `${label}: ${LICENSE_FILENAME} is ${licenseBytes} bytes, below the ${MIN_LICENSE_BYTES}-byte floor - that is a placeholder, not a licence text.`,
      );
    }

    if (fileSize(join(rootDir, dir, NOTICES_FILENAME)) === null) {
      violations.push(
        `${label}: no ${NOTICES_FILENAME} at the package root. Run \`npm run notices:generate\`.`,
      );
    }
  }

  // Notices freshness, re-derived rather than trusted.
  for (const generated of generateAll(rootDir)) {
    let current;
    try {
      current = readFileSync(join(rootDir, generated.path), "utf8");
    } catch {
      continue; // already reported above as missing
    }
    if (current !== generated.content) {
      violations.push(
        `${generated.name}: ${generated.path} is out of date with package-lock.json and the installed upstreams. Run \`npm run notices:generate\`.`,
      );
    }
  }

  // Tarball membership, measured.
  const packed = packedFileLists(rootDir, packages.map(({ manifest }) => manifest.name));
  for (const { dir, manifest } of packages) {
    const files = packed.get(manifest.name);
    if (!files) {
      violations.push(`${manifest.name} (${dir}): npm pack --dry-run returned no entry for this package.`);
      continue;
    }
    for (const required of [LICENSE_FILENAME, NOTICES_FILENAME]) {
      if (!files.has(required)) {
        violations.push(
          `${manifest.name} (${dir}): ${required} is absent from the tarball npm would publish (${files.size} files packed).`,
        );
      }
    }
  }

  return { violations, packages };
}

function main() {
  const { violations, packages } = collectViolations(root);

  if (violations.length > 0) {
    console.error(`Licensing gate FAILED: ${violations.length} violation(s).\n`);
    for (const violation of violations) console.error(`  - ${violation}`);
    console.error(
      "\nEvery publishable package must declare a license, carry a LICENSE file, and carry" +
        `\nup-to-date ${NOTICES_FILENAME} - all of them inside the published tarball.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Licensing gate OK: ${packages.length} publishable packages carry a license field, ` +
      `a ${LICENSE_FILENAME}, and up-to-date ${NOTICES_FILENAME}, all present in their tarballs.`,
  );
  for (const { dir, manifest } of packages) {
    console.log(`  ${manifest.license.padEnd(6)} ${manifest.name} (${dir})`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
