// Generate one third-party notices file per publishable package.
//
// WHY A GENERATOR AND NOT A HAND-WRITTEN LIST
// A hand-written inventory drifts the moment a dependency is added, bumped or
// dropped, and nothing detects the drift. The runtime closure is already
// recorded, exactly and transitively, in package-lock.json; this script reads
// it there. `--check` re-derives the files in memory and fails on any
// difference, so the committed notices cannot silently go stale.
//
// WHY ONE FILE PER PACKAGE, NAMED LICENSE.THIRD-PARTY.md
// A notices file at the repository root ships in nothing: the root manifest is
// `private: true` and is never packed. Each publishable package therefore
// carries its own, listing only what concerns IT.
// The filename is not cosmetic. npm-packlist force-includes, whatever the
// `files` field says, only: package.json, npm-shrinkwrap.json, and anything
// matching `/readme{,.*}`, `/copying{,.*}`, `/license{,.*}`, `/licence{,.*}`
// (see npm-packlist/lib/index.js). `NOTICE` is NOT in that list — measured on
// npm 11.17.0: a file named `NOTICE` or `NOTICE.md` at a package root is
// dropped from the tarball. `LICENSE.THIRD-PARTY.md` matches `/license{,.*}`
// and is force-included, so the notices travel with every package without a
// per-package `files` entry that a new package could forget.
// scripts/verify-publishable-licensing.mjs asserts the tarball membership for
// real rather than trusting this reasoning.
//
// WHAT IS RECORDED, AND UNDER WHICH OBLIGATION
// Two regimes, deliberately kept apart, because they do not carry the same
// duty:
//   1. Vendored code — third-party source copied INTO our own files and
//      compiled into our published dist/. We distribute a copy, so the
//      copyright notice and permission notice must travel with it. The
//      inventory is MEASURED, not listed: scripts/third-party-sources.json
//      declares a scanner (upstream fingerprint source + notice file) and this
//      script re-derives, on every run, which of our source files carry
//      byte-identical upstream data. Add or drop a glyph and the generated
//      file changes, so `--check` catches it. The licence TEXT is re-read from
//      the upstream package, never retyped.
//   2. Installed dependencies — the transitive runtime closure of the
//      package's `dependencies` / `optionalDependencies`. npm fetches these
//      from the registry with their own licence files; we do not copy them
//      into our tarballs. They are recorded so a consumer can see, in one
//      place, every licence family that lands in their node_modules because of
//      us, and so an incompatible licence appearing transitively is visible.
//
// OUT OF SCOPE, ON PURPOSE
// - peerDependencies: provided by the consumer, not installed by us.
// - devDependencies: never reach a published tarball.
// - @sentropic/* : first-party, covered by each package's own LICENSE.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const NOTICES_FILENAME = "LICENSE.THIRD-PARTY.md";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const FIRST_PARTY_SCOPE = "@sentropic/";

// Files a published package uses to carry its licence text. Matched
// case-insensitively against the package root only (never recursively: a
// nested LICENSE belongs to a vendored sub-work, not to the package itself).
//
// The separator class is `[._-]`, not a bare `.`, and that is the whole point.
// `LICENSE-MIT` / `LICENSE-APACHE` is the convention dual-licensed packages
// use, so a pattern accepting only a dot after `license` declares every one of
// them to carry no licence text at all. Measured on this repository's closure:
// `punycode` and `is-potential-custom-element-name` each ship a complete
// ~1.1 kB MIT text as `LICENSE-MIT.txt`, and the dot-only pattern reported
// both as `source-gap` in notices that ship to consumers. With the separator
// class, one real gap remains in the closure (`saxes`, which ships no licence
// file at all) and nothing else in it changes.
const LICENSE_FILE_RE = /^(licen[cs]e|copying|notice)([._-].*)?$/i;

function readJson(absPath) {
  return JSON.parse(readFileSync(absPath, "utf8"));
}

