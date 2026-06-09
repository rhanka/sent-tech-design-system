import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type {
  Finding,
  Severity,
  FrameworkId,
  ParityAuditReport,
  ParityBlockReport,
  ParityComparison,
  ParityPageReport,
  VisualLocale
} from "../types.js";
import {
  ENGLISH_UI_DENYLIST,
  VisualAuditDependencyError,
  detectSystemChrome,
  startStaticServer,
  matchPages,
  type StaticServer
} from "./visualAudit.js";

/**
 * AUDIT DE PARITÉ TRI-FRAMEWORK (Svelte / React / Vue)
 * --------------------------------------------------------------------------
 * Rend CHIFFRABLE l'écart entre les 3 implémentations d'un même composant en
 * pilotant un Chromium réel (playwright-core + Chrome système). Architecture
 * EN COUCHES validée par consensus (deepresearch + opus + codex) :
 *
 *   COUCHE 1 — PARITÉ CROSS-FRAMEWORK (pixel-diff) = le détecteur fiable.
 *     Pour chaque bloc d'exemple `.tex` d'une page composant : on navigue 3×
 *     vers `/components/<slug>?framework=svelte|react|vue` (routing route-backed
 *     du layout docs), on attend l'hydratation/montage des îles, et on
 *     screenshote CHAQUE bloc `.tex` PAR ÉLÉMENT (pas full-page). On diff alors
 *     svelte_i vs react_i et svelte_i vs vue_i (pixelmatch, includeAA:false,
 *     threshold ~0.1). Sortie : ratio de pixels différents + heatmap PNG. Si les
 *     dimensions diffèrent, c'est DÉJÀ un écart (flag, pas de diff possible).
 *
 *   COUCHE 2 — ASSERTIONS DOM/CSS DÉTERMINISTES (par framework, page.evaluate),
 *     exactes là où le VLM est aveugle : fuite i18n, overflow/clip d'overlays,
 *     tailles sm/md/lg non distinctes, désalignement de base sur une rangée.
 *
 *   COUCHE 3 — VLM-CRITIQUE : la CLI NE fait PAS l'appel. Elle PRODUIT les
 *     artefacts (shots 3fw par bloc + heatmaps + JSON structuré) pour qu'un
 *     agent Opus (claude:ds-QA) les trie. Format documenté dans le JSON de
 *     sortie (voir ParityAuditReport / ParityBlockReport).
 *
 * playwright-core est importé DYNAMIQUEMENT (le reste de la CLI ne dépend pas du
 * navigateur). pixelmatch/pngjs sont des deps directes (légères, pures JS).
 */

const FRAMEWORKS: FrameworkId[] = ["svelte", "react", "vue"];

export interface ParityAuditOptions {
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
  /** Seuil de ratio de pixels différents au-delà duquel un bloc est flaggé. */
  threshold: number;
  headful: boolean;
}

// ---------------------------------------------------------------------------
// COUCHE 2 — fonction exécutée IN-PAGE (browser context) pour un framework
// donné. Auto-suffisante (ne référence que son argument + globals DOM). Émet
// des findings DOM/CSS déterministes, étiquetés par framework par l'appelant.
// ---------------------------------------------------------------------------
interface DomCollectOptions {
  framework: FrameworkId;
  locale: string;
  denylist: string[];
}

interface DomRawFinding {
  ruleId: string;
  severity: Severity;
  message: string;
  location: string;
  suggestion?: string;
}

