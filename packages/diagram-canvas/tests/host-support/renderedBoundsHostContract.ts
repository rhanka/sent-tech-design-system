import { expect, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { DEFAULT_MAX_DISPLAY_SCALE, DEFAULT_MIN_READABLE_SCALE } from "@sentropic/diagram-canvas";
import { propsFor, type HostMount } from "./flowHostContract.js";
import { hCondInput } from "../layout/dc2a/h-cond.js";

interface Box { x: number; y: number; width: number; height: number }

/**
 * Painted rects for a jsdom scene host, derived from the rendered world
 * transform on the 1/64 CSS px layout grid. Connectors run on the outer
 * perimeter of the boxes, as orthogonal routes and self-relations do, and
 * carry the stroke of the scene stylesheet (token values inlined: jsdom
 * loads no host stylesheet). `ghosts` moves the geometry that paints
 * nothing (flow hit targets, hidden focus targets, clipped descriptions)
 * far outside the boxes; `grow` adds real ink around them, and a negative
 * margin pulls the connectors inside the boxes' perimeter.
 */
function paintFlowWorld() {
  const snap = (px: number): number => Math.round(px * 64) / 64;
  const original = Element.prototype.getBoundingClientRect;
  let ghosts = false;
  let grown = 0;
  const sheet = document.createElement("style");
  sheet.textContent = `
    .st-diagramSceneFigure-edge { fill: none; stroke: rgb(100, 116, 139); stroke-width: 1.5px; vector-effect: non-scaling-stroke; }
    .st-diagramSceneFigure-edge[data-flow-state="primary"] { stroke-width: 2.5px !important; }
    .st-diagramSceneFigure-edge[data-flow-state="related"] { stroke-width: 2px !important; }
    .st-diagramSceneFigure-flowHit { fill: none; stroke: rgba(0, 0, 0, 0); stroke-width: 16px; }
    .st-diagramSceneFigure-flowNode { opacity: 0; }
    .st-diagramSceneFigure-flowDescription { position: absolute; clip-path: inset(50%); width: 0; height: 0; overflow: hidden; }
    .st-diagramSceneFigure-frame { --st-component-diagramScene-transitionDuration: 240ms; }`;
  document.head.append(sheet);
  const boxOf = (element: HTMLElement): Box => ({ x: parseFloat(element.style.left), y: parseFloat(element.style.top),
    width: parseFloat(element.style.width), height: parseFloat(element.style.height) });
  const perimeter = (world: HTMLElement, margin: number): Box => {
    const boxes = [...world.querySelectorAll<HTMLElement>("[data-scene-occurrence],[data-scene-label]")].map(boxOf);
    const x = Math.min(...boxes.map((box) => box.x)) - margin, y = Math.min(...boxes.map((box) => box.y)) - margin;
    return { x, y, width: Math.max(...boxes.map((box) => box.x + box.width)) + margin - x,
      height: Math.max(...boxes.map((box) => box.y + box.height)) + margin - y };
  };
  const screen = (world: HTMLElement, box: Box): DOMRect => {
    const [tx, ty, scale] = /translate\(([-\d.e+]+)px,\s*([-\d.e+]+)px\)\s*scale\(([-\d.e+]+)\)/
      .exec(world.style.transform)!.slice(1).map(Number) as [number, number, number];
    const left = snap(tx + box.x * scale), top = snap(ty + box.y * scale);
    return new DOMRect(left, top, snap(tx + (box.x + box.width) * scale) - left, snap(ty + (box.y + box.height) * scale) - top);
  };
  const GHOST = "[data-flow-hit],.st-diagramSceneFigure-flowNode,.st-diagramSceneFigure-flowDescription";
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const world = this.closest<HTMLElement>(".st-diagramSceneFigure-world");
    if (world === null) return original.call(this);
    if (this === world) return screen(world, { x: 0, y: 0, width: 0, height: 0 });
    if (this.matches("[data-scene-edge]")) return screen(world, perimeter(world, grown));
    if (this.matches(GHOST)) return ghosts ? screen(world, perimeter(world, 200)) : new DOMRect();
    if (!(this instanceof HTMLElement) || !this.matches("[data-scene-occurrence],[data-scene-label]")) return new DOMRect();
    return screen(world, boxOf(this));
  });
  // jsdom has no Range#getClientRects: the only text ink is the ghosts'.
  const range = Range.prototype as unknown as { getClientRects?: () => DOMRect[] };
  const hadClientRects = Object.getOwnPropertyDescriptor(range, "getClientRects");
  range.getClientRects = function (this: Range) {
    const parent = this.startContainer instanceof Element ? this.startContainer : this.startContainer.parentElement;
    const world = parent?.closest<HTMLElement>(".st-diagramSceneFigure-world");
    return ghosts && world && parent?.closest(GHOST) ? [screen(world, perimeter(world, 200))] : [];
  };
  return {
    ghosts(on: boolean): void { ghosts = on; },
    grow(margin: number): void { grown = margin; },
    // jsdom drops its computed-style cache on a change of the document only.
    restyle(): void { document.head.append(sheet); },
    dispose(): void {
      sheet.remove();
      if (hadClientRects) Object.defineProperty(range, "getClientRects", hadClientRects);
      else delete range.getClientRects;
    },
  };
}