/** Every workspace directory declared by the root manifest, expanded. */
export function workspaceDirs(rootDir = root) {
  const patterns = readJson(join(rootDir, "package.json")).workspaces ?? [];
  const dirs = [];
  for (const pattern of patterns) {
    if (!pattern.endsWith("/*")) {
      dirs.push(pattern);
      continue;
    }
    const parent = pattern.slice(0, -2);
    let entries;
    try {
      entries = readdirSync(join(rootDir, parent), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = `${parent}/${entry.name}`;
      try {
        statSync(join(rootDir, dir, "package.json"));
      } catch {
        continue;
      }
      dirs.push(dir);
    }
  }
  return dirs.sort();
}

/**
 * The publishable workspaces: those whose manifest is not `private: true`.
 * This is the single definition of "publishable" the licensing gate uses, so a
 * twelfth package added tomorrow is in scope the moment its manifest is not
 * private - nothing to register by hand.
 */
export function publishableWorkspaces(rootDir = root) {
  return workspaceDirs(rootDir)
    .map((dir) => ({ dir, manifest: readJson(join(rootDir, dir, "package.json")) }))
    .filter(({ manifest }) => manifest.private !== true);
}

/**
 * npm's own resolution, replayed against the lockfile: from a package's path,
 * a dependency is looked up in that package's node_modules, then in each
 * ancestor's, up to the root. This is what makes the closure exact - two
 * copies of the same name at different depths are two distinct entries, and a
 * nested copy shadows the hoisted one, exactly as at install time.
 */
function resolveFromLock(lockPackages, fromPath, depName) {
  let dir = fromPath;
  for (;;) {
    const candidate = dir ? `${dir}/node_modules/${depName}` : `node_modules/${depName}`;
    if (lockPackages[candidate]) return candidate;
    if (!dir) return null;
    const cut = dir.lastIndexOf("/node_modules/");
    dir = cut === -1 ? "" : dir.slice(0, cut);
  }
}

/**
 * Transitive runtime closure of one workspace, from the lockfile.
 * Workspace links and first-party @sentropic packages are traversed but not
 * reported: they are ours, and each carries its own LICENSE.
 */
export function runtimeClosure(lock, workspaceDir) {
  const lockPackages = lock.packages;
  const seen = new Set();
  const found = new Map();
  const unresolved = [];
  const queue = [workspaceDir];

  while (queue.length > 0) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    const entry = lockPackages[current];
    if (!entry) continue;

    const deps = { ...(entry.dependencies ?? {}), ...(entry.optionalDependencies ?? {}) };
    for (const depName of Object.keys(deps)) {
      const path = resolveFromLock(lockPackages, current, depName);
      if (!path) {
        unresolved.push({ from: current, name: depName });
        continue;
      }
      const resolved = lockPackages[path];
      // A workspace link: follow it into the linked workspace's own deps.
      if (resolved.link) {
        queue.push(resolved.resolved);
        continue;
      }
      queue.push(path);
      // First-party, even when installed from the registry rather than linked.
      if (depName.startsWith(FIRST_PARTY_SCOPE)) continue;
      if (!found.has(path)) {
        found.set(path, {
          name: depName,
          version: resolved.version,
          license: resolved.license ?? null,
          path,
        });
      }
    }
  }

  return {
    packages: [...found.values()].sort((a, b) =>
      a.name === b.name ? a.version.localeCompare(b.version) : a.name.localeCompare(b.name),
    ),
    unresolved,
  };
}

/** The licence text a dependency actually ships, read from its installed copy. */
function readLicenseText(rootDir, pkgPath) {
  let entries;
  try {
    entries = readdirSync(join(rootDir, pkgPath), { withFileTypes: true });
  } catch {
    return null;
  }
  // Files only: the widened pattern can now match a directory name, and
  // reading a directory as text would abort the whole generation.
  const files = entries
    .filter((entry) => entry.isFile() && LICENSE_FILE_RE.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (files.length === 0) return null;
  return files
    .map((name) => {
      const text = readFileSync(join(rootDir, pkgPath, name), "utf8").replace(/\s+$/, "");
      return files.length === 1 ? text : `${name}:\n\n${text}`;
    })
    .join("\n\n");
}

/** Best-effort holder line for a dependency that ships no licence text at all. */
function fallbackAttribution(rootDir, pkgPath) {
  let manifest;
  try {
    manifest = readJson(join(rootDir, pkgPath, "package.json"));
  } catch {
    return null;
  }
  const author =
    typeof manifest.author === "string"
      ? manifest.author
      : manifest.author?.name
        ? `${manifest.author.name}${manifest.author.url ? ` (${manifest.author.url})` : ""}`
        : null;
  const repository =
    typeof manifest.repository === "string" ? manifest.repository : (manifest.repository?.url ?? null);
  return { author, repository };
}

function indentBlock(text) {
  return text
    .split("\n")
    .map((line) => (line.length > 0 ? `> ${line}` : ">"))
    .join("\n");
}

// Source extensions that can carry copied upstream data and end up compiled
// into dist/. Everything under a package's src/ is fair game; nothing outside
// it is scanned, because nothing outside it is published.
const SCANNABLE_SOURCE_RE = /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|html|svg|css)$/;

