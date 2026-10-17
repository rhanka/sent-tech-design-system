// Runner adapters behind one interface: run(fixture, ops) ->
// { model, events, geometry, pixels, viewport }.
//
// Real runners drive the REAL libraries inside the harness page
// (harness-page.html defines window.__reHarness on top of the bundles
// built by build-bundles.mjs from RE_ORACLES_DIR). The candidate runner
// is a stub by design at L0: it declares `unsupported` per entry and is
// never counted `covered`. The synthetic runner (synthetic-engines.mjs)
// exists only to self-test the comparators; it is not a reference and
// every report it feeds is stamped oracle: "synthetic".
import { runSyntheticEngine } from "./synthetic-engines.mjs";

const RUN_TIMEOUT_MS = 60000;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${RUN_TIMEOUT_MS}ms in ${label}`)), RUN_TIMEOUT_MS)),
  ]);
}

// Which in-page adapter serves a scenario. xyflow fixtures pick their
// flavour from the fixture id (xyflow-react-* / xyflow-svelte-*).
export function adapterFor(library, fixtureId) {
  if (library === "bpmn") return "runBpmn";
  if (library === "jointjs") return "runJoint";
  if (library === "xyflow") return fixtureId && fixtureId.includes("svelte") ? "runXyflowSvelte" : "runXyflowReact";
  return null;
}

export function oracleGateOf(library, fixtureId) {
  if (library === "xyflow") return fixtureId && fixtureId.includes("svelte") ? "xyflow-svelte" : "xyflow-react";
  if (library === "bpmn") return "bpmn";
  if (library === "jointjs") return "jointjs";
  return library;
}

// Decode a PNG screenshot inside the page and downscale it to a small
// RGBA buffer the pixel comparator consumes. The pixels come from the
// browser's own rendering of the library output (C3) — never from a
// synthetic rasterisation of extracted bounds.
const DECODE_SCREENSHOT = async (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  try {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    const width = 192; const height = 144;
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const data = ctx.getImageData(0, 0, width, height);
    return { width, height, data: Array.from(data.data) };
  } finally {
    URL.revokeObjectURL(url);
  }
};

// Execute one real-oracle run in the harness page. The adapter leaves its
// rendered container in place; this runner screenshots that container
// (the real library rendering), decodes the capture, then runs the
// adapter cleanup. Throws with the page cause when the library cannot
// run; the caller records the gate `unknown` — it never falls back to a
// synthetic verdict.
export async function runRealInPage(page, library, fixture, ops) {
  const fn = adapterFor(library, fixture.id);
  if (!fn) throw new Error(`unknown: no real adapter for library ${library}`);
  const result = await withTimeout(
    page.evaluate(
      ([fnName, fixtureJson, opsJson]) => {
        const fixture = JSON.parse(fixtureJson);
        const ops = JSON.parse(opsJson);
        const api = window.__reHarness;
        if (!api || typeof api[fnName] !== "function") {
          throw new Error(`harness page adapter ${fnName} unavailable (bundle missing or page not loaded)`);
        }
        return api[fnName](fixture, ops);
      },
      [fn, JSON.stringify(fixture), JSON.stringify(ops || { schemaVersion: 1, id: "empty", steps: [] })],
    ),
    `${library}/${fixture.id}`,
  );
  try {
    const host = page.locator(".oracle-host").last();
    const box = await host.boundingBox();
    if (!box || box.width < 1 || box.height < 1) throw new Error("oracle host has no rendered box");
    const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
    result.pixels = await page.evaluate(DECODE_SCREENSHOT, png.toString("base64"));
  } catch (err) {
    result.pixels = null;
    result.pixelCaptureError = String(err && err.message || err).split("\n")[0].slice(0, 200);
  } finally {
    await page.evaluate(() => {
      if (typeof window.__cleanupLastRun === "function") window.__cleanupLastRun();
    }).catch(() => {});
  }
  return result;
}

export async function oracleStatusInPage(page) {
  return page.evaluate(() => window.__oracleStatus || null);
}

export function syntheticRunner() {
  return {
    id: "synthetic",
    oracle: "synthetic",
    async run(fixture, ops) {
      return runSyntheticEngine(fixture, ops);
    },
  };
}

export function candidateStubRunner() {
  return {
    id: "candidate",
    async run() {
      // No parity implementation exists at L0. Never fabricate a result.
      return { unsupported: true };
    },
  };
}
