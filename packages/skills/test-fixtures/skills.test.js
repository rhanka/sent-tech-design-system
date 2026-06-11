import { test } from "node:test";
import assert from "node:assert";
import { existsSync, readFileSync, writeFileSync, rmSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { audit, defaultRules } from "../dist/index.js";
import { runCommand } from "../dist/cli.js";

function parseCommandReport(output, label) {
  const stdout = (output.stdout || "").trim();
  const stderr = (output.stderr || "").trim();

  const candidates = [stdout, stderr].filter(Boolean);
  for (const candidate of candidates) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
  }

  throw new Error(`Could not extract JSON report for ${label}. stdoutLen=${stdout.length}, stderrLen=${stderr.length}.`);
}

async function runCliCommand(args, options = {}) {
  const originalCwd = process.cwd();
  const targetCwd = options.cwd;
  if (targetCwd) process.chdir(targetCwd);
  try {
    return await runCommand(args);
  } finally {
    if (targetCwd) process.chdir(originalCwd);
  }
}

test("audit inline html successfully", async () => {
  const report = await audit({
    kind: "html",
    value: "<div>Hello World</div>"
  });
  assert.ok(report);
  assert.ok(report.target);
  assert.ok(Array.isArray(report.findings));
});

test("cli supports the WP8 design audit contract", async () => {
  const result = await runCliCommand(["audit", "<button style='width: 24px; height: 24px'>x</button>"]);

  assert.strictEqual(result.status, 1);
  const report = parseCommandReport(result, "design audit");
  assert.strictEqual(report.target.kind, "html");
  assert.ok(Array.isArray(report.findings));
  assert.ok(report.findings.some((finding) => finding.ruleId === "touch-target-44"));
  assert.match(result.stderr, /sentech-design:/);
});

test("package exposes the short design binary", () => {
  const packageJsonPath = resolve(import.meta.dirname || "./test-fixtures", "../package.json");
  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  assert.strictEqual(manifest.bin.design, "./dist/cli.js");
});