interface FitState { zoom: number; transform: string; viewport: string; extent: string }

/**
 * World units by which two reads of one painted edge may differ when they
 * go through two transforms: the hosts' refit tolerance, derived from the
 * 1/64 CSS px layout grid at the readability floor.
 */
const READ_GRANULARITY = (2 / DEFAULT_MIN_READABLE_SCALE + 1) / 64;

/**
 * The same fit, reached from a read through another transform: the same
 * scale, the same overflow, and every length within the two edge reads a
 * length spans. A connector half-stroke (1.5 / 2 / 0.45 world unit a side)
 * is twenty times that.
 */
function expectSameFit(actual: FitState, expected: FitState, message: string): void {
  expect(actual.zoom, message).toBe(expected.zoom);
  const NUMBER = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/g;
  const text = (state: FitState): string => [state.transform, state.extent, state.viewport].join(" | ");
  expect(text(actual).replace(NUMBER, "#"), message).toBe(text(expected).replace(NUMBER, "#"));
  const numbers = (state: FitState): number[] => (text(state).match(NUMBER) ?? []).map(Number);
  const slack = 2 * READ_GRANULARITY * expected.zoom;
  numbers(expected).forEach((value, index) => {
    expect(Math.abs(numbers(actual)[index]! - value), `${message}: ${text(actual)} / ${text(expected)}`).toBeLessThanOrEqual(slack);
  });
}

/**
 * PR 294 round 2: the fit is one fixed point of the painted bounds. It does
 * not move with the zoom the paint is read at (screen-constant connector
 * strokes), with a transient flow highlight, nor with geometry that paints
 * nothing; real ink still refits it.
 */
