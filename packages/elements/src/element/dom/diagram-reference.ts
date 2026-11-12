import type { DiagramResolutionContext, DiagramResolver } from "../../types/diagram.js";
import type { Diagnostic } from "../../validate/diagnostics.js";
import { componentStatus, diagramComponents, normalizeDiagram, type DiagramComponent } from "./diagram-components.js";

export interface DiagramFigure {
  readonly element: HTMLElement;
  resolve(resolver: DiagramResolver | undefined): void;
  destroy(): void;
}

/** One render-pass ticket per figure, held across resolver, import, hydrate and mount. */
export function diagramFigure(
  sourceRef: string,
  context: DiagramResolutionContext,
  sectionIndex: number,
  note: ((diagnostic: Diagnostic) => void) | undefined,
): DiagramFigure {
  Object.freeze(context);
  const figure = document.createElement("figure");
  figure.className = "st-dossier__diagram";
  figure.setAttribute("data-st-diagram", context.diagramId);
  figure.dataset.diagramState = "pending";
  const caption = document.createElement("figcaption");
  caption.className = "st-dossier__diagramAlt";
  caption.textContent = context.alt;
  const placeholder = document.createElement("div");
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", context.alt);
  placeholder.textContent = `Diagram pending · ${sourceRef}`;
  const reference = document.createElement("p");
  reference.className = "st-dossier__diagramReference";
  reference.textContent = `${sourceRef} · ${context.renderComponent}`;
  const state = document.createElement("p");
  state.className = "st-dossier__diagramState";
  state.setAttribute("aria-live", "polite");
  state.textContent = "Diagram pending";
  // The live region remains outside role=img so its updates stay exposed.
  figure.append(caption, placeholder, reference, state);
  let ticket = 0;
  let destroyed = false;
  let controller: AbortController | undefined;
  let stop: (() => void) | undefined;
  const current = (mine: number) => !destroyed && mine === ticket;

  function finish(value: string, code?: string): void {
    figure.dataset.diagramState = value;
    state.textContent = `Diagram ${value}`;
    if (code !== undefined) {
      placeholder.replaceChildren();
      placeholder.hidden = false;
      // Keep state and reference visible alongside the named placeholder.
      const description = document.createElement("span");
      description.textContent = `${context.alt} · ${sourceRef} · ${context.renderComponent} · ${value}`;
      placeholder.append(description);
      note?.({ code, severity: "warning", source: "host", path: `/root/document/sections/${sectionIndex}`,
        message: `Diagram ${context.diagramId}: ${value} (${context.renderComponent}, ${sourceRef})` });
    }
  }

  async function resolve(resolver: DiagramResolver | undefined): Promise<void> {
    if (destroyed || figure.dataset.diagramState !== "pending") return;
    const mine = ++ticket;
    controller?.abort();
    stop?.();
    stop = undefined;
    const status = componentStatus(context.renderComponent);
    if (status !== "available") {
      finish(status, `diagram-component-${status}`);
      return;
    }
    if (typeof resolver !== "function") {
      finish("unresolved", "diagram-unresolved");
      return;
    }
    let returned: unknown;
    try {
      returned = await resolver(sourceRef, context);
    } catch {
      if (current(mine)) finish("failed", "diagram-resolver-failed");
      return;
    }
    if (!current(mine)) return;
    if (returned === null || returned === undefined) {
      finish("unresolved", "diagram-unresolved");
      return;
    }
    const normalized = normalizeDiagram(returned);
    if (normalized === undefined) {
      finish("invalid", "diagram-payload-invalid");
      return;
    }
    if (normalized.component !== context.renderComponent) {
      finish("invalid", "diagram-component-mismatch");
      return;
    }
    const component = context.renderComponent as DiagramComponent;
    if (!diagramComponents[component].validateProps(normalized.props)) {
      finish("invalid", "diagram-payload-invalid");
      return;
    }
    controller = new AbortController();
    const signal = controller.signal;
    const content = document.createElement("div");
    signal.addEventListener("abort", () => content.remove(), { once: true });
    try {
      if (component === "GanttChart") {
        const painter = await diagramComponents.GanttChart.loadPainter();
        if (!current(mine)) return;
        painter.renderGantt(content, normalized.props, context.alt);
      } else {
        const engine = await diagramComponents.BpmnCanvas.loadPainter();
        if (!current(mine)) return;
        if (engine.port.validate(normalized.props.document).some((finding) => finding.severity === "error")) {
          finish("invalid", "diagram-payload-invalid");
          return;
        }
        const xml = await engine.toXml(normalized.props.document);
        if (!current(mine)) return;
        if (!xml.ok) {
          finish("invalid", "diagram-payload-invalid");
          return;
        }
        content.setAttribute("role", "img");
        content.setAttribute("aria-label", context.alt);
        // The canvas needs a mounted container, while the caption stays in place.
        placeholder.after(content);
        let mountFailed = false;
        const mounted = await engine.renderBpmn(content, { kind: "bpmn", xml: xml.xml, assetBase: undefined, watermark: undefined },
          (diagnostic) => { if (diagnostic.severity === "error") mountFailed = true; }, signal);
        if (!current(mine)) {
          mounted();
          content.remove();
          return;
        }
        // The canvas's ready promise settles on failure too; diagnostics carry it.
        if (mountFailed) {
          mounted();
          content.remove();
          finish("invalid", "diagram-payload-invalid");
          return;
        }
        stop = mounted;
      }
      placeholder.after(content);
      placeholder.hidden = true;
      finish("resolved");
    } catch {
      content.remove();
      if (current(mine)) {
        controller?.abort();
        finish("invalid", "diagram-payload-invalid");
      }
    }
  }

  return {
    element: figure,
    resolve(resolver) { void resolve(resolver); },
    destroy() {
      destroyed = true;
      ticket++;
      controller?.abort();
      stop?.();
    },
  };
}