test("design init --extract generates DESIGN.md from real css tokens", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-extract-"));
  try {
    writeFileSync(
      join(dir, "theme.css"),
      ":root{--st-foundation-color-blue-500:#1d4ed8;--st-semantic-text-primary:var(--st-foundation-color-blue-500);}",
    );
    const result = await runCliCommand(["init", "--extract"], { cwd: dir });
    assert.strictEqual(result.status, 0);
    const designPath = join(dir, "DESIGN.md");
    assert.ok(existsSync(designPath), "DESIGN.md should be created");
    const content = readFileSync(designPath, "utf-8");
    assert.match(content, /--st-foundation-color-blue-500/);
    assert.match(content, /--st-semantic-text-primary/);
    assert.match(content, /Tokens de design/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("design check --human scores real signals and flags accessibility issues", async () => {
  const clean = await runCliCommand([
    "check",
    "<main><h1>Titre</h1><p>Contenu suffisant pour la page.</p><button>OK</button></main>",
    "--human",
  ]);
  assert.strictEqual(clean.status, 0);
  const cleanReport = parseCommandReport(clean, "design check --human clean");
  assert.strictEqual(cleanReport.heuristics.accessibilityFriction, "none");
  assert.strictEqual(cleanReport.score, 100);

  const dirty = await runCliCommand([
    "check",
    '<div><input type="text"><img src="x.png"></div>',
    "--human",
  ]);
  assert.strictEqual(dirty.status, 1);
  const dirtyReport = parseCommandReport(dirty, "design check --human dirty");
  assert.ok(dirtyReport.metrics.unlabeledInputs >= 1);
  assert.ok(dirtyReport.metrics.imagesWithoutAlt >= 1);
  assert.notStrictEqual(dirtyReport.heuristics.accessibilityFriction, "none");
  assert.ok(dirtyReport.score < 100);
});

test("cli supports design check technical and heuristics aliases", async () => {
  const technical = await runCliCommand([
    "check",
    "--technical",
    "<button style='width: 24px; height: 24px'>x</button>"
  ]);

  assert.strictEqual(technical.status, 1);
  const technicalReport = parseCommandReport(technical, "design check --technical");
  assert.ok(technicalReport.findings.some((finding) => finding.ruleId === "touch-target-44"));

  const heuristics = await runCliCommand([
    "check",
    "--heuristics",
    "<main><h1>Dashboard</h1></main>",
  ]);

  assert.strictEqual(heuristics.status, 0);
  const heuristicsReport = parseCommandReport(heuristics, "design check --heuristics");
  assert.strictEqual(heuristicsReport.score, 100);
  assert.strictEqual(heuristicsReport.heuristics.accessibilityFriction, "none");
});

test("design check --fail-under gates by deterministic quality score", async () => {
  const dirtyHtml = "<style>.hero{color:#fff;background:#000}</style><h1>Titre <span class='badge'>Stable</span></h1>";
  const pass = await runCliCommand(["check", dirtyHtml, "--tech", "--fail-under", "80"]);
  assert.strictEqual(pass.status, 0);
  const passReport = parseCommandReport(pass, "design check --tech --fail-under pass");
  assert.ok(passReport.score >= 80);
  assert.ok(passReport.findings.length > 0);
  assert.match(pass.stderr, /score/);

  const fail = await runCliCommand(["check", dirtyHtml, "--tech", "--fail-under", "99"]);
  assert.strictEqual(fail.status, 1);
  const failReport = parseCommandReport(fail, "design check --tech --fail-under fail");
  assert.ok(failReport.score < 99);
});

test("design check --fail-under aggregates directory HTML targets", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-design-gate-"));
  try {
    writeFileSync(join(dir, "index.html"), "<main><h1>OK</h1><p>Texte court.</p></main>");
    writeFileSync(join(dir, "component.html"), "<style>.hero{color:#fff;background:#000}</style><h1>Titre</h1>");
    const result = await runCliCommand(["check", dir, "--fail-under", "90"]);
    assert.strictEqual(result.status, 0);
    const report = parseCommandReport(result, "design check --fail-under directory");
    assert.strictEqual(report.target.kind, "directory");
    assert.strictEqual(report.pages, 2);
    assert.ok(report.score >= 90);
    assert.ok(report.findings.some((finding) => finding.ruleId === "no-pure-black-white"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("design build scaffolds a real Svelte 5 component file", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-build-"));
  try {
    const result = await runCliCommand(["build", "FancyCard", "--out", dir]);
    assert.strictEqual(result.status, 0);
    const file = join(dir, "FancyCard.svelte");
    assert.ok(existsSync(file), "FancyCard.svelte should be created");
    const content = readFileSync(file, "utf-8");
    assert.match(content, /\$props\(\)/);
    assert.match(content, /st-fancy-card/);
    assert.match(content, /--st-semantic-text-primary/);

    const second = await runCliCommand(["build", "FancyCard", "--out", dir]);
    assert.strictEqual(second.status, 1, "must refuse overwrite without --force");

    const propose = await runCliCommand(["build", "Foo", "--propose"]);
    assert.strictEqual(propose.status, 2, "--propose must be honest (no false success)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("design polish --motion / --essence are deterministic and honest", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-polish-"));
  const file = join(dir, "anim.html");
  writeFileSync(file, "<style>.x{transition: all 0.2s ease;}</style>");
  try {
    const motion = await runCliCommand(["polish", file, "--motion"]);
    assert.strictEqual(motion.status, 0);
    assert.match(readFileSync(file, "utf-8"), /prefers-reduced-motion/);

    const nested = await runCliCommand([
      "polish",
      '<div class="card"><div class="card">x</div></div>',
      "--essence",
    ]);
    assert.strictEqual(nested.status, 1);

    const creative = await runCliCommand(["polish", "<div>x</div>", "--spark"]);
    assert.strictEqual(creative.status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli rejects unsupported persona simulations explicitly", async () => {
  const result = await runCliCommand([
    "check",
    "--personas",
    "<main><h1>Dashboard</h1></main>",
  ]);

  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /--personas/);
});

test("design align --spacing rounds off-grid spacing to the 4px grid", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-spacing-"));
  const targetPath = join(tempDir, "sample.html");
  writeFileSync(targetPath, "<style>.box{padding:5px 10px;margin:7px;border:1px solid red;gap:6px}</style>");
  try {
    const result = await runCliCommand(["align", targetPath, "--spacing"]);
    assert.strictEqual(result.status, 0);
    const out = readFileSync(targetPath, "utf-8");
    assert.match(out, /padding:4px 12px/);
    assert.match(out, /margin:8px/);
    assert.match(out, /gap:8px/);
    assert.match(out, /border:1px solid red/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("cli align tones rewrites common bare hex colors to published theme tokens", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-skills-"));
  const targetPath = join(tempDir, "sample.html");
  writeFileSync(
    targetPath,
    "<style>.panel{color:#0043ce;background:#f8fafc;border-color:#e2e8f0}.copy{color:#0f172a}.muted{color:#64748b}</style>",
    "utf-8"
  );

  try {
    const result = await runCliCommand(["align", targetPath, "--tones"]);

    assert.strictEqual(result.status, 0);
    const aligned = readFileSync(targetPath, "utf-8");
    assert.match(aligned, /var\(--st-semantic-action-primary\)/);
    assert.match(aligned, /var\(--st-semantic-surface-subtle\)/);
    assert.match(aligned, /var\(--st-semantic-border-subtle\)/);
    assert.match(aligned, /var\(--st-semantic-text-primary\)/);
    assert.match(aligned, /var\(--st-semantic-text-muted\)/);
    assert.doesNotMatch(aligned, /var\(--docs-/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("cli align typo rewrites raw font stacks to published font tokens", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-typo-"));
  const targetPath = join(tempDir, "sample.html");
  writeFileSync(
    targetPath,
    "<style>" +
      ".title{font-family:Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif}" +
      ".body{font-family:Inter, system-ui, sans-serif}" +
      ".code{font-family:'SFMono-Regular', Consolas, 'Liberation Mono', monospace}" +
      ".kept{font-family:var(--st-font-sans)}" +
    "</style>",
    "utf-8"
  );

  try {
    const result = await runCliCommand(["align", targetPath, "--typo"]);

    assert.strictEqual(result.status, 0);
    const aligned = readFileSync(targetPath, "utf-8");
    // Raw sans/display/mono stacks become the published tokens.
    assert.match(aligned, /\.title\{font-family:var\(--st-font-sans\)\}/);
    assert.match(aligned, /\.body\{font-family:var\(--st-font-display\)\}/);
    assert.match(aligned, /\.code\{font-family:var\(--st-font-mono\)\}/);
    // Already-tokenized declarations are left untouched (idempotent).
    assert.match(aligned, /\.kept\{font-family:var\(--st-font-sans\)\}/);
    // No raw font names linger.
    assert.doesNotMatch(aligned, /Inter,/);
    assert.doesNotMatch(aligned, /SFMono-Regular/);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("cli align typo is idempotent when fonts are already tokenized", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-typo-idem-"));
  const targetPath = join(tempDir, "sample.html");
  const original = "<style>.a{font-family:var(--st-font-sans)}.b{font-family:var(--st-typography-heading-fontFamily)}</style>";
  writeFileSync(targetPath, original, "utf-8");

  try {
    const result = await runCliCommand(["align", targetPath, "--typo"]);
    assert.strictEqual(result.status, 0);
    assert.strictEqual(readFileSync(targetPath, "utf-8"), original);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("cli init command in non-interactive mode creates PRODUCT.md", async () => {
  
  // Trouver la racine du projet
  let projectRoot = process.cwd();
  while (projectRoot !== resolve(projectRoot, "..")) {
    if (existsSync(resolve(projectRoot, "package.json")) && (existsSync(resolve(projectRoot, "packages")) || existsSync(resolve(projectRoot, "apps")))) {
      break;
    }
    projectRoot = resolve(projectRoot, "..");
  }
  const tempProductPath = resolve(projectRoot, "PRODUCT.md");
  
  // Sauvegarder PRODUCT.md existant
  let backup = null;
  if (existsSync(tempProductPath)) {
    backup = readFileSync(tempProductPath, "utf-8");
  }

  try {
    // Lancer la CLI avec init et --non-interactive
    const result = await runCliCommand(["init", "--non-interactive"]);
    assert.strictEqual(result.status, 0);
    
    // Vérifier que PRODUCT.md existe et contient le registre par défaut
    assert.ok(existsSync(tempProductPath));
    const content = readFileSync(tempProductPath, "utf-8");
    assert.ok(content.includes("## Register"));
    assert.ok(content.includes("product"));
  } finally {
    // Restaurer le backup
    if (backup !== null) {
      writeFileSync(tempProductPath, backup, "utf-8");
    } else if (existsSync(tempProductPath)) {
      rmSync(tempProductPath);
    }
  }
});

// --- Couverture directe des règles WP8 (références historiques + ajout dark-mode)
// Chaque règle : un cas qui la déclenche (positif) + un cas propre (négatif).
// On asserte uniquement le ruleId ciblé, d'autres findings peuvent coexister.

async function ruleIds(html) {
  const report = await audit({ kind: "html", value: html });
  return report.findings.map((f) => f.ruleId);
}
const LONG = "Lorem ipsum dolor sit amet ".repeat(15); // > 300 chars

test("rule single-font: une seule famille typographique → finding", async () => {
  assert.ok((await ruleIds("<style>body{font-family:Inter}</style><p>x</p>")).includes("single-font"));
});
test("rule single-font: deux familles distinctes → pas de finding", async () => {
  assert.ok(!(await ruleIds("<style>h1{font-family:Inter}p{font-family:Georgia}</style>")).includes("single-font"));
});
test("rule single-font: @font-face seul → pas de finding", async () => {
  assert.ok(!(await ruleIds("<style>@font-face{font-family:Marianne;src:url('/fonts/marianne.woff2')}</style><p>x</p>")).includes("single-font"));
});
test("rule single-font: stylesheet lié local → finding", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-single-font-css-"));
  try {
    const appDir = join(dir, "_app");
    const pageDir = join(dir, "components");
    mkdirSync(appDir, { recursive: true });
    mkdirSync(pageDir, { recursive: true });
    writeFileSync(join(appDir, "docs.css"), "body{font-family:Inter, sans-serif}");
    const pagePath = join(pageDir, "button.html");
    writeFileSync(pagePath, '<link rel="stylesheet" href="/_app/docs.css"><p>x</p>');

    const report = await audit({ kind: "file", value: pagePath });
    assert.ok(report.findings.some((finding) => finding.ruleId === "single-font"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rule no-bare-hex: hex inline → finding", async () => {
  assert.ok((await ruleIds('<div style="color:#ff0000">x</div>')).includes("no-bare-hex"));
});
test("rule no-bare-hex: hex direct dans un bloc style → finding", async () => {
  assert.ok((await ruleIds("<style>.x{background:#ffffff}</style><div class=\"x\">x</div>")).includes("no-bare-hex"));
});
test("rule no-bare-hex: déclaration de token CSS → pas de finding", async () => {
  assert.ok(!(await ruleIds("<style>:root{--st-semantic-text-primary:#0f172a;--docs-accent:#0043ce}</style>")).includes("no-bare-hex"));
});
test("rule no-bare-hex: fallback var tokenisé → pas de finding", async () => {
  assert.ok(!(await ruleIds('<div style="color:var(--st-semantic-text-primary, #0f172a)">x</div>')).includes("no-bare-hex"));
});
test("rule no-bare-hex: token sémantique → pas de finding", async () => {
  assert.ok(!(await ruleIds('<div style="color:var(--st-semantic-text-primary)">x</div>')).includes("no-bare-hex"));
});

test("rule no-em-dash: em dash dans la copy → finding", async () => {
  assert.ok((await ruleIds("<p>Avant — après</p>")).includes("no-em-dash"));
});
test("rule no-em-dash: texte imbriqué → un seul finding sur le propriétaire direct", async () => {
  const report = await audit({
    kind: "html",
    value: "<main><section><p>Avant — après <strong>OK</strong></p></section></main>"
  });
  const findings = report.findings.filter((finding) => finding.ruleId === "no-em-dash");

  assert.equal(findings.length, 1);
  assert.match(findings[0].location, /^p\[text=Avant/);
});
test("rule no-em-dash: script et style ignorés", async () => {
  const report = await audit({
    kind: "html",
    value: "<main><style>.x{content:'—'}</style><script>const x = '—';</script><p>Avant, apres</p></main>"
  });

  assert.equal(report.findings.filter((finding) => finding.ruleId === "no-em-dash").length, 0);
});
test("rule no-em-dash: copy sans tiret cadratin → pas de finding", async () => {
  assert.ok(!(await ruleIds("<p>Avant, apres</p>")).includes("no-em-dash"));
});

test("rule side-tab-on-rounded: bordure gauche + radius → finding", async () => {
  assert.ok((await ruleIds('<div style="border-left:4px solid red;border-radius:8px">x</div>')).includes("side-tab-on-rounded"));
});
test("rule side-tab-on-rounded: rail carré (radius 0) → pas de finding", async () => {
  assert.ok(!(await ruleIds('<div style="border-left:4px solid red;border-radius:0">x</div>')).includes("side-tab-on-rounded"));
});

test("rule line-length-cap: paragraphe long sans max-width → finding", async () => {
  assert.ok((await ruleIds(`<p>${LONG}</p>`)).includes("line-length-cap"));
});
test("rule line-length-cap: paragraphe long avec max-width → pas de finding", async () => {
  assert.ok(!(await ruleIds(`<p style="max-width:65ch">${LONG}</p>`)).includes("line-length-cap"));
});
test("rule line-length-cap: max-width depuis style inline → pas de finding", async () => {
  const html = `<style>.docs-section p{max-width:46rem}</style><section class="docs-section"><p>${LONG}</p></section>`;
  assert.ok(!(await ruleIds(html)).includes("line-length-cap"));
});
test("rule line-length-cap: max-width depuis stylesheet lié → pas de finding", async () => {
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-linked-css-"));
  try {
    const appDir = join(dir, "_app");
    const pageDir = join(dir, "components");
    mkdirSync(appDir, { recursive: true });
    mkdirSync(pageDir, { recursive: true });
    writeFileSync(join(appDir, "docs.css"), ".docs-section p{max-width:46rem}");
    const pagePath = join(pageDir, "menu-popover.html");
    writeFileSync(
      pagePath,
      `<link rel="stylesheet" href="/_app/docs.css"><section class="docs-section"><p>${LONG}</p></section>`,
    );

    const report = await audit({ kind: "file", value: pagePath });
    assert.ok(!report.findings.some((finding) => finding.ruleId === "line-length-cap"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rule heading-hierarchy: niveau sauté (H1→H3) → finding", async () => {
  assert.ok((await ruleIds("<h1>A</h1><h3>B</h3>")).includes("heading-hierarchy"));
});
test("rule heading-hierarchy: hiérarchie consécutive (H1→H2) → pas de finding", async () => {
  assert.ok(!(await ruleIds("<h1>A</h1><h2>B</h2>")).includes("heading-hierarchy"));
});

test("rule underline-hardcoded-border: champ avec border-bottom en dur → finding", async () => {
  assert.ok((await ruleIds('<input style="border-bottom:2px solid #161616">')).includes("underline-hardcoded-border"));
});
test("rule underline-hardcoded-border: champ avec box-shadow inset → pas de finding", async () => {
  assert.ok(!(await ruleIds('<input style="box-shadow:inset 0 -2px #161616">')).includes("underline-hardcoded-border"));
});

test("ruleset WP8: 27 règles actives avec traçabilité WP7", () => {
  assert.strictEqual(defaultRules.length, 27);
  for (const rule of defaultRules) {
    assert.ok(rule.principle, `${rule.id} should expose a design principle`);
    assert.ok(rule.wp7Finding, `${rule.id} should expose its WP7 finding source`);
  }
});

test("rule missing-dark-mode: absence de media query dark-mode → finding", async () => {
  const findings = await ruleIds("<style>body{background:#ffffff;color:#0f172a}</style><p>Demo</p>");
  assert.ok(findings.includes("missing-dark-mode"));
});
test("rule missing-dark-mode: media query prefers-color-scheme dark présente → pas de finding", async () => {
  const html = `<style>@media (prefers-color-scheme: dark){body{background:#161616;color:#f4f4f4}}</style><style>body{background:#ffffff;color:#0f172a}</style>`;
  assert.ok(!(await ruleIds(html)).includes("missing-dark-mode"));
});

test("rule cramped-padding: surface avec padding trop faible → finding", async () => {
  assert.ok((await ruleIds('<section class="docs-panel" style="padding:4px"><p>Dense</p></section>')).includes("cramped-padding"));
});
test("rule cramped-padding: padding tokenisé → pas de finding", async () => {
  assert.ok(!(await ruleIds('<section class="docs-panel" style="padding:var(--st-foundation-spacing-4)"><p>OK</p></section>')).includes("cramped-padding"));
});

test("rule motion-subtle: transition sans reduced-motion → finding", async () => {
  assert.ok((await ruleIds("<style>.btn{transition:all 250ms ease}</style><button class='btn'>OK</button>")).includes("motion-subtle"));
});
test("rule motion-subtle: transition tokenisée et reduced-motion aware → pas de finding", async () => {
  const html = "<style>.btn{transition:opacity var(--st-motion-duration-fast) ease}@media (prefers-reduced-motion: reduce){.btn{transition:none}}</style><button class='btn'>OK</button>";
  assert.ok(!(await ruleIds(html)).includes("motion-subtle"));
});

test("rule padding-scale-token: spacing hors grille 4px → finding", async () => {
  assert.ok((await ruleIds("<style>.box{padding:5px;margin:7px;gap:6px}</style><div class='box'>x</div>")).includes("padding-scale-token"));
});
test("rule padding-scale-token: spacing tokenisé ou sur grille → pas de finding", async () => {
  assert.ok(!(await ruleIds("<style>.box{padding:var(--st-foundation-spacing-4);margin:8px;gap:12px}</style><div class='box'>x</div>")).includes("padding-scale-token"));
});

test("rule rail-vs-radius-consistency: rail arrondi → finding", async () => {
  assert.ok((await ruleIds('<aside class="docs-rail" style="border-radius:12px"><a href="#">Item</a></aside>')).includes("rail-vs-radius-consistency"));
});
test("rule rail-vs-radius-consistency: rail carré → pas de finding", async () => {
  assert.ok(!(await ruleIds('<aside class="docs-rail" style="border-radius:0"><a href="#">Item</a></aside>')).includes("rail-vs-radius-consistency"));
});

test("rule grid-variance: grille de cartes uniforme et répétitive → finding", async () => {
  const cards = Array.from({ length: 6 }, (_, i) => `<article class="card">Card ${i}</article>`).join("");
  const html = `<style>.cards{display:grid;grid-template-columns:repeat(3,1fr)}</style><div class="cards">${cards}</div>`;
  assert.ok((await ruleIds(html)).includes("grid-variance"));
});
test("rule grid-variance: grille tokenisée → pas de finding", async () => {
  const cards = Array.from({ length: 6 }, (_, i) => `<article class="card">Card ${i}</article>`).join("");
  const html = `<style>.cards{display:grid;grid-template-columns:var(--st-layout-card-grid)}</style><div class="cards">${cards}</div>`;
  assert.ok(!(await ruleIds(html)).includes("grid-variance"));
});

test("rule contrast-token-pair: paire foreground/background hex à faible contraste → finding", async () => {
  assert.ok((await ruleIds('<div style="color:#777777;background:#888888">Low contrast</div>')).includes("contrast-token-pair"));
});
test("rule contrast-token-pair: paire tokenisée → pas de finding", async () => {
  const html = '<div style="color:var(--st-semantic-text-primary);background:var(--st-semantic-surface-default)">OK</div>';
  assert.ok(!(await ruleIds(html)).includes("contrast-token-pair"));
});

test("rule typography-scale-token: taille typographique hors échelle → finding", async () => {
  assert.ok((await ruleIds("<style>.copy{font-size:15px;line-height:17px}</style><p class='copy'>x</p>")).includes("typography-scale-token"));
});
test("rule typography-scale-token: taille tokenisée ou palier autorisé → pas de finding", async () => {
  const html = "<style>.copy{font-size:var(--st-typography-body-size);line-height:24px}</style><p class='copy'>x</p>";
  assert.ok(!(await ruleIds(html)).includes("typography-scale-token"));
});

test("rule no-pure-black-white: noir/blanc purs → finding", async () => {
  const html = "<style>.hero{color:#ffffff;background:#000}</style><section class='hero'>x</section>";
  assert.ok((await ruleIds(html)).includes("no-pure-black-white"));
});
test("rule no-pure-black-white: couleurs tokenisées → pas de finding", async () => {
  const html = "<style>.hero{color:var(--st-semantic-text-inverse);background:var(--st-semantic-surface-inverse)}</style><section class='hero'>x</section>";
  assert.ok(!(await ruleIds(html)).includes("no-pure-black-white"));
});

test("rule raw-color-value: fonction couleur brute → finding", async () => {
  const html = "<style>.badge{background:rgb(22 163 74);color:hsl(0 0% 100%)}</style><span class='badge'>OK</span>";
  assert.ok((await ruleIds(html)).includes("raw-color-value"));
});
test("rule raw-color-value: fonction couleur via token → pas de finding", async () => {
  const html = "<style>.badge{background:var(--st-semantic-feedback-success);color:var(--st-semantic-text-inverse)}</style><span class='badge'>OK</span>";
  assert.ok(!(await ruleIds(html)).includes("raw-color-value"));
});

test("rule font-family-token: famille typographique brute → finding", async () => {
  const html = "<style>.copy{font-family:Inter, system-ui, sans-serif}</style><p class='copy'>x</p>";
  assert.ok((await ruleIds(html)).includes("font-family-token"));
});
test("rule font-family-token: famille typographique tokenisée → pas de finding", async () => {
  const html = "<style>.copy{font-family:var(--st-foundation-font-sans)}</style><p class='copy'>x</p>";
  assert.ok(!(await ruleIds(html)).includes("font-family-token"));
});
test("rule font-family-token: @font-face source → pas de finding", async () => {
  const html = "<style>@font-face{font-family:Marianne;src:url('/fonts/marianne.woff2')}body{font-family:var(--st-foundation-font-sans)}</style><p>x</p>";
  assert.ok(!(await ruleIds(html)).includes("font-family-token"));
});

test("rule display-body-font-pair: même famille display/body → finding", async () => {
  const html = "<style>h1{font-family:Inter}.copy{font-family:Inter}</style><h1>Titre</h1><p class='copy'>Texte</p>";
  assert.ok((await ruleIds(html)).includes("display-body-font-pair"));
});
test("rule display-body-font-pair: tokens display/body distincts → pas de finding", async () => {
  const html = "<style>h1{font-family:var(--st-foundation-font-display)}.copy{font-family:var(--st-foundation-font-sans)}</style><h1>Titre</h1><p class='copy'>Texte</p>";
  assert.ok(!(await ruleIds(html)).includes("display-body-font-pair"));
});

test("rule line-length-max-width: max-width trop large → finding", async () => {
  const html = `<style>.copy{max-width:48rem}</style><p class='copy'>${LONG}</p>`;
  assert.ok((await ruleIds(html)).includes("line-length-max-width"));
});
test("rule line-length-max-width: max-width lisible → pas de finding", async () => {
  const html = `<style>.copy{max-width:65ch}</style><p class='copy'>${LONG}</p>`;
  assert.ok(!(await ruleIds(html)).includes("line-length-max-width"));
});

test("rule h1-inline-badge: badge dans H1 → finding", async () => {
  const html = "<h1>Button <span class='badge'>Stable</span></h1>";
  assert.ok((await ruleIds(html)).includes("h1-inline-badge"));
});
test("rule h1-inline-badge: badge hors H1 → pas de finding", async () => {
  const html = "<header><p><span class='badge'>Stable</span></p><h1>Button</h1></header>";
  assert.ok(!(await ruleIds(html)).includes("h1-inline-badge"));
});

test("rule status-indicator-label: indicateur sans libellé → finding", async () => {
  const html = "<nav><span class='status-dot' style='width:8px;height:8px;border-radius:999px'></span></nav>";
  assert.ok((await ruleIds(html)).includes("status-indicator-label"));
});
test("rule status-indicator-label: indicateur nommé → pas de finding", async () => {
  const html = "<nav><span class='status-dot' aria-label='Documenté' style='width:8px;height:8px;border-radius:999px'></span></nav>";
  assert.ok(!(await ruleIds(html)).includes("status-indicator-label"));
});
test("rule status-indicator-label: libellé court visible → pas de finding", async () => {
  const html = "<span class='st-toggle__state'>On</span>";
  assert.ok(!(await ruleIds(html)).includes("status-indicator-label"));
});
test("rule status-indicator-label: enfant décoratif d'un indicateur nommé → pas de finding", async () => {
  const html = "<span class='st-progressIndicator__indicator' aria-label='Complete: Intake'><span class='st-progressIndicator__dot'></span></span>";
  assert.ok(!(await ruleIds(html)).includes("status-indicator-label"));
});

test("rule redundant-url-label: URL visible redondante → finding", async () => {
  const html = "<footer><a href='https://github.com/rhanka/sent-tech-design-system'>github.com/rhanka/sent-tech-design-system</a></footer>";
  assert.ok((await ruleIds(html)).includes("redundant-url-label"));
});
test("rule redundant-url-label: libellé utile → pas de finding", async () => {
  const html = "<footer><a href='https://github.com/rhanka/sent-tech-design-system'>Repository</a></footer>";
  assert.ok(!(await ruleIds(html)).includes("redundant-url-label"));
});

test("rule auto-fit-card-grid: grille auto-fit de cartes → finding", async () => {
  const cards = Array.from({ length: 5 }, (_, i) => `<article class="card">Card ${i}</article>`).join("");
  const html = `<style>.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}</style><div class="cards">${cards}</div>`;
  assert.ok((await ruleIds(html)).includes("auto-fit-card-grid"));
});
test("rule auto-fit-card-grid: grille via token → pas de finding", async () => {
  const cards = Array.from({ length: 5 }, (_, i) => `<article class="card">Card ${i}</article>`).join("");
  const html = `<style>.cards{display:grid;grid-template-columns:var(--st-layout-card-grid)}</style><div class="cards">${cards}</div>`;
  assert.ok(!(await ruleIds(html)).includes("auto-fit-card-grid"));
});

test("rule focus-visible-ring: outline supprimé sans focus-visible → finding", async () => {
  const html = "<style>button{outline:none}</style><button>OK</button>";
  assert.ok((await ruleIds(html)).includes("focus-visible-ring"));
});
test("rule focus-visible-ring: focus-visible tokenisé → pas de finding", async () => {
  const html = "<style>button{outline:none}button:focus-visible{outline:2px solid var(--st-semantic-focus-ring)}</style><button>OK</button>";
  assert.ok(!(await ruleIds(html)).includes("focus-visible-ring"));
});

test("rule viewport-zoom: user-scalable=no → finding", async () => {
  const html = '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"><main>OK</main>';
  assert.ok((await ruleIds(html)).includes("viewport-zoom"));
});
test("rule viewport-zoom: maximum-scale sous 2 → finding", async () => {
  const html = '<meta name="viewport" content="width=device-width, maximum-scale=1.5"><main>OK</main>';
  assert.ok((await ruleIds(html)).includes("viewport-zoom"));
});
test("rule viewport-zoom: initial-scale et viewport-fit seuls → pas de finding", async () => {
  const html = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><main>OK</main>';
  assert.ok(!(await ruleIds(html)).includes("viewport-zoom"));
});
test("rule viewport-zoom: maximum-scale à 2 → pas de finding", async () => {
  const html = '<meta name="viewport" content="width=device-width, maximum-scale=2"><main>OK</main>';
  assert.ok(!(await ruleIds(html)).includes("viewport-zoom"));
});
