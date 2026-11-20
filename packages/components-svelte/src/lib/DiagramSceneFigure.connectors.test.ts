import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
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
    const foldedEdges = [...view.container.querySelectorAll("path[data-scene-edge]")];
    expect(foldedEdges).toHaveLength(1);
    expect(view.container.querySelectorAll("polyline")).toHaveLength(0);
    expect(foldedEdges[0]!.getAttribute("d")).toMatch(/^M[\d.-]+ [\d.-]+ .*L[\d.-]+ [\d.-]+$/);
    await fireEvent.click(toggle());
    await tick();
    expectConnectorPaint(view.container, { frames: fixture.zones, boxes: fixture.cards, relations: fixture.relations });
    expect([...view.container.querySelectorAll("path[data-scene-edge]")].some((edge) => (edge.getAttribute("d") ?? "").includes("Q"))).toBe(true);
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
      relations: {
        [r0!]: { strokeStyle: "dotted" as const, arrowhead: "open-triangle" as const },
        [r1!]: { arrowhead: "none" as const, emphasis: "emphasis" as const },
        [r2!]: { strokeStyle: "solid" as const, arrowhead: "arrow" as const },
        [crossEdge]: { strokeStyle: "dashed" as const, arrowhead: "open-triangle" as const, emphasis: "emphasis" as const },
      },
    };
    const view = render(DiagramSceneFigure, { ...propsOf(fixture), presentation } as DiagramSceneFigureProps);
    await tick();

    const markers = [...view.container.querySelectorAll("defs marker")];
    expect(markers.length).toBeGreaterThanOrEqual(3);
    expect(markers[0]!.id).toMatch(/^diagram-arrow-/);
    expect(markers[0]!.hasAttribute("data-arrowhead-kind")).toBe(false);
    expect(markers.some((m) => m.getAttribute("data-arrowhead-kind") === "open-triangle" && m.getAttribute("data-arrowhead-emphasis") === "default")).toBe(true);
    expect(markers.some((m) => m.getAttribute("data-arrowhead-kind") === "open-triangle" && m.getAttribute("data-arrowhead-emphasis") === "emphasis")).toBe(true);

    const edgeEl = (occ: string) => view.container.querySelector(`path[data-scene-edge="${occ}"]`)!;
    expect(edgeEl(r0!).getAttribute("stroke-dasharray")).toBe("2 5");
    expect(edgeEl(r0!).getAttribute("data-edge-stroke")).toBe("dotted");
    expect(edgeEl(r0!).getAttribute("data-edge-arrowhead")).toBe("open-triangle");
    expect(edgeEl(r0!).getAttribute("marker-end")).toMatch(/-open\)$/);

    expect(edgeEl(r1!).getAttribute("stroke-dasharray")).toBeNull();
    expect(edgeEl(r1!).getAttribute("marker-end")).toBeNull();
    expect(edgeEl(r1!).getAttribute("data-edge-emphasis")).toBe("emphasis");

    expect(edgeEl(crossEdge).getAttribute("stroke-dasharray")).toBe("8 6");
    expect(edgeEl(crossEdge).getAttribute("data-edge-emphasis")).toBe("emphasis");
    expect(edgeEl(crossEdge).getAttribute("marker-end")).toMatch(/-open-emphasis\)$/);

    // Fold the nested zone: cross-boundary edge re-routes with rounded path and keeps its style words.
    const [, ontology] = fixture.zones as [string, string];
    const toggle = () => view.container.querySelector<HTMLButtonElement>(`[data-scene-occurrence="${ontology}"] button[aria-expanded]`)!;
    await fireEvent.click(toggle());
    await tick();
    expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(1);
    const foldedEdge = edgeEl(crossEdge);
    expect(foldedEdge.getAttribute("stroke-dasharray")).toBe("8 6");
    expect(foldedEdge.getAttribute("data-edge-stroke")).toBe("dashed");
    expect(foldedEdge.getAttribute("data-edge-arrowhead")).toBe("open-triangle");
    expect(foldedEdge.getAttribute("data-edge-emphasis")).toBe("emphasis");
    expect(foldedEdge.getAttribute("marker-end")).toMatch(/-open-emphasis\)$/);

    // Unfold: all styled edges return intact.
    await fireEvent.click(toggle());
    await tick();
    expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(fixture.relations.length);
    expect(edgeEl(r0!).getAttribute("stroke-dasharray")).toBe("2 5");
    expect(edgeEl(r1!).getAttribute("marker-end")).toBeNull();
    expect(edgeEl(r1!).getAttribute("data-edge-emphasis")).toBe("emphasis");
  });
});
