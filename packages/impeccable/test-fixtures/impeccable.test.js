import { test } from "node:test";
import assert from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
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
  assert.match(result.stderr, /impeccable-sent-tech:/);
});

test("package exposes the short design binary", () => {
  const packageJsonPath = resolve(import.meta.dirname || "./test-fixtures", "../package.json");
  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  assert.strictEqual(manifest.bin.design, "./dist/cli.js");
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
