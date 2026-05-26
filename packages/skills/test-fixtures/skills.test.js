import { test } from "node:test";
import assert from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { audit } from "../dist/index.js";

test("audit inline html successfully", async () => {
  const report = await audit({
    kind: "html",
    value: "<div>Hello World</div>"
  });
  assert.ok(report);
  assert.ok(report.target);
  assert.ok(Array.isArray(report.findings));
});

test("cli supports the WP8 design audit contract", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const result = spawnSync(
    process.execPath,
    [cliPath, "audit", "<button style='width: 24px; height: 24px'>x</button>"],
    { encoding: "utf-8" }
  );

  assert.strictEqual(result.status, 1);
  const report = JSON.parse(result.stdout);
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

test("design init --extract generates DESIGN.md from real css tokens", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-extract-"));
  try {
    writeFileSync(
      join(dir, "theme.css"),
      ":root{--st-foundation-color-blue-500:#1d4ed8;--st-semantic-text-primary:var(--st-foundation-color-blue-500);}",
    );
    const result = spawnSync(process.execPath, [cliPath, "init", "--extract"], {
      cwd: dir,
      encoding: "utf-8",
    });
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

test("design check --human scores real signals and flags accessibility issues", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const clean = spawnSync(
    process.execPath,
    [cliPath, "check", "<main><h1>Titre</h1><p>Contenu suffisant pour la page.</p><button>OK</button></main>", "--human"],
    { encoding: "utf-8" },
  );
  assert.strictEqual(clean.status, 0);
  const cleanReport = JSON.parse(clean.stdout);
  assert.strictEqual(cleanReport.heuristics.accessibilityFriction, "none");
  assert.strictEqual(cleanReport.score, 100);

  const dirty = spawnSync(
    process.execPath,
    [cliPath, "check", '<div><input type="text"><img src="x.png"></div>', "--human"],
    { encoding: "utf-8" },
  );
  assert.strictEqual(dirty.status, 1);
  const dirtyReport = JSON.parse(dirty.stdout);
  assert.ok(dirtyReport.metrics.unlabeledInputs >= 1);
  assert.ok(dirtyReport.metrics.imagesWithoutAlt >= 1);
  assert.notStrictEqual(dirtyReport.heuristics.accessibilityFriction, "none");
  assert.ok(dirtyReport.score < 100);
});

test("cli supports design check technical and heuristics aliases", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const technical = spawnSync(
    process.execPath,
    [cliPath, "check", "--technical", "<button style='width: 24px; height: 24px'>x</button>"],
    { encoding: "utf-8" }
  );

  assert.strictEqual(technical.status, 1);
  const technicalReport = JSON.parse(technical.stdout);
  assert.ok(technicalReport.findings.some((finding) => finding.ruleId === "touch-target-44"));

  const heuristics = spawnSync(
    process.execPath,
    [cliPath, "check", "--heuristics", "<main><h1>Dashboard</h1></main>"],
    { encoding: "utf-8" }
  );

  assert.strictEqual(heuristics.status, 0);
  const heuristicsReport = JSON.parse(heuristics.stdout);
  assert.strictEqual(heuristicsReport.score, 100);
  assert.strictEqual(heuristicsReport.heuristics.accessibilityFriction, "none");
});

test("design build scaffolds a real Svelte 5 component file", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-build-"));
  try {
    const result = spawnSync(process.execPath, [cliPath, "build", "FancyCard", "--out", dir], { encoding: "utf-8" });
    assert.strictEqual(result.status, 0);
    const file = join(dir, "FancyCard.svelte");
    assert.ok(existsSync(file), "FancyCard.svelte should be created");
    const content = readFileSync(file, "utf-8");
    assert.match(content, /\$props\(\)/);
    assert.match(content, /st-fancy-card/);
    assert.match(content, /--st-semantic-text-primary/);

    const second = spawnSync(process.execPath, [cliPath, "build", "FancyCard", "--out", dir], { encoding: "utf-8" });
    assert.strictEqual(second.status, 1, "must refuse overwrite without --force");

    const propose = spawnSync(process.execPath, [cliPath, "build", "Foo", "--propose"], { encoding: "utf-8" });
    assert.strictEqual(propose.status, 2, "--propose must be honest (no false success)");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("design polish --motion / --essence are deterministic and honest", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const dir = mkdtempSync(join(tmpdir(), "sent-tech-polish-"));
  const file = join(dir, "anim.html");
  writeFileSync(file, "<style>.x{transition: all 0.2s ease;}</style>");
  try {
    const motion = spawnSync(process.execPath, [cliPath, "polish", file, "--motion"], { encoding: "utf-8" });
    assert.strictEqual(motion.status, 0);
    assert.match(readFileSync(file, "utf-8"), /prefers-reduced-motion/);

    const nested = spawnSync(
      process.execPath,
      [cliPath, "polish", '<div class="card"><div class="card">x</div></div>', "--essence"],
      { encoding: "utf-8" },
    );
    assert.strictEqual(nested.status, 1);

    const creative = spawnSync(process.execPath, [cliPath, "polish", "<div>x</div>", "--spark"], { encoding: "utf-8" });
    assert.strictEqual(creative.status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("cli rejects unsupported persona simulations explicitly", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const result = spawnSync(
    process.execPath,
    [cliPath, "check", "--personas", "<main><h1>Dashboard</h1></main>"],
    { encoding: "utf-8" }
  );

  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /--personas/);
});

test("design align --spacing rounds off-grid spacing to the 4px grid", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-spacing-"));
  const targetPath = join(tempDir, "sample.html");
  writeFileSync(targetPath, "<style>.box{padding:5px 10px;margin:7px;border:1px solid red;gap:6px}</style>");
  try {
    const result = spawnSync(process.execPath, [cliPath, "align", targetPath, "--spacing"], { encoding: "utf-8" });
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

test("cli align tones rewrites common bare hex colors to published theme tokens", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  const tempDir = mkdtempSync(join(tmpdir(), "sent-tech-skills-"));
  const targetPath = join(tempDir, "sample.html");
  writeFileSync(
    targetPath,
    "<style>.panel{color:#0043ce;background:#f8fafc;border-color:#e2e8f0}.copy{color:#0f172a}.muted{color:#64748b}</style>",
    "utf-8"
  );

  try {
    const result = spawnSync(process.execPath, [cliPath, "align", targetPath, "--tones"], {
      encoding: "utf-8"
    });

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

test("cli init command in non-interactive mode creates PRODUCT.md", () => {
  const cliPath = resolve(import.meta.dirname || "./test-fixtures", "../dist/cli.js");
  
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
    execFileSync(process.execPath, [cliPath, "init", "--non-interactive"], { stdio: "pipe" });
    
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
