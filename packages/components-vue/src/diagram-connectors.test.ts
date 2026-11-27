import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { mount } from "@vue/test-utils";
import { nextTick as tick } from "vue";
import {
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
} from "../../diagram-canvas/tests/scene-host-fixtures.js";
import { expectConnectorPaint, scenePaintOrder } from "../../diagram-canvas/tests/host-support/connectorHostContract.js";
import { flowFixture, flowMeasure } from "../../diagram-canvas/test-support/flowFixture.js";
import { nestedZoneFixture } from "../../diagram-canvas/test-support/nestedZoneFixture.js";
import { r7AuthoredLegendFixture } from "../../diagram-canvas/test-support/r7AuthoredLegendFixture.js";
import { r7ConnectorsFixture } from "../../diagram-canvas/test-support/r7ConnectorsFixture.js";
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
      const foldedEdges = [...view.container.querySelectorAll("polyline[data-scene-edge]")];
      expect(foldedEdges).toHaveLength(1);
      expect(view.container.querySelectorAll("path[data-scene-edge]")).toHaveLength(0);
      await fireEvent.click(toggle());
      await tick();
      expectConnectorPaint(view.container, { frames: fixture.zones, boxes: fixture.cards, relations: fixture.relations });
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
      const base = nestedZoneFixture({ outside: true });
      const fixture = { ...base, view: { ...base.view, presentation: { ...base.view.presentation, anatomy: "v2" as const } } };
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
        contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN },
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

    it("preserves v1 token geometry and resolves r7 CSS lengths and explicit paint metrics (REQ-R7-11 / REQ-R7-28)", async () => {
      const fixture = nestedZoneFixture({ outside: true });
      const compact = { ...fixture, view: { ...fixture.view, presentation: { ...fixture.view.presentation, anatomy: "v2" as const } } };
      const realGetComputedStyle = window.getComputedStyle.bind(window);
      vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
        const style = realGetComputedStyle(el);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === "getPropertyValue") {
              return (name: string) => {
                if (name === "--st-component-diagramScene-edgeLabelSize") return "18px";
                if (name === "--st-component-diagramScene-edgeLabelFontSize") return "14px";
                if (name === "--st-component-diagramScene-containerPadding") return "1.5rem";
                return target.getPropertyValue(name);
              };
            }
            const value = Reflect.get(target, prop);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
      });

      const v1Override = render(hostProps({ ...propsOf(fixture), presentation: { ...fixture.presentation, contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } }));
      await tick();
      await tick();
      const v1Viewport = v1Override.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
      expect(v1Viewport.style.getPropertyValue("--st-diagram-edge-label-size")).toBe("");
      expect(v1Viewport.style.getPropertyValue("--st-diagram-label-line-height")).toBe("24px");
      expect(v1Override.container.querySelector('polyline[data-scene-edge]')).not.toBeNull();
      const geometry = (container: HTMLElement) => Array.from(container.querySelectorAll("[data-scene-occurrence], [data-scene-label]"), (el) => el.getAttribute("style"));
      const legacyGeometry = geometry(v1Override.container);
      vi.restoreAllMocks();
      const legacy = render(hostProps({ ...propsOf(fixture), metrics: { containerPadding: 1.5 } }));
      await tick();
      expect(geometry(legacy.container)).toEqual(legacyGeometry);

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
      const remView = render(hostProps(propsOf(compact)));
      await tick();
      await tick();
      const remViewport = remView.container.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
      expect(remViewport.style.getPropertyValue("--st-diagram-edge-label-size")).toBe("24px");
      vi.restoreAllMocks();

      const explicitView = render(hostProps({
        ...propsOf(compact),
        presentation: { ...fixture.presentation, contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } },
        metrics: { edgeLabelSize: 24, linkStrokeWidth: 4, linkEmphasisStrokeWidth: 5 },
      } as DiagramSceneFigureProps));
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
        layout: (_doc: unknown, options: { previousOrientation?: Record<string, string> }) => {
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

      const container = document.createElement("div");
      document.body.append(container);
      const v1Props = hostProps({ ...propsOf(fixture), layoutCache: spyingCache as never, collapsed: [] } as DiagramSceneFigureProps);
      const v1Wrapper = mount(DiagramSceneFigure, { props: v1Props, attachTo: container });
      mounted.push({ unmount: () => v1Wrapper.unmount(), container });
      await tick();
      expect(seenSeeds.at(-1)).toBeUndefined();
      await v1Wrapper.setProps({ document: { ...fixture.document, revision: fixture.document.revision + 1 } });
      await tick();
      expect(seenSeeds.at(-1)).toEqual({ root: "columns" });

      seenSeeds.length = 0;
      const r7Container = document.createElement("div");
      document.body.append(r7Container);
      const r7Props = hostProps({
        ...propsOf(fixture),
        view: { ...fixture.view, presentation: { ...fixture.view.presentation, anatomy: "v2" } },
        presentation: { ...fixture.presentation, contractPin: { ...DIAGRAM_PRESENTATION_V2_CONTRACT_PIN } },
        layoutCache: spyingCache as never,
        collapsed: [],
      } as DiagramSceneFigureProps);
      const r7Wrapper = mount(DiagramSceneFigure, { props: r7Props, attachTo: r7Container });
      mounted.push({ unmount: () => r7Wrapper.unmount(), container: r7Container });
      await tick();
      expect(seenSeeds.at(-1)).toBeUndefined();
      await r7Wrapper.setProps({ hints: { cardGapX: 120 } });
      await tick();
      expect(seenSeeds.at(-1)).toEqual({ root: "columns" });
    });
  });
}

