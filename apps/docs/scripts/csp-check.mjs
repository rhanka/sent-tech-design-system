// Preuve exécutable : le build statique de la doc fonctionne sous une CSP stricte.
//
// Usage : node scripts/csp-check.mjs [buildDir]            (défaut : build)
//         CHROMIUM_PATH=/chemin/vers/chrome  pour forcer le navigateur.
//
// NE POSE AUCUNE CSP EN PRODUCTION (décision owner, voir svelte.config.js). Le
// script sert le build localement AVEC l'en-tête `Content-Security-Policy`
// documenté (DOCUMENTED_CSP : `script-src 'self'`, sans `unsafe-eval` ni
// `unsafe-inline` pour les scripts) et échoue si :
//   1. scan statique de TOUTES les pages : script inline soumis à script-src
//      (lu par le même parseur que l'externalisation), attributs de <script>
//      illisibles, gestionnaire `on…=` inline, URL `javascript:` ; script
//      pré-hydratation absent de la tête de <head>, non synchrone, placé après
//      une feuille de style, ou dont le nom n'est pas le hash de son contenu ;
//   2. une page clé, chargée dans Chromium, déclenche une violation CSP
//      (`securitypolicyviolation` ou message console), une `pageerror`, un
//      script en erreur HTTP, ou ne démarre pas SvelteKit (`kit.start`) ;
//   3. une île Angular attendue n'est pas montée, ou le compilateur JIT
//      d'Angular (@angular/compiler) est chargé (réseau ou runtime) ;
//   4. le script pré-hydratation n'a pas posé ses attributs et amorcé l'URL
//      à l'insertion de <body>, ou un thème privé paraît sans mode révélé,
//      même un instant (sur <html> ou dans l'URL).
// Les écarts CONNUS de la politique (KNOWN_CSP_DEVIATIONS, svelte.config.js)
// sont signalés par leur chaîne exacte, sans faire échouer.

import { createServer } from "node:http";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";
import config, { DOCUMENTED_CSP, KNOWN_CSP_DEVIATIONS } from "../svelte.config.js";
import { contentName } from "./externalize-inline-scripts.mjs";
import { parseScripts } from "./html-scripts.mjs";

const buildDir = resolve(process.argv[2] ?? "build");
const base = config.kit?.paths?.base ?? "";
const inlineDir = `${base}/${config.kit?.appDir ?? "_app"}/immutable/inline/`;

// Pages clés. `angular: true` : au moins une île Angular doit être montée.
const PAGES = [
  { path: "/" },
  { path: "/components/button?framework=angular", angular: true },
  { path: "/components/panel-section?framework=angular", angular: true },
  { path: "/components/modal?framework=angular", angular: true },
  { path: "/components/embed" },
  { path: "/views/analytics-overview?framework=angular", angular: true },
  { path: "/compare" }
];

// Script pré-hydratation sous CSP. `atBody` : état de <html> et de l'URL à
// l'insertion de <body>, donc AVANT tout script de page (le layout reposerait
// ensuite les mêmes valeurs : l'état final ne prouve rien).
const BOOT_CASES = [
  {
    label: "pré-hydratation : thème public + mode sombre + Angular",
    path: "/components/button",
    storage: { "st-docs-color-mode": "dark", "st-docs-theme": "dsfr", "docs-framework": "angular" },
    atBody: { mode: "dark", theme: "dsfr", framework: "angular", search: ["theme=dsfr", "framework=angular"] },
    angular: true
  },
  {
    label: "pré-hydratation : thème privé avec mode révélé persisté",
    path: "/components/button",
    storage: { "st-docs-theme": "cossette", "st-docs-demo-mode": "true" },
    atBody: { theme: "cossette", search: ["theme=cossette"] }
  },
  {
    label: "pré-hydratation : thème privé sans mode révélé",
    path: "/components/button",
    storage: { "st-docs-theme": "cossette" },
    atBody: { theme: null, search: [] },
    neverTheme: "cossette"
  }
];

