import type { DiagramNode } from "@sentropic/focus";
import { canonicalJson } from "@sentropic/focus/editing";
import { renderProcessTable } from "@sentropic/diagram-canvas/focus-bridge";
import { drawDossierDiagram, prepareDossierDiagram } from "../../../focus-diagrams/diagram-layout.js";
import { DossierDiagramError, readDossierScene } from "../../../focus-diagrams/diagram-source.js";

let nextScene = 0;

function sceneSvg(owner: Document, source: string, prefix: string): SVGSVGElement {
  const template = owner.createElement("template");
  // Chromium checks inline style attributes while parsing SVG in a template.
  // Strip the pinned canvas renderer's inline CSS before handing it to the DOM.
  template.innerHTML = source.replace(/<style>[\s\S]*?<\/style>| style="[^"]*"/g, "");
  const svg = template.content.querySelector("svg")!;
  // The diagram renders at its natural size and is never enlarged: the SVG
  // carries explicit width/height attributes and a viewBox (renderSceneSvg
  // always emits them); restore them from the viewBox if ever missing so the
  // CSS `width: auto; max-width: 100%; height: auto` rule stays meaningful.
  const viewBox = svg.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);
  if (viewBox !== undefined && viewBox.length === 4 && viewBox.every(Number.isFinite)) {
    if (!svg.hasAttribute("width")) svg.setAttribute("width", String(viewBox[2]));
    if (!svg.hasAttribute("height")) svg.setAttribute("height", String(viewBox[3]));
  }
  // The kit provides a single native fold control for the figure.
  for (const toggle of svg.querySelectorAll("[data-toggle]")) toggle.remove();
  for (const element of svg.querySelectorAll("[id]")) element.id = prefix + element.id;
  for (const element of svg.querySelectorAll("[marker-end], [mask]")) {
    for (const name of ["marker-end", "mask"]) {
      const value = element.getAttribute(name);
      if (value?.startsWith("url(#")) element.setAttribute(name, `url(#${prefix}${value.slice(5)}`);
    }
  }
  return svg;
}

/**
 * The `Tout voir` mode of the Focus static kit, with the same behaviour and
 * wording as the DiagramSceneFigure `Tout voir` mode: the diagram starts at
 * its natural size, the toggle shows the whole scene with no scroll, the
 * fullscreen control is offered while the whole-scene fit stands (when the
 * scene could read too small), pinch zoom keeps working, and leaving the mode
 * restores the natural size. Keyboard, `aria-pressed` and reduced motion
 * follow the same contract (Escape leaves fullscreen, then view-all).
 */
