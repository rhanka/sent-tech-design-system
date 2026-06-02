#!/usr/bin/env node
// @ts-check
/**
 * Pixel-perfect, edge-by-edge fidelity comparison CLI.
 *
 * Compares OUR mapped components (left cell) against the REAL official
 * DSFR / Carbon components (right cell, in an `<iframe srcdoc>` loading the
 * official CSS from CDN) on the /compare page.
 *
 * It measures real computed styles per edge/corner/side via headless Chrome
 * (puppeteer-core driving the system Chrome — no browser download), diffs
 * OURS vs REFERENCE, and emits:
 *   - docs/compare-fidelity-report.md  (human report, per theme/component)
 *   - tools/compare/last-report.json   (raw structured data for CI reuse)
 *
 * Usage:
 *   node tools/compare/fidelity.mjs [--theme dsfr|carbon] [--component Button|...]
 *                                   [--json] [--date YYYY-MM-DD] [--keep-server]
 *
 * No args = all themes, all components. Always exits 0 (it is a report).
 * Optional gate: --fail-under <pct> exits 1 if global fidelity is below pct.
 */

import { spawn } from "node:child_process";
import http from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer-core";

import { getCompareManifest, COMPARE_MANIFEST as COMPARE_MANIFEST_PUBLIC } from "../../apps/docs/src/lib/compare/manifest.mjs";
import { getReferenceThemes, REFERENCE_THEMES as REFERENCE_THEMES_PUBLIC } from "../../apps/docs/src/lib/compare/reference-themes.mjs";
import { gapKey, manifestHash, mergeRegistry } from "../../apps/docs/src/lib/compare/registry.mjs";
import { ANATOMY_VERSION } from "@sentropic/design-system-themes";

// Charge le manifest et les thèmes de référence avec les overlays privés locaux
// s'ils existent (fichiers gitignorés — stubs créés par
// scripts/ensure-compare-local-overlays.mjs avant chaque build).
const COMPARE_MANIFEST = getCompareManifest({ includeLocal: true });
const REFERENCE_THEMES = getReferenceThemes({ includeLocal: true });

// Ensemble des thèmes publics (dsfr, carbon) — leurs gaps vont dans compare-gaps.json.
// Les thèmes locaux (ex. airbus) vont dans compare-gaps.local.json (gitignorés).
const PUBLIC_THEMES = new Set(Object.keys(REFERENCE_THEMES_PUBLIC));

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const CHROME_PATH = "/usr/bin/google-chrome";
const DEFAULT_PORT = 4322; // NEVER 5173
const DEFAULT_FIDELITY_HOST = process.env.FIDELITY_HOST || "127.0.0.1";
const BUILD_DIR = join(REPO_ROOT, "apps", "docs", "build");

// ---------------------------------------------------------------------------
// Bench catalogue derived from the single manifest (no duplication).
// ---------------------------------------------------------------------------

const COMPONENTS = Array.from(
  new Set(Object.values(COMPARE_MANIFEST).flatMap((t) => Object.keys(t)))
);
const COMPONENT_THEMES = {}; // key → [themes that have it]
for (const theme of Object.keys(COMPARE_MANIFEST)) {
  for (const key of Object.keys(COMPARE_MANIFEST[theme])) {
    (COMPONENT_THEMES[key] ??= []).push(theme);
  }
}
const OUR_SELECTOR = Object.fromEntries(
  COMPONENTS.map((k) => {
    // Cherche ourSelector dans le premier thème qui possède ce composant
    // (dsfr en priorité, carbon ensuite, puis tout thème local comme airbus).
    const themes = Object.keys(COMPARE_MANIFEST);
    const entry =
      COMPARE_MANIFEST.dsfr?.[k] ??
      COMPARE_MANIFEST.carbon?.[k] ??
      themes.map((t) => COMPARE_MANIFEST[t]?.[k]).find(Boolean);
    return [k, entry?.ourSelector ?? ""];
  })
);
const REF_SELECTOR = Object.fromEntries(
  Object.entries(COMPARE_MANIFEST).map(([theme, keys]) => [
    theme,
    Object.fromEntries(Object.entries(keys).map(([k, m]) => [k, m.refSelector])),
  ])
);
const REF_SELECTOR_NOTE = Object.fromEntries(
  Object.entries(COMPARE_MANIFEST).map(([theme, keys]) => [
    theme,
    Object.fromEntries(
      Object.entries(keys).filter(([, m]) => m.note).map(([k, m]) => [k, m.note])
    ),
  ])
);

// Déduit dynamiquement depuis REFERENCE_THEMES (inclut les thèmes privés locaux).
const THEMES = Object.keys(REFERENCE_THEMES);

/** True when an official equivalent exists for (theme, component). */
function themeHasComponent(theme, component) {
  const allowed = COMPONENT_THEMES[component];
  if (allowed && !allowed.includes(theme)) return false;
  return Boolean(REF_SELECTOR[theme] && REF_SELECTOR[theme][component]);
}

