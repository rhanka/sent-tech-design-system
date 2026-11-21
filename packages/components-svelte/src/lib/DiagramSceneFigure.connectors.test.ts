import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } from "@sentropic/diagram-core";
import { expectConnectorPaint, scenePaintOrder } from "../../../diagram-canvas/tests/host-support/connectorHostContract.js";
import { flowFixture, flowMeasure } from "../../../diagram-canvas/test-support/flowFixture.js";
import { nestedZoneFixture } from "../../../diagram-canvas/test-support/nestedZoneFixture.js";
import DiagramSceneFigure, { type DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} takeRecords() { return []; } });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 1280 });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth; });

function propsOf(fixture: ReturnType<typeof nestedZoneFixture>): DiagramSceneFigureProps {
  return { document: fixture.document, view: fixture.view, registry: fixture.registry, bindings: fixture.bindings,
    presentation: fixture.presentation, measureLines: flowMeasure } as DiagramSceneFigureProps;
}

describe("DiagramSceneFigure connectors in nested zones — Svelte", () => {
  for (const outside of [false, true]) {
    it(`should paint every class relation above both zone frames${outside ? " when a route leaves the nested zone" : ""}`, async () => {
      const fixture = nestedZoneFixture({ outside });
      const view = render(DiagramSceneFigure, propsOf(fixture));
      await tick();
      expectConnectorPaint(view.container, { frames: fixture.zones, boxes: fixture.cards, relations: fixture.relations });
    });
  }

  it("should move a zone above the connectors once it is collapsed, and back under them when expanded", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const view = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    const [system, ontology] = fixture.zones as [string, string];
    const outsideCard = fixture.cards[fixture.cards.length - 1]!;
    const toggle = () => view.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${ontology}"] button[aria-expanded]`)!;
    await fireEvent.click(toggle());
    await tick();
    const folded = scenePaintOrder(view.container);
    expect([...folded.nodes.keys()].sort()).toEqual([system, ontology, outsideCard].sort());
    expect(folded.nodes.get(system)!).toBeLessThan(folded.connectors[0]!);
    expect(folded.nodes.get(ontology)!).toBeGreaterThan(folded.connectors[0]!);
    expect(folded.nodes.get(outsideCard)!).toBeGreaterThan(folded.connectors[0]!);
    const foldedEdges = [...view.container.querySelectorAll("polyline[data-scene-edge]")];
    expect(foldedEdges).toHaveLength(1);
    expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(0);
    await fireEvent.click(toggle());
    await tick();
    expectConnectorPaint(view.container, { frames: fixture.zones, boxes: fixture.cards, relations: fixture.relations });
  });

  it("should paint numbered flow connectors above the expanded zone that holds their source", async () => {
    const source = flowFixture(3, { labels: true, folded: true, reverse: true });
    const view = render(DiagramSceneFigure, { document: source.document, registry: source.options.registry, bindings: source.options.bindings,
      presentation: source.presentation, measureLines: flowMeasure, flows: { fanOutMax: 4 } } as DiagramSceneFigureProps);
    await tick();
    const order = scenePaintOrder(view.container);
    expect(order.connectors).toHaveLength(1);
    expect(order.nodes.get("occurrence:e.zone")!).toBeLessThan(order.connectors[0]!);
    for (const card of ["a", "b", "outside"]) expect(order.nodes.get(`occurrence:e.${card}`)!).toBeGreaterThan(order.connectors[0]!);
    expect(view.container.querySelectorAll("[data-scene-edge]").length).toBeGreaterThan(0);
  });

  it("should paint dash patterns, arrowheads and emphasis from presentation words and preserve them across fold/unfold", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const [r0, r1, r2] = fixture.relations.map((r) => r.occurrence);
    const crossEdge = fixture.relations[fixture.relations.length - 1]!.occurrence;
    const presentation = {
      ...fixture.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      relations: {
        [r0!]: { strokeStyle: "dotted" as const, arrowhead: "arrow" as const },
        [r1!]: { arrowhead: "none" as const, emphasis: "emphasis" as const },
        [r2!]: { strokeStyle: "solid" as const, arrowhead: "arrow" as const },
        [crossEdge]: { strokeStyle: "dashed" as const, arrowhead: "arrow" as const, emphasis: "emphasis" as const },
      },
    };
    const view = render(DiagramSceneFigure, { ...propsOf(fixture), presentation } as DiagramSceneFigureProps);
    await tick();

    const markers = [...view.container.querySelectorAll("defs marker")];
    expect(markers).toHaveLength(2);
    expect(markers[0]!.id).toMatch(/^diagram-arrow-/);
    expect(markers[0]!.hasAttribute("data-arrowhead-kind")).toBe(false);
    expect(markers[1]!.getAttribute("data-arrowhead-kind")).toBe("arrow");
    expect(markers[1]!.getAttribute("data-arrowhead-emphasis")).toBe("emphasis");

    const edgeEl = (occ: string) => view.container.querySelector(`path[data-scene-edge="${occ}"]`)!;
    expect(edgeEl(r0!).getAttribute("stroke-dasharray")).toBe("2 5");
    expect(edgeEl(r0!).getAttribute("data-edge-stroke")).toBe("dotted");
    expect(edgeEl(r0!).getAttribute("marker-end")).toMatch(/^url\(#diagram-arrow-[^)]+\)$/);

    expect(edgeEl(r1!).getAttribute("stroke-dasharray")).toBeNull();
    expect(edgeEl(r1!).getAttribute("marker-end")).toBeNull();
    expect(edgeEl(r1!).getAttribute("data-edge-emphasis")).toBe("emphasis");

    expect(edgeEl(crossEdge).getAttribute("stroke-dasharray")).toBe("8 6");
    expect(edgeEl(crossEdge).getAttribute("data-edge-emphasis")).toBe("emphasis");
    expect(edgeEl(crossEdge).getAttribute("marker-end")).toMatch(/-emphasis\)$/);

    // Automatic link-style legend lists the 4 active styles in fixed canonical order on the right strip.
    const legendEl = () => view.container.querySelector<HTMLElement>("[data-scene-legend]");
    expect(legendEl()).not.toBeNull();
    expect(legendEl()!.getAttribute("data-legend-anchor")).toBe("right");
    expect([...view.container.querySelectorAll("[data-legend-style]")].map((el) => el.getAttribute("data-legend-style"))).toEqual([
      "solid:arrow:default",
      "solid:none:emphasis",
      "dashed:arrow:emphasis",
      "dotted:arrow:default",
    ]);

    // Fold the nested zone: only 1 cross-boundary edge remains -> single style -> legend disappears.
    const [, ontology] = fixture.zones as [string, string];
    const toggle = () => view.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${ontology}"] button[aria-expanded]`)!;
    await fireEvent.click(toggle());
    await tick();
    expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(1);
    expect(legendEl()).toBeNull();
    const foldedEdge = edgeEl(crossEdge);
    expect(foldedEdge.getAttribute("stroke-dasharray")).toBe("8 6");
    expect(foldedEdge.getAttribute("data-edge-stroke")).toBe("dashed");
    expect(foldedEdge.getAttribute("data-edge-emphasis")).toBe("emphasis");
    expect(foldedEdge.getAttribute("marker-end")).toMatch(/-emphasis\)$/);

    // Unfold: all styled edges and the 4-entry legend return intact.
    await fireEvent.click(toggle());
    await tick();
    expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(fixture.relations.length);
    expect(legendEl()).not.toBeNull();
    expect([...view.container.querySelectorAll("[data-legend-style]")].map((el) => el.getAttribute("data-legend-style"))).toEqual([
      "solid:arrow:default",
      "solid:none:emphasis",
      "dashed:arrow:emphasis",
      "dotted:arrow:default",
    ]);
    expect(edgeEl(r0!).getAttribute("stroke-dasharray")).toBe("2 5");
    expect(edgeEl(r1!).getAttribute("marker-end")).toBeNull();
    expect(edgeEl(r1!).getAttribute("data-edge-emphasis")).toBe("emphasis");
  });

  it("should omit the automatic link legend for single-style scenes and when legend='none'", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const single = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    expect(single.container.querySelector("[data-scene-legend]")).toBeNull();
    single.unmount();

    const [r0, r1] = fixture.relations.map((r) => r.occurrence);
    const presentation = {
      ...fixture.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      relations: {
        [r0!]: { strokeStyle: "dashed" as const },
        [r1!]: { strokeStyle: "dotted" as const },
      },
    };
    const suppressed = render(DiagramSceneFigure, { ...propsOf(fixture), presentation, legend: "none" } as DiagramSceneFigureProps);
    await tick();
    expect(suppressed.container.querySelector("[data-scene-legend]")).toBeNull();
  });

  it("should apply fit-to-window framing only when fitToWindow is enabled and keep fold/unfold working (DE-2 ask 9)", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const defaultView = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    const defaultFigure = defaultView.container.querySelector("figure")!;
    const defaultViewport = defaultView.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    expect(defaultFigure.classList.contains("st-diagramSceneFigure--fitToWindow")).toBe(false);
    expect(defaultFigure.getAttribute("data-fit-to-window")).toBeNull();
    expect(defaultViewport.style.maxHeight).toBe("");
    defaultView.unmount();

    const fittedView = render(DiagramSceneFigure, { ...propsOf(fixture), fitToWindow: true } as DiagramSceneFigureProps);
    await tick();
    const figure = fittedView.container.querySelector("figure")!;
    const viewport = fittedView.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    expect(figure.classList.contains("st-diagramSceneFigure--fitToWindow")).toBe(true);
    expect(figure.getAttribute("data-fit-to-window")).toBe("true");
    expect(viewport.style.maxHeight).toBe("calc(100vh - 24px)");
    expect(viewport.style.maxWidth).toBe("100%");
    expect(viewport.style.marginInline).toBe("auto");

    // Fold and unfold keep fit-to-window active.
    const [, ontology] = fixture.zones as [string, string];
    const toggle = () => fittedView.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${ontology}"] button[aria-expanded]`)!;
    await fireEvent.click(toggle());
    await tick();
    expect(figure.getAttribute("data-fit-to-window")).toBe("true");
    expect(fittedView.container.querySelectorAll("polyline[data-scene-edge]")).toHaveLength(1);
    await fireEvent.click(toggle());
    await tick();
    expect(fittedView.container.querySelectorAll("polyline[data-scene-edge]")).toHaveLength(fixture.relations.length);
  });

  it("should recompute scaled edge label boxes when CSS overrides --st-component-diagramScene-edgeLabelSize on mount (REQ-R7-11)", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const baseView = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    const baseLabel = baseView.container.querySelector<HTMLElement>("[data-scene-label]")!;
    const baseWidth = parseFloat(baseLabel.style.width);
    const baseHeight = parseFloat(baseLabel.style.height);
    baseView.unmount();

    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      const style = realGetComputedStyle(el);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return (name: string) => name === "--st-component-diagramScene-edgeLabelSize" ? "27px" : target.getPropertyValue(name);
          }
          const value = Reflect.get(target, prop);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    });

    const scaledView = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    await tick();
    const scaledLabel = scaledView.container.querySelector<HTMLElement>("[data-scene-label]")!;
    expect(parseFloat(scaledLabel.style.width)).toBeGreaterThan(baseWidth);
    expect(parseFloat(scaledLabel.style.height)).toBeGreaterThan(baseHeight);
  });

  it("should match buildSceneLinkLegend geometry variables with zero overflow at edgeLabelSize 12px and 18px (REQ-R7-12)", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const [r0, r1] = fixture.relations.map((r) => r.occurrence);
    const presentation = {
      ...fixture.presentation,
      contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
      relations: {
        [r0!]: { strokeStyle: "dashed" as const },
        [r1!]: { strokeStyle: "dotted" as const },
      },
    };
    for (const edgeLabelSize of [12, 18]) {
      const view = render(DiagramSceneFigure, {
        ...propsOf(fixture),
        presentation,
        metrics: { edgeLabelSize },
      } as DiagramSceneFigureProps);
      await tick();
      const legend = view.container.querySelector<HTMLElement>("[data-scene-legend]")!;
      expect(legend).not.toBeNull();
      const num = (prop: string) => parseFloat(legend.style.getPropertyValue(prop));
      const items = legend.querySelectorAll("[data-legend-style]").length;
      const contentHeight =
        2 * num("--st-diagram-legend-padding") +
        num("--st-diagram-legend-header-height") +
        num("--st-diagram-legend-header-gap") +
        items * num("--st-diagram-legend-row-height") +
        Math.max(0, items - 1) * num("--st-diagram-legend-row-gap");
      expect(contentHeight).toBe(parseFloat(legend.style.height));
      view.unmount();
    }
  });

  it("honors consumer edgeLabelFontSize overrides in core themes, resolves 1.5rem to 24px, and propagates explicit metrics.edgeLabelSize / linkStrokeWidth to host CSS vars (REQ-R7-11 / REQ-R7-28)", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      const style = realGetComputedStyle(el);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return (name: string) => {
              if (name === "--st-component-diagramScene-edgeLabelSize") return "18px";
              if (name === "--st-component-diagramScene-edgeLabelFontSize") return "14px";
              return target.getPropertyValue(name);
            };
          }
          const value = Reflect.get(target, prop);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    });

    const v1Override = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    await tick();
    const v1Viewport = v1Override.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    expect(v1Viewport.style.getPropertyValue("--st-diagram-edge-label-size")).toBe("14px");
    v1Override.unmount();

    // 1.5rem resolves to 24px (1.5 * 16px), never 1.5 world units.
    vi.restoreAllMocks();
    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      const style = realGetComputedStyle(el);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return (name: string) => (name === "--st-component-diagramScene-edgeLabelSize" ? "1.5rem" : target.getPropertyValue(name));
          }
          const value = Reflect.get(target, prop);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    });
    const remView = render(DiagramSceneFigure, propsOf(fixture));
    await tick();
    await tick();
    const remViewport = remView.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    expect(remViewport.style.getPropertyValue("--st-diagram-edge-label-size")).toBe("24px");
    remView.unmount();
    vi.restoreAllMocks();

    // Explicit metrics.edgeLabelSize & linkStrokeWidth paint through host CSS custom properties.
    const explicitView = render(DiagramSceneFigure, {
      ...propsOf(fixture),
      presentation: { ...fixture.presentation, contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } },
      metrics: { edgeLabelSize: 24, linkStrokeWidth: 4, linkEmphasisStrokeWidth: 5 },
    } as DiagramSceneFigureProps);
    await tick();
    const explicitViewport = explicitView.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    expect(explicitViewport.style.getPropertyValue("--st-diagram-edge-label-size")).toBe("24px");
    expect(explicitViewport.style.getPropertyValue("--st-diagram-link-stroke-width")).toBe("4px");
    expect(explicitViewport.style.getPropertyValue("--st-diagram-link-emphasis-stroke-width")).toBe("5px");
  });

  it("resets orientation seed history on non-fold input changes with the same documentId and keeps main O-4 on legacy scenes (REQ-R7-28)", async () => {
    const fixture = nestedZoneFixture({ outside: true });
    const seenSeeds: (Record<string, string> | undefined)[] = [];
    const spyingCache = {
      layout: (_doc: unknown, options: { previousOrientation?: Record<string, string> }, _view?: unknown) => {
        seenSeeds.push(options.previousOrientation);
        return { status: "refused" as const, refusals: [{ code: "document-invalid" as const, path: "probe", message: "probe" }], diagnostics: [] };
      },
      layoutFolded: (_doc: unknown, _view: unknown, options: { previousOrientation?: Record<string, string> }) => {
        seenSeeds.push(options.previousOrientation);
        return {
          status: "laid-out" as const,
          view: fixture.view,
          fit: { direction: "top-to-bottom" as const, width: 100, height: 100, zoom: 1, pans: false, phone: false },
          warnings: [],
          orientations: { root: seenSeeds.length === 1 ? ("columns" as const) : ("rows" as const) },
        };
      },
      has: () => false,
      clear: () => {},
      dispose: () => {},
      stats: () => ({ entries: 0, bytes: 0, hits: 0, misses: 0, evictions: 0 }),
    };

    // Legacy @1 scene: fold mask revisits feed previousOrientation directly (main O-4, no stale seed replay).
    const baseProps = { ...propsOf(fixture), layoutCache: spyingCache as never, collapsed: [] };
    const view = render(DiagramSceneFigure, baseProps as DiagramSceneFigureProps);
    await tick();
    expect(seenSeeds.at(-1)).toBeUndefined();
    // Changing revision with the same documentId keeps feeding previousOrientation ("columns"), NOT the stale initial undefined seed.
    await view.rerender({
      ...baseProps,
      document: { ...fixture.document, revision: fixture.document.revision + 1 },
    } as DiagramSceneFigureProps);
    await tick();
    expect(seenSeeds.at(-1)).toEqual({ root: "columns" });
    view.unmount();

    // r7 @2 scene: changing revision or hints with the same documentId clears orientationSeedByFold instead of replaying initial seed.
    seenSeeds.length = 0;
    const r7Props = {
      ...propsOf(fixture),
      presentation: { ...fixture.presentation, contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } },
      layoutCache: spyingCache as never,
      collapsed: [],
    };
    const r7View = render(DiagramSceneFigure, r7Props as DiagramSceneFigureProps);
    await tick();
    expect(seenSeeds.at(-1)).toBeUndefined();
    await r7View.rerender({
      ...r7Props,
      hints: { cardGapX: 120 },
    } as DiagramSceneFigureProps);
    await tick();
    expect(seenSeeds.at(-1)).toEqual({ root: "columns" });
  });
});
