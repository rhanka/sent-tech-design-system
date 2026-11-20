import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { mount } from "@vue/test-utils";
import { nextTick as tick } from "vue";
import { expectConnectorPaint, scenePaintOrder } from "../../diagram-canvas/tests/host-support/connectorHostContract.js";
import { flowFixture, flowMeasure } from "../../diagram-canvas/test-support/flowFixture.js";
import { nestedZoneFixture } from "../../diagram-canvas/test-support/nestedZoneFixture.js";
import DiagramSceneFigure from "./DiagramSceneFigure.vue";
import type { DiagramSceneFigureProps } from "./DiagramSceneFigure.types.js";

const mounted: { unmount: () => void; container: HTMLElement }[] = [];
function render(props: DiagramSceneFigureProps) {
  const container = document.createElement("div");
  document.body.append(container);
  const view = mount(DiagramSceneFigure, { props, attachTo: container });
  mounted.push({ unmount: () => view.unmount(), container });
  return { container };
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} takeRecords() { return []; } });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 1280 });
});
afterEach(() => {
  for (const view of mounted.splice(0)) { view.unmount(); view.container.remove(); }
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
});

function propsOf(fixture: ReturnType<typeof nestedZoneFixture>): DiagramSceneFigureProps {
  return { document: fixture.document, view: fixture.view, registry: fixture.registry, bindings: fixture.bindings,
    presentation: fixture.presentation, measureLines: flowMeasure } as DiagramSceneFigureProps;
}

// The Vue figure has two scene hosts: the base one, and the numbered-flow one
// selected by an explicit `flows` input. Both follow the same paint order.
for (const host of ["base", "numbered-flow"] as const) {
  const hostProps = (props: DiagramSceneFigureProps): DiagramSceneFigureProps => host === "base" ? props : { ...props, flows: { fanOutMax: 4 } };

  describe(`DiagramSceneFigure connectors in nested zones — Vue ${host} host`, () => {
    for (const outside of [false, true]) {
      it(`should paint every class relation above both zone frames${outside ? " when a route leaves the nested zone" : ""}`, async () => {
        const fixture = nestedZoneFixture({ outside });
        const view = render(hostProps(propsOf(fixture)));
        await tick();
        expectConnectorPaint(view.container, { frames: fixture.zones, boxes: fixture.cards, relations: fixture.relations });
      });
    }

    it("should move a zone above the connectors once it is collapsed, and back under them when expanded", async () => {
      const fixture = nestedZoneFixture({ outside: true });
      const view = render(hostProps(propsOf(fixture)));
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
  });
}

describe("DiagramSceneFigure numbered flow connectors — Vue", () => {
  it("should paint numbered flow connectors above the expanded zone that holds their source", async () => {
    const source = flowFixture(3, { labels: true, folded: true, reverse: true });
    const view = render({ document: source.document, registry: source.options.registry, bindings: source.options.bindings,
      presentation: source.presentation, measureLines: flowMeasure, flows: { fanOutMax: 4 } } as DiagramSceneFigureProps);
    await tick();
    const order = scenePaintOrder(view.container);
    expect(order.connectors).toHaveLength(1);
    expect(order.nodes.get("occurrence:e.zone")!).toBeLessThan(order.connectors[0]!);
    for (const card of ["a", "b", "outside"]) expect(order.nodes.get(`occurrence:e.${card}`)!).toBeGreaterThan(order.connectors[0]!);
    expect(view.container.querySelectorAll("[data-scene-edge]").length).toBeGreaterThan(0);
  });
});