/** Ordered list of components rendered for a theme (mirrors the page filter). */
function componentsForTheme(theme, components) {
  return components.filter((c) => themeHasComponent(theme, c));
}

// Tolerances for the `~` (close) status.
const TOL = {
  lengthPx: 1, // ±1px for any length comparison
  colorDist: 12, // Euclidean distance in RGB space considered "close"
};

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = {
    theme: null,
    component: null,
    host: DEFAULT_FIDELITY_HOST,
    port: null,
    json: false,
    date: null,
    keepServer: false,
    failUnder: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--theme") out.theme = argv[++i];
    else if (a === "--component") out.component = argv[++i];
    else if (a === "--host") out.host = argv[++i];
    else if (a === "--port") out.port = Number(argv[++i]);
    else if (a === "--json") out.json = true;
    else if (a === "--date") out.date = argv[++i];
    else if (a === "--keep-server") out.keepServer = true;
    else if (a === "--fail-under") out.failUnder = Number(argv[++i]);
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      printHelp();
      process.exit(2);
    }
  }
  return out;
}

function printHelp() {
  console.log(`fidelity.mjs — edge-by-edge pixel-perfect fidelity comparison

Usage:
  node tools/compare/fidelity.mjs [options]

Options:
  --theme <dsfr|carbon>      Limit to one theme (default: all)
  --component <Name>         Limit to one component (default: all)
  --host <hostname>          Local server bind/target host (default: ${DEFAULT_FIDELITY_HOST})
  --port <number>            Local server port (default: ${DEFAULT_PORT}; or FIDELITY_PORT env)
  --json                     Print the raw JSON report to stdout
  --date <YYYY-MM-DD>        Date stamped in the report (default: placeholder)
  --keep-server              Do not kill the docs server on exit (debug)
  --fail-under <pct>         Exit 1 if global fidelity < pct (default: never fail)
  -h, --help                 Show this help

Components: ${COMPONENTS.join(", ")}`);
}

// ---------------------------------------------------------------------------
// Static server for the prerendered docs build (robust; no vite dev flakiness).
// ---------------------------------------------------------------------------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveStaticPath(urlPath) {
  // strip query, decode, normalise
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p.endsWith("/")) p = p.slice(0, -1);
  if (p === "") return join(BUILD_DIR, "index.html");
  const candidate = join(BUILD_DIR, p);
  // exact file
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  // directory -> index.html
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const idx = join(candidate, "index.html");
    if (existsSync(idx)) return idx;
  }
  // SvelteKit static adapter prerenders /compare -> compare.html
  const html = `${candidate}.html`;
  if (existsSync(html) && statSync(html).isFile()) return html;
  return null;
}