describe("DiagramSceneFigure numbered flow connectors — Vue", () => {
  it("honors the dashed and dotted link theme overrides on a mixed scene's shafts and legend when flows selects the numbered host", async () => {
    const source = flowFixture(3);
    const fixture = nestedZoneFixture({ outside: true });
    const dashed = fixture.relations[0]!;
    const dotted = fixture.relations[1]!;
    const seed = fixture.view.relationOccurrences[dashed.occurrence]!;
    const flow = relationRef("step");
    const flowOccurrence = occurrenceRef("step");
    const view = render({
      ...propsOf(fixture),
      document: {
        ...fixture.document,
        typeDefinitions: source.document.typeDefinitions,
        relations: { ...fixture.document.relations, [flow]: {
          ...source.document.relations["relation:z"]!, id: flow, endpoints: fixture.document.relations[seed.relation]!.endpoints,
        } },
      },
      view: { ...fixture.view, relationOccurrences: { ...fixture.view.relationOccurrences, [flowOccurrence]: {
        ...seed, id: flowOccurrence, relation: flow,
      } } },
      flows: source.options.flows,
      presentation: {
        ...fixture.presentation,
        contractPin: DIAGRAM_PRESENTATION_V2_CONTRACT_PIN,
        relations: {
          [dashed.occurrence]: { strokeStyle: "dashed" },
          [dotted.occurrence]: { strokeStyle: "dotted" },
        },
      },
    } as DiagramSceneFigureProps);
    view.container.style.setProperty("--st-component-diagramScene-linkDashDashed", "13 4");
    view.container.style.setProperty("--st-component-diagramScene-linkDashDotted", "3 7");
    await tick();
    expect(view.container.querySelector("[data-flow-badge]")).not.toBeNull();
    const dashedShaft = view.container.querySelector<SVGPathElement>(`path[data-scene-edge="${dashed.occurrence}"]`)!;
    const dashedSwatch = view.container.querySelector<SVGPathElement>('path[data-legend-swatch="dashed:arrow:default"]')!;
    for (const path of [dashedShaft, dashedSwatch]) {
      expect.soft(path.style.strokeDasharray).toBe("var(--st-component-diagramScene-linkDashDashed, 8 6)");
    }
    const dottedShaft = view.container.querySelector<SVGPathElement>(`path[data-scene-edge="${dotted.occurrence}"]`)!;
    const dottedSwatch = view.container.querySelector<SVGPathElement>('path[data-legend-swatch="dotted:arrow:default"]')!;
    for (const path of [dottedShaft, dottedSwatch]) {
      expect.soft(path.style.strokeDasharray).toBe("var(--st-component-diagramScene-linkDashDotted, 2 5)");
    }
  });

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

  it("keeps Vue SFC and built dist/styles.css edge stroke aligned with Svelte and arrowheads without mutating src/styles.css (REQ-R7-28)", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const vueBase = readFileSync(resolve(here, "DiagramSceneFigureBase.vue"), "utf8");
    const vueNumbered = readFileSync(resolve(here, "DiagramNumberedScene.vue"), "utf8");
    const svelte = readFileSync(resolve(here, "../../components-svelte/src/lib/DiagramSceneFigure.svelte"), "utf8");
    const baseStyle = vueBase.split("<style>")[1]!.split("</style>")[0]!.trim();

    const edgeRules = (css: string) => [...css.matchAll(/\.st-diagramSceneFigure-edge\s*\{[^}]*\}/g)].map((m) => m[0]);
    const vueEdgeRules = edgeRules(baseStyle);
    expect(vueEdgeRules).toHaveLength(1);
    const svelteEdgeRules = edgeRules(svelte.split("<style>")[1]!.split("</style>")[0]!);
    expect(svelteEdgeRules).toHaveLength(1);
    expect(vueEdgeRules[0]).toBe(svelteEdgeRules[0]);
    expect(vueEdgeRules[0]).toContain("stroke: var(--st-component-diagramScene-edgeStroke, var(--st-semantic-border-strong));");
    expect(baseStyle).toContain('.st-diagramSceneFigure-edge[data-connector-mode="r7"] {');
    expect(baseStyle).toContain("stroke: var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a));");
    expect(svelte).toContain("stroke: var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a));");
    expect(vueBase).toContain(':fill="scene.r7Connectors && !scene.processConnectors ? \'var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))\' : \'var(--st-component-diagramScene-edgeStroke, #64748b)\'"');
    expect(vueNumbered).toContain(':fill="scene.r7Connectors && !scene.processConnectors ? \'var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a))\' : \'var(--st-component-diagramScene-edgeStroke, #64748b)\'"');

    const distPath = resolve(here, "../dist/styles.css");
    if (existsSync(distPath)) {
      const distCss = readFileSync(distPath, "utf8");
      const distEdgeRules = edgeRules(distCss);
      // Built dist/styles.css appends DiagramSceneFigureBase.vue <style> last, supplying edgeStroke + DE-2 rules just like main.
      expect(distEdgeRules.at(-1)).toBe(vueEdgeRules[0]);
      expect(distCss).toContain('.st-diagramSceneFigure-edge[data-connector-mode="r7"]');
      expect(distCss).toContain("stroke: var(--st-component-diagramScene-linkStroke, var(--st-semantic-text-primary, #0f172a));");
    }
  });

  it("DE3-L1a: renders exactly one legend on r7-authored-legend (unfolded and folded) and omits data-authored-legend on v1", async () => {
    const r7 = r7AuthoredLegendFixture(false);
    const props = {
      document: r7.document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: r7.presentation,
      measureLines: flowMeasure,
      collapsed: [],
    } as DiagramSceneFigureProps;
    const view = render(props);
    await tick();
    expect(view.container.querySelectorAll("[data-authored-legend]")).toHaveLength(1);
    expect(view.container.querySelectorAll("[data-scene-legend]")).toHaveLength(0);

    const coreToggle = view.container.querySelector<HTMLButtonElement>('[data-scene-occurrence="occurrence:e.zone-core"] button[aria-expanded="true"]')!;
    await fireEvent.click(coreToggle);
    await tick();
    expect(view.container.querySelectorAll("[data-authored-legend]")).toHaveLength(1);
    expect(view.container.querySelectorAll("[data-scene-legend]")).toHaveLength(0);

    const v1View = render({
      ...props,
      presentation: {
        ...r7.presentation,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities: Object.fromEntries(
          Object.entries(r7.presentation.entities).map(([id, entry]) => {
            const { anatomy: _ignored, ...rest } = entry as { anatomy?: unknown; form: string; text: unknown };
            return [id, rest];
          }),
        ),
        relations: {},
      },
    } as DiagramSceneFigureProps);
    await tick();
    expect(v1View.container.querySelectorAll("[data-authored-legend]")).toHaveLength(0);
    expect(v1View.container.querySelectorAll("[data-scene-legend]")).toHaveLength(0);
  });

  it("D2D M1 feedback & DE3-L1b: paints r7 legend swatches, combined link rows, omits fold toggle on legend, and renders conditional marks", async () => {
    const r7 = r7AuthoredLegendFixture(false);
    const view = render({
      document: r7.document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: r7.presentation,
      measureLines: flowMeasure,
      collapsed: [],
    } as DiagramSceneFigureProps);
    await tick();
    const authored = view.container.querySelector<HTMLElement>("[data-authored-legend]")!;
    expect(authored).not.toBeNull();
    expect(view.container.querySelectorAll('[data-scene-kind="legend-key"] [data-legend-key-swatch]')).toHaveLength(2);
    expect(authored.querySelectorAll("[data-legend-style]").length).toBeGreaterThanOrEqual(2);
    expect(authored.querySelector("button[aria-expanded]")).toBeNull();
    expect(view.container.querySelectorAll('[data-scene-occurrence="occurrence:e.zone-core"] button[aria-expanded]')).toHaveLength(1);

    const v1View = render({
      document: r7.document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: {
        ...r7.presentation,
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities: Object.fromEntries(
          Object.entries(r7.presentation.entities).map(([id, entry]) => {
            const { anatomy: _ignored, ...rest } = entry as { anatomy?: unknown; form: string; text: unknown };
            return [id, rest];
          }),
        ),
        relations: {},
      },
      measureLines: flowMeasure,
      collapsed: [],
    } as DiagramSceneFigureProps);
    await tick();
    expect(v1View.container.querySelectorAll("[data-legend-key-swatch]")).toHaveLength(0);

    const r7Folded = r7ConnectorsFixture(true);
    const markView = render({
      document: r7Folded.document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      collapsed: r7Folded.defaultFolds,
      measureLines: flowMeasure,
      presentation: {
        ...r7Folded.presentation,
        entities: {
          ...r7Folded.presentation.entities,
          "occurrence:e.gateway": { ...(r7Folded.presentation.entities["occurrence:e.gateway"] as Record<string, unknown>), status: "proposed" },
        },
      },
    } as DiagramSceneFigureProps);
    await tick();
    expect(markView.container.querySelector('[data-scene-legend] [data-legend-mark="proposed"]')).not.toBeNull();
    expect(markView.container.querySelector('[data-scene-legend] [data-legend-mark="folded-zone"]')).not.toBeNull();
  });
});
