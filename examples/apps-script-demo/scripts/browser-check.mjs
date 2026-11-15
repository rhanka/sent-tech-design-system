// GitHub CI only. Keep this guard before the driver import and the launch.
// Opens the BUILT page (dist/demo.html, file://) in Chrome for Testing and
// checks what no static or server-side check can see: that the diagram is
// framed whole by its figure (or, on a phone, opens on its structure and
// scrolls), that every link is painted above the container surfaces, that the
// framing follows a change of width and a fold by hand, that "Fit" works, and
// that the page does not overflow, logs nothing and requests nothing. Never
// run it locally.
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
// Layout rounding and scrollbar rounding between two renders of one state.
const SAME_EXTENT = 2;
const CASES = [
  // boxes and links drawn when the page opens; whole: the figure frames them all
  { width: 320, height: 640, boxes: 5, links: 3, whole: false },
  { width: 768, height: 1024, boxes: 5, links: 3, whole: true },
  { width: 1280, height: 900, boxes: 11, links: 6, whole: true },
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
    links: viewport.querySelectorAll("polyline[data-scene-edge]").length,
    labels: [...viewport.querySelectorAll(".st-diagramSceneFigure-edgeLabel")].map((element, index) => box(element, `label ${index}: ${element.textContent.trim()}`)),
    page: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    controls: controls.map((button) => ({ text: button.textContent.trim(), label: button.getAttribute("aria-label"), disabled: button.disabled })),
  };
};

/**
 * Runs in the page: is every link painted where it can be seen? For each
 * connector, points are sampled along its segments; a sample is kept when it
 * is in the figure viewport and outside every card, folded container, edge
 * label and masked cutout (those are drawn above a link on purpose). At a kept
 * sample the top-most element must be the connector: hit testing follows the
 * paint order, so a container surface painted above the link is found here.
 * The connectors take pointer events and a 3 px stroke for the time of the
 * test only (they have none, and a stroke under 1 px at the framing zoom).
 */