function startStaticServer(host, port) {
  return new Promise((resolveFn, rejectFn) => {
    const server = http.createServer((req, res) => {
      const filePath = resolveStaticPath(req.url || "/");
      if (!filePath) {
        // SPA-ish fallback to the adapter's 404 page
        const fb = join(BUILD_DIR, "404.html");
        if (existsSync(fb)) {
          res.writeHead(200, { "content-type": MIME[".html"] });
          createReadStream(fb).pipe(res);
          return;
        }
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const type = MIME[extname(filePath)] || "application/octet-stream";
      res.writeHead(200, { "content-type": type });
      createReadStream(filePath).pipe(res);
    });
    server.on("error", rejectFn);
    server.listen(port, host, () => {
      const actual = server.address();
      const usedPort = typeof actual === "string" ? port : actual?.port;
      resolveFn({ server, usedPort: usedPort ?? port });
    });
  });
}

// ---------------------------------------------------------------------------
// Dev server fallback (only if build dir is missing).
// ---------------------------------------------------------------------------
function startDevServer(host, port) {
  const child = spawn(
    "npm",
    ["run", "--workspace", "apps/docs", "dev", "--", "--host", host, "--port", String(port), "--strictPort"],
    { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  return child;
}

async function waitForServer(url, { timeoutMs = 60000, intervalMs = 400 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((res) => {
      const req = http.get(url, (r) => {
        r.resume();
        res(r.statusCode != null && r.statusCode < 500);
      });
      req.on("error", () => res(false));
      req.setTimeout(2000, () => {
        req.destroy();
        res(false);
      });
    });
    if (ok) return true;
    await sleep(intervalMs);
  }
  return false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Color normalisation.
// ---------------------------------------------------------------------------
/** Normalise any computed color to `rgb(r,g,b)` (drops alpha for comparison). */
function normColor(raw) {
  if (!raw) return raw;
  const s = String(raw).trim();
  if (s === "transparent") return "rgb(0,0,0)/a0"; // mark fully transparent distinctly
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const [r, g, b, a] = parts;
    if (a !== undefined && a === 0) return `rgb(${r},${g},${b})/a0`;
    return `rgb(${r},${g},${b})`;
  }
  return s; // e.g. a keyword we did not expect; compare as-is
}

function colorRGB(norm) {
  const m = String(norm).match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function colorDistance(a, b) {
  const ca = colorRGB(a);
  const cb = colorRGB(b);
  if (!ca || !cb) return Infinity;
  return Math.sqrt(
    (ca[0] - cb[0]) ** 2 + (ca[1] - cb[1]) ** 2 + (ca[2] - cb[2]) ** 2
  );
}

// ---------------------------------------------------------------------------
// In-page measurement (runs inside the browser context).
// ---------------------------------------------------------------------------
/* eslint-disable */
function measureInPage(selector) {
  const el = document.querySelector(selector);
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const get = (p) => cs.getPropertyValue(p).trim();
  const sides = ["top", "right", "bottom", "left"];
  const border = {};
  for (const s of sides) {
    border[s] = {
      width: get(`border-${s}-width`),
      style: get(`border-${s}-style`),
      color: get(`border-${s}-color`),
    };
  }
  const radius = {
    topLeft: get("border-top-left-radius"),
    topRight: get("border-top-right-radius"),
    bottomRight: get("border-bottom-right-radius"),
    bottomLeft: get("border-bottom-left-radius"),
  };
  const padding = {};
  for (const s of sides) padding[s] = get(`padding-${s}`);

  // Focus measurement: focus, read, then blur to restore.
  const hadFocus = document.activeElement === el;
  let focus = null;
  try {
    if (typeof el.focus === "function") {
      el.focus();
      const fcs = getComputedStyle(el);
      focus = {
        outlineWidth: fcs.getPropertyValue("outline-width").trim(),
        outlineStyle: fcs.getPropertyValue("outline-style").trim(),
        outlineColor: fcs.getPropertyValue("outline-color").trim(),
        outlineOffset: fcs.getPropertyValue("outline-offset").trim(),
        boxShadow: fcs.getPropertyValue("box-shadow").trim(),
      };
      if (!hadFocus && typeof el.blur === "function") el.blur();
    }
  } catch (_) {
    focus = null;
  }

  return {
    found: true,
    border,
    radius,
    padding,
    box: { width: rect.width, height: rect.height },
    typo: {
      fontFamily: get("font-family").split(",")[0].replace(/['"]/g, "").trim(),
      fontSize: get("font-size"),
      fontWeight: get("font-weight"),
      lineHeight: get("line-height"),
      letterSpacing: get("letter-spacing"),
      textTransform: get("text-transform"),
      textDecorationLine: get("text-decoration-line"),
    },
    colors: {
      backgroundColor: get("background-color"),
      color: get("color"),
    },
  };
}
/* eslint-enable */

// ---------------------------------------------------------------------------
// Diff logic.
// ---------------------------------------------------------------------------
const LENGTH_PROP = /(width|height|size|radius|padding|spacing|offset)/i;

function parsePx(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "normal" || s === "auto" || s === "none" || s === "") return null;
  const m = s.match(/^(-?[\d.]+)px$/);
  if (m) return Number(m[1]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Returns { status: '='|'~'|'≠', delta } comparing OURS vs REF for one prop. */
function diffValue(prop, ours, ref) {
  const isColor = /color/i.test(prop);
  if (isColor) {
    const a = normColor(ours);
    const b = normColor(ref);
    if (a === b) return { status: "=", delta: "" };
    const dist = colorDistance(a, b);
    if (Number.isFinite(dist) && dist <= TOL.colorDist) {
      return { status: "~", delta: `Δrgb≈${dist.toFixed(0)}` };
    }
    return { status: "≠", delta: `${a} vs ${b}` };
  }

  const isLength = LENGTH_PROP.test(prop);
  if (isLength) {
    const a = parsePx(ours);
    const b = parsePx(ref);
    if (a != null && b != null) {
      const d = Math.abs(a - b);
      if (d === 0) return { status: "=", delta: "" };
      if (d <= TOL.lengthPx) return { status: "~", delta: `Δ${d.toFixed(1)}px` };
      return { status: "≠", delta: `Δ${(a - b).toFixed(1)}px` };
    }
    // fall through to literal comparison if not both numeric
  }

  // line-height can be unitless; normalise to string compare
  const a = String(ours ?? "").trim();
  const b = String(ref ?? "").trim();
  if (a === b) return { status: "=", delta: "" };
  return { status: "≠", delta: `${a} vs ${b}` };
}

/** Flatten a measurement into a list of { label, prop, value } rows. */
function flatten(m) {
  if (!m || !m.found) return [];
  const rows = [];
  const sides = ["top", "right", "bottom", "left"];
  for (const s of sides) {
    rows.push({ label: `border-${s} width`, prop: `border-${s}-width`, value: m.border[s].width });
    rows.push({ label: `border-${s} style`, prop: `border-${s}-style`, value: m.border[s].style });
    rows.push({ label: `border-${s} color`, prop: `border-${s}-color`, value: m.border[s].color });
  }
  for (const c of ["topLeft", "topRight", "bottomRight", "bottomLeft"]) {
    rows.push({ label: `radius ${c}`, prop: `border-radius`, value: m.radius[c] });
  }
  for (const s of sides) rows.push({ label: `padding-${s}`, prop: `padding-${s}`, value: m.padding[s] });
  rows.push({ label: "box width", prop: "box-width", value: round1(m.box.width) + "px" });
  rows.push({ label: "box height", prop: "box-height", value: round1(m.box.height) + "px" });
  rows.push({ label: "font-family", prop: "font-family", value: m.typo.fontFamily });
  rows.push({ label: "font-size", prop: "font-size", value: m.typo.fontSize });
  rows.push({ label: "font-weight", prop: "font-weight", value: m.typo.fontWeight });
  rows.push({ label: "line-height", prop: "line-height", value: m.typo.lineHeight });
  rows.push({ label: "letter-spacing", prop: "letter-spacing", value: m.typo.letterSpacing });
  rows.push({ label: "text-transform", prop: "text-transform", value: m.typo.textTransform });
  rows.push({ label: "text-decoration", prop: "text-decoration-line", value: m.typo.textDecorationLine });
  rows.push({ label: "background-color", prop: "background-color", value: m.colors.backgroundColor });
  rows.push({ label: "color", prop: "color", value: m.colors.color });
  if (m.focus) {
    rows.push({ label: "focus outline-width", prop: "outline-width", value: m.focus.outlineWidth });
    rows.push({ label: "focus outline-style", prop: "outline-style", value: m.focus.outlineStyle });
    rows.push({ label: "focus outline-color", prop: "outline-color", value: m.focus.outlineColor });
    rows.push({ label: "focus outline-offset", prop: "outline-offset", value: m.focus.outlineOffset });
    rows.push({ label: "focus box-shadow", prop: "box-shadow", value: m.focus.boxShadow });
  }
  return rows;
}

const round1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------
// Reference sanity check (did the CDN CSS actually load?).
// ---------------------------------------------------------------------------
function refLooksStyled(theme, component, m) {
  if (!m || !m.found) return false;

  // Primary signal: a styled element usually has a non-trivial laid-out box.
  const hasBox = m.box.width > 1 && m.box.height > 1;

  // Secondary signal: the official CDN CSS applies distinctive declarations
  // (non-zero padding/border, or a brand-specific font-size). Some legacy
  // markups (Carbon <li>-based tabs) render the tab via a child whose box can
  // collapse to 0×0 even though the CSS is fully loaded — those still carry
  // real padding/border/typography and must NOT be flagged as "unstyled".
  const anyPx = (obj) =>
    Object.values(obj).some((v) => {
      const n = parsePx(typeof v === "string" ? v : v && v.width);
      return n != null && n > 0;
    });
  const hasPadding = anyPx(m.padding);
  const hasBorder = Object.values(m.border).some((b) => {
    const n = parsePx(b.width);
    return n != null && n > 0;
  });
  const fs = parsePx(m.typo.fontSize);
  const hasFont = fs != null && fs > 0;

  // Truly unstyled = no box AND no padding AND no border (CSS not applied).
  if (!hasBox && !hasPadding && !hasBorder && !hasFont) return false;

  // For sized controls we still expect a plausible box when one is laid out.
  if (hasBox) {
    if (["Button", "Input", "Select", "Textarea"].includes(component) && m.box.height < 16) {
      return hasPadding || hasBorder;
    }
  }
  return hasBox || hasPadding || hasBorder;
}

// ---------------------------------------------------------------------------
// Main measurement run.
// ---------------------------------------------------------------------------
async function run(opts) {
  const themes = opts.theme ? [opts.theme] : THEMES;
  const components = opts.component ? [opts.component] : COMPONENTS;

  // Validate
  for (const t of themes) if (!THEMES.includes(t)) throw new Error(`Unknown theme: ${t}`);
  for (const c of components) if (!COMPONENTS.includes(c)) throw new Error(`Unknown component: ${c}`);

  if (!existsSync(CHROME_PATH)) {
    throw new Error(`System Chrome not found at ${CHROME_PATH}. Install Google Chrome.`);
  }

  // --- Start server (static build preferred; dev fallback) ---
  let server = null;
  let devChild = null;
  const host = opts.host || DEFAULT_FIDELITY_HOST;
  const preferredPort = Number(
    opts.port != null ? opts.port : process.env.FIDELITY_PORT != null ? process.env.FIDELITY_PORT : DEFAULT_PORT
  );
  if (!Number.isFinite(preferredPort) || preferredPort < 0) {
    throw new Error(`Invalid --port value: ${preferredPort}`);
  }
  const port = Math.floor(preferredPort);
  const useStatic = existsSync(join(BUILD_DIR, "compare.html"));
  let compareUrl = `http://${host}:${port}/compare`;

  if (useStatic) {
    try {
      const started = await startStaticServer(host, port);
      server = started.server;
      compareUrl = `http://${host}:${started.usedPort}/compare`;
    } catch (err) {
      if (opts.keepServer || port === 0) throw err;
      const autoErr = ["EADDRINUSE", "EACCES"];
      if (autoErr.includes(err?.code)) {
        const started = await startStaticServer(host, 0);
        server = started.server;
        compareUrl = `http://${host}:${started.usedPort}/compare`;
      } else {
        throw err;
      }
    }
  } else {
    devChild = startDevServer(host, port);
  }

  const up = await waitForServer(compareUrl, { timeoutMs: useStatic ? 15000 : 90000 });
  if (!up) {
    cleanup(server, devChild, opts);
    throw new Error(`Docs server did not respond at ${compareUrl}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];
  const warnings = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 2200, deviceScaleFactor: 1 });
    await page.goto(compareUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for our scoped sections to exist.
    await page.waitForSelector(".cmp-scope--dsfr", { timeout: 20000 }).catch(() => {});

    for (const theme of themes) {
      const scope = `.cmp-scope--${theme}`;
      // Only the components that actually render for THIS theme, in page order.
      const themeComponents = componentsForTheme(theme, components);
      for (const component of themeComponents) {
        const entry = {
          theme,
          component,
          ourSelector: `${scope} ${OUR_SELECTOR[component]}`,
          refSelector: REF_SELECTOR[theme][component],
          ours: null,
          ref: null,
          refStyled: false,
          notes: [],
        };
        const selNote = REF_SELECTOR_NOTE[theme]?.[component];
        if (selNote) entry.notes.push(selNote);

        // --- Measure OUR side ---
        const ourSel = `${scope} ${OUR_SELECTOR[component]}`;
        entry.ours = await page.evaluate(measureInPage, ourSel).catch(() => ({ found: false }));
        if (!entry.ours.found) {
          entry.notes.push(`our element not found: \`${ourSel}\``);
          warnings.push(`[${theme}/${component}] our element not found`);
        } else if (entry.ours.box.width <= 1 || entry.ours.box.height <= 1) {
          entry.notes.push("our element has zero/near-zero box (not laid out)");
          warnings.push(`[${theme}/${component}] our element not laid out`);
        }

        // --- Locate the reference iframe for THIS row ---
        // Located by data-compare-* attributes (fixes --component indexing bug, C6).
        const frame = await locateRefFrame(page, theme, component);
        if (!frame) {
          entry.notes.push("reference iframe for this row not found");
          warnings.push(`[${theme}/${component}] ref iframe missing`);
        } else {
          // Ensure the CDN CSS is applied: poll until the ref element looks styled.
          const refSel = REF_SELECTOR[theme][component];
          let m = await measureRefWithRetry(frame, refSel, theme, component);
          entry.ref = m.measurement;
          entry.refStyled = m.styled;
          if (!m.measurement || !m.measurement.found) {
            entry.notes.push(`reference element not found: \`${refSel}\``);
            warnings.push(`[${theme}/${component}] ref element not found`);
          } else if (!m.styled) {
            entry.notes.push(
              "reference appears UNSTYLED — CDN CSS likely not loaded; diff suppressed to avoid false 'identical'"
            );
            warnings.push(`[${theme}/${component}] ref UNSTYLED (CDN not loaded)`);
          } else if (m.measurement.box.width <= 1 || m.measurement.box.height <= 1) {
            entry.notes.push(
              "reference element is styled (CDN loaded) but its own box collapsed to 0; box width/height excluded from the diff"
            );
          }
        }

        results.push(entry);
      }
    }
  } finally {
    await browser.close().catch(() => {});
    cleanup(server, devChild, opts);
  }

  return { results, warnings, useStatic, compareUrl };
}

/** Find the contentFrame of the ref iframe in the row tagged for (theme, component). */
async function locateRefFrame(page, theme, component) {
  const handle = await page.evaluateHandle(
    (t, c) => {
      const row = document.querySelector(
        `.cmp-row[data-compare-theme="${t}"][data-compare-component="${c}"]`
      );
      return row ? row.querySelector(".cmp-cell--ref iframe.cmp-frame") : null;
    },
    theme,
    component
  );
  const el = handle.asElement();
  if (!el) {
    await handle.dispose();
    return null;
  }
  const frame = await el.contentFrame();
  await handle.dispose();
  return frame;
}

/** Measure the reference element, retrying until the CDN CSS appears applied. */
async function measureRefWithRetry(frame, selector, theme, component, attempts = 25) {
  let measurement = { found: false };
  let styled = false;
  for (let i = 0; i < attempts; i++) {
    try {
      // wait for selector to exist on first pass
      await frame.waitForSelector(selector, { timeout: 1500 }).catch(() => {});
      measurement = await frame.evaluate(measureInPage, selector).catch(() => ({ found: false }));
    } catch (_) {
      measurement = { found: false };
    }
    if (measurement && measurement.found) {
      styled = refLooksStyled(theme, component, measurement);
      if (styled) break;
    }
    await sleep(500);
  }
  return { measurement, styled };
}

function cleanup(server, devChild, opts) {
  if (opts.keepServer) return;
  if (server) {
    try {
      server.close();
    } catch (_) {
      /* ignore */
    }
  }
  if (devChild && !devChild.killed) {
    try {
      devChild.kill("SIGTERM");
    } catch (_) {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------------------
// Scoring + report building.
// ---------------------------------------------------------------------------
function scoreEntry(entry) {
  // Suppress diff if either side is missing or ref unstyled.
  if (!entry.ours || !entry.ours.found || !entry.ref || !entry.ref.found || !entry.refStyled) {
    return { rows: [], counts: { eq: 0, close: 0, diff: 0 }, fidelity: null };
  }
  const ourRows = flatten(entry.ours);
  const refRows = flatten(entry.ref);
  const refByLabel = new Map(refRows.map((r) => [r.label, r]));
  const rows = [];
  const counts = { eq: 0, close: 0, diff: 0 };
  // If the reference element's own box collapsed (e.g. Carbon <li> tab link
  // with no intrinsic width in static markup) while it is otherwise styled,
  // box width/height are not meaningful — skip them rather than emit a false ≠.
  const refBoxCollapsed = entry.ref.box.width <= 1 || entry.ref.box.height <= 1;

  // A border side is "invisible" when its width is 0 OR its color is fully
  // transparent. If BOTH sides are invisible (e.g. ours = 1px transparent,
  // ref = 0px none — visually identical), their `style`/`color` declarations
  // are cosmetically irrelevant. Treat such rows as `=` so the gap count
  // reflects *visible* fidelity, not ghost declarations on a hidden border.
  const isInvisibleBorder = (b) => {
    const w = parsePx(b.width);
    if (w === 0) return true;
    return normColor(b.color).endsWith("/a0"); // fully transparent
  };
  const sideHidden = {};
  for (const side of ["top", "right", "bottom", "left"]) {
    sideHidden[side] = isInvisibleBorder(entry.ours.border[side]) && isInvisibleBorder(entry.ref.border[side]);
  }
  const borderRow = /^border-(top|right|bottom|left) (style|color)$/;

  for (const o of ourRows) {
    if (refBoxCollapsed && (o.label === "box width" || o.label === "box height")) continue;
    const r = refByLabel.get(o.label);
    if (!r) continue;
    const bm = o.label.match(borderRow);
    if (bm && sideHidden[bm[1]]) {
      counts.eq++;
      rows.push({
        label: o.label,
        prop: o.prop,
        ours: o.value,
        ref: r.value,
        status: "=",
        delta: "bord 0px (invisible)",
      });
      continue;
    }
    const d = diffValue(o.prop, o.value, r.value);
    if (d.status === "=") counts.eq++;
    else if (d.status === "~") counts.close++;
    else counts.diff++;
    rows.push({ label: o.label, prop: o.prop, ours: o.value, ref: r.value, status: d.status, delta: d.delta });
  }
  const total = counts.eq + counts.close + counts.diff;
  const fidelity = total ? Math.round(((counts.eq + counts.close) / total) * 1000) / 10 : null;
  return { rows, counts, fidelity };
}

function buildReport({ results, warnings, useStatic, compareUrl }, opts) {
  const date = opts.date || "<date>";
  const scored = results.map((e) => ({ entry: e, ...scoreEntry(e) }));

  // group by theme
  const byTheme = new Map();
  for (const s of scored) {
    if (!byTheme.has(s.entry.theme)) byTheme.set(s.entry.theme, []);
    byTheme.get(s.entry.theme).push(s);
  }

  let globalEq = 0,
    globalClose = 0,
    globalDiff = 0;
  const netGaps = [];

  const lines = [];
  lines.push("# Rapport de fidélité — pixel-perfect par bord");
  lines.push("");
  lines.push("Comparaison **bord par bord** de NOS composants mappés vs les **vrais composants officiels** DSFR / Carbon.");
  lines.push("Toutes les valeurs proviennent des **styles calculés réels** (computed styles) ; aucune n'est inventée.");
  lines.push("");
  lines.push("| Champ | Valeur |");
  lines.push("|---|---|");
  lines.push(`| Date | ${date} |`);
  lines.push(`| Navigateur | Google Chrome système (\`${CHROME_PATH}\`) via puppeteer-core, headless |`);
  lines.push(`| URL mesurée | ${compareUrl} (${useStatic ? "build statique servi" : "serveur dev"}) |`);
  lines.push(`| Tolérance longueur | ±${TOL.lengthPx}px → statut \`~\` |`);
  lines.push(`| Tolérance couleur | distance RGB ≤ ${TOL.colorDist} → statut \`~\` |`);
  lines.push(`| Statuts | \`=\` identique · \`~\` proche (tolérance) · \`≠\` écart net |`);
  lines.push(`| Diff | NOS valeurs vs RÉFÉRENCE officielle ; fidélité = % de \`=\` + \`~\` |`);
  lines.push("");

  if (warnings.length) {
    lines.push("## ⚠ Avertissements (véracité du rendu)");
    lines.push("");
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  for (const [theme, group] of byTheme) {
    lines.push(`## Thème : ${theme}`);
    lines.push("");
    for (const s of group) {
      const e = s.entry;
      lines.push(`### ${e.component}`);
      lines.push("");
      lines.push(`- Notre sélecteur : \`${e.ourSelector}\``);
      lines.push(`- Référence : iframe \`.cmp-cell--ref\` → \`${e.refSelector}\``);
      if (e.notes.length) {
        for (const n of e.notes) lines.push(`- ⚠ ${n}`);
      }
      if (!s.rows.length) {
        lines.push("");
        lines.push("> Diff supprimé (élément manquant ou référence non stylée — voir note ci-dessus).");
        lines.push("");
        continue;
      }
      lines.push("");
      lines.push("| Propriété / Bord | Nous | Référence officielle | Δ / statut |");
      lines.push("|---|---|---|---|");
      for (const r of s.rows) {
        const badge =
          r.status === "="
            ? `=${r.delta ? ` (${r.delta})` : ""}`
            : r.status === "~"
              ? `~ ${r.delta}`.trim()
              : `≠ ${r.delta}`.trim();
        lines.push(`| ${r.label} | ${md(r.ours)} | ${md(r.ref)} | ${md(badge)} |`);
        if (r.status === "≠") {
          netGaps.push(`${theme}/${e.component}: ${r.label} (${r.delta})`);
        }
      }
      const total = s.counts.eq + s.counts.close + s.counts.diff;
      lines.push("");
      lines.push(
        `**Fidélité ${e.component} (${theme}) : ${s.fidelity}%** — ` +
          `${s.counts.eq} \`=\`, ${s.counts.close} \`~\`, ${s.counts.diff} \`≠\` sur ${total} propriétés.`
      );
      lines.push("");
      globalEq += s.counts.eq;
      globalClose += s.counts.close;
      globalDiff += s.counts.diff;
    }
  }

  const gTotal = globalEq + globalClose + globalDiff;
  const gFid = gTotal ? Math.round(((globalEq + globalClose) / gTotal) * 1000) / 10 : null;

  // Per-component fidelity recap (G5): one row per measured (theme, component).
  lines.push("## Récap de fidélité par composant");
  lines.push("");
  lines.push(`Couverture mesurée : **${scored.length} paires** (notre composant mappé vs vrai composant officiel).`);
  lines.push("");
  lines.push("| Thème | Composant / variant | Fidélité | `=` | `~` | `≠` | Réf stylée ? |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const s of scored) {
    const e = s.entry;
    const fid = s.fidelity == null ? "—" : `${s.fidelity}%`;
    const styled = e.ours && e.ours.found && e.ref && e.ref.found && e.refStyled ? "oui" : "non (diff supprimé)";
    lines.push(
      `| ${e.theme} | ${e.component} | ${fid} | ${s.counts.eq} | ${s.counts.close} | ${s.counts.diff} | ${styled} |`
    );
  }
  lines.push("");

  lines.push("## Récapitulatif global");
  lines.push("");
  lines.push(`- **Fidélité globale : ${gFid}%** (${globalEq} \`=\`, ${globalClose} \`~\`, ${globalDiff} \`≠\` sur ${gTotal} propriétés mesurées).`);
  lines.push(`- **Couverture : ${scored.length} paires composant×thème mesurées.**`);
  lines.push(`- **Écarts nets restants : ${netGaps.length}**`);
  if (netGaps.length) {
    lines.push("");
    for (const g of netGaps) lines.push(`  - ${g}`);
  }
  lines.push("");

  return { markdown: lines.join("\n") + "\n", scored, global: { eq: globalEq, close: globalClose, diff: globalDiff, fidelity: gFid }, netGaps };
}

/** Escape pipe chars for markdown table cells. */
function md(v) {
  return String(v ?? "").replace(/\|/g, "\\|");
}

function buildJson({ results }, report, compareUrl, opts) {
  return {
    meta: {
      date: opts.date || null,
      browser: "Google Chrome (system)",
      chromePath: CHROME_PATH,
      url: compareUrl,
      tolerances: TOL,
      generatedBy: "tools/compare/fidelity.mjs",
    },
    global: report.global,
    netGaps: report.netGaps,
    components: report.scored.map((s) => ({
      theme: s.entry.theme,
      component: s.entry.component,
      ourSelector: s.entry.ourSelector,
      refSelector: s.entry.refSelector,
      refStyled: s.entry.refStyled,
      notes: s.entry.notes,
      fidelity: s.fidelity,
      counts: s.counts,
      rows: s.rows,
      raw: { ours: s.entry.ours, ref: s.entry.ref },
    })),
  };
}

// ---------------------------------------------------------------------------
// Entry point.
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const raw = await run(opts);
  const report = buildReport(raw, opts);
  const json = buildJson(raw, report, raw.compareUrl, opts);

  // Build the gap list from the scored rows (≠ and ~ are gaps; = is parity).
  // Les thèmes publics (dsfr, carbon) → compare-gaps.json (versionné).
  // Les thèmes privés locaux (ex. airbus) → compare-gaps.local.json (gitignorés).
  const REGISTRY_PATH = join(
    REPO_ROOT, "apps", "docs", "src", "lib", "compare", "compare-gaps.json"
  );
  const REGISTRY_LOCAL_PATH = join(
    REPO_ROOT, "apps", "docs", "src", "lib", "compare", "compare-gaps.local.json"
  );
  const generatedAt = new Date().toISOString();
  const oracleGaps = [];       // thèmes publics seulement
  const oracleGapsLocal = [];  // thèmes privés locaux seulement
  for (const c of json.components) {
    const m = COMPARE_MANIFEST[c.theme]?.[c.component];
    if (!m) continue; // safety: only manifested pairs
    for (const r of c.rows) {
      if (r.status === "=") continue;
      const gap = {
        theme: c.theme,
        component: m.component,
        scenario: m.scenario,
        state: m.state,
        property: r.prop,
        ours: r.ours,
        ref: r.ref,
        delta: r.delta,
      };
      if (PUBLIC_THEMES.has(c.theme)) {
        oracleGaps.push(gap);
      } else {
        oracleGapsLocal.push(gap);
      }
    }
  }
  let existing = null;
  try {
    existing = JSON.parse(await readFile(REGISTRY_PATH, "utf8"));
  } catch {
    existing = null; // first seed
  }
  let existingLocal = null;
  try {
    existingLocal = JSON.parse(await readFile(REGISTRY_LOCAL_PATH, "utf8"));
  } catch {
    existingLocal = null; // first seed
  }
  // Mi4 — stamp REAL versions (C8 reproducibility): anatomy from the tokens
  // package, DS/theme pins from the docs deps (same source as the bench header).
  let deps = {};
  try {
    const docsPkg = JSON.parse(
      await readFile(join(REPO_ROOT, "apps", "docs", "package.json"), "utf8")
    );
    deps = docsPkg.dependencies ?? {};
  } catch {
    deps = {};
  }
  // Stamp pour les thèmes publics uniquement (hash du manifest public).
  const publicStamp = {
    manifestHash: manifestHash(COMPARE_MANIFEST_PUBLIC),
    generatedAt,
    anatomyVersion: ANATOMY_VERSION,
    dsVersion: deps["@sentropic/design-system-themes"] ?? null,
    themeVersion: {
      dsfr: deps["@sentropic/design-system-theme-dsfr"] ?? null,
      carbon: deps["@sentropic/design-system-theme-carbon"] ?? null,
    },
  };
  // Stamp pour les thèmes locaux (hash du manifest complet).
  const localStamp = {
    manifestHash: manifestHash(COMPARE_MANIFEST),
    generatedAt,
    anatomyVersion: ANATOMY_VERSION,
    dsVersion: deps["@sentropic/design-system-themes"] ?? null,
    themeVersion: {
      dsfr: deps["@sentropic/design-system-theme-dsfr"] ?? null,
      carbon: deps["@sentropic/design-system-theme-carbon"] ?? null,
    },
  };

  const registry = mergeRegistry(existing, oracleGaps, publicStamp);
  const registryLocal = mergeRegistry(existingLocal, oracleGapsLocal, localStamp);

  const mdPath = join(REPO_ROOT, "docs", "compare-fidelity-report.md");
  const jsonPath = join(REPO_ROOT, "tools", "compare", "last-report.json");
  await mkdir(dirname(mdPath), { recursive: true });
  await mkdir(dirname(jsonPath), { recursive: true });
  await writeFile(mdPath, report.markdown, "utf8");
  await writeFile(jsonPath, JSON.stringify(json, null, 2) + "\n", "utf8");
  await mkdir(dirname(REGISTRY_PATH), { recursive: true });
  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n", "utf8");
  // Écrit les gaps locaux seulement s'il y en a (ou si le fichier existait déjà).
  if (oracleGapsLocal.length > 0 || existingLocal !== null) {
    await mkdir(dirname(REGISTRY_LOCAL_PATH), { recursive: true });
    await writeFile(REGISTRY_LOCAL_PATH, JSON.stringify(registryLocal, null, 2) + "\n", "utf8");
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify(json, null, 2) + "\n");
  } else {
    console.log(`Fidelity report written:`);
    console.log(`  - ${mdPath}`);
    console.log(`  - ${jsonPath}`);
    console.log(`  - ${REGISTRY_PATH} (${Object.keys(registry.entries).length} entrées, thèmes publics)`);
    if (oracleGapsLocal.length > 0 || existingLocal !== null) {
      console.log(`  - ${REGISTRY_LOCAL_PATH} (${Object.keys(registryLocal.entries).length} entrées, thèmes locaux — gitignorés)`);
    }
    console.log(
      `Global fidelity: ${report.global.fidelity}% ` +
        `(${report.global.eq} =, ${report.global.close} ~, ${report.global.diff} ≠). ` +
        `Net gaps: ${report.netGaps.length}.`
    );
    if (raw.warnings.length) {
      console.log(`Warnings: ${raw.warnings.length} (see report header).`);
    }
  }

  if (opts.failUnder != null && report.global.fidelity != null && report.global.fidelity < opts.failUnder) {
    console.error(`Global fidelity ${report.global.fidelity}% < threshold ${opts.failUnder}%`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("fidelity.mjs failed:", err && err.stack ? err.stack : err);
  process.exit(1);
});
