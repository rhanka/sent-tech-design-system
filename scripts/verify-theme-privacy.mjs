// Verifies, IN A BROWSER ON THE BUILT SITE, that a private theme is absent from
// the theme picker until Ctrl+Shift+X is pressed, and present afterwards.
//
// WHY THIS IS NOT A GREP. Privacy here is enforced at RENDER time by the
// `PUBLIC_THEME_IDS` whitelist in `apps/docs/src/lib/theme-catalog.ts`, not by
// keeping a theme out of the bundle. Every theme ships in `apps/docs/build/_app`,
// public or not. So grepping the build for a theme id is doubly sterile: finding
// it proves no leak, and not finding it would prove no protection. The cheap
// check cannot confirm or refute the property, and it returns its verdict with
// the same confidence either way — hence a real browser.
//
// This is NOT a CI gate: it needs a Chromium binary, and the technical gate
// (`skills check apps/docs/build --tech`) only exercises the default theme, so it
// never sees a brand theme at all. It exists to be findable and quotable when a
// lot claims its themes are hidden.
//
// Usage:
//   node scripts/serve-built-docs.mjs apps/docs/build 4173 &
//   node scripts/verify-theme-privacy.mjs http://localhost:4173/ "Carrefour" "Eiffage"
//
// Exits 0 and prints PRIVACY_CHECK_PASS only when every named label is absent
// before the shortcut, present after it, and the revealed picker is larger than
// the public one.

import { mkdtempSync, rmSync } from "node:fs";

const repoRoot = process.env.PW_ROOT ?? new URL("..", import.meta.url).pathname;
const { chromium } = await import(
  new URL("node_modules/playwright-core/index.mjs", `file://${repoRoot}/`).href
);

const url = process.argv[2] ?? "http://localhost:4173/";
const targets = process.argv.slice(3);
if (targets.length === 0) {
  console.error("pass the theme LABELS (not ids) that must be hidden without the shortcut");
  process.exit(2);
}

// The reveal flag SURVIVES a reload, so a reused profile can start already
// revealed — in which case Ctrl+Shift+X turns it OFF and the two passes are
// inverted. Measured once: a stale profile reported all four themes as leaked
// when they were not. So the default is a throwaway profile, created here and
// removed on exit; PW_PROFILE overrides it only for deliberate debugging.
//
// WHY $HOME AND NOT os.tmpdir(). A snap Chromium cannot create its profile lock
// under any path with a HIDDEN component. Measured on this machine: a plain
// directory under $HOME works, /tmp works, a dot-directory under $HOME fails,
// and a directory under $TMPDIR fails — because $TMPDIR here is
// /home/<user>/.cache-tmp, which is hidden. So os.tmpdir(), the obvious choice,
// is unusable, and its failure is misleading: Chromium reports "the profile is
// already in use" for a directory created one millisecond earlier. $HOME is
// chosen because it is the one base that is reliably non-hidden.
const ownProfile = !process.env.PW_PROFILE;
const profile = process.env.PW_PROFILE ?? mkdtempSync(`${process.env.HOME}/chromium-theme-privacy-`);
const executablePath = process.env.PW_CHROMIUM ?? "/snap/bin/chromium";

const browser = await chromium.launchPersistentContext(profile, {
  executablePath,
  args: ["--no-sandbox"],
  headless: true
});
if (!ownProfile) {
  console.error(
    "note: PW_PROFILE is set, so this run reuses a persistent profile. That is the " +
      "path by which a revealed starting state comes back; the PRIVACY_CHECK_INVALID " +
      "exit below catches it, but a clean verification should omit PW_PROFILE."
  );
}

// A throwaway profile must go on EVERY path. Cleaning it only after a successful run
// leaks one directory per crash — measured: three orphans under $HOME after three
// failures. process.on("exit") covers the thrown, the rejected and the returned alike.
if (ownProfile) {
  process.on("exit", () => {
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  });
}

const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });

// An unstable read is neither a pass nor a failure: it names the instrument.
process.on("unhandledRejection", (e) => {
  console.log(`PRIVACY_CHECK_INVALID: ${e instanceof Error ? e.message : e}`);
  process.exit(2);
});

const openPicker = async () => {
  await page.click(".docs-theme-trigger");
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
};
const closePicker = async () => {
  await page.keyboard.press("Escape");
  await page.waitForSelector('[role="dialog"]', { state: "detached", timeout: 5000 });
};
const rawLabels = () =>
  page.$$eval('[role="dialog"] .st-menu__itemLabel', (nodes) =>
    nodes.map((n) => n.textContent.trim())
  );

// The dialog exists before its list is finished, so waitForSelector is not enough:
// reading straight after it returns a PARTIAL list. Measured once — the same code on
// the same site read 131 labels and then 139, so the check had no verdict, it had a
// coin. A short read of the FIRST pass is the dangerous direction, because a theme
// that has not rendered yet looks hidden and a leak would pass.
//
// So read only a STABLE list: two consecutive reads agreeing on a non-zero count.
// If it never stabilises the run has no verdict and says so, rather than guessing.
const STABLE_TRIES = 40;
const STABLE_INTERVAL_MS = 100;
async function pickerLabels() {
  let previous = null;
  for (let i = 0; i < STABLE_TRIES; i++) {
    const current = await rawLabels();
    if (previous !== null && current.length === previous.length && current.length > 0) {
      return current;
    }
    previous = current;
    await page.waitForTimeout(STABLE_INTERVAL_MS);
  }
  throw new Error(
    `the picker list never stabilised over ${STABLE_TRIES * STABLE_INTERVAL_MS}ms; ` +
      "no reading of it is evidence about privacy"
  );
}

// Pass 1 — no shortcut. The named themes must be absent.
await openPicker();
const before = await pickerLabels();
await closePicker();

// Pass 2 — Ctrl+Shift+X, then the same picker. They must be present.
await page.evaluate(() => {
  window.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "X",
      code: "KeyX",
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    })
  );
});
await page.waitForTimeout(400);
await openPicker();
const after = await pickerLabels();
await closePicker();

const report = {
  url,
  publicCount: before.length,
  publicLabels: before,
  revealedCount: after.length,
  leakedWithoutShortcut: targets.filter((t) => before.includes(t)),
  hiddenWithoutShortcut: targets.filter((t) => !before.includes(t)),
  revealedWithShortcut: targets.filter((t) => after.includes(t)),
  missingAfterReveal: targets.filter((t) => !after.includes(t)),
  pageErrors
};
console.log(JSON.stringify(report, null, 2));

await browser.close();

// An inverted pair means the browser started REVEALED, so pass 1 measured the
// revealed picker and pass 2 the public one. The run says nothing about privacy
// and must not be read as a leak: the themes listed under
// leakedWithoutShortcut are an artefact of the starting state, not a finding.
if (report.revealedCount <= report.publicCount) {
  console.log(
    "PRIVACY_CHECK_INVALID: the browser started in revealed state " +
      `(${report.publicCount} labels before the shortcut, ${report.revealedCount} after). ` +
      "Nothing here is evidence about privacy. Re-run with a fresh profile."
  );
  process.exit(2);
}

const ok =
  report.leakedWithoutShortcut.length === 0 && report.missingAfterReveal.length === 0;
console.log(ok ? "PRIVACY_CHECK_PASS" : "PRIVACY_CHECK_FAIL");
process.exit(ok ? 0 : 1);
