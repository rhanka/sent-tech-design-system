import { readFileSync } from "node:fs";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MAX_DISPLAY_SCALE,
  DEFAULT_MIN_READABLE_SCALE,
  FIT_WINDOW_HEIGHT_SHARE,
  FIXED_CARD_HEIGHT,
  FIXED_CARD_WIDTH,
  MIN_ZOOM,
  type LayoutResult,
  type LineMeasurer,
  type Rect,
} from "@sentropic/diagram-canvas";
// The profile registry and executor bindings are host inputs of the figure.
// The design-system layering guard keeps `@sentropic/diagram-core` out of this
// package's manifest and bare imports, so the test — acting as the host —
// reads them from the built sibling workspace.
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  m3ProfileRegistry,
  shippedExecutorBindings,
} from "../../../diagram-core/dist/index.js";
import DiagramSceneFigure from "./DiagramSceneFigure.svelte";
import type { DiagramSceneCamera, DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";
import { cardLineMeasurer } from "./diagramCardModel.js";
import {
  layoutScene,
  parseDurationMs,
  parseEasing,
  resolveScene,
  scenePlacement,
  sceneFit,
  ZOOM_STEP_RATIO,
  type SceneDocument,
  type SceneLaidOut,
  type SceneOccurrenceRef,
  type ScenePresentation,
} from "./diagramSceneModel.js";

/* ── scene fixtures ──────────────────────────────────────────────── */

interface CardSpec {
  readonly id: string;
  readonly parent?: string;
  readonly container?: boolean;
}

const occurrence = (id: string): SceneOccurrenceRef => `occurrence:e.${id}` as SceneOccurrenceRef;

function sceneOf(
  name: string,
  cards: readonly CardSpec[],
  links: readonly { readonly from: string; readonly to: string; readonly label?: string }[] = [],
): { document: SceneDocument; presentation: ScenePresentation; hints: NonNullable<DiagramSceneFigureProps["hints"]> } {
  const entities: Record<string, unknown> = {};
  const relations: Record<string, unknown> = {};
  const forms: Record<string, unknown> = {};
  const ordering: Record<string, string[]> = {};
  const rootOrder: string[] = [];
  for (const card of cards) {
    const ref = `entity:${card.id}`;
    entities[ref] = {
      id: ref,
      profile: "generic@2",
      type: card.container === true ? "container" : "node",
      attributes: { name: { kind: "text", value: card.id } },
    };
    forms[occurrence(card.id)] =
      card.container === true
        ? { form: "container", text: { kicker: "ZONE", title: `Zone ${card.id}`, subtitle: "Group" } }
        : { form: "card", text: { kicker: "CARD", title: `Card ${card.id}`, body: "Does one thing" } };
    if (card.parent === undefined) {
      rootOrder.push(ref);
      continue;
    }
    (ordering[`entity:${card.parent}`] ??= []).push(ref);
    relations[`relation:contains.${card.id}`] = {
      id: `relation:contains.${card.id}`,
      profile: "generic@2",
      type: "contains",
      endpoints: [
        { role: "parent", target: `entity:${card.parent}` },
        { role: "child", target: ref },
      ],
      attributes: {},
    };
  }
  for (const link of links) {
    const id = `relation:link.${link.from}.${link.to}`;
    relations[id] = {
      id,
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: `entity:${link.from}` },
        { role: "target", target: `entity:${link.to}` },
      ],
      attributes: link.label === undefined ? {} : { label: { kind: "text", value: link.label } },
    };
  }
  return {
    document: {
      documentId: `document:${name}`,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    } as unknown as SceneDocument,
    presentation: {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: forms,
      legends: {},
      categoryTokens: [],
    } as unknown as ScenePresentation,
    hints: { rootOrder, ordering } as unknown as NonNullable<DiagramSceneFigureProps["hints"]>,
  };
}

const children = (zone: string, count: number): CardSpec[] =>
  Array.from({ length: count }, (_, index) => ({ id: `${zone}${index + 1}`, parent: zone }));

/** Two zones of six cards and one free card, one labelled link: overflows any 16:9 box at 100 %. */
const WIDE = sceneOf(
  "wide",
  [
    { id: "a", container: true },
    ...children("a", 6),
    { id: "b", container: true },
    ...children("b", 6),
    { id: "c" },
  ],
  [{ from: "a1", to: "c", label: "calls" }],
);
const SINGLE = sceneOf("single", [{ id: "solo" }]);
/** Three root cards; the engine places the label of the p → r link. */
const LABELLED = sceneOf("labelled", [{ id: "p" }, { id: "q" }, { id: "r" }], [{ from: "p", to: "r", label: "ok" }]);
const EMPTY = sceneOf("empty", []);

/* ── host stubs: viewW, windowH, tokens, matchMedia ──────────────── */

let viewW = 1280;
let reducedMotion = false;
// jsdom does not inherit custom properties through getComputedStyle, so the
// theme is stubbed where the figure reads it: the computed style of its frame.
let tokens: Record<string, string> = {};
const setToken = (name: string, value: string | undefined): void => {
  if (value === undefined) delete tokens[name];
  else tokens[name] = value;
};
const TOKENS: Record<string, string> = {
  "--st-component-diagramScene-maxDisplayScale": String(DEFAULT_MAX_DISPLAY_SCALE),
  "--st-component-diagramScene-minReadableScale": String(DEFAULT_MIN_READABLE_SCALE),
  "--st-component-diagramScene-transitionDuration": "240ms",
  // Linear on purpose: interpolated rectangles are then exact midpoints.
  "--st-foundation-motion-easing": "cubic-bezier(0.25, 0.25, 0.75, 0.75)",
};

