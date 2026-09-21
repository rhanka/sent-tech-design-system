// Preuve exécutable : le build statique de la doc fonctionne sous une CSP stricte.
//
// Usage : node scripts/csp-check.mjs [buildDir]            (défaut : build)
//         CHROMIUM_PATH=/chemin/vers/chrome  pour forcer le navigateur.
//
// NE POSE AUCUNE CSP EN PRODUCTION (décision owner, voir svelte.config.js). Le
// script sert le build localement AVEC l'en-tête `Content-Security-Policy`
// documenté (DOCUMENTED_CSP : `script-src 'self'`, sans `unsafe-eval` ni
// `unsafe-inline` pour les scripts) et échoue si :
//   1. un fichier HTML du build contient un script inline exécutable, un
//      gestionnaire d'événement inline (on…=) ou une URL `javascript:` ;
//   2. une page clé, chargée dans Chromium, déclenche une violation CSP
//      (`securitypolicyviolation` ou message console « Content Security
//      Policy »), une `pageerror`, ou ne démarre pas SvelteKit ;
//   3. une île Angular attendue n'est pas montée, ou le compilateur JIT
//      d'Angular (@angular/compiler) est chargé (réseau ou runtime) ;
//   4. le script pré-hydratation ne s'exécute pas sous la CSP, ou amorce un
//      thème privé sans mode révélé.

import { createServer } from "node:http";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";
import { DOCUMENTED_CSP } from "../svelte.config.js";

const buildDir = resolve(process.argv[2] ?? "build");

// Pages clés. `angular: true` : au moins une île Angular doit être montée.
const PAGES = [
  { path: "/" },
  { path: "/components/button?framework=angular", angular: true },
  { path: "/components/panel-section?framework=angular", angular: true },
  { path: "/components/modal?framework=angular", angular: true },
  { path: "/views/analytics-overview?framework=angular", angular: true },
  { path: "/compare" }
];

// Script pré-hydratation sous CSP : il doit poser ses attributs et amorcer
// l'URL (thème public), et ne rien faire d'un thème privé sans mode révélé.
const BOOT_CASES = [
  {
    label: "pré-hydratation : thème public + mode sombre + Angular",
    path: "/components/button",
    storage: { "st-docs-color-mode": "dark", "st-docs-theme": "dsfr", "docs-framework": "angular" },
    expect: { mode: "dark", theme: "dsfr", search: ["theme=dsfr", "framework=angular"] },
    angular: true
  },
  {
    label: "pré-hydratation : thème privé sans mode révélé",
    path: "/components/button",
    // Le layout pose ensuite le thème par défaut : seul compte que la marque
    // privée n'apparaisse jamais, ni sur <html> ni dans l'URL.
    storage: { "st-docs-theme": "cossette" },
    expect: { search: [], neverTheme: "cossette" }
  }
];

// Seul gestionnaire inline toléré par le scan statique, et SIGNALÉ à chaque
// passage : Svelte 5 l'écrit au SSR sur les <img> qui écoutent load/error, pour
// rejouer après l'hydratation un événement survenu avant. Sous `script-src
// 'self'` il est bloqué (violation script-src-attr, sans autre effet que la
// perte de ce rejeu). Hors du périmètre livré : décision owner (autoriser son
// hash via 'unsafe-hashes', ou retirer load/error des <img> concernés).
const KNOWN_SVELTE_REPLAY_HANDLER = /^on(?:load|error)="this\.__e=event"$/;

// Marqueur propre à @angular/compiler (DomElementSchemaRegistry) : absent de
// @angular/core, présent dans tout bundle qui embarque le compilateur.
const COMPILER_MARKER = "[Element]|textContent";

const CHROME_CANDIDATES = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium"
];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

// 1. Scan statique de TOUTES les pages du build.
function staticScan() {
  const problems = [];
  const known = new Map();
  const executable = new Set(["", "text/javascript", "application/javascript", "module"]);
  const files = htmlFiles(buildDir);
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const rel = file.slice(buildDir.length);
    for (const [, attributes, source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const type = (/\btype\s*=\s*["']?([^"'\s>]*)/i.exec(attributes)?.[1] ?? "").toLowerCase();
      if (!/\bsrc\s*=/i.test(attributes) && executable.has(type) && source.trim() !== "") {
        problems.push(`${rel} : script inline exécutable`);
      }
    }
    for (const [tag] of html.matchAll(/<[a-zA-Z][^<>]*>/g)) {
      for (const [handler] of tag.matchAll(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g)) {
        const attribute = handler.trim();
        if (KNOWN_SVELTE_REPLAY_HANDLER.test(attribute)) {
          known.set(rel, (known.get(rel) ?? 0) + 1);
        } else {
          problems.push(`${rel} : gestionnaire inline ${attribute.slice(0, 80)}`);
        }
      }
    }
    if (/\b(?:href|src|action)\s*=\s*["']?\s*javascript:/i.test(html)) {
      problems.push(`${rel} : URL javascript:`);
    }
  }
  return { files: files.length, problems, known };
}

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const base = join(buildDir, rel);
    const headers = { "content-security-policy": DOCUMENTED_CSP };
    for (const candidate of [base, `${base}.html`, join(base, "index.html")]) {
      if (isFile(candidate)) {
        res.writeHead(200, { ...headers, "content-type": TYPES[extname(candidate)] ?? "application/octet-stream" });
        res.end(readFileSync(candidate));
        return;
      }
    }
    res.writeHead(404, { ...headers, "content-type": TYPES[".html"] });
    res.end(readFileSync(join(buildDir, "404.html")));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done(server)));
}

