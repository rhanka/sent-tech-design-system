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
    expect(view.container.querySelectorAll("[data-scene-edge]")).toHaveLength(1);
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
});
