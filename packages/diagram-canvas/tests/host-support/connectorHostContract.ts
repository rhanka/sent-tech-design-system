/**
 * Shared Node/jsdom contract for the mounted scene hosts (Svelte, Vue): the
 * paint order of a scene and the attachment of its connectors, read from the
 * rendered DOM. It never starts a browser; painted occlusion itself is
 * measured by the first-paint gate (`tools/diagram-first-paint`).
 */
import { expect } from "vitest";

export interface ConnectorExpectation {
  /** Expanded zones, drawn as frames under the connectors. */
  readonly frames: readonly string[];
  /** Cards and collapsed zones, drawn above the connectors. */
  readonly boxes: readonly string[];
  /** Every relation the scene draws: its occurrence and the two boxes it joins. */
  readonly relations: readonly { readonly occurrence: string; readonly ends: readonly [string, string] }[];
  /** Expanded zones with a footer: one cutout of the connector mask each. Defaults to `frames.length`. */
  readonly cutouts?: number;
}

interface Box { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
interface Point { readonly x: number; readonly y: number }

const TOLERANCE = 0.01;

function borderDistance(point: Point, box: Box): number {
  const dx = Math.max(box.x - point.x, 0, point.x - box.x - box.width);
  const dy = Math.max(box.y - point.y, 0, point.y - box.y - box.height);
  if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
  return Math.min(point.x - box.x, box.x + box.width - point.x, point.y - box.y, box.y + box.height - point.y);
}

/** The world's children in document order — the paint order: no layer of the scene sets a z-index. */
export function scenePaintOrder(container: HTMLElement) {
  const world = container.querySelector(".st-diagramSceneFigure-world");
  if (world === null) throw new Error("no scene world rendered");
  const children = [...world.children] as HTMLElement[];
  const connectors = children.flatMap((child, index) => child.classList.contains("st-diagramSceneFigure-edges") ? [index] : []);
  const nodes = new Map(children.flatMap((child, index) => child.dataset["sceneOccurrence"] === undefined ? [] : [[child.dataset["sceneOccurrence"], index] as const]));
  const labels = new Map(children.flatMap((child, index) => child.dataset["sceneLabel"] === undefined ? [] : [[child.dataset["sceneLabel"], index] as const]));
  return { children, connectors, nodes, labels };
}

/**
 * Every expected relation has a connector whose two ends touch its two boxes
 * and a label; the expanded zone frames precede the connector layer, every
 * box follows it and the labels come last.
 */
export function expectConnectorPaint(container: HTMLElement, expected: ConnectorExpectation): void {
  const order = scenePaintOrder(container);
  expect(order.connectors, "one connector layer").toHaveLength(1);
  const layer = order.connectors[0]!;
  expect([...order.nodes.keys()].sort(), "drawn nodes").toEqual([...expected.frames, ...expected.boxes].sort());
  for (const frame of expected.frames) expect(order.nodes.get(frame)!, `${frame} frame paints under the connectors`).toBeLessThan(layer);
  for (const box of expected.boxes) expect(order.nodes.get(box)!, `${box} paints above the connectors`).toBeGreaterThan(layer);
  const lastNode = Math.max(...order.nodes.values());
  for (const [label, index] of order.labels) expect(index, `${label} label paints last`).toBeGreaterThan(lastNode);

  const boxOf = (occurrence: string): Box => {
    const style = order.children[order.nodes.get(occurrence)!]!.style;
    return { x: parseFloat(style.left), y: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height) };
  };
  // Every connector sits in the one group the footer mask applies to.
  const svg = order.children[layer]!;
  const group = svg.querySelector(":scope > g[data-scene-connectors]");
  expect(group, "connector group").not.toBeNull();
  const cutouts = [...svg.querySelectorAll("mask > rect[data-scene-cutout]")];
  expect(cutouts, "footer cutouts").toHaveLength(expected.cutouts ?? expected.frames.length);
  for (const cutout of cutouts) for (const name of ["x", "y", "width", "height"]) expect(Number.isFinite(Number(cutout.getAttribute(name))), `cutout ${name}`).toBe(true);
  if (cutouts.length === 0) expect(group!.getAttribute("mask")).toBeNull();
  else expect(group!.getAttribute("mask")).toBe(`url(#${svg.querySelector("mask")!.id})`);
  expect(svg.querySelectorAll("[data-scene-edge]").length, "every connector is in the masked group").toBe(group!.querySelectorAll("[data-scene-edge]").length);
  const connectors = [...order.children[layer]!.querySelectorAll("[data-scene-edge]")];
  expect(connectors.map((connector) => connector.getAttribute("data-scene-edge")).sort(), "drawn connectors")
    .toEqual(expected.relations.map((relation) => relation.occurrence).sort());
  expect([...order.labels.keys()].sort(), "every label belongs to a drawn connector")
    .toEqual(expected.relations.map((relation) => relation.occurrence).sort());
  for (const relation of expected.relations) {
    const connector = connectors.find((candidate) => candidate.getAttribute("data-scene-edge") === relation.occurrence)!;
    const points = (connector.getAttribute("points") ?? "").trim().split(/\s+/).map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return { x: x!, y: y! };
    });
    expect(points.length, `${relation.occurrence} route`).toBeGreaterThanOrEqual(2);
    expect(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)), `${relation.occurrence} finite route`).toBe(true);
    expect(borderDistance(points[0]!, boxOf(relation.ends[0])), `${relation.occurrence} leaves ${relation.ends[0]}`).toBeLessThanOrEqual(TOLERANCE);
    expect(borderDistance(points[points.length - 1]!, boxOf(relation.ends[1])), `${relation.occurrence} reaches ${relation.ends[1]}`).toBeLessThanOrEqual(TOLERANCE);
  }
}
