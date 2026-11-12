import { normalizeEnvelopeInput, utf8ByteLength, ENVELOPE_LIMIT_BYTES } from "../../validate/envelope.js";

export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const nonblank = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** Derived from component-index/generated/contracts/gantt-chart.json, minus class. */
export function validateGanttProps(props: Record<string, unknown>): boolean {
  if (Object.keys(props).some((key) => !["data", "label", "width", "height", "marker"].includes(key))) return false;
  if (!nonblank(props.label) || !Array.isArray(props.data) || props.data.length > 500) return false;
  if (["width", "height", "marker"].some((key) => key in props && !finite(props[key]))) return false;
  return props.data.every((task) => record(task) &&
    Object.keys(task).every((key) => ["task", "start", "end", "category"].includes(key)) &&
    nonblank(task.task) && finite(task.start) && finite(task.end) &&
    (!("category" in task) || typeof task.category === "string"));
}

/** BpmnCanvasProps structural envelope; the loaded engine owns F1 semantics. */
function validateBpmnProps(props: Record<string, unknown>): boolean {
  return Object.keys(props).every((key) => key === "document") &&
    record(props.document) && props.document.$type === "bpmn:Definitions";
}

/** Private registry: these are diagram painters, never catalogue components. */
export const diagramComponents = {
  GanttChart: { validateProps: validateGanttProps, loadPainter: () => import("./engines/gantt.js") },
  BpmnCanvas: { validateProps: validateBpmnProps, loadPainter: () => import("./engines/bpmn-canvas.js") },
} as const;

export type DiagramComponent = keyof typeof diagramComponents;

export function componentStatus(id: string): "available" | "unavailable" | "unsupported" {
  if (id === "DiagramCanvas" || id === "RoadmapChart") return "unavailable";
  return Object.hasOwn(diagramComponents, id) ? "available" : "unsupported";
}

/** Reject values JSON would silently erase or coerce before the shared round-trip. */
function assertJson(value: unknown, ancestors = new Set<object>()): void {
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("non-finite number");
  if (["function", "symbol", "bigint"].includes(typeof value)) throw new Error("non-JSON value");
  if (value === null || typeof value !== "object") return;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    throw new Error("non-JSON object");
  }
  if (ancestors.has(value)) throw new Error("cyclic value");
  ancestors.add(value);
  for (const child of Object.values(value)) assertJson(child, ancestors);
  ancestors.delete(value);
}

/** Normalize either host return shape and measure only normalized props in UTF-8. */
export function normalizeDiagram(value: unknown): { component: string; props: Record<string, unknown> } | undefined {
  try {
    assertJson(value);
    const json = normalizeEnvelopeInput(value);
    if (!json.ok || !record(json.value) || typeof json.value.component !== "string") return undefined;
    const { component, id: _id, ...rest } = json.value;
    const props = Object.hasOwn(rest, "props") ? rest.props : rest;
    if (!record(props) || utf8ByteLength(JSON.stringify(props)) > ENVELOPE_LIMIT_BYTES) return undefined;
    return { component, props };
  } catch {
    return undefined;
  }
}
