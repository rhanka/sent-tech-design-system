// Runner adapters behind one interface: run(fixture, ops) ->
// { model, events, geometry, pixels, viewport }.
//
// Real runners drive the REAL libraries inside the harness page
// (harness-page.html defines window.__reHarness on top of the bundles
// built by build-bundles.mjs from RE_ORACLES_DIR). The candidate runner
// is a stub by design at L0: it declares `unsupported` with the lot that
// will deliver it, and is never counted `covered`.

// Candidate side at L0, per library. No candidate output exists: the
// comparison goes through DiagramState (packages/diagram-core) and the
// adapters of later lots; nothing is converted ad hoc in the meantime.
export const CANDIDATE_STATUS = {
  bpmn: { verdict: "unsupported", cause: "candidate = DiagramState through the A' codec (toDiagramState / toModdleJson, private package @sentropic/diagram-bpmn-moddle), delivered by lot L3 of spec/SPEC_EVOL_GD_BPMN_MODDLE_COVERAGE.md §13; not written at L0" },
  xyflow: { verdict: "unsupported", cause: "candidate = DiagramState (packages/diagram-core) through the xyflow-parity adapter of a later lot (spec/SPEC_RE_XYFLOW_PARITY.md §8); not written at L0" },
  jointjs: { verdict: "unsupported", cause: "candidate = DiagramState (packages/diagram-core) through the JointJS-parity adapter of a later lot (spec/SPEC_RE_JOINTJS_PARITY.md §6); not written at L0" },
};

