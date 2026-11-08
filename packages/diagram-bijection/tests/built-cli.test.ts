/**
 * Regression test for the DL-0 CI failure of the « bijection » job: the built
 * CLI resolved fixtures/pins.json relative to its own file, and tsc emits to
 * dist/src/, so ../../fixtures landed in dist/fixtures (ENOENT) while vitest,
 * running from src/, passed. The pins file must resolve through the package
 * root, so the built bins work from any cwd. This test builds the package
 * (`npm run build -w @sentropic/diagram-bijection`, the entry point the
 * workflows use), then runs the built CLI from a directory outside the
 * repository and proves the fixture paths resolve.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = execFileSync("git", ["-C", pkgRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

let foreignCwd: string;
let outDir: string;
beforeAll(() => {
  execFileSync("npm", ["run", "build", "-w", "@sentropic/diagram-bijection"], { cwd: repoRoot, stdio: "inherit" });
  foreignCwd = mkdtempSync(join(tmpdir(), "dl0-built-cli-cwd-"));
  outDir = mkdtempSync(join(tmpdir(), "dl0-built-cli-out-"));
}, 300_000);
afterAll(() => {
  rmSync(foreignCwd, { recursive: true, force: true });
  rmSync(outDir, { recursive: true, force: true });
});

/**
 * Child env without CI and without the raw-fixture roots: the anon bins must
 * report `not-run` for the confidential-raw pins, never read a raw file.
 */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CI;
  delete env.DL_HRPN_ROOT;
  delete env.DL_SENTROPIC_ROOT;
  delete env.DL_BPMN_CANVAS_ROOT;
  delete env.DL_ANON_HOME;
  delete env.DL_RAWGATE_KEY;
  return env;
}

describe("built CLI resolves the package fixtures from any cwd", () => {
  it("the built pins module points at <pkgRoot>/fixtures/pins.json", async () => {
    const built = (await import(pathToFileURL(join(pkgRoot, "dist", "src", "pins", "fixture-pins.js")).href)) as {
      DEFAULT_PINS_FILE: string;
      readFixturePins: () => { schema: string; pins: readonly unknown[] };
    };
    expect(built.DEFAULT_PINS_FILE).toBe(join(pkgRoot, "fixtures", "pins.json"));
    const pins = built.readFixturePins();
    expect(pins.schema).toBe("ds.fixture-pins/1");
    expect(pins.pins.length).toBeGreaterThan(0);
  });

  it("bin/dl-harness.mjs run --all loads every structure fixture from a different cwd", () => {
    const res = spawnSync(
      process.execPath,
      [join(pkgRoot, "bin", "dl-harness.mjs"), "run", "--all", `--out=${outDir}`],
      { cwd: foreignCwd, env: childEnv(), encoding: "utf8" },
    );
    // The pre-fix failure was an ENOENT on dist/fixtures/pins.json with empty
    // stdout; a completed run prints one line per fixture and writes reports.
    expect(res.stderr).not.toMatch(/ENOENT/);
    expect(res.stdout).toMatch(/s2-target-anon: verdict=/);
    expect(res.stdout).toMatch(/tiny: verdict=/);
    // Exit 1 only when the checkout is dirty (verdict partial); CI runs clean.
    expect([0, 1]).toContain(res.status);
    expect(readdirSync(outDir).filter((n) => n.endsWith(".report.json")).sort()).toEqual([
      "s2-target-anon.report.json",
      "tiny.report.json",
    ]);
  }, 120_000);

  it("bin/dl-anon.mjs reads the pins file from a different cwd (raw pins stay not-run)", () => {
    const res = spawnSync(process.execPath, [join(pkgRoot, "bin", "dl-anon.mjs"), "verify"], {
      cwd: foreignCwd,
      env: childEnv(),
      encoding: "utf8",
    });
    expect(res.stderr).not.toMatch(/ENOENT/);
    expect(res.stderr).toMatch(/pin s2-target-raw: not-run/);
    expect(res.status).toBe(1);
  }, 120_000);
});
