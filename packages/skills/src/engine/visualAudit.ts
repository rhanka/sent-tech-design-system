import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readdirSync, mkdirSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import type { Finding, Severity, VisualAuditReport, VisualLocale, VisualPageReport } from "../types.js";

/**
 * AUDIT VISUEL HEADLESS
 * --------------------------------------------------------------------------
 * Contrairement à `design audit` (statique, JSDOM, AUCUN layout calculé), cet
 * audit pilote un Chromium HEADLESS réel (Playwright) sur les pages docs
 * rendues, calcule les rects/styles in-page et détecte des bugs VISUELS :
 *   - chevauchement de texte illisible
 *   - fuite i18n (chaîne anglaise visible sur page FR)
 *   - incohérence/désalignement de contrôles (boutons, groupes)
 *   - grille cassée / cellules superposées (ex. Calendar)
 *   - débordement / contenu coupé (overflow caché)
 *
 * Playwright est importé DYNAMIQUEMENT : le reste de la CLI ne dépend pas du
 * navigateur. Si Playwright (ou le navigateur) est absent, l'erreur est claire.
 */

// --- Denylist i18n : chaînes d'UI anglaises à ne pas laisser fuiter en FR ----
export const ENGLISH_UI_DENYLIST = [
  "Copied", "Copy", "Loading", "Close", "Next", "Previous", "Search", "Submit",
  "Cancel", "Save", "Open", "Show more", "Show less", "Select", "Delete",
  "Confirm", "Settings", "Upload", "Download", "Edit", "Remove", "Apply", "Reset"
];

export class VisualAuditDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisualAuditDependencyError";
  }
}

export interface VisualAuditOptions {
  /** Dossier de build statique docs à servir (ex. apps/docs/build). */
  siteDir?: string;
  /** URL de base déjà servie (alternative à siteDir). */
  baseUrl?: string;
  /** Sous-chemin des pages composants (défaut "components"). */
  componentsSubpath?: string;
  /** Filtres de pages (slugs ou globs : "button", "calendar", "chart-*"). */
  pages?: string[] | null;
  outDir: string;
  locale: VisualLocale;
  headful: boolean;
}

interface PageCollectOptions {
  locale: string;
  denylist: string[];
  caps: { perRule: number; maxElements: number };
}

interface PageRawFinding {
  ruleId: string;
  severity: Severity;
  message: string;
  location: string;
  suggestion?: string;
}