function domCollect(opts: DomCollectOptions): DomRawFinding[] {
  const win = window;
  const doc = document;
  const findings: DomRawFinding[] = [];
  const fwTag = `[${opts.framework}] `;

  const clamp = (s: string, n: number): string => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  const isVisible = (el: Element): boolean => {
    const node = el as Element & { checkVisibility?: (o?: Record<string, boolean>) => boolean };
    if (typeof node.checkVisibility === "function") {
      if (!node.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })) {
        return false;
      }
    } else {
      const st = win.getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const selectorFor = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const id = (el as HTMLElement).id;
    if (id) return `${tag}#${id}`;
    let cls = "";
    if (typeof el.className === "string" && el.className.trim()) {
      const tokens = el.className.trim().split(/\s+/).filter((c) => !c.startsWith("svelte-")).slice(0, 2);
      if (tokens.length) cls = "." + tokens.join(".");
    }
    return `${tag}${cls}`;
  };

  const blocks = Array.from(doc.querySelectorAll<HTMLElement>(".tex"));
  const blockLabel = (block: Element, i: number): string => {
    const t = block.querySelector(".tex__title");
    const txt = (t?.textContent || "").replace(/\s+/g, " ").trim();
    return txt ? `tex#${i} « ${clamp(txt, 30)} »` : `tex#${i}`;
  };

  // --- (a) FUITE I18N (locale FR) — limité au contenu rendu (.tex__stage) ---
  if (opts.locale === "fr") {
    const esc = opts.denylist.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`\\b(${esc.join("|")})\\b`, "i");
    const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "KBD", "SAMP", "TEXTAREA", "SVG"]);
    const i18nSeen = new Set<string>();
    for (const block of blocks) {
      const stage = block.querySelector(".tex__stage");
      if (!stage) continue;
      const walker = doc.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node) {
        const txt = (node.textContent || "").trim();
        const parent = node.parentElement;
        node = walker.nextNode();
        if (!txt || !parent) continue;
        if (txt.length > 48) continue;
        const m = re.exec(txt);
        if (!m) continue;
        let skip = false;
        let p: Element | null = parent;
        while (p && p !== stage.parentElement) {
          if (skipTags.has(p.tagName)) { skip = true; break; }
          p = p.parentElement;
        }
        if (skip) continue;
        if (!isVisible(parent)) continue;
        const word = m[1];
        const key = `${selectorFor(parent)}:${word.toLowerCase()}`;
        if (i18nSeen.has(key)) continue;
        i18nSeen.add(key);
        findings.push({
          ruleId: "parity-i18n-leak",
          severity: "medium",
          message: `${fwTag}Chaîne anglaise « ${word} » visible sur une page FR (« ${clamp(txt, 50)} »).`,
          location: selectorFor(parent),
          suggestion: "Traduire ce libellé d'interface ou passer la prop de label localisée."
        });
      }
    }
  }

  // --- (b) OVERFLOW/CLIP : overlay absolu/fixed clippé par un ancêtre --------
  // Tout enfant en position absolute/fixed d'un .tex/.tex__stage dont le rect
  // déborde ET dont un ancêtre (jusqu'au .tex) a overflow != visible le clippe.
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    const stage = block.querySelector<HTMLElement>(".tex__stage") || block;
    const overlays = Array.from(stage.querySelectorAll<HTMLElement>("*")).filter((el) => {
      const pos = win.getComputedStyle(el).position;
      return (pos === "absolute" || pos === "fixed") && isVisible(el);
    });
    let reported = 0;
    for (const ov of overlays) {
      if (reported >= 3) break;
      const ovr = ov.getBoundingClientRect();
      if (ovr.width < 4 || ovr.height < 4) continue;
      // Cherche un ancêtre clippant entre l'overlay et le .tex.
      let anc: HTMLElement | null = ov.parentElement;
      let clipper: HTMLElement | null = null;
      while (anc && anc !== block.parentElement) {
        const s = win.getComputedStyle(anc);
        const clipsX = s.overflowX === "hidden" || s.overflowX === "clip" || s.overflowX === "auto" || s.overflowX === "scroll";
        const clipsY = s.overflowY === "hidden" || s.overflowY === "clip" || s.overflowY === "auto" || s.overflowY === "scroll";
        if (clipsX || clipsY) {
          const cr = anc.getBoundingClientRect();
          const overflowsTop = ovr.top < cr.top - 1;
          const overflowsBottom = ovr.bottom > cr.bottom + 1;
          const overflowsLeft = ovr.left < cr.left - 1;
          const overflowsRight = ovr.right > cr.right + 1;
          if ((clipsY && (overflowsTop || overflowsBottom)) || (clipsX && (overflowsLeft || overflowsRight))) {
            clipper = anc;
            break;
          }
        }
        anc = anc.parentElement;
      }
      if (clipper) {
        reported++;
        findings.push({
          ruleId: "parity-overflow-clip",
          severity: "high",
          message: `${fwTag}Overlay positionné déborde de ${blockLabel(block, bi)} et est coupé par un ancêtre (${selectorFor(clipper)}, overflow!=visible).`,
          location: selectorFor(ov),
          suggestion: "Faire en sorte que le menu/overlay déborde du cadre (overflow:visible sur l'ancêtre) ou le rendre en portail."
        });
      }
    }
  }

  // --- (c) TAILLES sm/md/lg NON DISTINCTES ----------------------------------
  // Bloc dont le titre évoque les tailles : on cherche des contrôles étiquetés
  // sm/md/lg (texte/aria/classe) et on vérifie que leurs hauteurs diffèrent.
  const sizeRe = /\b(sm|md|lg|small|medium|large|petit|moyen|grand|tailles?|sizes?)\b/i;
  const CONTROL_SEL =
    'button, [role="button"], input, select, .st-button, .st-input, .st-select, [class*="size"], [data-size]';
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    const title = (block.querySelector(".tex__title")?.textContent || "").trim();
    const stage = block.querySelector<HTMLElement>(".tex__stage");
    if (!stage) continue;
    const titleSuggestsSize = /\b(tailles?|sizes?)\b/i.test(title);
    // Identifie les contrôles "feuilles" visibles taggés par une taille.
    const tagged = new Map<string, HTMLElement[]>(); // size -> elements
    const controls = Array.from(stage.querySelectorAll<HTMLElement>(CONTROL_SEL)).filter(
      (c) => isVisible(c) && !c.querySelector(CONTROL_SEL)
    );
    for (const c of controls) {
      const hay = `${c.getAttribute("data-size") || ""} ${c.className} ${c.getAttribute("aria-label") || ""} ${(c.textContent || "").trim()}`;
      const m = hay.match(/\b(sm|small|petit|md|medium|moyen|lg|large|grand)\b/i);
      if (!m) continue;
      const raw = m[1].toLowerCase();
      const size = /sm|small|petit/.test(raw) ? "sm" : /lg|large|grand/.test(raw) ? "lg" : "md";
      if (!tagged.has(size)) tagged.set(size, []);
      tagged.get(size)!.push(c);
    }
    if (!titleSuggestsSize && tagged.size < 2) continue;
    if (tagged.size < 2) continue;
    // Hauteur médiane par taille.
    const medHeight = (els: HTMLElement[]): number => {
      const hs = els.map((e) => e.getBoundingClientRect().height).filter((h) => h > 0).sort((a, b) => a - b);
      return hs.length ? hs[Math.floor(hs.length / 2)] : 0;
    };
    const order: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg"];
    const present = order.filter((s) => tagged.has(s));
    const heights = present.map((s) => ({ size: s, h: medHeight(tagged.get(s)!) }));
    // Au moins deux tailles présentes : leurs hauteurs doivent différer (>2px).
    let identical = false;
    for (let i = 0; i < heights.length; i++) {
      for (let j = i + 1; j < heights.length; j++) {
        if (Math.abs(heights[i].h - heights[j].h) <= 2 && heights[i].h > 0) identical = true;
      }
    }
    if (identical) {
      const desc = heights.map((x) => `${x.size}:${Math.round(x.h)}px`).join(" ");
      findings.push({
        ruleId: "parity-sizes-not-distinct",
        severity: "medium",
        message: `${fwTag}Tailles annoncées non distinctes dans ${blockLabel(block, bi)} (${desc}).`,
        location: selectorFor(block),
        suggestion: "Rendre les tailles sm/md/lg visuellement distinctes (hauteurs différentes) ou retirer la démo de tailles."
      });
    }
  }

  // --- (d) ALIGNEMENT DE BASE sur une rangée (.tex__render flex-row) ---------
  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi];
    const renders = Array.from(block.querySelectorAll<HTMLElement>(".tex__render"));
    for (const render of renders) {
      const st = win.getComputedStyle(render);
      if (st.display !== "flex" && st.display !== "inline-flex") continue;
      if (st.flexDirection.startsWith("column")) continue;
      const children = Array.from(render.children).filter(
        (c) => c instanceof HTMLElement && isVisible(c)
      ) as HTMLElement[];
      if (children.length < 2) continue;
      const rects = children.map((c) => c.getBoundingClientRect());
      // Regroupe par rangée (chevauchement vertical) ; signale les tops très
      // divergents au sein d'une même rangée.
      const rows: number[][] = [];
      const byTop = rects.map((r, i) => ({ r, i })).sort((a, b) => a.r.top - b.r.top);
      for (const { r, i } of byTop) {
        let placed = false;
        for (const row of rows) {
          const ref = rects[row[0]];
          const overlapY = Math.min(ref.bottom, r.bottom) - Math.max(ref.top, r.top);
          if (overlapY > Math.min(ref.height, r.height) * 0.5) { row.push(i); placed = true; break; }
        }
        if (!placed) rows.push([i]);
      }
      for (const row of rows) {
        if (row.length < 2) continue;
        const tops = row.map((i) => rects[i].top);
        const spread = Math.max(...tops) - Math.min(...tops);
        // Tolérance : un alignement par baseline/center peut décaler les tops si
        // les hauteurs diffèrent. On ne flag que des divergences franches (>10px)
        // ET non explicables par align-items center/end.
        const alignItems = st.alignItems;
        if (spread > 10 && alignItems !== "center" && alignItems !== "flex-end" && alignItems !== "end" && alignItems !== "baseline") {
          findings.push({
            ruleId: "parity-baseline-misaligned",
            severity: "low",
            message: `${fwTag}Contrôles désalignés en haut sur une rangée de ${blockLabel(block, bi)} (Δtop ${Math.round(spread)}px, align-items:${alignItems}).`,
            location: selectorFor(render),
            suggestion: "Aligner la rangée par le haut (align-items:flex-start) ou centrer explicitement les contrôles."
          });
          break;
        }
      }
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// COUCHE 1 — décodage PNG + diff pixel
// ---------------------------------------------------------------------------
interface Shot {
  buffer: Buffer;
  width: number;
  height: number;
  data: Buffer; // RGBA
}

function decode(buffer: Buffer): Shot {
  const png = PNG.sync.read(buffer);
  return { buffer, width: png.width, height: png.height, data: png.data };
}

function comparePair(
  a: Shot | null,
  b: Shot | null,
  threshold: number,
  heatmapPath: string,
  pixelThreshold: number
): ParityComparison | null {
  if (!a || !b) return null;
  // Dimensions différentes = écart de parité d'office (pas de diff pixel).
  if (a.width !== b.width || a.height !== b.height) {
    return {
      ratio: 1,
      diffPixels: a.width * a.height,
      totalPixels: a.width * a.height,
      flagged: true,
      heatmap: "",
      dimsMismatch: { a: { w: a.width, h: a.height }, b: { w: b.width, h: b.height } }
    };
  }
  const { width, height } = a;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: pixelThreshold,
    includeAA: false,
    alpha: 0.4
  });
  const totalPixels = width * height;
  const ratio = totalPixels > 0 ? diffPixels / totalPixels : 0;
  let heatmap = "";
  if (diffPixels > 0) {
    writeFileSync(heatmapPath, PNG.sync.write(diff));
    heatmap = heatmapPath;
  }
  return {
    ratio,
    diffPixels,
    totalPixels,
    flagged: ratio > threshold,
    heatmap
  };
}