// Marqueur propre à @angular/compiler (DomElementSchemaRegistry) : absent de
// @angular/core, présent dans tout bundle qui embarque le compilateur.
const COMPILER_MARKER = "[Element]|textContent";
const CSP_CONSOLE = /Content Security Policy|Refused to (execute|load|evaluate|apply|frame|connect)/i;

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
  const known = [];
  const bootFiles = new Set();
  const addressed = new Map();
  const files = htmlFiles(buildDir);

  const checkAddressed = (rel, src) => {
    if (!src.startsWith(inlineDir)) return;
    if (!addressed.has(src)) {
      const path = join(buildDir, src.slice(base.length));
      addressed.set(src, isFile(path) && contentName(readFileSync(path, "utf8")) === basename(src));
    }
    if (!addressed.get(src)) problems.push(`${rel} : ${src} absent ou nom ≠ hash du contenu`);
  };

  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const rel = file.slice(buildDir.length);

    let scripts;
    try {
      scripts = parseScripts(html);
    } catch (error) {
      problems.push(`${rel} : ${error.message}`);
      continue;
    }
    for (const script of scripts) {
      if (script.inlineExecutable) problems.push(`${rel} : script inline exécutable (${script.kind}) ${script.tag.slice(0, 80)}`);
      if (script.kind === "external") checkAddressed(rel, script.attributes.get("src"));
    }

    // Script pré-hydratation : PREMIER script, dans <head>, avant toute feuille
    // de style, classique synchrone (seul attribut : src), adressé par contenu.
    const headEnd = html.indexOf("</head>");
    const firstStylesheet = html.search(/<link\b[^>]*\brel="stylesheet"|<style\b/);
    const boot = scripts[0];
    const bootSrc = boot?.attributes.get("src") ?? "";
    if (
      !boot ||
      boot.kind !== "external" ||
      boot.attributes.size !== 1 ||
      !new RegExp(`^${inlineDir}[0-9a-f]{24}\\.js$`).test(bootSrc) ||
      boot.start > headEnd ||
      (firstStylesheet !== -1 && boot.start > firstStylesheet)
    ) {
      problems.push(`${rel} : script pré-hydratation absent de la tête de <head> ou non synchrone (${boot?.tag.slice(0, 80) ?? "aucun script"})`);
    } else {
      bootFiles.add(bootSrc);
    }

    for (const [tag] of html.matchAll(/<[a-zA-Z][^<>]*>/g)) {
      for (const [handler] of tag.matchAll(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g)) {
        const attribute = handler.trim();
        if (KNOWN_CSP_DEVIATIONS.inlineHandlers.includes(attribute)) known.push(`${rel} : ${attribute}`);
        else problems.push(`${rel} : gestionnaire inline ${attribute.slice(0, 80)}`);
      }
    }
    if (/\b(?:href|src|action)\s*=\s*["']?\s*javascript:/i.test(html)) {
      problems.push(`${rel} : URL javascript:`);
    }
  }

  if (bootFiles.size > 1) problems.push(`scripts pré-hydratation différents selon les pages : ${[...bootFiles].join(" ")}`);
  return { files: files.length, problems, known };
}

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    const target = join(buildDir, rel);
    const headers = { "content-security-policy": DOCUMENTED_CSP };
    for (const candidate of [target, `${target}.html`, join(target, "index.html")]) {
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

// Posé avant tout script de la page (hors CSP). Relève :
//   - les violations CSP ;
//   - TOUTES les valeurs prises par les attributs de <html> (attributeOldValue :
//     un thème posé puis retiré dans le même script laisse sa trace) ;
//   - l'état de <html> et de l'URL à l'insertion de <body> ;
//   - toutes les URL écrites par history.pushState / replaceState.
function instrument() {
  const WATCHED = ["data-st-theme", "data-color-mode", "data-st-framework"];
  window.__cspViolations = [];
  window.addEventListener(
    "securitypolicyviolation",
    (event) =>
      window.__cspViolations.push({
        key: `${event.effectiveDirective} ${event.blockedURI || "inline"}`,
        detail: `${event.sourceFile || ""}:${event.lineNumber || ""} ${event.sample || ""}`.trim()
      }),
    true
  );
  window.__attributeValues = Object.fromEntries(WATCHED.map((name) => [name, []]));
  window.__atBody = null;
  const snapshot = () => {
    const html = document.documentElement;
    return {
      mode: html.getAttribute("data-color-mode"),
      theme: html.getAttribute("data-st-theme"),
      framework: html.getAttribute("data-st-framework"),
      search: location.search
    };
  };
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes" && record.target === document.documentElement) {
        window.__attributeValues[record.attributeName].push(record.oldValue);
      }
      if (
        record.type === "childList" &&
        window.__atBody === null &&
        [...record.addedNodes].some((node) => node.nodeName === "BODY")
      ) {
        window.__atBody = snapshot();
      }
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: WATCHED
  });
  window.__urls = [location.search];
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      window.__urls.push(location.search);
      return result;
    };
  }
}

