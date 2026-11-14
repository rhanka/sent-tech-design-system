/**
 * §2.9 W-DL0.7: fixture pins `ds.fixture-pins/1`. Every `repo` pin matches its
 * file, a one-byte change of a temporary copy is caught, and a
 * `confidential-raw` pin reports `not-run` without its variable — never
 * `pass` unread.
 */
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { readFixturePins, verifyFixturePin, type FixturePin } from "../src/pins/fixture-pins.js";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = execFileSync("git", ["-C", pkgRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const pins = readFixturePins();

const tmpDirs: string[] = [];
afterEach(() => {
  while (tmpDirs.length > 0) rmSync(tmpDirs.pop() as string, { recursive: true, force: true });
});
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "dl-pins-test-"));
  tmpDirs.push(dir);
  return dir;
}

describe("W-DL0.7 fixture pins", () => {
  it("every repo pin matches its file (sha256 and byte length)", async () => {
    const repoPins = pins.pins.filter((p) => p.root.kind === "repo");
    expect(repoPins.length).toBeGreaterThanOrEqual(2); // tiny + s2-target-anon
    for (const pin of repoPins) {
      const result = await verifyFixturePin(pin, {}, repoRoot);
      expect(result.status, `pin ${pin.id}`).toBe("pass");
    }
  });

  it("a one-byte change of a temporary copy is caught with the actual digest", async () => {
    const dir = tempDir();
    const src = join(repoRoot, "packages/diagram-bijection/fixtures/synthetic/tiny.structure.json");
    const copy = join(dir, "fixture.json");
    copyFileSync(src, copy);
    const pin: FixturePin = {
      id: "temp-copy",
      root: { kind: "repo" },
      path: "fixture.json",
      sha256: JSON.parse(readFileSync(join(pkgRoot, "fixtures/pins.json"), "utf8")).pins.find((p: FixturePin) => p.id === "tiny").sha256,
      bytes: readFileSync(src).length,
      confidentiality: "public",
    };
    expect((await verifyFixturePin(pin, {}, dir)).status).toBe("pass");
    const bytes = readFileSync(copy);
    bytes[0] = bytes[0] === 0x7b ? 0x20 : 0x7b; // flip the first byte
    writeFileSync(copy, bytes);
    const changed = await verifyFixturePin(pin, {}, dir);
    expect(changed.status).toBe("fail");
    if (changed.status === "fail") {
      expect(changed.actualSha256).not.toBe(pin.sha256);
      expect(changed.actualBytes).toBe(pin.bytes);
    }
  });

  it("a missing file is not-run, never pass", async () => {
    const dir = tempDir();
    const pin: FixturePin = {
      id: "missing",
      root: { kind: "repo" },
      path: "no-such-file.json",
      sha256: "0".repeat(64),
      bytes: 1,
      confidentiality: "public",
    };
    expect((await verifyFixturePin(pin, {}, dir)).status).toBe("not-run");
  });

  it("a confidential-raw pin reports not-run without its variable and is never pass unread", async () => {
    const raw = pins.pins.filter((p) => p.confidentiality === "confidential-raw");
    expect(raw.length).toBeGreaterThanOrEqual(5);
    for (const pin of raw) {
      const env: Record<string, string | undefined> = {};
      const result = await verifyFixturePin(pin, env, repoRoot);
      expect(result.status, `pin ${pin.id} without env`).toBe("not-run");
      if (result.status === "not-run") expect(result.reason).toBe("raw fixture unavailable");
      // A non-absolute or unrelated variable must not make it pass either.
      const bogus = await verifyFixturePin(pin, { [pin.root.kind === "env-dir" || pin.root.kind === "env-git" ? pin.root.env : "DL_HRPN_ROOT"]: "relative/path" }, repoRoot);
      expect(bogus.status).toBe("not-run");
    }
  });

  it("the pins file holds no repository name and no raw content", () => {
    const text = readFileSync(join(pkgRoot, "fixtures", "pins.json"), "utf8");
    expect(text).not.toContain("airbus");
    expect(text).not.toContain("genair");
    expect(text).not.toContain("/home/");
    for (const pin of pins.pins) {
      expect(pin.path.split("/").some((seg) => seg === "." || seg === "..")).toBe(false);
    }
  });

  it("the tiny pin lives under fixtures/synthetic/ per the §1 tree", () => {
    const tiny = pins.pins.find((p) => p.id === "tiny");
    expect(tiny).toBeDefined();
    expect(tiny?.path).toBe("packages/diagram-bijection/fixtures/synthetic/tiny.structure.json");
  });

  it("a pin path that is absolute or holds a backslash is rejected (§2.4 POSIX relative)", () => {
    const dir = tempDir();
    const base = JSON.parse(readFileSync(join(pkgRoot, "fixtures/pins.json"), "utf8")) as { pins: Record<string, unknown>[] };
    for (const badPath of ["/etc/passwd", "fixtures\\pins.json"]) {
      const file = join(dir, "pins.json");
      writeFileSync(file, JSON.stringify({ schema: "ds.fixture-pins/1", pins: [{ ...base.pins[0], path: badPath }] }));
      expect(() => readFixturePins(file)).toThrow(/POSIX relative/);
    }
  });
});