function setWindow(width: number, height: number): void {
  viewW = width;
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

beforeEach(() => {
  setWindow(1280, 720);
  reducedMotion = false;
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => viewW });
  tokens = { ...TOKENS };
  const computed = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    const style = computed(element, pseudo);
    return new Proxy(style, {
      get(target, key) {
        if (key === "getPropertyValue") {
          return (name: string): string => tokens[name] ?? target.getPropertyValue(name);
        }
        const value = Reflect.get(target, key) as unknown;
        return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(target) : value;
      },
    });
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") && reducedMotion,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
});

afterEach(() => {
  vi.useRealTimers();
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  vi.restoreAllMocks();
});

/* ── harness ─────────────────────────────────────────────────────── */

const cardLines = cardLineMeasurer();
/**
 * The shared card measurer, with edge labels at the DC-2a harness size
 * (9 px advance, 20 px line box): at the card body size (24 px) a one-line
 * label plus its margins is taller than the 32 px gutter cap and the engine
 * places none.
 */
const measureLines: LineMeasurer = (request) =>
  request.role === "edge-label"
    ? { lines: [request.text], width: request.text.length * 9, height: 20, overflow: false }
    : cardLines(request);

function mount(
  scene: ReturnType<typeof sceneOf>,
  extra: Partial<DiagramSceneFigureProps> = {},
) {
  const layouts: LayoutResult[] = [];
  const cameras: DiagramSceneCamera[] = [];
  const counting = vi.fn(measureLines);
  const result = render(DiagramSceneFigure, {
    props: {
      document: scene.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: scene.presentation,
      hints: scene.hints,
      measureLines: counting,
      title: "Scene",
      onLayout: (layout: LayoutResult) => layouts.push(layout),
      onCameraChange: (camera: DiagramSceneCamera) => cameras.push(camera),
      ...extra,
    },
  });
  const root = result.container;
  const figure = root.querySelector("figure") as HTMLElement;
  const viewport = root.querySelector(".st-diagramSceneFigure-viewport") as HTMLElement;
  const world = root.querySelector(".st-diagramSceneFigure-world") as HTMLElement;
  const button = (name: string): HTMLButtonElement =>
    [...root.querySelectorAll("button")].find(
      (candidate) => candidate.getAttribute("aria-label") === name || candidate.textContent?.trim() === name,
    ) as HTMLButtonElement;
  const zoom = (): number => Number(figure.dataset["zoom"]);
  const readout = (): string => (root.querySelector("output")?.textContent ?? "").trim();
  const rectOf = (id: string): Rect => {
    const node = [...root.querySelectorAll<HTMLElement>("[data-scene-occurrence]")].find(
      (candidate) => candidate.dataset["sceneOccurrence"] === occurrence(id),
    );
    if (node === undefined) throw new Error(`no node drawn for ${id}`);
    return {
      x: parseFloat(node.style.left),
      y: parseFloat(node.style.top),
      width: parseFloat(node.style.width),
      height: parseFloat(node.style.height),
    };
  };
  const drawn = (): string[] =>
    [...root.querySelectorAll<HTMLElement>("[data-scene-occurrence]")].map(
      (candidate) => candidate.dataset["sceneOccurrence"] ?? "",
    );
  const toggle = (zone: string): HTMLButtonElement => {
    const node = [...root.querySelectorAll<HTMLElement>("[data-scene-occurrence]")].find(
      (candidate) => candidate.dataset["sceneOccurrence"] === occurrence(zone),
    );
    return node?.querySelector("button[aria-expanded]") as HTMLButtonElement;
  };
  const lastLayout = (): SceneLaidOut => {
    const last = layouts[layouts.length - 1];
    if (last === undefined || last.status !== "laid-out") throw new Error("no laid-out result");
    return last;
  };
  return { ...result, root, figure, viewport, world, button, zoom, readout, rectOf, drawn, toggle, layouts, cameras, counting, lastLayout };
}

/** The scene model the engine emits for a fixture and fold state, with no figure involved. */
function modelOf(scene: ReturnType<typeof sceneOf>, collapsed: readonly string[] = []) {
  const input = {
    document: scene.document,
    registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
    bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
    presentation: scene.presentation,
    hints: scene.hints,
    measureLines,
    collapsed: collapsed.map(occurrence),
  };
  const result = layoutScene(input);
  if (result.status !== "laid-out") throw new Error(JSON.stringify(result.refusals));
  return { result, model: resolveScene(result, input) };
}

const resize = async (width: number, height: number): Promise<void> => {
  setWindow(width, height);
  window.dispatchEvent(new Event("resize"));
  await tick();
};

/* ── camera ──────────────────────────────────────────────────────── */