async function launchBrowser() {
  const options = { headless: true, ignoreDefaultArgs: ["--hide-scrollbars"] };
  const forced = process.env.CHROMIUM_PATH;
  if (forced) return chromium.launch({ ...options, executablePath: forced });
  const system = CHROME_CANDIDATES.find(isFile);
  if (system) return chromium.launch({ ...options, executablePath: system });
  return chromium.launch(options);
}

// Posé avant tout script de la page (hors CSP) : collecte des violations et de
// toutes les valeurs prises par data-st-theme sur <html>.
function instrument() {
  window.__cspViolations = [];
  window.addEventListener(
    "securitypolicyviolation",
    (event) =>
      window.__cspViolations.push(
        `${event.violatedDirective} ${event.blockedURI || "inline"} ${event.sourceFile || ""}:${event.lineNumber || ""} ${event.sample || ""}`.trim()
      ),
    true
  );
  // <html> peut ne pas exister encore : on observe le document entier.
  window.__themeValues = [];
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.target === document.documentElement) {
        window.__themeValues.push(record.target.getAttribute("data-st-theme"));
      }
    }
  }).observe(document, { attributes: true, subtree: true, attributeFilter: ["data-st-theme"] });
}

async function checkPage(browser, origin, { label, path, angular, storage, expect: expected }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: storage
      ? { cookies: [], origins: [{ origin, localStorage: Object.entries(storage).map(([name, value]) => ({ name, value })) }] }
      : undefined
  });
  const page = await context.newPage();
  await page.addInitScript(instrument);

  const failures = [];
  const scripts = [];
  page.on("pageerror", (error) => failures.push(`pageerror : ${error.message}`));
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to (execute|load|evaluate|apply)/i.test(message.text())) {
      failures.push(`console CSP : ${message.text().slice(0, 240)}`);
    }
  });
  page.on("response", (response) => {
    if (/\.m?js(\?|$)/.test(response.url())) scripts.push(response);
  });

  await page.goto(origin + path, { waitUntil: "networkidle" });

  if (angular) {
    const mounted = await page
      .waitForFunction(
        () =>
          [...document.querySelectorAll(".fp__island, .tex__render")].some((host) =>
            host.querySelector("[ng-version]")
          ),
        null,
        { timeout: 30_000 }
      )
      .then(() => true)
      .catch(() => false);
    if (!mounted) failures.push("île Angular non montée");
  }
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => ({
    violations: window.__cspViolations,
    themeValues: window.__themeValues,
    booted: Object.keys(window).some((key) => key.startsWith("__sveltekit_")),
    compilerFacade: Boolean(globalThis.ng && globalThis.ng["ɵcompilerFacade"]),
    unavailable: document.querySelectorAll(".angular-island-unavailable").length,
    mode: document.documentElement.getAttribute("data-color-mode"),
    theme: document.documentElement.getAttribute("data-st-theme"),
    search: location.search
  }));

  for (const violation of state.violations) failures.push(`violation CSP : ${violation}`);
  if (!state.booted) failures.push("SvelteKit n'a pas démarré (amorce d'hydratation non exécutée)");
  if (state.compilerFacade) failures.push("@angular/compiler chargé (ng.ɵcompilerFacade publié)");
  if (state.unavailable) failures.push(`${state.unavailable} composant(s) Angular manquant(s)`);

  let jsBytes = 0;
  for (const response of scripts) {
    const body = await response.body().catch(() => Buffer.alloc(0));
    jsBytes += body.length;
    if (body.includes(COMPILER_MARKER)) failures.push(`@angular/compiler téléchargé : ${new URL(response.url()).pathname}`);
  }

  if (expected) {
    if ("mode" in expected && state.mode !== expected.mode) {
      failures.push(`data-color-mode=${state.mode}, attendu ${expected.mode}`);
    }
    if ("theme" in expected && state.theme !== expected.theme) {
      failures.push(`data-st-theme=${state.theme}, attendu ${expected.theme}`);
    }
    for (const part of expected.search) {
      if (!state.search.includes(part)) failures.push(`URL ${state.search} sans ${part}`);
    }
    if (expected.neverTheme) {
      if (state.themeValues.includes(expected.neverTheme)) failures.push(`thème privé posé sur <html> : ${expected.neverTheme}`);
      if (state.search.includes(expected.neverTheme)) failures.push(`thème privé dans l'URL : ${state.search}`);
    }
  }

  await context.close();
  return { label: label ?? path, failures, scripts: scripts.length, jsBytes };
}

const scan = staticScan();
console.log(`[csp-check] scan statique : ${scan.files} page(s) HTML, ${scan.problems.length} problème(s)`);
for (const problem of scan.problems.slice(0, 20)) console.log(`  ✗ ${problem}`);
for (const [page, count] of scan.known) {
  console.log(`  ! ${page} : ${count} gestionnaire(s) Svelte this.__e=event (écart connu, non bloquant)`);
}

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
console.log(`[csp-check] ${origin} avec Content-Security-Policy: ${DOCUMENTED_CSP}`);

let failed = scan.problems.length > 0;
const browser = await launchBrowser();
try {
  for (const entry of [...PAGES, ...BOOT_CASES]) {
    const result = await checkPage(browser, origin, entry);
    const kb = (result.jsBytes / 1024).toFixed(0);
    console.log(`${result.failures.length ? "✗" : "✓"} ${result.label}  (${result.scripts} scripts, ${kb} kB JS)`);
    for (const failure of result.failures) console.log(`    ${failure}`);
    if (result.failures.length) failed = true;
  }
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  console.error("[csp-check] ÉCHEC : le build n'est pas compatible avec la CSP documentée.");
  process.exit(1);
}
console.log("[csp-check] OK : aucune violation CSP, aucune erreur, îles Angular montées sans compilateur.");
