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
  const extent = figure.querySelector('.st-diagramSceneFigure-extent');
  const world = figure.querySelector('.st-diagramSceneFigure-world');
  const box = element => {
    const r = element.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  };
  const matrix = new DOMMatrixReadOnly(getComputedStyle(world).transform);
  const transform = [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
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
    const points = Array.from(element.points, point => {
      const p = new DOMPoint(point.x, point.y).matrixTransform(ctm);
      return { x: p.x, y: p.y };
    });
    return { id: element.dataset.sceneEdge, stroke, points };
  });
  return { camera: window.__camera, scale, transform, frame: box(frame),
    // The rendered extent includes all scene bounds and the two 1 px paint
    // insets. Recover the fit BEFORE the readability clamp from DOM geometry.
    content: box(extent),
    overflow: [getComputedStyle(frame).overflowX, getComputedStyle(frame).overflowY],
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

const epsilon = 1 / 64; // CSS layout precision, not a visual clearance allowance.

// Distance to the actual painted segment, including bends only where they
// occur. A polyline's combined bounding rectangle contains unpainted space.
function segmentDistance(box, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  let enter = 0, leave = 1;
  for (const [start, delta, low, high] of [[a.x, dx, box.left, box.right], [a.y, dy, box.top, box.bottom]]) {
    if (delta === 0) {
      if (start < low || start > high) { leave = -1; break; }
    } else {
      const t1 = (low - start) / delta, t2 = (high - start) / delta;
      enter = Math.max(enter, Math.min(t1, t2));
      leave = Math.min(leave, Math.max(t1, t2));
    }
  }
  if (enter <= leave) return 0;
  const pointToBox = p => Math.hypot(Math.max(box.left - p.x, 0, p.x - box.right),
    Math.max(box.top - p.y, 0, p.y - box.bottom));
  const pointToSegment = (x, y) => {
    const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - a.x - t * dx, y - a.y - t * dy);
  };
  return Math.min(pointToBox(a), pointToBox(b),
    ...[box.left, box.right].flatMap(x => [box.top, box.bottom].map(y => pointToSegment(x, y))));
}

function equalGeometry(actual, expected, path = 'geometry') {
  if (typeof expected === 'number') {
    assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= epsilon,
      `${path}: ${actual} != ${expected} within ${epsilon} CSS px`);
  } else if (expected !== null && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual), Object.keys(expected), `${path} structure`);
    for (const key of Object.keys(expected)) equalGeometry(actual[key], expected[key], `${path}.${key}`);
  } else assert.equal(actual, expected, path);
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
  const worldWidth = (state.content.width - 2) / state.scale;
  const worldHeight = (state.content.height - 2) / state.scale;
  const unclampedFit = Math.min((state.frame.width - 2) / worldWidth,
    (state.frame.height - 2) / worldHeight);
  assert.ok(Number.isFinite(unclampedFit) && unclampedFit > 0, 'finite geometric fit');
  const overflow = [state.content.width > state.frame.width + 0.5,
    state.content.height > state.frame.height + 0.5];
  assert.ok(state.outerScroll[0] <= state.outerScroll[1] && state.outerScroll[2] <= state.outerScroll[3],
    `outer frame overflows: ${state.outerScroll}`);
  if (unclampedFit >= 0.45) {
    assert.deepEqual(overflow, [false, false], `feasible fit ${unclampedFit} must not scroll`);
  } else {
    assert.equal(state.scale, 0.45, 'infeasible fit must stop at the readability floor');
  }
  for (const [axis, index] of [['x', 0], ['y', 1]]) {
    assert.equal(state.scroll[index * 2] > state.scroll[index * 2 + 1], overflow[index],
      `${axis} scroll extent must match geometric overflow: ${state.scroll}`);
    assert.equal(state.overflow[index], overflow[index] ? 'auto' : 'hidden', `${axis} scrolling policy`);
  }
  assert.equal(state.camera.pans, overflow.some(Boolean), 'camera panning must match overflowing axes');
  assert.deepEqual(state.scroll.slice(4), [0, 0], 'fit starts at the scroll origin');
  for (const label of state.labels) {
    assert.ok(label.left >= state.frame.left - epsilon && label.top >= state.frame.top - epsilon
      && label.right <= state.frame.left + state.scroll[0] + epsilon
      && label.bottom <= state.frame.top + state.scroll[2] + epsilon,
    `label unreachable within scroll extent: ${label.id}`);
    for (const path of state.paths) {
      assert.ok(path.points.length >= 2 && Number.isFinite(path.stroke), `measurable connector ${path.id}`);
      for (let i = 1; i < path.points.length; i++) {
        const distance = segmentDistance(label, path.points[i - 1], path.points[i]) - path.stroke;
        assert.ok(distance + epsilon >= state.clearance,
          `label ${label.id} clearance ${distance} < ${state.clearance} at connector ${path.id} segment ${i}`);
      }
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
          assert.deepEqual(after.camera, initial.camera, 'initial camera must equal state after Ajuster');
          assert.deepEqual(after.scroll, initial.scroll, 'initial scrolling must equal state after Ajuster');
          assert.deepEqual(after.outerScroll, initial.outerScroll, 'initial outer scrolling must equal state after Ajuster');
          equalGeometry(after, initial);
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
