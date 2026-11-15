import { expect, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";
import { DEFAULT_MAX_DISPLAY_SCALE, DEFAULT_MIN_READABLE_SCALE } from "@sentropic/diagram-canvas";
import { propsFor, type HostMount } from "./flowHostContract.js";

interface Box { x: number; y: number; width: number; height: number }

/**
 * Painted rects for a jsdom scene host, derived from the rendered world
 * transform on the 1/64 CSS px layout grid. Connectors run on the outer
 * perimeter of the boxes, as orthogonal routes and self-relations do, and
 * carry the stroke of the scene stylesheet (token values inlined: jsdom
 * loads no host stylesheet). `ghosts` moves the geometry that paints
 * nothing (flow hit targets, hidden focus targets, clipped descriptions)
 * far outside the boxes; `grow` adds real ink around them.
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
    .st-diagramSceneFigure-flowDescription { position: absolute; clip-path: inset(50%); width: 0; height: 0; overflow: hidden; }`;
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
  } finally {
    paint.dispose();
  }
}