const RUN_TIMEOUT_MS = 60000;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout after ${RUN_TIMEOUT_MS}ms in ${label}`)), RUN_TIMEOUT_MS)),
  ]);
}

// Which in-page adapter serves a scenario (xyflow examples have their own
// driver, runXyflowExample below).
export function adapterFor(library) {
  if (library === "bpmn") return "runBpmn";
  if (library === "jointjs") return "runJoint";
  return null;
}

// xyflow example driver. Each run starts from a fresh page load (the
// example modules may keep module-level state, e.g. id counters), loads
// the example's own bundle, mounts it, then plays the pointer script: the
// page plans each op from the library store (client points), and the
// mouse of the browser executes it (Playwright: trusted pointer and mouse
// events through the real hit-testing). The page then settles and the
// native store state is read back.
async function runXyflowExample(page, fixture, ops, ctx) {
  const entry = ctx.examples && ctx.examples[fixture.id];
  if (!entry || entry.status !== "built") throw new Error(`example bundle for ${fixture.id} not built${entry && entry.cause ? `: ${entry.cause}` : ""}`);
  // Errors of a previous run (e.g. a recorded deviation) do not carry over.
  if (page.__pageErrors) page.__pageErrors.length = 0;
  await page.goto(ctx.url);
  await page.evaluate(() => window.__harnessReady);
  if (page.__pageErrors && page.__pageErrors.length) {
    throw new Error(`harness page error before the example loaded: ${page.__pageErrors[0]}`);
  }
  await page.evaluate(([bundle, css]) => window.__reHarness.xyLoad(bundle, css), [entry.bundle, entry.css || null]);
  // An error thrown by the example's own code (page error) ends the run:
  // the React/Svelte tree is gone and comparing what remains would hide a
  // missing graph. The scenario is then unknown with that precise error —
  // unless it is a recorded upstream deviation (ctx.deviation), see below.
  const errors = page.__pageErrors || [];
  const exampleError = (phase) => {
    if (errors.length) throw new Error(`example-error during ${phase}: ${errors[0]}`);
  };
  await page.evaluate(() => window.__reHarness.xyMount()).catch((err) => { exampleError("mount"); throw err; });
  exampleError("mount");
  const deviation = ctx.deviation || null;
  for (const step of (ops && ops.steps) || []) {
    // Recorded upstream deviation (SPEC_RE_BPMN_JS_PARITY §8.5): just
    // before the op that triggers it, the state reached so far is read
    // (store, journal, geometry, pixels) so that both runs are still
    // compared up to the crash; then the op must reproduce the recorded
    // symptom. The run stops there.
    if (deviation && step.op === deviation.op) {
      const pre = await page.evaluate(() => window.__reHarness.xyExtract());
      await capturePixels(page, pre, { keepHost: true });
      let reproduced = null;
      try {
        await playStep(page, step);
        exampleError(`op ${step.op}`);
      } catch (err) {
        // The example's own page error is the observed symptom (the settle
        // barrier that follows only reports that the tree is gone).
        reproduced = errors.length ? errors[0] : String(err && err.message || err).split("\n")[0];
      }
      pre.deviationOutcome = {
        id: deviation.id,
        op: step.op,
        reproduced: Boolean(reproduced && reproduced.includes(deviation.symptom)),
        observed: reproduced || "no error: the recorded upstream bug did not reproduce",
      };
      await page.evaluate(() => { if (typeof window.__cleanupLastRun === "function") window.__cleanupLastRun(); }).catch(() => {});
      return pre;
    }
    await playStep(page, step).catch((err) => { exampleError(`op ${step.op}`); throw err; });
    exampleError(`op ${step.op}`);
  }
  // Park the pointer outside the flow so no hover state differs per run.
  await page.mouse.move(1020, 760);
  await page.evaluate(() => window.__reHarness.xySettle("park"));
  return page.evaluate(() => window.__reHarness.xyExtract());
}

// One op on every mounted flow: planned in the page from the store, played
// by the browser's mouse, then settled.
async function playStep(page, step) {
  const count = await page.evaluate(() => window.__reHarness.xyFlowCount());
  for (let flow = 0; flow < Math.max(1, count); flow += 1) {
    const plan = await page.evaluate(([st, f]) => window.__reHarness.xyPlan(st, f), [step, flow]);
    if (plan.kind === "drag") {
      await page.mouse.move(plan.from.x, plan.from.y);
      await page.mouse.down();
      await page.mouse.move(plan.to.x, plan.to.y, { steps: 8 });
      await page.mouse.up();
    } else if (plan.kind === "click") {
      await page.mouse.click(plan.at.x, plan.at.y);
    } else if (plan.kind === "wheel") {
      await page.mouse.move(plan.at.x, plan.at.y);
      await page.mouse.wheel(0, plan.deltaY);
    }
    await page.evaluate((kind) => window.__reHarness.xySettle(kind), plan.kind);
  }
}

// Decode a PNG screenshot inside the page and downscale it to a small
// RGBA buffer the pixel comparator consumes. The pixels come from the
// browser's own rendering of the library output (C3) — never from a
// rasterisation of extracted bounds.
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
// substitute verdict.
export async function runRealInPage(page, library, fixture, ops, ctx = {}) {
  if (library === "xyflow") {
    const result = await withTimeout(runXyflowExample(page, fixture, ops, ctx), `xyflow/${fixture.id}`);
    return result.pixels ? result : capturePixels(page, result);
  }
  const fn = adapterFor(library);
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
  return capturePixels(page, result);
}

async function capturePixels(page, result, { keepHost = false } = {}) {
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
    if (!keepHost) {
      await page.evaluate(() => {
        if (typeof window.__cleanupLastRun === "function") window.__cleanupLastRun();
      }).catch(() => {});
    }
  }
  return result;
}

export async function oracleStatusInPage(page) {
  return page.evaluate(() => window.__oracleStatus || null);
}

export function candidateStubRunner(library) {
  return {
    id: "candidate",
    async run() {
      // No candidate implementation exists at L0, and no ad hoc converter
      // stands in for the DiagramState codec. Never fabricate a result.
      const status = CANDIDATE_STATUS[library] || { verdict: "unsupported", cause: `no candidate path for ${library}` };
      return { unsupported: true, cause: status.cause };
    },
  };
}
