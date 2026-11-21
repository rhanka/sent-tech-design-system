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

    it("should paint dash patterns, arrowheads and emphasis from presentation words and preserve them across fold/unfold", async () => {
      const fixture = nestedZoneFixture({ outside: true });
      const [r0, r1, r2] = fixture.relations.map((r) => r.occurrence);
      const crossEdge = fixture.relations[fixture.relations.length - 1]!.occurrence;
      const presentation = {
        ...fixture.presentation,
        relations: {
          [r0!]: { strokeStyle: "dotted" as const, arrowhead: "arrow" as const },
          [r1!]: { arrowhead: "none" as const, emphasis: "emphasis" as const },
          [r2!]: { strokeStyle: "solid" as const, arrowhead: "arrow" as const },
          [crossEdge]: { strokeStyle: "dashed" as const, arrowhead: "arrow" as const, emphasis: "emphasis" as const },
        },
      };
      const view = render(hostProps({ ...propsOf(fixture), presentation } as DiagramSceneFigureProps));
      await tick();

      const markers = [...view.container.querySelectorAll("defs marker")];
      expect(markers).toHaveLength(2);
      expect(markers[0]!.id).toMatch(/^diagram-arrow-/);
      expect(markers[0]!.hasAttribute("data-arrowhead-kind")).toBe(false);

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

      const legendEl = () => view.container.querySelector<HTMLElement>("[data-scene-legend]");
      expect(legendEl()).not.toBeNull();
      expect(legendEl()!.getAttribute("data-legend-anchor")).toBe("right");
      expect([...view.container.querySelectorAll("[data-legend-style]")].map((el) => el.getAttribute("data-legend-style"))).toEqual([
        "solid:arrow:default",
        "solid:none:emphasis",
        "dashed:arrow:emphasis",
        "dotted:arrow:default",
      ]);

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

    it("should recompute scaled edge label boxes when CSS overrides --st-component-diagramScene-edgeLabelSize on mount (REQ-R7-11)", async () => {
      const fixture = nestedZoneFixture({ outside: true });
      const baseView = render(hostProps(propsOf(fixture)));
      await tick();
      const baseLabel = baseView.container.querySelector<HTMLElement>("[data-scene-label]")!;
      const baseWidth = parseFloat(baseLabel.style.width);
      const baseHeight = parseFloat(baseLabel.style.height);

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

      const scaledView = render(hostProps(propsOf(fixture)));
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
        relations: {
          [r0!]: { strokeStyle: "dashed" as const },
          [r1!]: { strokeStyle: "dotted" as const },
        },
      };
      for (const edgeLabelSize of [12, 18]) {
        const view = render(hostProps({
          ...propsOf(fixture),
          presentation,
          metrics: { edgeLabelSize },
        } as DiagramSceneFigureProps));
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
      }
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