// ---------------------------------------------------------------------------
// Énumération des slugs
// ---------------------------------------------------------------------------
function enumerateSlugs(siteDir: string, componentsSubpath: string, pages: string[] | null): string[] {
  const compDir = join(siteDir, componentsSubpath);
  let entries: string[];
  try {
    entries = readdirSync(compDir);
  } catch {
    throw new Error(`Dossier composants introuvable : ${compDir} (lancer le build docs d'abord).`);
  }
  const slugs = entries
    .filter((f) => f.endsWith(".html") && f !== "404.html")
    .map((f) => f.replace(/\.html$/, ""))
    .filter((s) => !s.startsWith("["))
    .sort();
  return matchPages(slugs, pages ?? null);
}

function parityScoreFor(flaggedBlocks: number, totalBlocks: number, domFindings: Finding[]): number {
  // Score = part de blocs en parité, pénalisée par les findings DOM pondérés.
  const base = totalBlocks > 0 ? ((totalBlocks - flaggedBlocks) / totalBlocks) * 100 : 100;
  const weighted = domFindings.reduce((t, f) => {
    if (f.severity === "high") return t + 4;
    if (f.severity === "medium") return t + 2;
    return t + 1;
  }, 0);
  const penalty = weighted / Math.max(1, totalBlocks || 1);
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}