// An SVG path payload, in the two shapes our ports write it: a JSX/HTML
// attribute (d="…") and an object property (d: "…"). Trivially short payloads
// are ignored - a two-command stub is not upstream authorship.
const PATH_DATA_RE = /\bd=["']([^"']{8,})["']|\bd:\s*"([^"]{8,})"/g;

/**
 * Index the upstream's own path data: every `d:` payload it publishes, mapped
 * to the icon names that use it. Several icons can share one payload, so the
 * value is a set - naming only one of them would be a guess.
 */
function loadFingerprints(rootDir, scanner) {
  const dir = join(rootDir, scanner.fingerprintDir);
  const index = new Map();
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    throw new Error(
      `Scanner "${scanner.id}": ${scanner.fingerprintDir} is missing. Run npm ci before generating notices.`,
    );
  }
  for (const name of entries) {
    if (!name.endsWith(".js")) continue;
    const source = readFileSync(join(dir, name), "utf8");
    const icon = name.slice(0, -3);
    for (const match of source.matchAll(/\bd:\s*"([^"]+)"/g)) {
      const payload = match[1];
      if (payload.length < 8) continue;
      if (!index.has(payload)) index.set(payload, new Set());
      index.get(payload).add(icon);
    }
  }
  return index;
}

function listSourceFiles(absDir) {
  const out = [];
  const stack = [absDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist") continue;
        stack.push(abs);
        continue;
      }
      if (SCANNABLE_SOURCE_RE.test(entry.name)) out.push(abs);
    }
  }
  return out.sort();
}

/**
 * Which of a package's own published sources carry upstream data verbatim.
 * Only `<package>/src` is scanned: it is what the build compiles into the
 * tarball. Build scripts, tests fixtures and repo tooling outside src/ are not
 * published, so a match there is not a redistribution.
 */