describe("DiagramSceneFigure camera", () => {
  it("Z-8 initial camera is the host fit of the scene bounds, never the layout fit.zoom", async () => {
    const view = mount(WIDE);
    await tick();
    const { result, model } = modelOf(WIDE);
    const fit = sceneFit({ bounds: model.bounds!, viewWidth: 1280, windowHeight: 720 });
    expect(view.zoom()).toBe(fit.zoom);
    // The layout report is floored at MIN_ZOOM (0.75) and written into the
    // emitted view camera: the host reads neither.
    expect(result.fit.zoom).toBeGreaterThanOrEqual(MIN_ZOOM);
    expect(result.view.presentation.camera.zoom).toBe(result.fit.zoom);
    expect(view.zoom()).toBeLessThan(result.fit.zoom);
    expect(view.zoom()).toBeLessThanOrEqual(DEFAULT_MAX_DISPLAY_SCALE);
  });

  it("Z-1 / AC-13 zoom clamps at MAX_DISPLAY_SCALE through buttons, keys, wheel and setZoom; zoom-in is disabled at the cap", async () => {
    const view = mount(SINGLE);
    await tick();
    // A single card fits: the camera already sits at the cap.
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(view.button("Zoom in").disabled).toBe(true);
    await fireEvent.keyDown(view.viewport, { key: "+" });
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    await fireEvent.wheel(view.viewport, { ctrlKey: true, deltaY: -4000 });
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    view.component.setZoom(3);
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    view.component.setZoom(Number.POSITIVE_INFINITY);
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);

    const wide = mount(WIDE);
    await tick();
    for (let step = 0; step < 40; step += 1) {
      if (wide.button("Zoom in").disabled) break;
      await fireEvent.click(wide.button("Zoom in"));
    }
    expect(wide.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(wide.button("Zoom in").disabled).toBe(true);
    expect(wide.button("Zoom out").disabled).toBe(false);
  });

  it("Z-1 / Z-2 a two-finger pinch zooms inside the same range", async () => {
    const view = mount(WIDE);
    await tick();
    const touch = (type: string, pointerId: number, clientX: number): Event =>
      Object.assign(new Event(type, { bubbles: true, cancelable: true }), { pointerId, pointerType: "touch", clientX, clientY: 0 });
    view.viewport.dispatchEvent(touch("pointerdown", 1, 0));
    view.viewport.dispatchEvent(touch("pointerdown", 2, 100));
    // Spread far beyond the cap: clamped.
    view.viewport.dispatchEvent(touch("pointermove", 2, 5000));
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    // Pinch far below the fit: clamped at the lower bound.
    view.viewport.dispatchEvent(touch("pointermove", 2, 1));
    await tick();
    expect(view.zoom()).toBe(view.component.getCamera().minZoom);
    view.viewport.dispatchEvent(touch("pointerup", 2, 1));
    view.viewport.dispatchEvent(touch("pointerup", 1, 0));
    // One finger alone scrolls and never zooms.
    view.viewport.dispatchEvent(touch("pointerdown", 3, 0));
    view.viewport.dispatchEvent(touch("pointermove", 3, 400));
    await tick();
    expect(view.zoom()).toBe(view.component.getCamera().minZoom);
  });

  it("AC-22 at readout 100 % a card renders at 460 × 200 × MAX_DISPLAY_SCALE, never at its natural size", async () => {
    const view = mount(SINGLE);
    await tick();
    expect(view.readout()).toBe("100 %");
    const rect = view.rectOf("solo");
    expect(rect.width).toBe(FIXED_CARD_WIDTH);
    expect(rect.height).toBe(FIXED_CARD_HEIGHT);
    // Geometry is untouched; the scale is the world transform alone.
    expect(view.world.style.transform).toContain(`scale(${DEFAULT_MAX_DISPLAY_SCALE})`);
    expect(rect.width * view.zoom()).toBeCloseTo(285.2, 5);
    expect(rect.height * view.zoom()).toBeCloseTo(124, 5);
    expect(view.viewport.style.getPropertyValue("--st-diagram-zoom")).toBe(String(DEFAULT_MAX_DISPLAY_SCALE));
  });

  it("Z-5 readout is round(zoom / MAX_DISPLAY_SCALE × 100), exposed with an accessible name", async () => {
    const view = mount(WIDE, { labels: { zoomLevel: (percent) => `Zoom à ${percent} %` } });
    await tick();
    const expected = Math.round((view.zoom() / DEFAULT_MAX_DISPLAY_SCALE) * 100);
    expect(expected).toBeLessThan(100);
    expect(view.readout()).toBe(`${expected} %`);
    expect(view.figure.dataset["zoomReadout"]).toBe(String(expected));
    expect(view.root.querySelector("output")?.getAttribute("aria-label")).toBe(`Zoom à ${expected} %`);
  });

  it("Z-2 / AC-14 zoom-out reaches zoomFit by control, key and Ctrl+wheel, then disables; no state offers zoom-in only", async () => {
    const view = mount(WIDE);
    await tick();
    view.component.setZoom(DEFAULT_MAX_DISPLAY_SCALE);
    await tick();
    const { model } = modelOf(WIDE);
    const fit = sceneFit({ bounds: model.bounds!, viewWidth: 1280, windowHeight: 720 });
    expect(view.button("Zoom out").disabled).toBe(false);
    await fireEvent.click(view.button("Zoom out"));
    expect(view.zoom()).toBeCloseTo(DEFAULT_MAX_DISPLAY_SCALE / ZOOM_STEP_RATIO, 10);
    await fireEvent.keyDown(view.viewport, { key: "-" });
    expect(view.zoom()).toBeCloseTo(Math.max(fit.minZoom, DEFAULT_MAX_DISPLAY_SCALE / ZOOM_STEP_RATIO ** 2), 10);
    await fireEvent.wheel(view.viewport, { ctrlKey: true, deltaY: 100000 });
    expect(view.zoom()).toBe(fit.minZoom);
    expect(view.button("Zoom out").disabled).toBe(true);
    expect(view.button("Zoom in").disabled).toBe(false);
    // A plain wheel scrolls and never zooms.
    await fireEvent.wheel(view.viewport, { deltaY: -4000 });
    expect(view.zoom()).toBe(fit.minZoom);
  });

  it("Z-3 / AC-23 fit frames the drawing on both axes of the fit box min(viewW·9/16, 0.85·windowH) × viewW, centred", async () => {
    const view = mount(WIDE);
    await tick();
    const { model } = modelOf(WIDE);
    const bounds = model.bounds!;
    for (const [width, height] of [
      [1920, 1080],
      [1280, 720],
      // A short window: 0.85 × windowH is the tighter side of the fit box.
      [1600, 500],
    ] as const) {
      await resize(width, height);
      view.component.setZoom(DEFAULT_MAX_DISPLAY_SCALE);
      await tick();
      await fireEvent.click(view.button("Fit"));
      const fitHeight = Math.min((width * 9) / 16, FIT_WINDOW_HEIGHT_SHARE * height);
      const raw = Math.min(width / bounds.width, fitHeight / bounds.height, DEFAULT_MAX_DISPLAY_SCALE);
      expect(view.viewport.style.height).toBe(`${fitHeight}px`);
      // BF-2: the fit holds at the readability floor.
      expect(view.zoom()).toBeCloseTo(Math.max(raw, DEFAULT_MIN_READABLE_SCALE), 12);
      expect(view.zoom()).toBeLessThanOrEqual(DEFAULT_MAX_DISPLAY_SCALE);
      const placed = scenePlacement(bounds, view.zoom(), { fitWidth: width, fitHeight });
      expect(view.world.style.transform).toBe(
        `translate(${placed.translateX}px,${placed.translateY}px) scale(${view.zoom()})`,
      );
      if (raw >= DEFAULT_MIN_READABLE_SCALE) {
        // Whole drawing inside the box, centred on both axes.
        expect(bounds.width * view.zoom()).toBeLessThanOrEqual(width + 1e-6);
        expect(bounds.height * view.zoom()).toBeLessThanOrEqual(fitHeight + 1e-6);
        expect(placed.translateX + bounds.x * view.zoom()).toBeCloseTo((width - bounds.width * view.zoom()) / 2, 6);
        expect(placed.translateY + bounds.y * view.zoom()).toBeCloseTo((fitHeight - bounds.height * view.zoom()) / 2, 6);
        expect(view.viewport.dataset["pans"]).toBe("false");
      } else {
        // Below the floor the box keeps its size and scrolls from its start.
        expect(view.viewport.dataset["pans"]).toBe("true");
        expect(view.viewport.scrollLeft).toBe(0);
        expect(view.viewport.scrollTop).toBe(0);
      }
    }
  });

  it("BF-7 the fit bbox is the scene bounds united with the engine's emitted label boxes", async () => {
    const { result, model } = modelOf(LABELLED);
    expect(result.warnings.filter((warning) => warning.code === "label-unplaced")).toEqual([]);
    expect(model.labels.map((entry) => entry.lines)).toEqual([["ok"]]);
    expect(Object.fromEntries(model.labels.map((entry) => [entry.occurrence, entry.box]))).toEqual(result.labelBoxes);
    const bounds = model.bounds!;
    const inside = (box: Rect): void => {
      expect(box.x).toBeGreaterThanOrEqual(bounds.x);
      expect(box.y).toBeGreaterThanOrEqual(bounds.y);
      expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    };
    for (const node of model.nodes) inside(node.rect);
    for (const entry of model.labels) inside(entry.box);
    for (const edge of model.edges) for (const point of edge.points) inside({ ...point, width: 0, height: 0 });
    // The host never draws a label the engine reported unplaced, in any fold state.
    for (const folds of [[], ["a"], ["a", "b"]]) {
      const folded = modelOf(WIDE, folds);
      const unplaced = folded.result.warnings.filter((warning) => warning.code === "label-unplaced").length;
      expect(folded.model.labels.length).toBe(1 - unplaced);
      expect(Object.fromEntries(folded.model.labels.map((entry) => [entry.occurrence, entry.box]))).toEqual(folded.result.labelBoxes);
    }
    // The figure draws the label at its box and fits that same bbox.
    const view = mount(LABELLED);
    await tick();
    const drawnLabel = view.root.querySelector("[data-scene-label]") as HTMLElement;
    expect(drawnLabel.textContent?.trim()).toBe("ok");
    expect(parseFloat(drawnLabel.style.left)).toBe(model.labels[0]!.box.x);
    expect(parseFloat(drawnLabel.style.top)).toBe(model.labels[0]!.box.y);
    expect(view.root.querySelectorAll("polyline[data-scene-edge]").length).toBe(1);
    expect(view.zoom()).toBe(sceneFit({ bounds, viewWidth: 1280, windowHeight: 720 }).zoom);
  });

  it("Z-4 reset returns to fit: the fit control and the 0 key share one action", async () => {
    const view = mount(WIDE);
    await tick();
    const fitZoom = view.zoom();
    await fireEvent.click(view.button("Zoom in"));
    expect(view.zoom()).toBeGreaterThan(fitZoom);
    await fireEvent.click(view.button("Fit"));
    expect(view.zoom()).toBe(fitZoom);
    await fireEvent.click(view.button("Zoom in"));
    await fireEvent.keyDown(view.viewport, { key: "0" });
    expect(view.zoom()).toBe(fitZoom);
    expect(view.component.getCamera().fitZoom).toBe(fitZoom);
  });

  it("empty scene fits at 100 %", async () => {
    const view = mount(EMPTY);
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(view.readout()).toBe("100 %");
    expect(view.drawn()).toEqual([]);
    expect(view.button("Zoom in").disabled).toBe(true);
    expect(view.button("Zoom out").disabled).toBe(true);
  });

  it("Z-6 / AC-15 zoom, fit and reset run no layout and change no rectangle or orientation", async () => {
    const view = mount(WIDE);
    await tick();
    const layoutsBefore = view.layouts.length;
    const measuresBefore = view.counting.mock.calls.length;
    const rectsBefore = view.drawn().map((id) => [id, view.rectOf(id.replace("occurrence:e.", ""))]);
    const orientations = view.lastLayout().orientations;
    await fireEvent.click(view.button("Zoom in"));
    await fireEvent.click(view.button("Zoom out"));
    await fireEvent.keyDown(view.viewport, { key: "+" });
    await fireEvent.wheel(view.viewport, { ctrlKey: true, deltaY: 300 });
    view.component.setZoom(0.5);
    await tick();
    await fireEvent.click(view.button("Fit"));
    await resize(1024, 768);
    expect(view.layouts.length).toBe(layoutsBefore);
    // No layout, and no label replay either: the measurer is never called.
    expect(view.counting.mock.calls.length).toBe(measuresBefore);
    expect(view.drawn().map((id) => [id, view.rectOf(id.replace("occurrence:e.", ""))])).toEqual(rectsBefore);
    expect(view.lastLayout().orientations).toEqual(orientations);
  });

  it("Z-7 a fold relayout reclamps the zoom into the new range; a zoom inside the range is preserved", async () => {
    reducedMotion = true;
    setWindow(800, 600);
    const view = mount(WIDE, { defaultFolds: [occurrence("a"), occurrence("b")] });
    await tick();
    // Folded, three cards fit at the cap.
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    await fireEvent.click(view.toggle("a"));
    await tick();
    // The cap is inside the unfolded range: preserved, the drawing now pans.
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(view.viewport.dataset["pans"]).toBe("true");
    // One fit activation after the overflowing unfold reframes it.
    await fireEvent.click(view.button("Fit"));
    const unfoldedFit = view.zoom();
    expect(unfoldedFit).toBeLessThan(DEFAULT_MAX_DISPLAY_SCALE);
    // Zoom out to the lower bound of the unfolded range, then fold back: the
    // folded range is the single point [cap, cap], so the zoom clamps up.
    view.component.setZoom(0);
    await tick();
    expect(view.zoom()).toBe(view.component.getCamera().minZoom);
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.component.getCamera().minZoom).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
  });

  it("reclamps on resize: a camera at the fit follows the new fit box, any other zoom is clamped", async () => {
    const view = mount(WIDE);
    await tick();
    const { model } = modelOf(WIDE);
    await resize(800, 720);
    expect(view.zoom()).toBe(sceneFit({ bounds: model.bounds!, viewWidth: 800, windowHeight: 720 }).zoom);
    // Lower bound of the narrow range, then a wider frame: clamped up to the new lower bound.
    view.component.setZoom(0);
    await tick();
    const narrowMin = view.zoom();
    await resize(1920, 1080);
    const wide = sceneFit({ bounds: model.bounds!, viewWidth: 1920, windowHeight: 1080 });
    expect(wide.minZoom).toBeGreaterThan(narrowMin);
    expect(view.zoom()).toBe(wide.minZoom);
  });

  it("resolves the camera cap from the maxDisplayScale token (AC-6)", async () => {
    setToken("--st-component-diagramScene-maxDisplayScale", "0.5");
    const view = mount(SINGLE);
    await tick();
    expect(view.zoom()).toBe(0.5);
    expect(view.readout()).toBe("100 %");
  });
});

