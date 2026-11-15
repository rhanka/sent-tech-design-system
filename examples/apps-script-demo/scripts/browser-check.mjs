// GitHub CI only. Keep this guard before the driver import and the launch.
// Opens the BUILT page (dist/demo.html, file://) in Chrome for Testing and
// checks what no static or server-side check can see: that the diagram is
// framed whole by its figure, that "Fit" works, that the page does not
// overflow, logs nothing and requests nothing. Never run it locally.
if (process.env.GITHUB_ACTIONS !== "true" || process.env.CI !== "true"
    || !process.env.GITHUB_RUN_ID || !process.env.CHROME_BIN) {
  throw new Error("The browser check runs only in GitHub CI with CHROME_BIN");
}

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { default: puppeteer } = await import("puppeteer-core");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageFile = resolve(root, "dist/demo.html");
if (!existsSync(pageFile)) throw new Error("dist/demo.html is missing: run `npm run build:fresh` first");
const pageUrl = pathToFileURL(pageFile).href;
const artifacts = process.env.DEMO_ARTIFACTS;

const READABLE_SCALE = 0.45;
const TOLERANCE = 1; // CSS px, for layout rounding
// The figure re-measures its painted bounds after a camera move, which moves
// the framing zoom by a few 1e-5 (measured in CI: 0.46886 -> 0.46886 - 3e-6).
const SAME_ZOOM = 1e-3;
const CASES = [
  // [width, height, boxes drawn when the page opens]
  { width: 320, height: 640, boxes: 1 },
  { width: 1280, height: 900, boxes: 11 },
];
const SCHEMES = ["light", "dark"];

/** Runs in the page: geometry of the figure, in CSS px. */
const measure = () => {
  const figure = document.querySelector(".st-diagramSceneFigure");
  const viewport = document.querySelector(".st-diagramSceneFigure-viewport");
  if (figure === null || viewport === null) return null;
  const outer = viewport.getBoundingClientRect();
  const left = outer.left + viewport.clientLeft;
  const top = outer.top + viewport.clientTop;
  const box = (element, id) => {
    const rect = element.getBoundingClientRect();
    return { id, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  };
  const controls = [...document.querySelectorAll(".st-diagramSceneFigure-controls button")];
  return {
    zoom: Number(figure.getAttribute("data-zoom")),
    readout: figure.getAttribute("data-zoom-readout"),
    refused: figure.getAttribute("data-scene-refused"),
    pans: viewport.getAttribute("data-pans"),
    busy: viewport.getAttribute("aria-busy"),
    inner: { left, top, right: left + viewport.clientWidth, bottom: top + viewport.clientHeight },
    scroll: {
      left: viewport.scrollLeft, top: viewport.scrollTop,
      width: viewport.scrollWidth, height: viewport.scrollHeight,
      clientWidth: viewport.clientWidth, clientHeight: viewport.clientHeight,
    },
    boxes: [...viewport.querySelectorAll("[data-scene-occurrence]")].map((element) => box(element, element.getAttribute("data-scene-occurrence"))),
    labels: [...viewport.querySelectorAll(".st-diagramSceneFigure-edgeLabel")].map((element, index) => box(element, `label ${index}: ${element.textContent.trim()}`)),
    page: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    controls: controls.map((button) => ({ text: button.textContent.trim(), label: button.getAttribute("aria-label"), disabled: button.disabled })),
  };
};

/** Waits until two measures 150 ms apart are identical and no transition runs. */
async function settled(page) {
  let previous;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((done) => setTimeout(done, 150));
    const current = await page.evaluate(measure);
    const text = JSON.stringify(current);
    if (current !== null && current.busy !== "true" && text === previous) return current;
    previous = text;
  }
  throw new Error("The figure did not settle within 9 s");
}