// ---------------------------------------------------------------------------
// Fonction exécutée IN-PAGE (browser context). Auto-suffisante : ne référence
// QUE son argument et les globals DOM (window/document/NodeFilter). Toutes les
// aides sont imbriquées pour être sérialisées avec elle par page.evaluate.
// ---------------------------------------------------------------------------
function pageCollect(opts: PageCollectOptions): PageRawFinding[] {
  const win = window;
  const doc = document;
  const { perRule, maxElements } = opts.caps;
  const findings: PageRawFinding[] = [];
  const ruleCount: Record<string, number> = {};

  const push = (f: PageRawFinding): void => {
    ruleCount[f.ruleId] = (ruleCount[f.ruleId] || 0) + 1;
    if (ruleCount[f.ruleId] <= perRule) findings.push(f);
  };
  const clamp = (s: string, n: number): string => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  const selectorFor = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const id = (el as HTMLElement).id;
    if (id) return `${tag}#${id}`;
    let cls = "";
    if (typeof el.className === "string" && el.className.trim()) {
      const tokens = el.className.trim().split(/\s+/).filter((c) => !c.startsWith("svelte-")).slice(0, 2);
      if (tokens.length) cls = "." + tokens.join(".");
    }
    let nth = "";
    const parent = el.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
      if (sameTag.length > 1) nth = `:nth-of-type(${sameTag.indexOf(el) + 1})`;
    }
    return `${tag}${cls}${nth}`;
  };

  // Visibilité ROBUSTE : checkVisibility() tient compte de display/visibility/
  // opacity ET de content-visibility et des ancêtres masqués (ex. contenu d'un
  // <details> replié qui garde sa boîte de layout mais n'est PAS peint). Le
  // fallback style+rect couvre les moteurs sans checkVisibility().
  const isVisible = (el: Element): boolean => {
    const node = el as Element & { checkVisibility?: (opts?: Record<string, boolean>) => boolean };
    if (typeof node.checkVisibility === "function") {
      if (
        !node.checkVisibility({
          contentVisibilityAuto: true,
          opacityProperty: true,
          visibilityProperty: true,
          checkOpacity: true,
          checkVisibilityCSS: true
        })
      ) {
        return false;
      }
    } else {
      const style = win.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const directText = (el: Element): string => {
    let t = "";
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === 3) t += node.textContent || "";
    }
    return t.replace(/\s+/g, " ").trim();
  };

  const hasChildElementWithText = (el: Element): boolean => {
    for (const child of Array.from(el.children)) {
      if ((child.textContent || "").replace(/\s+/g, " ").trim().length > 0) return true;
    }
    return false;
  };

  const rectOverlapRatio = (a: DOMRect, b: DOMRect): number => {
    const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const inter = ix * iy;
    if (inter <= 0) return 0;
    return inter / Math.min(a.width * a.height, b.width * b.height);
  };

  // Périmètre d'audit = le CONTENU documentaire du composant (`.docs-page`),
  // pas le chrome docs (sidebar/header/footer du layout, hors `.docs-page`, qui
  // liste légitimement des NOMS de composants anglais : Search, Select…). On
  // exclut aussi la table des matières interne, sans filtrer par balise
  // sémantique afin de NE PAS écarter les démos de composants <header>/<nav>.
  const scanRoot: Element = doc.querySelector(".docs-page") || doc.querySelector("main") || doc.body || doc.documentElement;
  const inChrome = (el: Element): boolean =>
    !!el.closest(".docs-side-nav, .docs-toc, .docs-tableOfContents, .docs-breadcrumbs, .docs-onThisPage");
  const allEls = Array.from(scanRoot.querySelectorAll("*")).filter((el) => !inChrome(el));

  // --- (a) CHEVAUCHEMENT DE TEXTE ------------------------------------------
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "BR", "HR", "IMG"]);
  const leaves: Array<{ el: Element; r: DOMRect; text: string }> = [];
  for (const el of allEls) {
    if (leaves.length >= maxElements) break;
    if (SKIP_TAGS.has(el.tagName)) continue;
    if (!isVisible(el)) continue;
    const pos = win.getComputedStyle(el).position;
    // Les overlays intentionnels (badge absolu, tooltip, sticky) ne comptent pas.
    if (pos === "absolute" || pos === "fixed" || pos === "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) continue;
    const text = directText(el);
    if (!text) continue;
    if (hasChildElementWithText(el)) continue; // garder les feuilles de texte
    leaves.push({ el, r, text });
  }
  const overlapSeen = new Set<string>();
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const A = leaves[i];
      const B = leaves[j];
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const ratio = rectOverlapRatio(A.r, B.r);
      if (ratio < 0.25) continue;
      const key = `${selectorFor(A.el)}|${selectorFor(B.el)}`;
      if (overlapSeen.has(key)) continue;
      overlapSeen.add(key);
      const severity: Severity = ratio > 0.6 ? "high" : ratio > 0.4 ? "medium" : "low";
      push({
        ruleId: "visual-text-overlap",
        severity,
        message: `Chevauchement de texte (${Math.round(ratio * 100)} %) entre « ${clamp(A.text, 40)} » et « ${clamp(B.text, 40)} ».`,
        location: selectorFor(A.el),
        suggestion: "Ces textes se superposent et deviennent illisibles : corriger le positionnement, les marges ou la hauteur de ligne."
      });
    }
  }

  // --- (b) FUITE I18N (locale FR) ------------------------------------------
  if (opts.locale === "fr") {
    const esc = opts.denylist.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`\\b(${esc.join("|")})\\b`, "i");
    const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "KBD", "SAMP", "TEXTAREA", "SVG"]);
    const walker = doc.createTreeWalker(scanRoot, NodeFilter.SHOW_TEXT);
    const i18nSeen = new Set<string>();
    let node: Node | null = walker.nextNode();
    while (node) {
      const txt = (node.textContent || "").trim();
      const parent = node.parentElement;
      const current = node;
      node = walker.nextNode();
      if (!txt || !parent) continue;
      // Cibler les LIBELLÉS d'UI : un texte long est de la prose (qui peut citer
      // un type HTML "submit"/"reset" légitimement), pas un libellé qui fuite.
      if (txt.length > 48) continue;
      const m = re.exec(txt);
      if (!m) continue;
      // Ignorer le code documenté (API tables, snippets) et les zones marquées.
      if (inChrome(parent)) continue;
      let skip = false;
      let p: Element | null = parent;
      while (p) {
        if (skipTags.has(p.tagName)) { skip = true; break; }
        if (p.classList && (p.classList.contains("docs-table") || p.hasAttribute("data-i18n-ignore"))) { skip = true; break; }
        p = p.parentElement;
      }
      if (skip) continue;
      if (!isVisible(parent)) continue;
      void current;
      const word = m[1];
      const key = `${selectorFor(parent)}:${word.toLowerCase()}`;
      if (i18nSeen.has(key)) continue;
      i18nSeen.add(key);
      push({
        ruleId: "visual-i18n-leak",
        severity: "medium",
        message: `Chaîne anglaise « ${word} » visible sur une page FR (« ${clamp(txt, 50)} »).`,
        location: selectorFor(parent),
        suggestion: "Traduire ce libellé d'interface ou passer la prop de label localisée (ex. copiedLabel=\"Copié\")."
      });
    }
  }

  // --- Aides communes contrôles --------------------------------------------
  const CONTROL_SEL =
    'button, [role="button"], a.st-button, .st-button, .st-iconButton, .st-copyButton, input[type="button"], input[type="submit"]';
  const leafControls = (root: Element): Array<{ el: Element; r: DOMRect }> =>
    Array.from(root.querySelectorAll(CONTROL_SEL))
      .filter((c) => isVisible(c) && !c.querySelector(CONTROL_SEL))
      .map((el) => ({ el, r: el.getBoundingClientRect() }));
  const rowClusters = (items: Array<{ el: Element; r: DOMRect }>): Array<Array<{ el: Element; r: DOMRect }>> => {
    const sorted = items.slice().sort((a, b) => a.r.top - b.r.top);
    const clusters: Array<Array<{ el: Element; r: DOMRect }>> = [];
    for (const it of sorted) {
      let placed = false;
      for (const cl of clusters) {
        const ref = cl[0].r;
        const overlapY = Math.min(ref.bottom, it.r.bottom) - Math.max(ref.top, it.r.top);
        if (overlapY > Math.min(ref.height, it.r.height) * 0.5) { cl.push(it); placed = true; break; }
      }
      if (!placed) clusters.push([it]);
    }
    return clusters;
  };

  // --- (c1) HAUTEURS INCOHÉRENTES dans un vrai groupe ----------------------
  const groups = Array.from(
    scanRoot.querySelectorAll('.st-buttonGroup:not(.st-buttonGroup--vertical), [role="group"]')
  ).filter((g) => !inChrome(g));
  for (const g of groups) {
    for (const cluster of rowClusters(leafControls(g))) {
      if (cluster.length < 2) continue;
      const heights = cluster.map((c) => c.r.height);
      const min = Math.min(...heights);
      const max = Math.max(...heights);
      const sortedH = heights.slice().sort((a, b) => a - b);
      const median = sortedH[Math.floor(sortedH.length / 2)];
      if (max - min > Math.max(3, median * 0.15)) {
        push({
          ruleId: "visual-control-incoherence",
          severity: "medium",
          message: `Hauteurs de contrôles incohérentes dans un groupe (${Math.round(min)}px … ${Math.round(max)}px).`,
          location: selectorFor(g),
          suggestion: "Uniformiser la hauteur des contrôles d'un même groupe (mêmes tokens de taille)."
        });
      }
    }
  }

  // --- (c2) DÉSALIGNEMENT VERTICAL sur une rangée --------------------------
  const alignTargets = Array.from(
    scanRoot.querySelectorAll('.docs-example, .st-buttonGroup, [role="group"], .st-toolbar')
  ).filter((t) => !inChrome(t));
  const alignSeen = new Set<string>();
  for (const t of alignTargets) {
    for (const cluster of rowClusters(leafControls(t))) {
      if (cluster.length < 2) continue;
      const centers = cluster.map((c) => c.r.top + c.r.height / 2);
      const spread = Math.max(...centers) - Math.min(...centers);
      if (spread > 4) {
        const key = selectorFor(t);
        if (alignSeen.has(key)) continue;
        alignSeen.add(key);
        push({
          ruleId: "visual-control-misaligned",
          severity: spread > 10 ? "medium" : "low",
          message: `Contrôles désalignés verticalement sur une même rangée (Δ centre ${Math.round(spread)}px).`,
          location: key,
          suggestion: "Aligner verticalement les contrôles (align-items: center) : un contrôle sort de la ligne."
        });
      }
    }
  }

  // --- (d) GRILLE CASSÉE / CELLULES SUPERPOSÉES ----------------------------
  const checkSiblingOverlap = (container: Element, children: Element[], label: string): void => {
    const items = children.filter((c) => isVisible(c)).map((el) => ({ el, r: el.getBoundingClientRect() }));
    let reported = 0;
    for (let i = 0; i < items.length && reported < 3; i++) {
      for (let j = i + 1; j < items.length && reported < 3; j++) {
        const A = items[i];
        const B = items[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const ratio = rectOverlapRatio(A.r, B.r);
        if (ratio < 0.35) continue;
        reported++;
        push({
          ruleId: "visual-grid-broken",
          severity: "high",
          message: `${label} : cellules superposées (${Math.round(ratio * 100)} %).`,
          location: selectorFor(container),
          suggestion: "Réparer le gabarit de grille (colonnes/lignes) : les cellules se chevauchent et le contenu devient illisible."
        });
      }
    }
  };
  const gridEls = allEls.filter((el) => {
    const d = win.getComputedStyle(el).display;
    return d === "grid" || d === "inline-grid";
  });
  for (const g of gridEls.slice(0, 30)) {
    checkSiblingOverlap(g, Array.from(g.children), "Grille");
  }
  for (const cg of Array.from(scanRoot.querySelectorAll(".st-calendar__grid, .st-calendar__days"))) {
    checkSiblingOverlap(cg, Array.from(cg.querySelectorAll(".st-calendar__day")), "Grille calendrier");
  }

  // --- (e) DÉBORDEMENT / CONTENU COUPÉ -------------------------------------
  const de = (doc.scrollingElement || doc.documentElement) as HTMLElement | null;
  if (de && de.scrollWidth > win.innerWidth + 4) {
    push({
      ruleId: "visual-overflow",
      severity: "medium",
      message: `Débordement horizontal de la page (contenu ${de.scrollWidth}px > viewport ${win.innerWidth}px).`,
      location: "html",
      suggestion: "Un élément dépasse la largeur du viewport : vérifier largeurs fixes, min-width ou chaînes non coupées."
    });
  }
  let clipReported = 0;
  for (const el of allEls) {
    if (clipReported >= perRule) break;
    if (!isVisible(el)) continue;
    const s = win.getComputedStyle(el);
    if (!(s.overflowX === "hidden" || s.overflowX === "clip")) continue;
    const he = el as HTMLElement;
    if (he.clientWidth < 40) continue;
    if (he.scrollWidth - he.clientWidth > 4) {
      clipReported++;
      push({
        ruleId: "visual-clipping",
        severity: "low",
        message: `Contenu coupé horizontalement (overflow caché, ${he.scrollWidth}px > ${he.clientWidth}px).`,
        location: selectorFor(el),
        suggestion: "Le contenu dépasse et est masqué : prévoir un retour à la ligne, une largeur adaptative ou un défilement."
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Serveur statique minimal (Node) pour servir le build docs prerendu.
// ---------------------------------------------------------------------------
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json"
};

async function resolveFile(root: string, urlPath: string): Promise<string | null> {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safe = normalize(clean).replace(/^(\.\.([/\\]|$))+/, "");
  const base = join(root, safe);
  const candidates: string[] = [];
  if (safe === "" || safe.endsWith("/")) {
    candidates.push(join(base, "index.html"));
  } else if (extname(base)) {
    candidates.push(base);
  } else {
    candidates.push(`${base}.html`, join(base, "index.html"), base);
  }
  for (const c of candidates) {
    try {
      const st = await stat(c);
      if (st.isFile()) return c;
    } catch {
      // try next
    }
  }
  return null;
}

interface StaticServer {
  port: number;
  close: () => Promise<void>;
}

function startStaticServer(root: string): Promise<StaticServer> {
  return new Promise<StaticServer>((resolveP, rejectP) => {
    const server = createServer(async (req, res) => {
      try {
        let file = await resolveFile(root, req.url || "/");
        if (!file) {
          const fallback = join(root, "404.html");
          try {
            await stat(fallback);
            file = fallback;
            res.statusCode = 404;
          } catch {
            res.statusCode = 404;
            res.end("Not found");
            return;
          }
        }
        const data = await readFile(file);
        res.setHeader("Content-Type", MIME[extname(file).toLowerCase()] || "application/octet-stream");
        res.end(data);
      } catch {
        res.statusCode = 500;
        res.end("Server error");
      }
    });
    server.on("error", rejectP);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolveP({ port, close: () => new Promise<void>((r) => server.close(() => r())) });
    });
  });
}

// ---------------------------------------------------------------------------
// Énumération des slugs + filtres glob
// ---------------------------------------------------------------------------
function globToRegExp(glob: string): RegExp {
  const esc = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${esc}$`);
}

function matchPages(slugs: string[], patterns: string[] | null): string[] {
  if (!patterns || patterns.length === 0) return slugs;
  const res = patterns.map(globToRegExp);
  return slugs.filter((s) => res.some((r) => r.test(s)));
}

export function detectSystemChrome(): string | undefined {
  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium"
  ];
  for (const c of candidates) {
    try {
      if (statSync(c).isFile()) return c;
    } catch {
      // next
    }
  }
  return undefined;
}

function visualScore(findings: Finding[], pages: number): number {
  const weighted = findings.reduce((total, f) => {
    if (f.severity === "high") return total + 4;
    if (f.severity === "medium") return total + 2;
    return total + 1;
  }, 0);
  const score = 100 - weighted / Math.max(1, pages);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ---------------------------------------------------------------------------
// Orchestration principale
// ---------------------------------------------------------------------------
export async function visualAudit(options: VisualAuditOptions): Promise<VisualAuditReport> {
  const start = Date.now();
  const componentsSubpath = options.componentsSubpath ?? "components";

  let chromium: import("playwright-core").BrowserType;
  try {
    chromium = (await import("playwright-core")).chromium;
  } catch {
    throw new VisualAuditDependencyError(
      "playwright-core requis pour `audit:visual` (`npm i -D playwright-core`). Un Chrome/Chromium système est nécessaire au runtime (auto-détecté, ou via --executable-path)."
    );
  }

  // Cible : serveur statique local OU URL de base déjà servie.
  let baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, "") : "";
  let server: StaticServer | null = null;
  if (!baseUrl) {
    if (!options.siteDir) {
      throw new Error("Aucune cible : fournir un dossier de build docs ou une URL.");
    }
    server = await startStaticServer(options.siteDir);
    baseUrl = `http://127.0.0.1:${server.port}`;
  }

  try {
    // Énumération des pages composants.
    let slugs: string[];
    if (options.siteDir) {
      const compDir = join(options.siteDir, componentsSubpath);
      let entries: string[];
      try {
        entries = readdirSync(compDir);
      } catch {
        throw new Error(`Dossier composants introuvable : ${compDir} (lancer le build docs d'abord).`);
      }
      slugs = entries
        .filter((f) => f.endsWith(".html") && f !== "404.html")
        .map((f) => f.replace(/\.html$/, ""))
        .filter((s) => !s.startsWith("["))
        .sort();
      slugs = matchPages(slugs, options.pages ?? null);
    } else {
      slugs = options.pages ?? [];
      if (slugs.length === 0) {
        throw new Error("En mode URL, préciser --pages avec la liste des slugs à auditer.");
      }
    }
    if (slugs.length === 0) {
      throw new Error("Aucune page composant ne correspond au filtre --pages.");
    }

    mkdirSync(options.outDir, { recursive: true });

    // Lancement navigateur (cache Playwright, sinon Chrome système).
    const launchOpts = { headless: !options.headful };
    let browser: import("playwright-core").Browser;
    let usedExecutable: string | undefined;
    try {
      browser = await chromium.launch(launchOpts);
    } catch (err) {
      const sys = detectSystemChrome();
      if (!sys) throw err;
      usedExecutable = sys;
      browser = await chromium.launch({ ...launchOpts, executablePath: sys });
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: options.locale === "fr" ? "fr-FR" : "en-US",
      deviceScaleFactor: 1
    });
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    } catch {
      // permission optionnelle ; certaines builds ne l'exposent pas
    }

    const caps = { perRule: 20, maxElements: 1200 };
    const pageReports: VisualPageReport[] = [];

    for (const slug of slugs) {
      const page = await context.newPage();
      const url = `${baseUrl}/${componentsSubpath}/${slug}`;
      try {
        await page.goto(url, { waitUntil: "load", timeout: 30000 });
        try {
          await page.waitForLoadState("networkidle", { timeout: 4000 });
        } catch {
          // hydration lente : le contenu SSR est déjà présent
        }
        await page.waitForTimeout(250);

        const screenshot = join(options.outDir, `${slug}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });

        const raw: PageRawFinding[] = [];
        raw.push(...(await page.evaluate(pageCollect, { locale: options.locale, denylist: ENGLISH_UI_DENYLIST, caps })));

        // Passe d'interaction : révéler le feedback des boutons « copier »
        // (le label bascule vers copiedLabel — capte la fuite i18n "Copied").
        if (options.locale === "fr") {
          try {
            await page.bringToFront(); // focus requis pour l'API clipboard
          } catch {
            // ignore
          }
          const copyButtons = await page.$$('.st-copyButton, [class*="copyButton"], [class*="copy-button"]');
          let clicked = 0;
          for (const cb of copyButtons.slice(0, 10)) {
            try {
              await cb.click({ timeout: 1000, force: true, noWaitAfter: true });
              clicked++;
            } catch {
              // bouton non cliquable (désactivé, masqué) : ignorer
            }
          }
          if (clicked > 0) {
            await page.waitForTimeout(120);
            raw.push(...(await page.evaluate(pageCollect, { locale: options.locale, denylist: ENGLISH_UI_DENYLIST, caps })));
          }
        }

        const seen = new Set<string>();
        const findings: Finding[] = [];
        for (const f of raw) {
          const key = `${f.ruleId}|${f.location}|${f.message}`;
          if (seen.has(key)) continue;
          seen.add(key);
          findings.push({
            ruleId: f.ruleId,
            severity: f.severity,
            message: f.message,
            location: f.location,
            ...(f.suggestion ? { suggestion: f.suggestion } : {})
          });
        }
        pageReports.push({ slug, url, screenshot, findings });
      } catch (err) {
        pageReports.push({
          slug,
          url,
          screenshot: "",
          findings: [
            {
              ruleId: "visual-page-error",
              severity: "low",
              message: `Échec du rendu de la page : ${(err as Error).message}`,
              location: ":root"
            }
          ]
        });
      } finally {
        await page.close();
      }
    }

    await context.close();
    await browser.close();

    const allFindings = pageReports.flatMap((p) => p.findings);
    return {
      target: options.baseUrl ?? options.siteDir ?? baseUrl,
      locale: options.locale,
      engine: "playwright-chromium",
      browser: { headless: !options.headful, executablePath: usedExecutable },
      outDir: options.outDir,
      pages: pageReports,
      totalFindings: allFindings.length,
      score: visualScore(allFindings, pageReports.length),
      durationMs: Date.now() - start
    };
  } finally {
    if (server) await server.close();
  }
}