/* ── folds and orientation feedback ──────────────────────────────── */

describe("DiagramSceneFigure folds", () => {
  it("re-runs the whole layout on a fold and feeds the emitted orientation record back (O-4)", async () => {
    reducedMotion = true;
    const view = mount(WIDE);
    await tick();
    expect(view.layouts.length).toBe(1);
    const first = view.lastLayout();
    expect(Object.keys(first.orientations ?? {})).toContain("root");
    expect(view.drawn()).toContain(occurrence("a1"));

    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.layouts.length).toBe(2);
    expect(view.drawn()).not.toContain(occurrence("a1"));
    expect(view.rectOf("a")).toMatchObject({ width: FIXED_CARD_WIDTH, height: FIXED_CARD_HEIGHT });
    // The second pass equals an engine call fed the first record …
    const input = {
      document: WIDE.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: WIDE.presentation,
      hints: WIDE.hints,
      measureLines,
      collapsed: [occurrence("a")],
    };
    const fed = layoutScene({ ...input, previousOrientation: first.orientations! });
    expect(view.lastLayout().orientations).toEqual((fed as SceneLaidOut).orientations);
    expect(view.lastLayout().view.entityOccurrences).toEqual((fed as SceneLaidOut).view.entityOccurrences);

    // … and a cycle A → ∅ → A keeps every level's orientation (fixed point, O-5).
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.lastLayout().orientations).toEqual(first.orientations);
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.lastLayout().orientations).toEqual((fed as SceneLaidOut).orientations);
    expect(view.layouts.length).toBe(4);
  });

  it("passes previousOrientation to the engine: a level inside the hysteresis band keeps its previous orientation", () => {
    const input = {
      document: WIDE.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: WIDE.presentation,
      hints: WIDE.hints,
      measureLines,
      collapsed: [] as SceneOccurrenceRef[],
      // A band wider than any score gap: the previous value always wins.
      rowPack: { orientationHysteresis: 1e6 },
    };
    const free = layoutScene(input) as SceneLaidOut;
    const flipped = Object.fromEntries(
      Object.entries(free.orientations ?? {}).map(([key, value]) => [key, value === "rows" ? "columns" : "rows"]),
    ) as Record<string, "rows" | "columns">;
    const held = layoutScene({ ...input, previousOrientation: flipped }) as SceneLaidOut;
    const multi = Object.keys(flipped).filter((key) => held.orientations?.[key] === flipped[key]);
    expect(multi.length).toBeGreaterThan(0);
    expect(held.orientations?.["root"]).toBe(flipped["root"]);
  });

  it("is controllable: `collapsed` drives the folds and onFoldChange reports the request", async () => {
    reducedMotion = true;
    const changes: unknown[] = [];
    const view = mount(WIDE, {
      collapsed: [occurrence("b")],
      onFoldChange: (next, change) => changes.push([next, change]),
    });
    await tick();
    expect(view.drawn()).not.toContain(occurrence("b1"));
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(changes).toEqual([[[occurrence("b"), occurrence("a")], { occurrence: occurrence("a"), collapsed: true }]]);
    // Controlled: nothing folds until the host passes the new state.
    expect(view.drawn()).toContain(occurrence("a1"));
    await view.rerender({ collapsed: [occurrence("b"), occurrence("a")] });
    expect(view.drawn()).not.toContain(occurrence("a1"));
  });

  it("names every control and returns the focus to the toggle after a fold", async () => {
    reducedMotion = true;
    const view = mount(WIDE, {
      label: "Architecture",
      labels: { zoomIn: "Zoomer", zoomOut: "Dézoomer", fit: "Ajuster", controls: "Caméra", viewport: "Schéma", collapse: (title) => `Replier ${title}`, expand: (title) => `Déplier ${title}` },
    });
    await tick();
    expect(view.figure.getAttribute("aria-label")).toBe("Architecture");
    expect(view.root.querySelector('[role="group"][aria-label="Caméra"]')).not.toBeNull();
    expect(view.button("Zoomer").tagName).toBe("BUTTON");
    expect(view.button("Dézoomer").tagName).toBe("BUTTON");
    expect(view.button("Ajuster").tagName).toBe("BUTTON");
    expect(view.viewport.getAttribute("aria-label")).toBe("Schéma");
    expect(view.viewport.tabIndex).toBe(0);
    expect(view.toggle("a").getAttribute("aria-label")).toBe("Replier Zone a");
    await fireEvent.click(view.toggle("a"));
    await tick();
    await tick();
    expect(view.toggle("a").getAttribute("aria-label")).toBe("Déplier Zone a");
    expect(document.activeElement).toBe(view.toggle("a"));
  });
});

