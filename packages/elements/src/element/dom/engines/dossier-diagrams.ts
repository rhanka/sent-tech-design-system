import type { DiagramNode } from "@sentropic/focus";
import type { SemanticDocument } from "@sentropic/diagram-core";
import { drawDossierDiagram, prepareDossierDiagram } from "../../../dossier/diagram-layout.js";
import { DossierDiagramError } from "../../../dossier/diagram-source.js";
import type { DossierDiagramViews } from "../../../ports/dossier-views.js";

let nextScene = 0;

function sceneSvg(owner: Document, source: string, prefix: string): SVGSVGElement {
  const template = owner.createElement("template");
  template.innerHTML = source;
  const svg = template.content.querySelector("svg")!;
  // The standalone canvas SVG supplies its own style. The kit uses external CSS.
  for (const style of svg.querySelectorAll("style")) style.remove();
  for (const element of svg.querySelectorAll("[style]")) element.removeAttribute("style");
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

export function createDossierDiagram(owner: Document, section: DiagramNode, derived?: DossierDiagramViews): HTMLElement {
  const scene = section.scene ?? derived?.scene;
  if (scene === undefined) {
    throw new DossierDiagramError(section.id, "diagram-views-invalid", "A scene or a views companion is required");
  }
  const { layout, expanded } = prepareDossierDiagram(section.id, section.alt, scene as SemanticDocument);
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
