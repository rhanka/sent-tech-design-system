// GitHub CI only. Keep this guard before build/server/driver imports and launch.
if (process.env.GITHUB_ACTIONS !== 'true' || process.env.CI !== 'true'
    || !process.env.GITHUB_RUN_ID || !process.env.CHROME_BIN) {
  throw new Error('Diagram first paint runs only in GitHub CI with CHROME_BIN');
}

const { mkdir, writeFile, mkdtemp, rm } = await import('node:fs/promises');
const { tmpdir } = await import('node:os');
const { join } = await import('node:path');
const { buildHarness, root } = await import('./build.mjs');
const { preview } = await import('vite');
const { default: puppeteer } = await import('puppeteer-core');
const assert = (await import('node:assert/strict')).default;

const artifacts = process.env.DIAGRAM_ARTIFACTS;
assert.ok(artifacts, 'DIAGRAM_ARTIFACTS is required');
await mkdir(artifacts, { recursive: true });
const work = await mkdtemp(join(tmpdir(), 'diagram-first-paint-'));
let server;
let browser;
let completed = 0;
const failures = [];

// This function executes inside Chrome. Every geometric value comes from DOM
// layout, SVG paint or the computed transform, never layout-engine fixtures.
function measure() {
  const figure = document.querySelector('.st-diagramSceneFigure');
  const frame = figure.querySelector('.st-diagramSceneFigure-viewport');
  const world = figure.querySelector('.st-diagramSceneFigure-world');
  const box = element => {
    const r = element.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  const transform = getComputedStyle(world).transform;
  const matrix = new DOMMatrixReadOnly(transform);
  const scale = Math.hypot(matrix.a, matrix.b);
  const labels = [...figure.querySelectorAll('[data-scene-label],.st-diagramSceneFigure-label')]
    .map(element => ({ id: element.dataset.sceneLabel ?? element.textContent, ...box(element) }));
  // Include actual text ink, which can overflow its allocated label/card box.
  const walker = document.createTreeWalker(world, NodeFilter.SHOW_TEXT);
  let text;
  while ((text = walker.nextNode())) {
    if (!text.textContent.trim() || text.parentElement.closest('defs,title,desc,[hidden]')) continue;
    const range = document.createRange();
    range.selectNodeContents(text);
    for (const r of range.getClientRects()) labels.push({ id: text.textContent,
      left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
  }
  const paths = [...figure.querySelectorAll('[data-scene-edge]')].map(element => {
    const style = getComputedStyle(element);
    const ctm = element.getScreenCTM();
    const strokeScale = style.vectorEffect === 'non-scaling-stroke' ? 1 : Math.hypot(ctm.a, ctm.b);
    const stroke = parseFloat(style.strokeWidth) * strokeScale / 2;
    const r = box(element);
    return { id: element.dataset.sceneEdge, left: r.left - stroke, top: r.top - stroke,
      right: r.right + stroke, bottom: r.bottom + stroke };
  });
  return { camera: window.__camera, scale, transform, frame: box(frame),
    clearance: parseFloat(getComputedStyle(figure).getPropertyValue('--st-component-diagramScene-labelPadding')) * scale,
    refused: figure.dataset.sceneRefused ?? null,
    scroll: [frame.scrollWidth, frame.clientWidth, frame.scrollHeight, frame.clientHeight, frame.scrollLeft, frame.scrollTop],
    outerScroll: (() => { const el = figure.querySelector('.st-diagramSceneFigure-frame');
      return [el.scrollWidth, el.clientWidth, el.scrollHeight, el.clientHeight]; })(),
    nodes: [...figure.querySelectorAll('[data-scene-occurrence]')].map(element => ({ id: element.dataset.sceneOccurrence, ...box(element) })),
    labels, paths };
}

async function settle(page) {
  await page.waitForFunction(() => window.__mounted && window.__camera
    && document.querySelector('[data-scene-occurrence]'), { timeout: 2000 });
  await page.evaluate(() => document.fonts.ready);
  // Observe stable painted geometry across frames, without ever fitting or
  // resizing the page. Do not wait for a passing assertion to hide bad state.
  await page.evaluate(async measureSource => {
    const snapshot = (0, eval)(`(${measureSource})`);
    let previous;
    let stable = 0;
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      const state = JSON.stringify(snapshot());
      stable = state === previous ? stable + 1 : 0;
      previous = state;
      if (stable >= 3 && !document.querySelector('[aria-busy="true"]')) return;
    }
    throw new Error('Diagram geometry did not settle');
  }, measure.toString());
}

function check(state, scene) {
  assert.equal(state.refused, null, 'scene must render');
  assert.ok(state.nodes.length >= 3, 'must render at least three cards');
  assert.ok(state.frame.width > 0 && state.frame.height > 0, 'nonempty frame');
  assert.ok(Number.isFinite(state.camera.fitZoom), 'finite fit');
  assert.ok(state.scale >= 0.45, `display scale ${state.scale} < 0.45`);
  assert.ok(Number.isFinite(state.clearance) && state.clearance > 0, 'clearance token must resolve');
  if (scene !== 'three-cards') {
    assert.ok(state.paths.length > 0 && state.labels.length > 0, 'golden must have connectors and labels');
  }
  if (state.camera.fitZoom >= 0.45) {
    for (const [name, dims] of [['viewport', state.scroll], ['frame', state.outerScroll]]) {
      assert.ok(dims[0] <= dims[1] && dims[2] <= dims[3], `${name} overflows: ${dims}`);
    }
  }
  const epsilon = 1 / 64; // CSS layout precision, not a visual clearance allowance.
  for (const label of state.labels) {
    assert.ok(label.left >= state.frame.left - epsilon && label.top >= state.frame.top - epsilon
      && label.right <= state.frame.right + epsilon && label.bottom <= state.frame.bottom + epsilon,
    `label outside frame: ${label.id}`);
    for (const path of state.paths) {
      const c = state.clearance;
      assert.ok(label.right + c <= path.left + epsilon || label.left - c >= path.right - epsilon
        || label.bottom + c <= path.top + epsilon || label.top - c >= path.bottom - epsilon,
      `label ${label.id} intersects connector bbox ${path.id} with clearance ${c}`);
    }
  }
}

try {
  await buildHarness(join(work, 'dist'));
  server = await preview({ configFile: false, envFile: false, root,
    build: { outDir: join(work, 'dist') }, preview: { host: '127.0.0.1', port: 0 } });
  const address = server.httpServer.address();
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN, headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  for (const framework of ['svelte', 'vue']) {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      for (const scene of ['architecture-folded', 'architecture-unfolded', 'ontology-folded', 'ontology-unfolded', 'three-cards']) {
        const name = `${framework}-${scene}-${viewport.width}x${viewport.height}`;
        const page = await browser.newPage();
        const errors = [];
        const consoleMessages = [];
        page.on('pageerror', error => errors.push(String(error)));
        page.on('console', message => consoleMessages.push(`[${message.type()}] ${message.text()}`));
        let initial;
        let after;
        try {
          await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
          await page.goto(`http://127.0.0.1:${address.port}/?framework=${framework}&scene=${scene}`, { waitUntil: 'load' });
          await settle(page);
          initial = await page.evaluate(measure);
          // Preserve the untouched state even if the later comparison fails.
          await page.screenshot({ path: join(artifacts, `${name}-initial.png`), fullPage: true });
          const fit = await page.$('button::-p-text(Ajuster)');
          assert.ok(fit, 'Ajuster button must exist');
          await fit.click();
          await settle(page);
          after = await page.evaluate(measure);
          assert.deepEqual(errors, [], 'no browser runtime errors');
          check(initial, scene);
          check(after, scene);
          assert.deepEqual(after, initial, 'initial DOM/camera must equal state after Ajuster');
          completed++;
          console.log(`PASS ${name}`);
        } catch (error) {
          failures.push(name);
          console.error(`FAIL ${name}: ${error.stack}`);
          await page.screenshot({ path: join(artifacts, `${name}-failure.png`), fullPage: true });
          await writeFile(join(artifacts, `${name}.json`), JSON.stringify({ error: String(error), errors, consoleMessages, initial, after }, null, 2));
        } finally {
          await page.close();
        }
      }
    }
  }
  assert.equal(completed, 20, `All 20 cases must pass; failures: ${failures.join(', ')}`);
} finally {
  await browser?.close();
  await server?.close();
  await rm(work, { recursive: true, force: true });
}