/* ── transition ──────────────────────────────────────────────────── */

describe("DiagramSceneFigure transition", () => {
  const mid = (from: Rect, to: Rect, share: number): Rect => ({
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
    width: from.width + (to.width - from.width) * share,
    height: from.height + (to.height - from.height) * share,
  });
  const expectRect = (actual: Rect, expected: Rect): void => {
    for (const key of ["x", "y", "width", "height"] as const) expect(actual[key]).toBeCloseTo(expected[key], 6);
  };

  it("T-1 / T-2 / AC-18 interpolates from the previous to the new rectangles over the transitionDuration token, then lands on the layout output", async () => {
    vi.useFakeTimers();
    const view = mount(WIDE);
    await tick();
    const before = modelOf(WIDE).model;
    const after = modelOf(WIDE, ["a"]).model;
    const rectIn = (model: typeof before, id: string): Rect =>
      model.nodes.find((node) => node.occurrence === occurrence(id))!.rect;
    // The folded zone changes size even when the frozen shelves keep sibling positions.
    expect(rectIn(before, "a")).not.toEqual(rectIn(after, "a"));
    expectRect(view.rectOf("a"), rectIn(before, "a"));

    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");
    // First frame: still the previous rectangles, never a jump.
    expectRect(view.rectOf("a"), rectIn(before, "a"));

    await vi.advanceTimersByTimeAsync(120);
    await tick();
    const elapsed = 120 / 240;
    // Frames tick every 16 ms: the last one before 120 ms is at 112 ms.
    const shown = view.rectOf("a");
    const low = mid(rectIn(before, "a"), rectIn(after, "a"), 96 / 240);
    const high = mid(rectIn(before, "a"), rectIn(after, "a"), elapsed);
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(shown[key]).toBeGreaterThanOrEqual(Math.min(low[key], high[key]) - 1e-6);
      expect(shown[key]).toBeLessThanOrEqual(Math.max(low[key], high[key]) + 1e-6);
    }
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");

    await vi.advanceTimersByTimeAsync(200);
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("false");
    for (const node of after.nodes) {
      expect(view.rectOf(node.occurrence.replace("occurrence:e.", ""))).toEqual(node.rect);
    }
  });

  it("T-2 the duration follows the token value, not a host literal", async () => {
    vi.useFakeTimers();
    setToken("--st-component-diagramScene-transitionDuration", "1000ms");
    const view = mount(WIDE);
    await tick();
    await fireEvent.click(view.toggle("a"));
    await tick();
    await vi.advanceTimersByTimeAsync(600);
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");
    await vi.advanceTimersByTimeAsync(500);
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("false");
  });

  it("T-3 under prefers-reduced-motion the new geometry applies at once, equal to the animated end state", async () => {
    vi.useFakeTimers();
    reducedMotion = true;
    const view = mount(WIDE);
    await tick();
    const after = modelOf(WIDE, ["a"]).model;
    const frames = vi.spyOn(window, "requestAnimationFrame");
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("false");
    // No frame is requested: no interpolation, no sequencing.
    expect(frames).not.toHaveBeenCalled();
    for (const node of after.nodes) {
      expect(view.rectOf(node.occurrence.replace("occurrence:e.", ""))).toEqual(node.rect);
    }
    // The preference is read at toggle time: turning it off animates the next toggle.
    reducedMotion = false;
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");
  });

  it("T-4 a toggle during a transition retargets from the displayed rectangles to the newest geometry", async () => {
    vi.useFakeTimers();
    const view = mount(WIDE);
    await tick();
    const unfolded = modelOf(WIDE).model;
    const rectIn = (id: string): Rect => unfolded.nodes.find((node) => node.occurrence === occurrence(id))!.rect;
    await fireEvent.click(view.toggle("a"));
    await tick();
    await vi.advanceTimersByTimeAsync(120);
    await tick();
    const displayed = view.rectOf("a");
    expect(displayed).not.toEqual(rectIn("a"));

    // Unfold again mid-way: the start is what was on screen, not a stale target.
    await fireEvent.click(view.toggle("a"));
    await tick();
    expectRect(view.rectOf("a"), displayed);
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");
    // A full token duration from the retarget, then the unfolded layout exactly.
    await vi.advanceTimersByTimeAsync(200);
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("true");
    await vi.advanceTimersByTimeAsync(100);
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("false");
    for (const node of unfolded.nodes) {
      expect(view.rectOf(node.occurrence.replace("occurrence:e.", ""))).toEqual(node.rect);
    }
    // No stale-target queue: once settled, no further frame is requested.
    const frames = vi.spyOn(window, "requestAnimationFrame");
    await vi.advanceTimersByTimeAsync(500);
    expect(frames).not.toHaveBeenCalled();
  });

  it("applies instantly when the duration token is absent (no host duration literal)", async () => {
    vi.useFakeTimers();
    setToken("--st-component-diagramScene-transitionDuration", undefined);
    const view = mount(WIDE);
    await tick();
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.viewport.getAttribute("aria-busy")).toBe("false");
  });

  it("reads durations and easings as token values", () => {
    expect(parseDurationMs("240ms")).toBe(240);
    expect(parseDurationMs("0.24s")).toBe(240);
    expect(parseDurationMs("0ms")).toBe(0);
    expect(parseDurationMs(undefined)).toBe(0);
    expect(parseDurationMs("fast")).toBe(0);
    const easeOut = parseEasing("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    // Ease-out: ahead of linear at the midpoint, monotonic.
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
    expect(easeOut(0.75)).toBeGreaterThanOrEqual(easeOut(0.5));
    expect(parseEasing(undefined)(0.3)).toBe(0.3);
    expect(parseEasing("ease")(0.3)).toBe(0.3);
  });
});

