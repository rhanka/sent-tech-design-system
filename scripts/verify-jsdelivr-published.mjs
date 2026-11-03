// Post-publish CDN verification for the L7b lot (AC-L7b CDN gate).
//
// What this verifies (elements): the pinned jsDelivr base serves the exact
// bytes `dist/browser/sri.json` pins — every listed file is fetched at the
// same pinned base, its byte length and sha384 integrity are recomputed from
// the served bytes and compared to the sri entry — plus the package-root
// catalogue trio (catalog.json, envelope.json, the three component schemas).
// For @sentropic/diagram-core it checks dist/index.js + dist/index.d.ts on
// jsDelivr plus `npm view` visibility.
//
// A mismatch is reported, never repaired: exit 1 with one line per failure
// (URL, expected, observed). Republishing the same version cannot fix served
// bytes; the correction is a new patch version.
//
// Offline use: `--base-url` overrides the CDN base (tests point it at a
// local fixture server). CI and owner runs use the default jsDelivr base.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const DEFAULT_BASE_URL = "https://cdn.jsdelivr.net/npm";
const DEFAULT_ATTEMPTS = 20;
const DEFAULT_DELAY_MS = 15000;

function usage() {
  return [
    "usage: node scripts/verify-jsdelivr-published.mjs --package <name> --version <version> [--attempts N] [--delay-ms MS] [--base-url URL]",
    "example: node scripts/verify-jsdelivr-published.mjs --package @sentropic/design-system-elements --version 0.2.0",
  ].join("\n");
}

function parseArgs(argv) {
  const out = { attempts: DEFAULT_ATTEMPTS, delayMs: DEFAULT_DELAY_MS, baseUrl: DEFAULT_BASE_URL };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--package") out.package = argv[++i];
    else if (arg === "--version") out.version = argv[++i];
    else if (arg === "--attempts") out.attempts = Number(argv[++i]);
    else if (arg === "--delay-ms") out.delayMs = Number(argv[++i]);
    else if (arg === "--base-url") out.baseUrl = argv[++i];
    else if (arg === "--help" || arg === "-h") out.help = true;
    else throw new Error(`unknown argument: ${arg}\n${usage()}`);
  }
  if (out.help) return out;
  if (!out.package) throw new Error(`missing --package\n${usage()}`);
  if (!out.version) throw new Error(`missing --version\n${usage()}`);
  if (!Number.isFinite(out.attempts) || out.attempts < 1) throw new Error("--attempts must be a positive number");
  if (!Number.isFinite(out.delayMs) || out.delayMs < 0) throw new Error("--delay-ms must be a non-negative number");
  out.baseUrl = String(out.baseUrl).replace(/\/+$/, "");
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sha384Integrity(bytes) {
  return `sha384-${createHash("sha384").update(bytes).digest("base64")}`;
}

// Fetch with the attempts budget: HTTP 200 required. A non-200 (or a
// network error) is retried until the budget is spent, then returned as a
// failure so the caller prints one line and keeps checking the rest.
async function fetchBytes(url, attempts, delayMs) {
  let lastStatus = null;
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      lastStatus = res.status;
      if (res.status === 200) {
        return { ok: true, bytes: Buffer.from(await res.arrayBuffer()), status: 200 };
      }
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = String(error).split("\n")[0];
    }
    if (attempt < attempts && delayMs > 0) await sleep(delayMs);
  }
  return { ok: false, status: lastStatus, error: lastError };
}