async function checkPage(browser, origin, entry) {
  const { label, path, angular, storage, atBody: expected, neverTheme } = entry;
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: storage
      ? { cookies: [], origins: [{ origin, localStorage: Object.entries(storage).map(([name, value]) => ({ name, value })) }] }
      : undefined
  });
  const page = await context.newPage();
  await page.addInitScript(instrument);

  const failures = [];
  const known = [];
  const scripts = [];
  page.on("pageerror", (error) => failures.push(`pageerror : ${error.message}`));
  page.on("console", (message) => {
    const text = message.text();
    if (!CSP_CONSOLE.test(text)) return;
    if (KNOWN_CSP_DEVIATIONS.consoleMessages.some((prefix) => text.startsWith(prefix))) known.push(`console : ${text.split("\n")[0].slice(0, 160)}`);
    else failures.push(`console CSP : ${text.slice(0, 240)}`);
  });
  page.on("response", (response) => {
    if (/\.m?js(\?|$)/.test(response.url())) scripts.push(response);
  });

  await page.goto(origin + path, { waitUntil: "networkidle" });

  // Marqueur d'hydratation : SvelteKit l'inscrit dans history.state au début
  // de `kit.start` (client.js, HISTORY_INDEX) ; ni le HTML prérendu ni le
  // script pré-hydratation ne le posent.
  const booted = await page
    .waitForFunction(() => Boolean(history.state && "sveltekit:history" in history.state), null, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!booted) failures.push("SvelteKit n'a pas démarré (kit.start non exécuté)");

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

  const state = await page.evaluate(() => {
    const html = document.documentElement;
    const values = {};
    for (const [name, old] of Object.entries(window.__attributeValues)) values[name] = [...old, html.getAttribute(name)];
    return {
      violations: window.__cspViolations,
      atBody: window.__atBody,
      values,
      urls: [...window.__urls, location.search],
      compilerFacade: Boolean(globalThis.ng && globalThis.ng["ɵcompilerFacade"]),
      unavailable: document.querySelectorAll(".angular-island-unavailable").length
    };
  });

  for (const { key, detail } of state.violations) {
    if (KNOWN_CSP_DEVIATIONS.violations.includes(key)) known.push(`violation : ${key}`);
    else failures.push(`violation CSP : ${key} ${detail}`);
  }
  if (state.compilerFacade) failures.push("@angular/compiler chargé (ng.ɵcompilerFacade publié)");
  if (state.unavailable) failures.push(`${state.unavailable} composant(s) Angular manquant(s)`);

  let jsBytes = 0;
  for (const response of scripts) {
    if (response.status() >= 400) failures.push(`script HTTP ${response.status()} : ${new URL(response.url()).pathname}`);
    const body = await response.body().catch(() => Buffer.alloc(0));
    jsBytes += body.length;
    if (body.includes(COMPILER_MARKER)) failures.push(`@angular/compiler téléchargé : ${new URL(response.url()).pathname}`);
  }

  if (expected) {
    const at = state.atBody;
    if (!at) {
      failures.push("insertion de <body> non observée");
    } else {
      for (const [key, attribute] of [["mode", "data-color-mode"], ["theme", "data-st-theme"], ["framework", "data-st-framework"]]) {
        if (key in expected && at[key] !== expected[key]) {
          failures.push(`à l'insertion de <body> : ${attribute}=${at[key]}, attendu ${expected[key]}`);
        }
      }
      for (const part of expected.search) {
        if (!new URLSearchParams(at.search).toString().split("&").includes(part)) {
          failures.push(`à l'insertion de <body> : URL "${at.search}" sans ${part}`);
        }
      }
      if (expected.search.length === 0 && new URLSearchParams(at.search).has("theme")) {
        failures.push(`à l'insertion de <body> : URL amorcée avec un thème (${at.search})`);
      }
    }
  }
  if (neverTheme) {
    if (state.values["data-st-theme"].includes(neverTheme)) {
      failures.push(`thème privé posé sur <html>, même un instant : ${JSON.stringify(state.values["data-st-theme"])}`);
    }
    const leaked = state.urls.filter((search) => new URLSearchParams(search).get("theme") === neverTheme);
    if (leaked.length) failures.push(`thème privé dans l'URL : ${leaked.join(" ")}`);
  }

  await context.close();
  return { label: label ?? path, failures, known: [...new Set(known)], scripts: scripts.length, jsBytes };
}

const scan = staticScan();
console.log(`[csp-check] scan statique : ${scan.files} page(s) HTML, ${scan.problems.length} problème(s)`);
for (const problem of scan.problems.slice(0, 20)) console.log(`  ✗ ${problem}`);
for (const item of scan.known) console.log(`  ! ${item} (écart connu, non bloquant)`);

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
    for (const item of result.known) console.log(`    ! ${item} (écart connu, non bloquant)`);
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
console.log("[csp-check] OK : aucune violation CSP hors écarts connus, aucune erreur, îles Angular montées sans compilateur.");