/* ── M1 production measurer and readability floor (BF-6) ─────── */

describe("M1 production edge labels (BF-6) and readability floor", () => {
  const productionLines = cardLineMeasurer();
  const edgeSample = (text: string): { readonly height: number } =>
    productionLines({ text, role: "edge-label", availableWidth: 400, allocatedLines: 1, folded: false });

  const tokenSource = (): string => {
    for (const candidate of [
      "../tokens/src/component.ts",
      "packages/tokens/src/component.ts",
      "/home/antoinefa/src/sent-tech-design-system/.dc2a-l4-wt/packages/tokens/src/component.ts",
    ]) {
      try {
        return readFileSync(candidate, "utf8");
      } catch {
        continue;
      }
    }
    throw new Error("tokens component.ts not found from DiagramSceneFigure.test.ts");
  };

  function productionModelOf(scene: ReturnType<typeof sceneOf>) {
    const input = {
      document: scene.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: scene.presentation,
      hints: scene.hints,
      measureLines: productionLines,
      collapsed: [] as SceneOccurrenceRef[],
    };
    const result = layoutScene(input);
    if (result.status !== "laid-out") throw new Error(JSON.stringify(result.refusals));
    return { result, model: resolveScene(result, input) };
  }

  function mountDefault(scene: ReturnType<typeof sceneOf>, extra: Partial<DiagramSceneFigureProps> = {}) {
    const layouts: LayoutResult[] = [];
    const cameras: DiagramSceneCamera[] = [];
    const result = render(DiagramSceneFigure, {
      props: {
        document: scene.document,
        registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
        bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
        presentation: scene.presentation,
        hints: scene.hints,
        title: "Scene",
        onLayout: (layout: LayoutResult) => layouts.push(layout),
        onCameraChange: (camera: DiagramSceneCamera) => cameras.push(camera),
        ...extra,
      },
    });
    const root = result.container;
    const figure = root.querySelector("figure") as HTMLElement;
    const viewport = root.querySelector(".st-diagramSceneFigure-viewport") as HTMLElement;
    const world = root.querySelector(".st-diagramSceneFigure-world") as HTMLElement;
    const lastLayout = (): SceneLaidOut => {
      const last = layouts[layouts.length - 1];
      if (last === undefined || last.status !== "laid-out") throw new Error("no laid-out result");
      return last;
    };
    return { ...result, root, figure, viewport, world, layouts, cameras, lastLayout };
  }

  it("edge-label measures at the 18px token line box, fitting the 32px cap", () => {
    expect(tokenSource()).toContain('edgeLabelFontSize: "18px"');
    expect(tokenSource()).toContain('edgeLabelLineHeight: "22px"');
    expect(edgeSample("ok").height).toBe(22);
    expect(edgeSample("ok").height + 2 * 4).toBeLessThanOrEqual(32);
    expect(18 * DEFAULT_MIN_READABLE_SCALE).toBeGreaterThanOrEqual(8);
  });

  it("LABELLED and WIDE draw the engine placed set with the default measurer, readable at fit and at 100%", async () => {
    // LABELLED fits its one-line label in the capped gutter at 18px (BF-6):
    // no unplaced warning, one drawn label, readable at fit and at 100 %.
    {
      const { result, model } = productionModelOf(LABELLED);
      expect(result.warnings.filter((warning) => warning.code === "label-unplaced")).toEqual([]);
      expect(model.labels.length).toBeGreaterThan(0);
      const view = mountDefault(LABELLED);
      await tick();
      expect(view.root.querySelectorAll("[data-scene-label]").length).toBe(model.labels.length);
      for (const entry of model.labels) {
        const label = view.root.querySelector(`[data-scene-label="${entry.occurrence}"]`) as HTMLElement | null;
        expect(label).not.toBeNull();
        expect(parseFloat(label!.style.left)).toBe(entry.box.x);
        expect(parseFloat(label!.style.top)).toBe(entry.box.y);
        expect(entry.box.height * view.component.getCamera().zoom).toBeGreaterThanOrEqual(8);
        expect(18 * view.component.getCamera().zoom).toBeGreaterThanOrEqual(8);
      }
      view.component.setZoom(view.component.getCamera().maxZoom);
      await tick();
      expect(view.root.querySelector("output")?.textContent?.trim()).toBe("100 %");
      for (const entry of model.labels) {
        expect(18 * view.component.getCamera().zoom).toBeGreaterThanOrEqual(8);
      }
    }
    // WIDE proves the default path is mounted (no stub): the figure draws
    // exactly the engine's placed set with the production measurer. Its
    // "calls" bridge still needs the L2/L3 route work, so no placement count
    // is pinned here — parity plus readability of whatever is placed.
    {
      const { model } = productionModelOf(WIDE);
      const view = mountDefault(WIDE);
      await tick();
      expect(view.root.querySelectorAll("[data-scene-label]").length).toBe(model.labels.length);
      for (const entry of model.labels) {
        const label = view.root.querySelector(`[data-scene-label="${entry.occurrence}"]`) as HTMLElement | null;
        expect(label).not.toBeNull();
        expect(parseFloat(label!.style.left)).toBe(entry.box.x);
        expect(parseFloat(label!.style.top)).toBe(entry.box.y);
        expect(entry.box.height * view.component.getCamera().zoom).toBeGreaterThanOrEqual(8);
        expect(18 * view.component.getCamera().zoom).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it("host turns row-pack ON by default: no rowPack prop still packs rows with orientations", async () => {
    const view = mountDefault(LABELLED);
    await tick();
    expect(Object.keys(view.lastLayout().orientations ?? {})).toContain("root");
    const base = {
      document: LABELLED.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: LABELLED.presentation,
      hints: LABELLED.hints,
      measureLines: productionLines,
      collapsed: [] as SceneOccurrenceRef[],
    };
    const implicit = layoutScene(base) as SceneLaidOut;
    const explicit = layoutScene({ ...base, rowPack: {} }) as SceneLaidOut;
    expect(implicit.orientations).toEqual(explicit.orientations);
  });
});

/* ── cheap Minors: m2 hysteresis band, m3 token re-read, m4 paint order, m5 a11y, m6 viewport width ── */

describe("DiagramSceneFigure cheap minors", () => {
  it("m2 hysteresis band: a zero band switches back to free while a huge band holds the flip", () => {
    const base = {
      document: WIDE.document,
      registry: m3ProfileRegistry as DiagramSceneFigureProps["registry"],
      bindings: shippedExecutorBindings as DiagramSceneFigureProps["bindings"],
      presentation: WIDE.presentation,
      hints: WIDE.hints,
      measureLines,
      collapsed: [] as SceneOccurrenceRef[],
    };
    const free = layoutScene({ ...base, rowPack: { orientationHysteresis: 0 } }) as SceneLaidOut;
    const flipped = Object.fromEntries(
      Object.entries(free.orientations ?? {}).map(([key, value]) => [key, value === "rows" ? "columns" : "rows"]),
    ) as Record<string, "rows" | "columns">;
    // Zero band: any score gap switches back to the free orientation.
    const switched = layoutScene({
      ...base,
      rowPack: { orientationHysteresis: 0 },
      previousOrientation: flipped,
    }) as SceneLaidOut;
    expect(switched.orientations).toEqual(free.orientations);
    // Huge band: the flipped record is held (plumbing proof at the default path).
    const held = layoutScene({
      ...base,
      rowPack: { orientationHysteresis: 1e6 },
      previousOrientation: flipped,
    }) as SceneLaidOut;
    expect(held.orientations?.["root"]).toBe(flipped["root"]);
  });

  it("m3 re-reads camera tokens before setZoom/fitToFrame (post-mount theme change)", async () => {
    const view = mount(SINGLE);
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
    setToken("--st-component-diagramScene-maxDisplayScale", "0.5");
    view.component.setZoom(3);
    await tick();
    expect(view.zoom()).toBe(0.5);
    expect(view.button("Zoom in").disabled).toBe(true);
    setToken("--st-component-diagramScene-maxDisplayScale", "0.62");
    view.component.fitToFrame();
    await tick();
    expect(view.zoom()).toBe(DEFAULT_MAX_DISPLAY_SCALE);
  });

  it("m4 edges paint before nodes and labels last", async () => {
    const view = mount(LABELLED);
    await tick();
    const world = view.root.querySelector(".st-diagramSceneFigure-world") as HTMLElement;
    const order = [...world.children];
    const edgeIndex = order.findIndex((el) => el.classList.contains("st-diagramSceneFigure-edges"));
    const firstNodeIndex = order.findIndex((el) => el.classList.contains("st-diagramSceneFigure-node"));
    const firstLabelIndex = order.findIndex((el) => el.classList.contains("st-diagramSceneFigure-edgeLabel"));
    expect(edgeIndex).toBeGreaterThanOrEqual(0);
    expect(firstNodeIndex).toBeGreaterThanOrEqual(0);
    expect(edgeIndex).toBeLessThan(firstNodeIndex);
    expect(firstLabelIndex).toBeGreaterThan(firstNodeIndex);
  });

  it("m5 keys reach the camera from non-input descendants and camera payloads are asserted", async () => {
    const view = mount(WIDE);
    await tick();
    expect(view.cameras.length).toBeGreaterThan(0);
    const last = view.cameras[view.cameras.length - 1]!;
    expect(last.zoom).toBe(view.zoom());
    expect(last.readout).toBe(Math.round((view.zoom() / last.maxZoom) * 100));
    expect(last.minZoom).toBeLessThanOrEqual(last.zoom);
    expect(last.zoom).toBeLessThanOrEqual(last.maxZoom);
    expect(typeof last.pans).toBe("boolean");
    const before = view.zoom();
    await fireEvent.keyDown(view.toggle("a"), { key: "+" });
    expect(view.zoom()).toBeGreaterThan(before);
  });

  it("m5 a refused layout renders visible text, not only the data attribute", async () => {
    const view = mount(WIDE, { rowPack: { targetAspect: 0 } });
    await tick();
    expect(view.figure.dataset["sceneRefused"]).toBe("row-pack-invalid");
    expect(view.root.querySelector('[role="alert"]')).not.toBeNull();
  });

  it("m6 fit width uses the viewport narrowed by its scrollbar", async () => {
    const view = mount(WIDE);
    await tick();
    Object.defineProperty(view.viewport, "clientWidth", { configurable: true, value: 1000 });
    await resize(1280, 720);
    const { model } = modelOf(WIDE);
    const expected = sceneFit({ bounds: model.bounds!, viewWidth: 1000, windowHeight: 720 });
    expect(view.zoom()).toBe(expected.zoom);
  });

  it("m1 a document switch starts with a fresh orientation record and refits the camera", async () => {
    reducedMotion = true;
    const view = mount(WIDE);
    await tick();
    await fireEvent.click(view.toggle("a"));
    await tick();
    expect(view.drawn()).not.toContain(occurrence("a1"));
    await view.rerender({
      document: SINGLE.document,
      presentation: SINGLE.presentation,
      hints: SINGLE.hints,
    });
    await tick();
    expect(view.drawn()).toContain(occurrence("solo"));
    expect(Object.keys(view.lastLayout().orientations ?? {})).toContain("root");
    expect(view.zoom()).toBe(view.component.getCamera().fitZoom);
  });
});

