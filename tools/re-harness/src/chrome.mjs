// Headless-Chrome driver. Preference order (SPEC_RE_XYFLOW_PARITY.md §6,
// SPEC_RE_JOINTJS_PARITY.md §5.2): playwright-core when present in the
// repository lockfile, then puppeteer-core, then the raw CDP pattern of
// packages/graph/tests/golden/cdp-harness.mjs. No network, no install:
// modules are resolved from the repository root node_modules by the caller.
import { spawn } from "node:child_process";
import fs from "node:fs";

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/snap/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

export function findChrome() {
  for (const c of CHROME_CANDIDATES) if (fs.existsSync(c)) return c;
  return null;
}

// Launch via playwright-core (root dependency). Returns { browser, page, kind }.
export async function launchBrowser({ playwrightCore, puppeteerCore } = {}) {
  const executablePath = findChrome();
  if (playwrightCore?.chromium) {
    const launch = () => playwrightCore.chromium.launch({
      executablePath: executablePath || undefined,
      headless: true,
      args: ["--no-sandbox", "--force-device-scale-factor=1", "--disable-lcd-text", "--hide-scrollbars"],
    });
    let browser;
    try {
      browser = await launch();
    } catch (err) {
      // Sandboxed TMPDIRs can refuse Chromium's profile SingletonLock. Retry
      // once with the profile rooted under /tmp, which the sandbox allows.
      if (!String(err?.message || err).includes("ProcessSingleton")) throw err;
      process.env.TMPDIR = "/tmp";
      browser = await launch();
    }
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
    return { kind: "playwright-core", browser, page, executablePath };
  }
  if (puppeteerCore?.launch) {
    const browser = await puppeteerCore.launch({
      executablePath: executablePath || undefined,
      headless: true,
      args: ["--no-sandbox", "--force-device-scale-factor=1", "--disable-lcd-text", "--hide-scrollbars"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
    return { kind: "puppeteer-core", browser, page, executablePath };
  }
  throw new Error("unknown: neither playwright-core nor puppeteer-core available (no network install attempted)");
}

// Real-oracle bootstrap: fixed seed RNG and reduced motion, but NATIVE
// clocks and requestAnimationFrame — the real libraries (bpmn-js, xyflow,
// JointJS) schedule real work on them, and parity comes from two identical
// independent runs plus explicit stabilisation waits in the adapters.
export const DETERMINISM_INIT_REAL = `
(() => {
  let seed = 42;
  Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  try { Object.defineProperty(window, 'matchMedia', { value: (q) => ({ matches: q.includes('prefers-reduced-motion'), media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }) }); } catch (e) {}
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{animation-duration:0s !important;transition-duration:0s !important;}';
  (document.head || document.documentElement).appendChild(style);
})();
`;

// NOTE (C9): a stepped-clock variant of this bootstrap (harness-stepped
// performance.now/Date.now/rAF via __harnessStep) was removed: it was dead
// code — never injected — and freezing the clock breaks the real
// libraries, which schedule real work on rAF/timers. Determinism comes
// from two identical independent runs plus explicit settle barriers
// (waitFor / double-rAF) in the adapters, not from a fake clock.