export function scanVendored(rootDir, pkgDir, scanner, fingerprints) {
  const srcDir = join(rootDir, pkgDir, "src");
  if (!existsSync(srcDir)) return null;

  const files = new Map();
  const icons = new Set();
  const payloads = new Set();

  for (const abs of listSourceFiles(srcDir)) {
    const source = readFileSync(abs, "utf8");
    let count = 0;
    for (const match of source.matchAll(PATH_DATA_RE)) {
      const payload = (match[1] ?? match[2]).trim();
      const hit = fingerprints.get(payload);
      if (!hit) continue;
      count += 1;
      payloads.add(payload);
      for (const icon of hit) icons.add(icon);
    }
    if (count > 0) files.set(relative(join(rootDir, pkgDir), abs).split(sep).join("/"), count);
  }

  if (files.size === 0) return null;
  return {
    scanner,
    files: [...files.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    distinctPayloads: payloads.size,
    icons: [...icons].sort(),
  };
}

function renderVendored(rootDir, findings, upstreamVersions, { scanners, hasNote }) {
  const out = [];
  out.push("## 1. Code tiers recopié dans ce paquet");
  out.push("");
  if (findings.length === 0) {
    // Say what was measured, not more. The scanners declared in
    // scripts/third-party-sources.json are the entire reach of this section;
    // writing "ce paquet ne recopie aucune source tierce" would assert an
    // absence nothing here establishes - and, in the three state-design-system
    // themes, would contradict the `unresolved` note printed a few lines below
    // in the same shipped file.
    if (scanners.length === 0) {
      out.push(
        "**Non mesuré.** Aucun amont n'est déclaré dans",
        "`scripts/third-party-sources.json`, donc rien n'a été cherché dans les",
        "sources de ce paquet. Cette section ne dit rien, ni dans un sens ni dans",
        "l'autre.",
      );
      out.push("");
      return out;
    }
    const names = scanners.map((scanner) => `\`${scanner.upstream}\``).join(", ");
    out.push(
      `**Rien de mesuré.** Ce qui a été cherché, littéralement : les données de`,
      `tracé publiées par ${names}, comparées octet pour octet aux sources de ce`,
      "paquet. Aucune n'y figure.",
      "",
      "Ce qui n'a **pas** été cherché : tout amont non déclaré dans",
      "`scripts/third-party-sources.json`. L'absence ci-dessus est donc l'absence",
      "de ces données-là, et non un constat d'absence générale de code tiers dans",
      "ce paquet.",
    );
    if (hasNote) {
      out.push(
        "",
        "Ce paquet porte par ailleurs une section « Points ouverts », plus bas :",
        "elle nomme ce que cette mesure ne couvre pas.",
      );
    }
    out.push("");
    return out;
  }
  out.push(
    "Le code ci-dessous n'est pas une dépendance : il est **copié dans nos sources**",
    "et compilé dans le `dist/` publié. Nous en distribuons donc une copie, et la",
    "notice de copyright comme la notice de permission doivent l'accompagner. Elles",
    "sont reproduites intégralement, sans abréviation.",
    "",
    "L'inventaire ci-dessous est **mesuré** à la génération, en comparant nos",
    "sources à l'amont installé : il ne peut pas se désynchroniser en silence.",
    "",
  );
  for (const finding of findings) {
    const { scanner } = finding;
    const version = upstreamVersions.get(scanner.package) ?? "version non résolue";
    const text = readFileSync(join(rootDir, scanner.licenseFrom), "utf8").replace(/\s+$/, "");
    const totalOccurrences = finding.files.reduce((sum, [, count]) => sum + count, 0);

    out.push(`### ${scanner.upstream} — mesuré contre \`${scanner.package}\` ${version} — ${scanner.spdx}`);
    out.push("");
    out.push(`**Ce qui est copié.** ${scanner.what}`);
    out.push("");
    out.push(
      `**Étendue mesurée.** ${finding.distinctPayloads} chaîne(s) de tracé distincte(s),`,
      `${totalOccurrences} occurrence(s), dans ${finding.files.length} fichier(s) source de ce paquet :`,
      "",
    );
    out.push("| Fichier source | Occurrences |");
    out.push("|---|---|");
    for (const [file, count] of finding.files) out.push(`| \`${file}\` | ${count} |`);
    out.push("");
    out.push(
      `Glyphes amont concernés (une chaîne partagée par plusieurs glyphes les nomme tous) :`,
      finding.icons.map((icon) => `\`${icon}\``).join(", ") + ".",
      "",
    );
    out.push(`**Pourquoi c'est une redistribution.** ${scanner.why}`);
    out.push("");
    out.push(`**Obligation.** ${scanner.obligation}`);
    out.push("");
    out.push(`**Titulaires.** ${scanner.holders.join(" ; ")}.`);
    out.push(`**Amont.** ${scanner.homepage}`);
    out.push("");
    out.push(`**Notice intégrale**, telle que publiée par l'amont dans \`${scanner.licenseFrom}\` :`);
    out.push("");
    out.push(indentBlock(text));
    out.push("");
  }
  return out;
}

function renderInstalled(rootDir, closure) {
  const out = [];
  out.push("## 2. Dépendances installées avec ce paquet");
  out.push("");
  if (closure.packages.length === 0) {
    out.push(
      "Aucune. Ce paquet ne déclare aucune dépendance tierce : installer ce paquet",
      "n'installe aucun code tiers de notre fait.",
    );
    out.push("");
    return out;
  }

  const families = new Map();
  for (const pkg of closure.packages) {
    const key = pkg.license ?? "non déclarée";
    families.set(key, (families.get(key) ?? 0) + 1);
  }

  out.push(
    `Fermeture **transitive** de \`dependencies\` et \`optionalDependencies\`, dérivée`,
    `de \`package-lock.json\` : ${closure.packages.length} paquet(s), ${families.size} famille(s) de licences.`,
    "Ces paquets ne sont pas recopiés dans notre tarball — npm les récupère du",
    "registre avec leurs propres fichiers de licence. Ils sont recensés ici parce",
    "qu'ils arrivent dans le `node_modules` du consommateur de notre fait.",
    "",
  );
  out.push("| Paquet | Version | Licence déclarée |");
  out.push("|---|---|---|");
  for (const pkg of closure.packages) {
    out.push(`| \`${pkg.name}\` | ${pkg.version} | ${pkg.license ?? "non déclarée"} |`);
  }
  out.push("");

  if (families.has("Apache-2.0")) {
    out.push(
      "> **Apache-2.0.** Sa section 4(d) impose de reconduire le fichier `NOTICE` de",
      "> l'amont, lorsqu'il en existe un, dans toute œuvre dérivée distribuée. Les",
      "> textes ci-dessous reprennent chaque fichier de notice publié par l'amont.",
      "",
    );
  }
  if (families.has("BSD-3-Clause")) {
    out.push(
      "> **BSD-3-Clause.** Sa troisième clause interdit d'employer le nom du",
      "> titulaire ou de ses contributeurs pour endosser ou promouvoir un produit",
      "> dérivé sans accord écrit préalable. Nous ne le faisons pas.",
      "",
    );
  }

  out.push("### Textes de notice");
  out.push("");
  for (const pkg of closure.packages) {
    out.push(`#### \`${pkg.name}\` ${pkg.version} — ${pkg.license ?? "licence non déclarée"}`);
    out.push("");
    const text = readLicenseText(rootDir, pkg.path);
    if (text) {
      out.push(indentBlock(text));
    } else {
      const attribution = fallbackAttribution(rootDir, pkg.path);
      out.push(
        `> \`source-gap\` : le paquet publié ne contient aucun fichier de licence.`,
        `> Identifiant déclaré dans son manifeste : ${pkg.license ?? "aucun"}.`,
      );
      if (attribution?.author) out.push(`> Auteur déclaré : ${attribution.author}.`);
      if (attribution?.repository) out.push(`> Dépôt déclaré : ${attribution.repository}.`);
      out.push(
        "> Le texte doit être relu à la source avant toute redistribution d'une copie",
        "> de ce paquet.",
      );
    }
    out.push("");
  }
  return out;
}

export function renderNotices({ rootDir = root, lock, sources, scanners, upstreamVersions, dir, manifest }) {
  const closure = runtimeClosure(lock, dir);
  const vendored = scanners
    .map(({ scanner, fingerprints }) => scanVendored(rootDir, dir, scanner, fingerprints))
    .filter((finding) => finding !== null);
  const note = sources.notes?.[manifest.name] ?? null;

  const out = [];
  out.push(
    "<!-- GÉNÉRÉ par scripts/generate-third-party-notices.mjs — ne pas éditer à la main. -->",
    "<!-- Régénérer : `npm run notices:generate`. La dérive fait échouer `npm run licensing:check`. -->",
    "",
    `# Notices de tiers — \`${manifest.name}\``,
    "",
    `Licence de ce paquet : **${manifest.license ?? "non déclarée"}** — voir \`LICENSE\`.`,
    "Ce fichier couvre le code **tiers**, et lui seul.",
    "",
    "Périmètre, littéralement : le code tiers recopié dans ce paquet (§1) et la",
    "fermeture transitive de ses dépendances d'exécution (§2). Hors périmètre, et",
    "c'est délibéré : les `peerDependencies`, fournies par le consommateur, et les",
    "`devDependencies`, qui n'entrent dans aucun tarball.",
    "",
  );
  out.push(
    ...renderVendored(rootDir, vendored, upstreamVersions, {
      scanners: scanners.map(({ scanner }) => scanner),
      hasNote: note !== null,
    }),
  );
  out.push(...renderInstalled(rootDir, closure));

  if (closure.unresolved.length > 0) {
    out.push("## Non résolu");
    out.push("");
    for (const item of closure.unresolved) {
      out.push(`- \`${item.name}\`, requis par \`${item.from}\`, absent de \`package-lock.json\`.`);
    }
    out.push("");
  }

  if (note) {
    out.push("## Points ouverts", "", note, "");
  }

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

export function generateAll(rootDir = root) {
  const lock = readJson(join(rootDir, "package-lock.json"));
  const sources = readJson(join(rootDir, "scripts", "third-party-sources.json"));
  const scanners = (sources.scanners ?? []).map((scanner) => ({
    scanner,
    fingerprints: loadFingerprints(rootDir, scanner),
  }));
  // Pinned by package-lock.json, so the measured inventory names the exact
  // upstream release it was measured against.
  const upstreamVersions = new Map(
    (sources.scanners ?? []).map((scanner) => [
      scanner.package,
      lock.packages[`node_modules/${scanner.package}`]?.version,
    ]),
  );
  return publishableWorkspaces(rootDir).map(({ dir, manifest }) => ({
    dir,
    name: manifest.name,
    path: join(dir, NOTICES_FILENAME),
    content: renderNotices({ rootDir, lock, sources, scanners, upstreamVersions, dir, manifest }),
  }));
}

function main() {
  const check = process.argv.includes("--check");
  const generated = generateAll(root);
  const stale = [];

  for (const file of generated) {
    let current = null;
    try {
      current = readFileSync(join(root, file.path), "utf8");
    } catch {
      current = null;
    }
    if (current === file.content) continue;
    if (check) {
      stale.push({ path: file.path, reason: current === null ? "absent" : "différent" });
      continue;
    }
    writeFileSync(join(root, file.path), file.content);
    console.log(`${current === null ? "created" : "updated"}  ${file.path}`);
  }

  if (check) {
    if (stale.length > 0) {
      console.error("Notices de tiers périmées ou manquantes :");
      for (const item of stale) console.error(`  - ${item.path} (${item.reason})`);
      console.error("\nRégénérer avec : npm run notices:generate");
      process.exitCode = 1;
      return;
    }
    console.log(`Notices de tiers à jour pour ${generated.length} paquets publiables.`);
    return;
  }

  console.log(`Notices de tiers générées pour ${generated.length} paquets publiables.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
