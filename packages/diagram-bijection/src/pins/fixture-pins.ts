// Fixture pins `ds.fixture-pins/1` (§2.4). The pins file holds no repository
// name and no raw content: the root is an environment variable.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

export type PinRoot =
  | { readonly kind: "repo" }
  | { readonly kind: "env-dir"; readonly env: "DL_HRPN_ROOT" | "DL_SENTROPIC_ROOT" | "DL_BPMN_CANVAS_ROOT" }
  | { readonly kind: "env-git"; readonly env: "DL_HRPN_ROOT" | "DL_SENTROPIC_ROOT" | "DL_BPMN_CANVAS_ROOT"; readonly commit: string };
export interface FixturePin {
  readonly id: string; // key, unique in the file
  readonly root: PinRoot;
  readonly path: string; // POSIX, relative to the root, no "." or ".." segment
  readonly sha256: string;
  readonly bytes: number;
  readonly confidentiality: "public" | "confidential-raw";
}
export interface FixturePinFile { readonly schema: "ds.fixture-pins/1"; readonly pins: readonly FixturePin[] }

export const PINS_SCHEMA = "ds.fixture-pins/1";

function pinProblem(pin: unknown): string | undefined {
  if (typeof pin !== "object" || pin === null) return "pin is not an object";
  const p = pin as Record<string, unknown>;
  if (typeof p.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(p.id)) return "pin id invalid";
  if (typeof p.path !== "string" || p.path.length === 0) return "pin path invalid";
  // §2.4: the pin path is POSIX, relative to the root — no absolute path, no
  // backslash, no "." or ".." segment.
  if (p.path.startsWith("/") || p.path.includes("\\")) return "pin path is not POSIX relative";
  if (p.path.split("/").some((seg) => seg === "." || seg === "..")) return "pin path has . or .. segment";
  if (typeof p.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(p.sha256)) return "pin sha256 invalid";
  if (typeof p.bytes !== "number" || !Number.isInteger(p.bytes) || p.bytes < 0) return "pin bytes invalid";
  if (p.confidentiality !== "public" && p.confidentiality !== "confidential-raw") return "pin confidentiality invalid";
  const root = p.root;
  if (typeof root !== "object" || root === null) return "pin root invalid";
  const r = root as Record<string, unknown>;
  if (r.kind === "repo") return undefined;
  if (r.kind === "env-dir" || r.kind === "env-git") {
    if (r.env !== "DL_HRPN_ROOT" && r.env !== "DL_SENTROPIC_ROOT" && r.env !== "DL_BPMN_CANVAS_ROOT") return "pin root env invalid";
    if (r.kind === "env-git" && (typeof r.commit !== "string" || !/^[0-9a-f]{40}$/.test(r.commit))) return "pin root commit invalid";
    return undefined;
  }
  return "pin root kind invalid";
}

/**
 * The package root, found by walking up from this module to the package.json
 * named @sentropic/diagram-bijection. A path relative to import.meta.url would
 * move with the outDir (tsc emits to dist/src/, so ../../fixtures would land
 * in dist/fixtures); the walk-up resolves the same root from src/ (vitest) and
 * from dist/src/ (the built CLI), whatever the cwd.
 */
function packageRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { name?: string };
      if (pkg.name === "@sentropic/diagram-bijection") return dir;
    } catch {
      /* keep walking */
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error("package root not found");
    dir = parent;
  }
}

/** The package's own pins file, used when `file` is omitted (§2.4). */
export const DEFAULT_PINS_FILE = join(packageRoot(), "fixtures", "pins.json");

export function readFixturePins(file?: string): FixturePinFile {
  const parsed = JSON.parse(readFileSync(file ?? DEFAULT_PINS_FILE, "utf8")) as unknown;
  if (typeof parsed !== "object" || parsed === null) throw new Error("pins file is not an object");
  const file_ = parsed as Record<string, unknown>;
  if (file_.schema !== PINS_SCHEMA) throw new Error(`pins file schema must be ${PINS_SCHEMA}`);
  if (!Array.isArray(file_.pins)) throw new Error("pins file has no pins array");
  const pins = file_.pins as unknown[];
  const ids = new Set<string>();
  for (const pin of pins) {
    const problem = pinProblem(pin);
    if (problem !== undefined) throw new Error(`invalid pin: ${problem}`);
    const id = (pin as FixturePin).id;
    if (ids.has(id)) throw new Error(`duplicate pin id ${id}`);
    ids.add(id);
  }
  return parsed as FixturePinFile;
}

function sha256Of(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Read the pinned bytes. `repo` pins resolve against the repository root;
 * `env-dir` against the work-tree file at `$ENV/path`; `env-git` through
 * `git -C $ENV show <commit>:<path>`. A missing variable or file gives
 * `not-run`, never `pass`.
 */
export async function readPinBytes(
  pin: FixturePin,
  repoRoot: string,
  env: Readonly<Record<string, string | undefined>>,
): Promise<Uint8Array | { readonly unavailable: "raw fixture unavailable" }> {
  try {
    if (pin.root.kind === "repo") {
      return new Uint8Array(readFileSync(join(repoRoot, pin.path)));
    }
    const rootEnv = env[pin.root.env];
    if (rootEnv === undefined || !isAbsolute(rootEnv)) return { unavailable: "raw fixture unavailable" };
    if (pin.root.kind === "env-dir") {
      return new Uint8Array(readFileSync(join(rootEnv, pin.path)));
    }
    const out = execFileSync("git", ["-C", rootEnv, "show", `${pin.root.commit}:${pin.path}`], { maxBuffer: 1 << 28 });
    return new Uint8Array(out);
  } catch {
    return { unavailable: "raw fixture unavailable" };
  }
}

export async function verifyFixturePin(
  pin: FixturePin,
  env: Readonly<Record<string, string | undefined>>,
  repoRoot?: string,
): Promise<
  | { readonly status: "pass" }
  | { readonly status: "fail"; readonly actualSha256: string; readonly actualBytes: number }
  | { readonly status: "not-run"; readonly reason: "raw fixture unavailable" }
> {
  const root = repoRoot ?? process.cwd();
  const bytes = await readPinBytes(pin, root, env);
  if ("unavailable" in bytes) return { status: "not-run", reason: "raw fixture unavailable" };
  const actualSha256 = sha256Of(bytes);
  if (actualSha256 === pin.sha256 && bytes.length === pin.bytes) return { status: "pass" };
  return { status: "fail", actualSha256, actualBytes: bytes.length };
}