function attachViewAll(
  owner: Document, drawing: HTMLElement, viewport: HTMLElement, controls: HTMLElement, viewportId: string,
): void {
  const viewAllButton = owner.createElement("button");
  viewAllButton.type = "button";
  viewAllButton.textContent = "Tout voir";
  viewAllButton.setAttribute("aria-pressed", "false");
  viewAllButton.setAttribute("aria-controls", viewportId);
  viewAllButton.setAttribute("data-review-passthrough", "");
  const fullscreenButton = owner.createElement("button");
  fullscreenButton.type = "button";
  fullscreenButton.textContent = "Plein écran";
  fullscreenButton.setAttribute("aria-label", "Plein écran");
  fullscreenButton.setAttribute("aria-pressed", "false");
  fullscreenButton.setAttribute("data-review-passthrough", "");
  fullscreenButton.hidden = true;
  controls.append(viewAllButton, fullscreenButton);

  let fallbackFullscreen = false;
  const nativeFullscreen = (): boolean => owner.fullscreenElement === drawing;
  const fullscreen = (): boolean => fallbackFullscreen || nativeFullscreen();
  const syncButtons = (): void => {
    const viewAll = viewport.dataset["viewAll"] === "true";
    viewAllButton.setAttribute("aria-pressed", String(viewAll));
    fullscreenButton.setAttribute("aria-pressed", String(fullscreen()));
    fullscreenButton.hidden = !viewAll;
  };
  const exitFullscreen = (): void => {
    if (fallbackFullscreen) {
      fallbackFullscreen = false;
      drawing.removeAttribute("data-fullscreen");
    } else if (nativeFullscreen() && typeof owner.exitFullscreen === "function") {
      void owner.exitFullscreen();
    }
    syncButtons();
  };
  const enterFullscreen = (): void => {
    const request = (drawing as HTMLElement & { requestFullscreen?: unknown }).requestFullscreen;
    const enabled = typeof request === "function" && owner.fullscreenEnabled !== false;
    if (enabled) {
      const promise = (request as () => Promise<unknown>).call(drawing);
      if (promise === undefined || typeof (promise as Promise<unknown>).catch !== "function") return;
      (promise as Promise<unknown>).then(() => syncButtons()).catch(() => {
        fallbackFullscreen = true;
        drawing.dataset["fullscreen"] = "true";
        syncButtons();
      });
      return;
    }
    // No Fullscreen API (file:// artifact, headless): fixed overlay fallback.
    fallbackFullscreen = true;
    drawing.dataset["fullscreen"] = "true";
    syncButtons();
  };

  const setViewAll = (enabled: boolean): void => {
    const next = Boolean(enabled);
    const current = viewport.dataset["viewAll"] === "true";
    if (next === current) return;
    if (!next && fullscreen()) exitFullscreen();
    if (next) viewport.dataset["viewAll"] = "true";
    else viewport.removeAttribute("data-view-all");
    syncButtons();
  };

  viewAllButton.addEventListener("click", () => setViewAll(viewport.dataset["viewAll"] !== "true"));
  fullscreenButton.addEventListener("click", () => {
    if (fullscreen()) exitFullscreen();
    else enterFullscreen();
  });
  drawing.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (fallbackFullscreen) {
      exitFullscreen();
      event.preventDefault();
      return;
    }
    if (viewport.dataset["viewAll"] === "true" && !nativeFullscreen()) {
      setViewAll(false);
      event.preventDefault();
    }
  });
  // Native Escape leaves fullscreen by itself; keep the buttons in sync.
  owner.addEventListener?.("fullscreenchange", () => {
    if (fallbackFullscreen && !nativeFullscreen()) {
      fallbackFullscreen = false;
      drawing.removeAttribute("data-fullscreen");
    }
    syncButtons();
  });
}

export function createDossierDiagram(
  owner: Document, section: DiagramNode, derived?: { readonly scene: unknown; readonly views: Record<string, unknown> },
): HTMLElement {
  const sceneInput = section.scene ?? derived?.scene;
  if (sceneInput === undefined) {
    throw new DossierDiagramError(section.id, "diagram-views-invalid", "A scene or a views companion is required");
  }
  const scene = readDossierScene(section.id, sceneInput);
  const { layout, expanded, folded } = prepareDossierDiagram(section.id, section.alt, scene);
  if (derived !== undefined && (canonicalJson(derived.scene) !== canonicalJson(scene) ||
      canonicalJson(derived.views) !== canonicalJson({ expanded: expanded.result.view, folded: folded.result.view }))) {
    throw new DossierDiagramError(section.id, "diagram-views-invalid", "The views companion does not match the scene");
  }
  const drawing = owner.createElement("div");
  drawing.className = "st-dossier__diagramDrawing";
  const viewport = owner.createElement("div");
  viewport.className = "st-dossier__diagramViewport";
  const prefix = `st-dossier-scene-${++nextScene}-`;
  viewport.id = `${prefix}viewport`;
  viewport.append(sceneSvg(owner, expanded.svg, prefix));
  const controls = owner.createElement("div");
  controls.className = "st-dossier__diagramControls";
  drawing.append(controls, viewport);
  if (layout.containers.length !== 0) {
    const button = owner.createElement("button");
    button.type = "button";
    button.textContent = "Fold containers";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("data-review-passthrough", "");
    button.setAttribute("aria-controls", viewport.id);
    button.addEventListener("click", () => {
      const fold = button.getAttribute("aria-expanded") === "true";
      const { svg } = drawDossierDiagram(section.id, section.alt, layout, fold ? layout.containers : []);
      viewport.replaceChildren(sceneSvg(owner, svg, prefix));
      button.setAttribute("aria-expanded", String(!fold));
      button.textContent = fold ? "Expand containers" : "Fold containers";
    });
    controls.prepend(button);
  }
  attachViewAll(owner, drawing, viewport, controls, viewport.id);
  if (scene.profileRefs.includes("process@1")) {
    const tableTemplate = owner.createElement("template");
    tableTemplate.innerHTML = renderProcessTable(scene);
    const table = tableTemplate.content.firstElementChild;
    if (table !== null) {
      table.querySelector("summary")?.setAttribute("data-review-passthrough", "");
      drawing.append(table);
    }
  }
  return drawing;
}
