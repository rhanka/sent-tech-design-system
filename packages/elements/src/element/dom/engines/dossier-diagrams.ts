import type { DiagramNode } from "@sentropic/focus";
import { canonicalJson } from "@sentropic/focus/editing";
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
  viewport.append(sceneSvg(owner, expanded.svg, prefix));
  drawing.append(viewport);
  if (layout.containers.length !== 0) {
    const button = owner.createElement("button");
    button.type = "button";
    button.textContent = "Fold containers";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("data-review-passthrough", "");
    viewport.id = `${prefix}viewport`;
    button.setAttribute("aria-controls", viewport.id);
    button.addEventListener("click", () => {
      const fold = button.getAttribute("aria-expanded") === "true";
      const { svg } = drawDossierDiagram(section.id, section.alt, layout, fold ? layout.containers : []);
      viewport.replaceChildren(sceneSvg(owner, svg, prefix));
      button.setAttribute("aria-expanded", String(!fold));
      button.textContent = fold ? "Expand containers" : "Fold containers";
    });
    drawing.prepend(button);
  }
  return drawing;
}