const connectors = () => {
  const viewport = document.querySelector(".st-diagramSceneFigure-viewport");
  // Hit testing only answers inside the window.
  viewport.scrollIntoView({ block: "center", behavior: "instant" });
  const outer = viewport.getBoundingClientRect();
  const view = { left: outer.left + viewport.clientLeft, top: outer.top + viewport.clientTop };
  view.right = view.left + viewport.clientWidth;
  view.bottom = view.top + viewport.clientHeight;
  const PAD = 3;
  const covers = [];
  for (const node of viewport.querySelectorAll("[data-scene-occurrence]")) {
    if (node.querySelector(".st-diagramZone--expanded") === null) covers.push(node.getBoundingClientRect());
  }
  for (const label of viewport.querySelectorAll(".st-diagramSceneFigure-edgeLabel")) covers.push(label.getBoundingClientRect());
  const style = document.createElement("style");
  style.textContent = "polyline[data-scene-edge]{pointer-events:stroke !important;stroke-width:3px !important}";
  document.head.append(style);
  try {
    return [...viewport.querySelectorAll("polyline[data-scene-edge]")].map((line) => {
      const matrix = line.getScreenCTM();
      const at = (x, y) => ({ x: matrix.a * x + matrix.c * y + matrix.e, y: matrix.b * x + matrix.d * y + matrix.f });
      for (const cutout of line.ownerSVGElement.querySelectorAll("rect[data-scene-cutout]")) {
        const start = at(cutout.x.baseVal.value, cutout.y.baseVal.value);
        const end = at(cutout.x.baseVal.value + cutout.width.baseVal.value, cutout.y.baseVal.value + cutout.height.baseVal.value);
        covers.push({ left: start.x, top: start.y, right: end.x, bottom: end.y });
      }
      const points = [...line.points].map((point) => at(point.x, point.y));
      let length = 0;
      let exposed = 0;
      const hidden = [];
      for (let index = 0; index + 1 < points.length; index += 1) {
        const from = points[index];
        const to = points[index + 1];
        length += Math.hypot(to.x - from.x, to.y - from.y);
        for (let step = 1; step < 20; step += 1) {
          const x = from.x + ((to.x - from.x) * step) / 20;
          const y = from.y + ((to.y - from.y) * step) / 20;
          if (x < view.left + PAD || x > view.right - PAD || y < view.top + PAD || y > view.bottom - PAD) continue;
          if (covers.some((rect) => x >= rect.left - PAD && x <= rect.right + PAD && y >= rect.top - PAD && y <= rect.bottom + PAD)) continue;
          const top = document.elementFromPoint(x, y);
          if (top !== null && top.hasAttribute("data-scene-edge")) exposed += 1;
          else if (hidden.length < 3) {
            const owner = top?.closest("[data-scene-occurrence]")?.getAttribute("data-scene-occurrence") ?? "";
            hidden.push(`(${x.toFixed(1)}, ${y.toFixed(1)}) under <${top?.tagName.toLowerCase() ?? "nothing"} class="${top?.getAttribute("class") ?? ""}"> ${owner}`);
          }
        }
      }
      return { id: line.getAttribute("data-scene-edge"), points: points.length, length, exposed, hidden };
    });
  } finally {
    style.remove();
  }
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

/**
 * The figure is too small for the drawing: it sits at the readable scale and
 * scrolls from its start, inside a page that does not overflow.
 */
function scrolling(expect, state, when) {
  expect(state.refused === null, `${when}: layout refused (${state.refused})`);
  expect(state.pans === "true", `${when}: data-pans=${state.pans}, expected true`);
  expect(Math.abs(state.zoom - READABLE_SCALE) < 1e-6, `${when}: zoom ${state.zoom}, expected ${READABLE_SCALE}`);
  expect(state.scroll.left === 0 && state.scroll.top === 0, `${when}: scrolled to (${state.scroll.left}, ${state.scroll.top}), expected the start`);
  expect(state.scroll.width > state.scroll.clientWidth, `${when}: the drawing does not scroll sideways`);
  expect(state.page.scrollWidth === state.page.clientWidth, `${when}: the page overflows sideways (${state.page.scrollWidth} > ${state.page.clientWidth})`);
}

/** Same drawing extent as another render of the same state: nothing kept from a previous state. */
function sameExtent(expect, state, reference, when) {
  expect(Math.abs(state.zoom - reference.zoom) < SAME_ZOOM, `${when}: zoom ${state.zoom}, a fresh load gives ${reference.zoom}`);
  expect(Math.abs(state.scroll.width - reference.scroll.width) <= SAME_EXTENT && Math.abs(state.scroll.height - reference.scroll.height) <= SAME_EXTENT,
    `${when}: scroll extent ${state.scroll.width} x ${state.scroll.height}, a fresh load gives ${reference.scroll.width} x ${reference.scroll.height}`);
}

/** Every link has a connector with a length, and no sample of it is under another surface. */
async function painted(expect, page, links, everyLink, when) {
  const found = await page.evaluate(connectors);
  expect(found.length === links, `${when}: ${found.length} connectors, expected ${links}`);
  for (const link of found) {
    expect(link.points >= 2 && link.length > 1, `${when}: ${link.id} has no path (${link.points} points, ${link.length.toFixed(1)} px)`);
    expect(link.hidden.length === 0, `${when}: ${link.id} is covered at ${link.hidden.join("; ")}`);
    if (everyLink) expect(link.exposed > 0, `${when}: ${link.id} has no visible part`);
  }
  expect(found.some((link) => link.exposed > 0), `${when}: no link is visible`);
  return found;
}

const occurrence = (state, name) => state.boxes.find((item) => item.id === `occurrence:e.${name}`);
/** Clicks the fold button of a container; `expanded` is its state before the click. */
const toggleFold = (page, name, expanded) => page.evaluate((id, state) => {
  const toggle = document.querySelector(`.st-diagramSceneFigure-viewport [data-scene-occurrence="${id}"] button[aria-expanded="${state}"]`);
  if (toggle === null) return false;
  toggle.click();
  return true;
}, `occurrence:e.${name}`, String(expanded));

async function open(width, height, scheme) {
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
  return { page, messages, requests };
}

/** Changes the window size, then waits for the page and the figure to follow. */
async function resize(page, width, height) {
  await page.setViewport({ width, height });
  await new Promise((done) => setTimeout(done, 300));
  return settled(page);
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
/** State of each fresh load, by "width x height": what a resize to that size must give. */
const fresh = new Map();
try {
  for (const { width, height, boxes, links, whole } of CASES) {
    for (const scheme of SCHEMES) {
      const name = `${width}x${height}-${scheme}`;
      const { page, messages, requests } = await open(width, height, scheme);

      await run(name, page, async (expect) => {
        const opened = await settled(page);
        fresh.set(`${width}x${height}`, opened);
        const framing = whole ? framed : scrolling;
        expect(opened.colorScheme.includes(scheme), `colour scheme is "${opened.colorScheme}", expected ${scheme}`);
        expect(opened.controls.length === 3 && opened.controls[FIT].text === "Fit", `controls are ${JSON.stringify(opened.controls)}`);
        expect(opened.boxes.length === boxes, `${opened.boxes.length} boxes drawn when the page opens, expected ${boxes}`);
        framing(expect, opened, "on open");
        const drawn = await painted(expect, page, links, whole, "on open");

        // Fit on an untouched camera changes nothing.
        await clickControl(page, FIT);
        const fitted = await settled(page);
        framing(expect, fitted, "after Fit");
        expect(Math.abs(fitted.zoom - opened.zoom) < SAME_ZOOM, `Fit moved an untouched camera (${opened.zoom} -> ${fitted.zoom})`);

        // Zoom in, then Fit must come back to the framing zoom.
        let last = fitted;
        if (!fitted.controls[ZOOM_IN].disabled) {
          await clickControl(page, ZOOM_IN);
          const closer = await settled(page);
          expect(closer.zoom > fitted.zoom + 1e-6, `zoom in did not zoom (${fitted.zoom} -> ${closer.zoom})`);
          await clickControl(page, FIT);
          last = await settled(page);
          framing(expect, last, "after zoom in then Fit");
          expect(Math.abs(last.zoom - fitted.zoom) < SAME_ZOOM, `Fit after a zoom in gives ${last.zoom}, expected ${fitted.zoom}`);
        }

        // Phone: the drawing opens on its structure, not on one folded card.
        // The first card is in view and a stage starts beside it. Folding
        // `Request path` by hand frames the one card left; unfolding it gives
        // back the drawing as it opened.
        if (!whole) {
          const client = occurrence(last, "client");
          const inView = (item) => item !== undefined && item.left < last.inner.right && item.right > last.inner.left && item.top < last.inner.bottom && item.bottom > last.inner.top;
          expect(client !== undefined && client.left >= last.inner.left - TOLERANCE && client.right <= last.inner.right + TOLERANCE
            && client.top >= last.inner.top - TOLERANCE && (client.top + client.bottom) / 2 <= last.inner.bottom,
            `the Client app card is not in view when the page opens (${JSON.stringify(client)} in ${JSON.stringify(last.inner)})`);
          expect(["ingestion", "processing", "storage"].some((stage) => inView(occurrence(last, stage))), "no stage is in view beside the Client app card");

          expect(await toggleFold(page, "path", true), "no fold button on Request path");
          const card = await settled(page);
          expect(card.boxes.length === 1, `${card.boxes.length} boxes after folding Request path, expected 1`);
          framed(expect, card, "after folding Request path by hand");
          expect(await toggleFold(page, "path", false), "no unfold button on the folded card");
          last = await settled(page);
          expect(last.boxes.length === boxes, `${last.boxes.length} boxes after unfolding the card, expected ${boxes}`);
          scrolling(expect, last, "after unfolding the card");
          sameExtent(expect, last, opened, "after unfolding the card");
        }

        expect(messages.length === 0, `console: ${JSON.stringify(messages)}`);
        expect(requests.length === 0, `requests other than file: or data: ${JSON.stringify(requests)}`);
        return { opened, last, links: drawn, messages, requests };
      });
      await page.close();
    }
  }

  // One page through a change of width and a fold by hand: the framing must
  // follow, with nothing kept from the previous state (scroll extent, zoom).
  {
    const name = "resize-and-fold-light";
    const { page, messages, requests } = await open(1280, 900, "light");
    await run(name, page, async (expect) => {
      const wide = await settled(page);
      framed(expect, wide, "on open at 1280");
      // The reader zooms in: a new width is a new frame all the same.
      if (!wide.controls[ZOOM_IN].disabled) {
        await clickControl(page, ZOOM_IN);
        await settled(page);
      }

      const phone = await resize(page, 320, 640);
      expect(phone.boxes.length === 5, `${phone.boxes.length} boxes after a resize to 320, expected 5`);
      scrolling(expect, phone, "after a resize from 1280 to 320");
      if (fresh.has("320x640")) sameExtent(expect, phone, fresh.get("320x640"), "after a resize from 1280 to 320");

      const tablet = await resize(page, 768, 1024);
      expect(tablet.boxes.length === 5, `${tablet.boxes.length} boxes after a resize to 768, expected 5`);
      framed(expect, tablet, "after a resize from 320 to 768");
      if (fresh.has("768x1024")) sameExtent(expect, tablet, fresh.get("768x1024"), "after a resize from 320 to 768");

      const back = await resize(page, 1280, 900);
      expect(back.boxes.length === 11, `${back.boxes.length} boxes after a resize back to 1280, expected 11`);
      framed(expect, back, "after a resize back to 1280");
      sameExtent(expect, back, wide, "after a resize back to 1280");
      await painted(expect, page, 6, true, "after a resize back to 1280");

      // Fold by hand at the fit: the figure frames the smaller drawing.
      expect(await toggleFold(page, "storage", true), "no fold button on Storage");
      const folded = await settled(page);
      expect(folded.boxes.length === 9, `${folded.boxes.length} boxes after folding Storage, expected 9`);
      framed(expect, folded, "after folding Storage by hand");
      expect(folded.zoom > back.zoom + 1e-6, `folding Storage did not reframe (${back.zoom} -> ${folded.zoom})`);
      const links = await painted(expect, page, 5, true, "after folding Storage by hand");

      expect(messages.length === 0, `console: ${JSON.stringify(messages)}`);
      expect(requests.length === 0, `requests other than file: or data: ${JSON.stringify(requests)}`);
      return { wide, phone, tablet, back, folded, links, messages, requests };
    });
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`${failures.length} browser case(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("Browser check passed");