export async function runRenderedBoundsHostCase(mount: HostMount, tick: () => Promise<unknown>): Promise<void> {
  // A frame whose fit lies between the readability floor and the cap.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 550 });
  vi.stubGlobal("innerHeight", 900);
  const paint = paintFlowWorld();
  try {
    const view = mount(propsFor(3, { labels: true }));
    const flush = async (): Promise<void> => { await tick(); await tick(); paint.restyle(); };
    await flush();
    const root = view.container;
    const figure = root.querySelector<HTMLElement>("figure")!;
    const viewport = root.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
    const state = () => ({
      zoom: Number(figure.dataset["zoom"]),
      transform: root.querySelector<HTMLElement>(".st-diagramSceneFigure-world")!.style.transform,
      viewport: viewport.style.cssText,
      extent: root.querySelector<HTMLElement>(".st-diagramSceneFigure-extent")!.style.cssText,
    });
    const fit = async (): Promise<void> => {
      await fireEvent.click([...root.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Fit")!);
      await flush();
    };
    await fit();
    const settled = state();
    // A zoom step stops at the display cap: past the fit is what matters.
    const zoomIn = async (): Promise<void> => {
      await fireEvent.keyDown(viewport, { key: "+" });
      await flush();
      expect(state().zoom).toBeGreaterThan(settled.zoom);
    };
    expect(settled.zoom).toBeGreaterThan(DEFAULT_MIN_READABLE_SCALE);
    expect(settled.zoom).toBeLessThan(DEFAULT_MAX_DISPLAY_SCALE);
    const edge = root.querySelector("[data-scene-edge]")!;
    expect(getComputedStyle(edge).vectorEffect).toBe("non-scaling-stroke");
    expect(getComputedStyle(edge).strokeWidth).toBe("1.5px");
    await fit();
    expect(state(), "Fit again").toEqual(settled);

    // Read through one, then two zoom steps: the stroke keeps its screen
    // width, the fit keeps its place.
    await zoomIn();
    await fit();
    expect(state(), "Fit after one zoom step").toEqual(settled);
    await zoomIn();
    await zoomIn();
    await fit();
    expect(state(), "Fit after two zoom steps").toEqual(settled);

    // A zoom and a Fit in one turn: the world still paints the fit scale
    // when it is read, whatever zoom the host has moved to.
    void fireEvent.keyDown(viewport, { key: "+" });
    await fit();
    expect(state(), "Fit in the turn of a zoom step").toEqual(settled);

    // A selected flow step is drawn thicker: transient, the fit stays.
    const badge = root.querySelector<HTMLElement>("[data-flow-badge]")!;
    await fireEvent.click(badge);
    await flush();
    const primary = root.querySelector('[data-scene-edge][data-flow-state="primary"]')!;
    expect(getComputedStyle(primary).strokeWidth).toBe("2.5px");
    await fit();
    expect(state(), "Fit with a highlighted flow step").toEqual(settled);
    await zoomIn();
    await fit();
    expect(state(), "Fit with a highlighted flow step, after a zoom").toEqual(settled);
    await fireEvent.click(badge);
    await flush();
    expect(root.querySelector('[data-scene-edge][data-flow-state="primary"]')).toBeNull();

    // Hit targets, hidden focus targets and clipped descriptions paint
    // nothing: wherever they are, the fit stays.
    expect(root.querySelectorAll("[data-flow-hit]").length).toBeGreaterThan(0);
    expect(root.querySelectorAll(".st-diagramSceneFigure-flowNode").length).toBeGreaterThan(0);
    expect(root.querySelectorAll(".st-diagramSceneFigure-world .st-diagramSceneFigure-flowDescription").length).toBeGreaterThan(0);
    paint.ghosts(true);
    await fit();
    expect(state(), "Fit over unpainted geometry").toEqual(settled);
    await zoomIn();
    await fit();
    expect(state(), "Fit over unpainted geometry, after a zoom").toEqual(settled);

    // Real ink past the frame still refits, once.
    paint.grow(50);
    await fit();
    const grown = state();
    expect(grown.zoom).toBeLessThan(settled.zoom);
    await fit();
    expect(state(), "Fit again on the grown paint").toEqual(grown);

    // The ink goes: the fit comes back, once.
    paint.grow(0);
    await fit();
    expectSameFit(state(), settled, "Fit once the grown paint is gone");
    const restored = state();
    await fit();
    expect(state(), "Fit again once the grown paint is gone").toEqual(restored);

    // Paint that lies inside the model bounds again is the model fit: the
    // one a host reaches when it never read anything past them.
    paint.grow(50);
    await fit();
    expectSameFit(state(), grown, "Fit on the grown paint, again");
    paint.grow(-20);
    await fit();
    const inside = state();
    const model = mount(propsFor(3, { labels: true }));
    await flush();
    const modelRoot = model.container;
    await fireEvent.click([...modelRoot.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Fit")!);
    await flush();
    expectSameFit(inside, {
      zoom: Number(modelRoot.querySelector<HTMLElement>("figure")!.dataset["zoom"]),
      transform: modelRoot.querySelector<HTMLElement>(".st-diagramSceneFigure-world")!.style.transform,
      viewport: modelRoot.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!.style.cssText,
      extent: modelRoot.querySelector<HTMLElement>(".st-diagramSceneFigure-extent")!.style.cssText,
    }, "Fit on paint back inside the model bounds");
    expect(inside.zoom).toBeGreaterThan(grown.zoom);
    expect(inside.zoom).toBeGreaterThanOrEqual(settled.zoom);
    expect(inside).not.toEqual(restored);
    await fit();
    expect(state(), "Fit again inside the model bounds").toEqual(inside);
  } finally {
    paint.dispose();
  }
}

interface Camera { zoom: number; fitZoom: number; minZoom: number }
interface Framing { fitZoom: number; minZoom: number; height: number }

/** The same framing: the same fit scale, and a height within two edge reads. */
function expectSameFraming(actual: Framing, expected: Framing, message: string): void {
  expect([actual.fitZoom, actual.minZoom], message).toEqual([expected.fitZoom, expected.minZoom]);
  expect(Math.abs(actual.height - expected.height), `${message}: ${actual.height} / ${expected.height}`).toBeLessThanOrEqual(2 * READ_GRANULARITY * expected.fitZoom);
}

/**
 * PR 294 round 3: a fold or an unfold animates. While it runs the hosts
 * paint interpolated rectangles and fade the connectors, the edge labels and
 * the entering nodes in from zero opacity; none of that is the scene's paint.
 * Once settled, the camera is framed on the settled paint, and the first Fit
 * lands where a freshly mounted host in the same fold state does.
 */
export async function runRenderedBoundsFoldCase(mount: HostMount, tick: () => Promise<unknown>): Promise<void> {
  // A frame in which both fold states fit above the readability floor.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 2600 });
  vi.stubGlobal("innerHeight", 2400);
  // Motion is allowed: the 240 ms token duration applies.
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.useFakeTimers();
  const paint = paintFlowWorld();
  try {
    // Uncontrolled folds: the host owns them, a toggle folds at once.
    const { collapsed: _controlled, ...source } = hCondInput("architecture", false);
    const input = { ...source, measureLines: undefined } as unknown as Parameters<HostMount>[0];
    const flush = async (): Promise<void> => { await tick(); await tick(); paint.restyle(); };
    const open = async (folds: readonly string[]) => {
      const cameras: Camera[] = [];
      const view = mount({ ...input, defaultFolds: folds, onCameraChange: (camera: Camera) => { cameras.push(camera); } } as never);
      await flush();
      const root = view.container;
      const viewport = root.querySelector<HTMLElement>(".st-diagramSceneFigure-viewport")!;
      const state = () => ({
        zoom: Number(root.querySelector<HTMLElement>("figure")!.dataset["zoom"]),
        transform: root.querySelector<HTMLElement>(".st-diagramSceneFigure-world")!.style.transform,
        viewport: viewport.style.cssText,
        extent: root.querySelector<HTMLElement>(".st-diagramSceneFigure-extent")!.style.cssText,
      });
      // What the fit is made of, whatever zoom the camera is held at.
      const framing = () => ({ fitZoom: cameras.at(-1)!.fitZoom, minZoom: cameras.at(-1)!.minZoom, height: parseFloat(viewport.style.height) });
      const fit = async (): Promise<void> => {
        await fireEvent.click([...root.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Fit")!);
        await flush();
      };
      const toggle = async (): Promise<void> => {
        await fireEvent.click(root.querySelector<HTMLElement>("button[aria-expanded]")!);
        await flush();
      };
      const busy = () => viewport.getAttribute("aria-busy");
      const settle = async (): Promise<void> => { await vi.advanceTimersByTimeAsync(300); await flush(); };
      return { root, state, framing, fit, toggle, busy, settle };
    };

    // The references: a host mounted in each fold state, fitted.
    const unfoldedHost = await open([]);
    const occurrence = unfoldedHost.root.querySelector<HTMLElement>("button[aria-expanded]")!
      .closest<HTMLElement>("[data-scene-occurrence]")!.dataset["sceneOccurrence"]!;
    await unfoldedHost.fit();
    const unfolded = { state: unfoldedHost.state(), framing: unfoldedHost.framing() };
    const foldedHost = await open([occurrence]);
    await foldedHost.fit();
    const folded = { state: foldedHost.state(), framing: foldedHost.framing() };
    // The two fold states are framed apart by far more than a half-stroke.
    expect(Math.abs(folded.framing.height - unfolded.framing.height)).toBeGreaterThan(10);
    // Perimeter connectors are part of both paints.
    for (const host of [unfoldedHost, foldedHost]) expect(host.root.querySelectorAll("[data-scene-edge]").length).toBeGreaterThan(0);
    expect(unfolded.state.zoom).toBeGreaterThan(DEFAULT_MIN_READABLE_SCALE);
    expect(folded.state.zoom).toBeGreaterThan(DEFAULT_MIN_READABLE_SCALE);

    const host = await open([]);
    expectSameFraming(host.framing(), unfolded.framing, "framing at mount");

    // Fold: the first frame still paints the unfolded rectangles.
    await host.toggle();
    expect(host.busy()).toBe("true");
    await host.settle();
    expect(host.busy()).toBe("false");
    expectSameFraming(host.framing(), folded.framing, "framing once the fold settled");
    await host.fit();
    expectSameFit(host.state(), folded.state, "first Fit after a fold");
    const refolded = host.state();
    await host.fit();
    expect(host.state(), "second Fit after a fold").toEqual(refolded);

    // Unfold: the first frame paints connectors, labels and entering nodes
    // at zero opacity.
    await host.toggle();
    expect(host.busy()).toBe("true");
    expect(host.root.querySelector<SVGElement>(".st-diagramSceneFigure-edges")!.style.opacity).toBe("0");
    await host.settle();
    expect(host.busy()).toBe("false");
    expectSameFraming(host.framing(), unfolded.framing, "framing once the unfold settled");
    await host.fit();
    expectSameFit(host.state(), unfolded.state, "first Fit after an unfold");
    const reopened = host.state();
    await host.fit();
    expect(host.state(), "second Fit after an unfold").toEqual(reopened);

    // Fit during a transition ends it and frames its end state.
    await host.toggle();
    expect(host.busy()).toBe("true");
    await host.fit();
    expect(host.busy()).toBe("false");
    expectSameFit(host.state(), folded.state, "Fit during a fold");
    const ended = host.state();
    await host.settle();
    await host.fit();
    expect(host.state(), "Fit after a fold ended by Fit").toEqual(ended);
  } finally {
    vi.useRealTimers();
    paint.dispose();
  }
}