// ---------------------------------------------------------------------------
// Orchestration principale
// ---------------------------------------------------------------------------
export async function parityAudit(options: ParityAuditOptions): Promise<ParityAuditReport> {
  const start = Date.now();
  const componentsSubpath = options.componentsSubpath ?? "components";
  const pixelThreshold = 0.1; // sensibilité pixelmatch (anti-aliasing)

  let chromium: import("playwright-core").BrowserType;
  try {
    chromium = (await import("playwright-core")).chromium;
  } catch {
    throw new VisualAuditDependencyError(
      "playwright-core requis pour `audit:parity` (`npm i -D playwright-core`). Un Chrome/Chromium système est nécessaire au runtime (auto-détecté, ou via Chrome système)."
    );
  }

  let baseUrl = options.baseUrl ? options.baseUrl.replace(/\/$/, "") : "";
  let server: StaticServer | null = null;
  if (!baseUrl) {
    if (!options.siteDir) throw new Error("Aucune cible : fournir un dossier de build docs ou une URL.");
    server = await startStaticServer(options.siteDir);
    baseUrl = `http://127.0.0.1:${server.port}`;
  }

  try {
    let slugs: string[];
    if (options.siteDir) {
      slugs = enumerateSlugs(options.siteDir, componentsSubpath, options.pages ?? null);
    } else {
      slugs = options.pages ?? [];
      if (slugs.length === 0) throw new Error("En mode URL, préciser --pages avec la liste des slugs à auditer.");
    }
    if (slugs.length === 0) throw new Error("Aucune page composant ne correspond au filtre --pages.");

    mkdirSync(options.outDir, { recursive: true });

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
      deviceScaleFactor: 1,
      // Environnement figé : réduit les sources de bruit du diff pixel.
      reducedMotion: "reduce"
    });
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseUrl });
    } catch {
      // optionnel
    }
    // Coupe les animations CSS résiduelles (transitions/keyframes) pour stabiliser.
    await context.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent =
        "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;}";
      const apply = () => document.head && document.head.appendChild(style);
      if (document.head) apply();
      else document.addEventListener("DOMContentLoaded", apply);
    });

    const pageReports: ParityPageReport[] = [];

    for (const slug of slugs) {
      const url = `${baseUrl}/${componentsSubpath}/${slug}`;
      const slugDir = join(options.outDir, slug);
      mkdirSync(slugDir, { recursive: true });

      // Captures par framework : shotsByFw[fw] = Shot[] indexé par bloc.
      const shotsByFw: Record<FrameworkId, Array<Shot | null>> = { svelte: [], react: [], vue: [] };
      const shotPathByFw: Record<FrameworkId, string[]> = { svelte: [], react: [], vue: [] };
      const titlesByBlock: string[] = [];
      const domFindings: Finding[] = [];
      let blockCount = 0;
      let pageError: string | undefined;

      for (const fw of FRAMEWORKS) {
        const page = await context.newPage();
        try {
          const fwUrl = `${url}?framework=${fw}`;
          await page.goto(fwUrl, { waitUntil: "load", timeout: 30000 });
          try {
            await page.waitForLoadState("networkidle", { timeout: 6000 });
          } catch {
            // hydratation/îles lentes : on poursuit, le délai ci-dessous couvre.
          }
          // Laisse les îles React/Vue se monter ($effect côté client).
          await page.waitForTimeout(fw === "svelte" ? 350 : 900);

          // Récupère les titres des blocs (depuis svelte, l'ordre est stable).
          if (fw === "svelte") {
            const titles = await page.$$eval(".tex", (els) =>
              els.map((el) => (el.querySelector(".tex__title")?.textContent || "").replace(/\s+/g, " ").trim())
            );
            blockCount = titles.length;
            titles.forEach((t) => titlesByBlock.push(t));
          }

          // COUCHE 2 — assertions DOM/CSS pour ce framework.
          try {
            const raw = await page.evaluate(domCollect, {
              framework: fw,
              locale: options.locale,
              denylist: ENGLISH_UI_DENYLIST
            });
            for (const f of raw) {
              domFindings.push({
                ruleId: f.ruleId,
                severity: f.severity,
                message: f.message,
                location: f.location,
                ...(f.suggestion ? { suggestion: f.suggestion } : {})
              });
            }
          } catch {
            // evaluate peut échouer si la page a planté ; non bloquant.
          }

          // COUCHE 1 — capture par bloc `.tex` (par élément, pas full-page).
          const handles = await page.$$(".tex");
          for (let i = 0; i < handles.length; i++) {
            const h = handles[i];
            let shot: Shot | null = null;
            const shotPath = join(slugDir, `block-${i}.${fw}.png`);
            try {
              await h.scrollIntoViewIfNeeded({ timeout: 2000 });
              const buf = await h.screenshot({ timeout: 8000 });
              const b = Buffer.from(buf);
              writeFileSync(shotPath, b);
              shot = decode(b);
            } catch {
              shot = null;
            }
            shotsByFw[fw][i] = shot;
            shotPathByFw[fw][i] = shot ? shotPath : "";
          }
        } catch (err) {
          pageError = (err as Error).message;
        } finally {
          await page.close();
        }
      }

      // Nombre de blocs = max observé sur les 3 frameworks (robuste si l'un casse).
      const nBlocks = Math.max(
        blockCount,
        shotsByFw.svelte.length,
        shotsByFw.react.length,
        shotsByFw.vue.length
      );

      const blocks: ParityBlockReport[] = [];
      let flaggedBlocks = 0;
      for (let i = 0; i < nBlocks; i++) {
        const sv = shotsByFw.svelte[i] ?? null;
        const rc = shotsByFw.react[i] ?? null;
        const vu = shotsByFw.vue[i] ?? null;
        const svr = comparePair(sv, rc, options.threshold, join(slugDir, `block-${i}.svelte-vs-react.diff.png`), pixelThreshold);
        const svv = comparePair(sv, vu, options.threshold, join(slugDir, `block-${i}.svelte-vs-vue.diff.png`), pixelThreshold);
        if ((svr && svr.flagged) || (svv && svv.flagged)) flaggedBlocks++;
        const shots: ParityBlockReport["shots"] = {};
        if (shotPathByFw.svelte[i]) shots.svelte = shotPathByFw.svelte[i];
        if (shotPathByFw.react[i]) shots.react = shotPathByFw.react[i];
        if (shotPathByFw.vue[i]) shots.vue = shotPathByFw.vue[i];
        blocks.push({
          index: i,
          ...(titlesByBlock[i] ? { title: titlesByBlock[i] } : {}),
          shots,
          parity: { svelteVsReact: svr, svelteVsVue: svv }
        });
      }

      pageReports.push({
        slug,
        url,
        blocks,
        dom: domFindings,
        parityScore: parityScoreFor(flaggedBlocks, nBlocks, domFindings),
        flaggedBlocks,
        ...(pageError ? { error: pageError } : {})
      });
    }

    await context.close();
    await browser.close();

    const totalBlocks = pageReports.reduce((t, p) => t + p.blocks.length, 0);
    const totalFlaggedBlocks = pageReports.reduce((t, p) => t + p.flaggedBlocks, 0);
    const totalDomFindings = pageReports.reduce((t, p) => t + p.dom.length, 0);
    const allDom = pageReports.flatMap((p) => p.dom);
    const parityScore = parityScoreFor(totalFlaggedBlocks, totalBlocks, allDom);

    return {
      target: options.baseUrl ?? options.siteDir ?? baseUrl,
      locale: options.locale,
      engine: "playwright-chromium",
      browser: { headless: !options.headful, executablePath: usedExecutable },
      outDir: options.outDir,
      threshold: options.threshold,
      frameworks: FRAMEWORKS,
      pages: pageReports,
      totalBlocks,
      totalFlaggedBlocks,
      totalDomFindings,
      parityScore,
      durationMs: Date.now() - start
    };
  } finally {
    if (server) await server.close();
  }
}