const failures = [];
async function run(name, page, steps) {
  const problems = [];
  const expect = (ok, message) => { if (!ok) problems.push(message); };
  let last;
  try {
    last = await steps(expect);
  } catch (error) {
    problems.push(`threw: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  }
  if (problems.length === 0) {
    console.log(`PASS  ${name}`);
    return;
  }
  console.log(`FAIL  ${name}`);
  for (const problem of problems) console.log(`      ${problem}`);
  failures.push(name);
  if (artifacts !== undefined) {
    await mkdir(artifacts, { recursive: true });
    await page.screenshot({ path: join(artifacts, `${name}.png`), fullPage: true }).catch(() => undefined);
    await writeFile(join(artifacts, `${name}.json`), JSON.stringify({ problems, last }, null, 2));
  }
}

/** The whole drawing is inside the figure viewport, which does not scroll. */
function framed(expect, state, when) {
  expect(state.refused === null, `${when}: layout refused (${state.refused})`);
  expect(state.pans === "false", `${when}: the figure pans (data-pans=${state.pans})`);
  expect(state.zoom >= READABLE_SCALE - 1e-6, `${when}: zoom ${state.zoom} is below the readable scale`);
  expect(state.scroll.width <= state.scroll.clientWidth + TOLERANCE, `${when}: viewport scrolls sideways (${state.scroll.width} > ${state.scroll.clientWidth})`);
  expect(state.scroll.height <= state.scroll.clientHeight + TOLERANCE, `${when}: viewport scrolls down (${state.scroll.height} > ${state.scroll.clientHeight})`);
  for (const item of [...state.boxes, ...state.labels]) {
    const inside = item.left >= state.inner.left - TOLERANCE && item.top >= state.inner.top - TOLERANCE
      && item.right <= state.inner.right + TOLERANCE && item.bottom <= state.inner.bottom + TOLERANCE;
    expect(inside, `${when}: ${item.id} [${item.left.toFixed(1)}, ${item.top.toFixed(1)}, ${item.right.toFixed(1)}, ${item.bottom.toFixed(1)}] is outside the viewport [${state.inner.left.toFixed(1)}, ${state.inner.top.toFixed(1)}, ${state.inner.right.toFixed(1)}, ${state.inner.bottom.toFixed(1)}]`);
  }
  expect(state.page.scrollWidth === state.page.clientWidth, `${when}: the page overflows sideways (${state.page.scrollWidth} > ${state.page.clientWidth})`);
}

const clickControl = (page, index) => page.evaluate((at) => {
  document.querySelectorAll(".st-diagramSceneFigure-controls button")[at].click();
}, index);
const ZOOM_IN = 1;
const FIT = 2;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_BIN,
  headless: true,
  // Classic scrollbars, as a desktop browser shows them.
  ignoreDefaultArgs: ["--hide-scrollbars"],
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  for (const { width, height, boxes } of CASES) {
    for (const scheme of SCHEMES) {
      const name = `${width}x${height}-${scheme}`;
      const page = await browser.newPage();
      const messages = [];
      const requests = [];
      page.on("pageerror", (error) => messages.push(`[pageerror] ${String(error)}`));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warn" || message.type() === "warning") messages.push(`[${message.type()}] ${message.text()}`);
      });
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = request.url();
        if (url.startsWith("file:") || url.startsWith("data:")) {
          void request.continue();
        } else {
          requests.push(url);
          void request.abort();
        }
      });
      await page.setViewport({ width, height });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
      await page.goto(pageUrl, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));

      await run(name, page, async (expect) => {
        const opened = await settled(page);
        expect(opened.colorScheme.includes(scheme), `colour scheme is "${opened.colorScheme}", expected ${scheme}`);
        expect(opened.controls.length === 3 && opened.controls[FIT].text === "Fit", `controls are ${JSON.stringify(opened.controls)}`);
        expect(opened.boxes.length === boxes, `${opened.boxes.length} boxes drawn when the page opens, expected ${boxes}`);
        framed(expect, opened, "on open");

        // Fit on an untouched camera changes nothing.
        await clickControl(page, FIT);
        const fitted = await settled(page);
        framed(expect, fitted, "after Fit");
        expect(Math.abs(fitted.zoom - opened.zoom) < SAME_ZOOM, `Fit moved an untouched camera (${opened.zoom} -> ${fitted.zoom})`);

        // Zoom in, then Fit must come back to the framing zoom.
        let last = fitted;
        if (!fitted.controls[ZOOM_IN].disabled) {
          await clickControl(page, ZOOM_IN);
          const closer = await settled(page);
          expect(closer.zoom > fitted.zoom + 1e-6, `zoom in did not zoom (${fitted.zoom} -> ${closer.zoom})`);
          await clickControl(page, FIT);
          last = await settled(page);
          framed(expect, last, "after zoom in then Fit");
          expect(Math.abs(last.zoom - fitted.zoom) < SAME_ZOOM, `Fit after a zoom in gives ${last.zoom}, expected ${fitted.zoom}`);
        }

        // Narrow page: unfolding past what fits scrolls from the start, the
        // page itself never overflows, and Fit holds the readable scale.
        if (boxes === 1) {
          const unfolded = await page.evaluate(() => {
            const toggle = document.querySelector('.st-diagramSceneFigure-viewport [data-scene-occurrence] button[aria-expanded="false"]');
            if (toggle === null) return false;
            toggle.click();
            return true;
          });
          expect(unfolded, "no unfold button on the folded card");
          await settled(page);
          await clickControl(page, FIT);
          last = await settled(page);
          expect(last.boxes.length === 5, `${last.boxes.length} boxes after unfolding the card, expected 5`);
          expect(last.pans === "true", `after unfolding: data-pans=${last.pans}, expected true`);
          expect(Math.abs(last.zoom - READABLE_SCALE) < 1e-6, `after unfolding then Fit: zoom ${last.zoom}, expected ${READABLE_SCALE}`);
          expect(last.scroll.left === 0 && last.scroll.top === 0, `after unfolding then Fit: scrolled to (${last.scroll.left}, ${last.scroll.top}), expected the start`);
          expect(last.scroll.width > last.scroll.clientWidth, "after unfolding: the drawing does not scroll sideways");
          expect(last.page.scrollWidth === last.page.clientWidth, `after unfolding: the page overflows sideways (${last.page.scrollWidth} > ${last.page.clientWidth})`);
        }

        expect(messages.length === 0, `console: ${JSON.stringify(messages)}`);
        expect(requests.length === 0, `requests other than file: or data: ${JSON.stringify(requests)}`);
        return { opened, last, messages, requests };
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`${failures.length} browser case(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Browser check passed");