async function checkElements({ base, attempts, delayMs }, failures) {
  const sriUrl = `${base}/dist/browser/sri.json`;
  const sriRes = await fetchBytes(sriUrl, attempts, delayMs);
  if (!sriRes.ok) {
    failures.push(`${sriUrl}: expected HTTP 200, observed ${sriRes.error ?? `HTTP ${sriRes.status}`}`);
    return;
  }
  let sri;
  try {
    sri = JSON.parse(sriRes.bytes.toString("utf8"));
  } catch {
    failures.push(`${sriUrl}: expected JSON body, observed unparseable bytes`);
    return;
  }
  const files = sri?.files;
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    failures.push(`${sriUrl}: expected object at .files, observed ${Array.isArray(files) ? "array" : typeof files}`);
    return;
  }
  for (const [name, entry] of Object.entries(files)) {
    const url = `${base}/dist/browser/${name}`;
    const res = await fetchBytes(url, attempts, delayMs);
    if (!res.ok) {
      failures.push(`${url}: expected HTTP 200, observed ${res.error ?? `HTTP ${res.status}`}`);
      continue;
    }
    if (typeof entry?.bytes === "number" && res.bytes.length !== entry.bytes) {
      failures.push(`${url}: expected ${entry.bytes} bytes, observed ${res.bytes.length}`);
    }
    if (typeof entry?.integrity === "string") {
      const observed = sha384Integrity(res.bytes);
      if (observed !== entry.integrity) {
        failures.push(`${url}: expected integrity ${entry.integrity}, observed ${observed}`);
      }
    }
  }

  const roots = [
    "catalog.json",
    "envelope.json",
    "schemas/BarChart.v1.json",
    "schemas/BpmnCanvas.v1.json",
    "schemas/DecisionDossier.v1.json",
  ];
  let catalog = null;
  for (const rel of roots) {
    const url = `${base}/${rel}`;
    const res = await fetchBytes(url, attempts, delayMs);
    if (!res.ok) {
      failures.push(`${url}: expected HTTP 200, observed ${res.error ?? `HTTP ${res.status}`}`);
      continue;
    }
    try {
      const parsed = JSON.parse(res.bytes.toString("utf8"));
      if (rel === "catalog.json") catalog = parsed;
    } catch {
      failures.push(`${url}: expected JSON body, observed unparseable bytes`);
    }
  }
  if (catalog) {
    const url = `${base}/catalog.json`;
    for (const key of ["catalogId", "$id"]) {
      const value = catalog?.[key];
      if (typeof value !== "string" || !value.includes("/v1/")) {
        failures.push(`${url}: expected ${key} to name the v1 catalogue, observed ${JSON.stringify(value)}`);
      }
    }
  }
}

async function checkDiagramCore({ packageName, version, base, attempts, delayMs }, failures) {
  for (const rel of ["dist/index.js", "dist/index.d.ts"]) {
    const url = `${base}/${rel}`;
    const res = await fetchBytes(url, attempts, delayMs);
    if (!res.ok) {
      failures.push(`${url}: expected HTTP 200, observed ${res.error ?? `HTTP ${res.status}`}`);
      continue;
    }
    if (res.bytes.length === 0) {
      failures.push(`${url}: expected non-empty body, observed 0 bytes`);
    }
  }
  const viewed = spawnSync("npm", ["view", `${packageName}@${version}`, "version", "--silent"], {
    encoding: "utf8",
  });
  const observed = String(viewed.stdout ?? "").trim();
  if (viewed.status !== 0 || observed !== version) {
    failures.push(
      `npm view ${packageName}@${version}: expected version ${version}, observed ${observed || `exit ${viewed.status}`}`,
    );
  }
}

async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    console.error(String(error.message ?? error));
    return 1;
  }
  if (args.help) {
    console.log(usage());
    return 0;
  }
  const base = `${args.baseUrl}/${args.package}@${args.version}`;
  const failures = [];
  if (args.package === "@sentropic/diagram-core") {
    await checkDiagramCore({ packageName: args.package, version: args.version, base, attempts: args.attempts, delayMs: args.delayMs }, failures);
  } else {
    await checkElements({ base, attempts: args.attempts, delayMs: args.delayMs }, failures);
  }
  if (failures.length > 0) {
    for (const line of failures) console.error(`FAIL ${line}`);
    console.error(`verify-jsdelivr-published: ${failures.length} failure(s) for ${args.package}@${args.version}`);
    return 1;
  }
  console.log(`OK ${args.package}@${args.version}: all CDN checks passed`);
  return 0;
}

const invokedDirectly =
  process.argv[1] != null && import.meta.url.endsWith(process.argv[1].slice(process.argv[1].lastIndexOf("/")));
if (invokedDirectly) {
  process.exitCode = await main();
}

export { checkDiagramCore, checkElements, fetchBytes, parseArgs, sha384Integrity };
