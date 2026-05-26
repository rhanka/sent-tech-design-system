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
  assert.strictEqual(heuristicsReport.score, 92);
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
