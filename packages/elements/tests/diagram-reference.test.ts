// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import fixture from "./fixtures/dossier-diagram-ref.json";
import inlineFixture from "./fixtures/dossier-diagram.json";
import inputsFixture from "./fixtures/dossier-inputs.json";
import ganttContract from "../../component-index/generated/contracts/gantt-chart.json";
import { renderDossier } from "../src/element/dom/engines/focus-renderer.js";
import { renderGantt } from "../src/element/dom/engines/gantt.js";
import { normalizeDiagram, validateGanttProps } from "../src/element/dom/diagram-components.js";
import { createElementRuntime } from "../src/element/dom/element-runtime.svelte.js";
import { renderDossierAction } from "../src/element/dom/render-action.js";
import { DOSSIER_CSS } from "../src/element/dom/engines/dossier-styles.js";
import type { DiagramResolver } from "../src/types/diagram.js";
import type { Diagnostic } from "../src/validate/diagnostics.js";

const bpmn = vi.hoisted(() => ({
  loads: 0,
  validate: vi.fn(() => [] as { severity: string }[]),
  toXml: vi.fn(async () => ({ ok: true, xml: "<definitions/>", warnings: [] })),
  mount: vi.fn(async (_node: HTMLElement, _payload: unknown, _note: (diagnostic: Diagnostic) => void, _signal?: AbortSignal) => () => {}),
}));
vi.mock("../src/element/dom/engines/bpmn-canvas.ts", () => {
  bpmn.loads++;
  return { port: { source: "bpmn-canvas", validate: bpmn.validate }, toXml: bpmn.toXml, renderBpmn: bpmn.mount };
});

const stops: (() => void)[] = [];
afterEach(() => {
  stops.splice(0).forEach((stop) => stop());
  document.body.replaceChildren();
  bpmn.validate.mockReset().mockReturnValue([]);
  bpmn.toXml.mockReset().mockResolvedValue({ ok: true, xml: "<definitions/>", warnings: [] });
  bpmn.mount.mockReset().mockResolvedValue(() => {});
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

const gantt = () => ({ component: "GanttChart", props: { data: [{ task: "Prototype", start: 0, end: 4 }], label: "Roadmap" } });
function render(resolver?: DiagramResolver, component = "GanttChart") {
  const envelope = structuredClone(fixture);
  envelope.root.document.sections.at(-1)!.renderComponent = component;
  const node = document.createElement("div");
  document.body.append(node);
  const diagnostics: Diagnostic[] = [];
  const stop = renderDossier(node, envelope.root.document, vi.fn(), {
    diagramResolver: resolver, onDiagramDiagnostic: (found) => diagnostics.push(found),
  });
  stops.push(stop);
  const figure = node.querySelector<HTMLElement>("figure")!;
  return { node, figure, diagnostics, stop, envelope };
}
const settled = async (figure: HTMLElement, state: string) => {
  await vi.waitFor(() => expect(figure.dataset.diagramState).toBe(state));
};

describe("diagram-by-reference lifecycle and fallback (B2–B6, B9, B11–B15)", () => {
  it("should keep focus loading independent of the BPMN engine", () => {
    expect(bpmn.loads).toBe(0);
  });

  it("should resolve once with the verbatim reference and context, preserving the caption and focus", async () => {
    const pending = deferred<ReturnType<typeof gantt>>();
    const resolver = vi.fn(() => pending.promise);
    const { node, figure, diagnostics } = render(resolver);
    const caption = figure.querySelector("figcaption");
    const live = figure.querySelector('[aria-live="polite"]');
    expect(figure.dataset.diagramState).toBe("pending");
    expect(caption?.textContent).toBe("Roadmap from prototype to rollout");
    expect(figure.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(caption?.textContent);
    expect(resolver).toHaveBeenCalledExactlyOnceWith("engram:roadmap-layout-engine-gantt", {
      diagramId: "g3-roadmap", targetRef: "skeleton-layout-engine", documentRef: "skeleton-layout-engine",
      renderComponent: "GanttChart", alt: "Roadmap from prototype to rollout",
    });
    const option = node.querySelector<HTMLButtonElement>("button")!;
    option.focus();
    pending.resolve(gantt());
    await settled(figure, "resolved");
    expect(figure.querySelector("figcaption")).toBe(caption);
    expect(figure.querySelector('[aria-live="polite"]')).toBe(live);
    expect(live?.textContent).toBe("Diagram resolved");
    expect(document.activeElement).toBe(option);
    expect(figure.querySelectorAll("svg rect")).toHaveLength(1);
    expect(figure.querySelector('svg[role="img"] > title')?.textContent).toBe(caption?.textContent);
    expect(figure.querySelector("li")?.textContent).toBe("Prototype: 0 – 4");
    expect(diagnostics).toEqual([]);
    option.click();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it("should treat bare and envelope-root returns identically", async () => {
    const bare = render(() => gantt());
    const root = render(() => ({ component: "GanttChart", id: "host-diagram", ...gantt().props }));
    await settled(bare.figure, "resolved");
    await settled(root.figure, "resolved");
    expect(root.figure.outerHTML).toBe(bare.figure.outerHTML);
  });

  it.each([
    ["no resolver", undefined, "GanttChart", "unresolved", "diagram-unresolved"],
    ["null", (): null => null, "GanttChart", "unresolved", "diagram-unresolved"],
    ["undefined", (): undefined => undefined, "GanttChart", "unresolved", "diagram-unresolved"],
    ["throw", (): never => { throw new Error("host"); }, "GanttChart", "failed", "diagram-resolver-failed"],
    ["rejection", (): Promise<never> => Promise.reject(new Error("host")), "GanttChart", "failed", "diagram-resolver-failed"],
    ["mismatch", () => ({ component: "BpmnCanvas", props: {} }), "GanttChart", "invalid", "diagram-component-mismatch"],
    ["bad payload", () => ({ component: "GanttChart", props: {} }), "GanttChart", "invalid", "diagram-payload-invalid"],
    ["unsupported", () => gantt(), "NotAComponent", "unsupported", "diagram-component-unsupported"],
    ["reserved roadmap", () => gantt(), "RoadmapChart", "unavailable", "diagram-component-unavailable"],
    ["reserved canvas", () => gantt(), "DiagramCanvas", "unavailable", "diagram-component-unavailable"],
  ] as const)("should show a named fallback and one section warning for %s", async (_name, resolver, component, state, code) => {
    const spy = resolver === undefined ? undefined : vi.fn(resolver);
    const { figure, diagnostics } = render(spy, component);
    await settled(figure, state);
    expect(figure.textContent).toContain("Roadmap from prototype to rollout");
    expect(figure.textContent).toContain("engram:roadmap-layout-engine-gantt");
    expect(figure.textContent).toContain(component);
    expect(figure.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Roadmap from prototype to rollout");
    expect(diagnostics).toEqual([expect.objectContaining({ code, severity: "warning", source: "host", path: "/root/document/sections/3" })]);
    if (component !== "GanttChart") expect(spy).not.toHaveBeenCalled();
  });

  it.each(["function", "cycle", "DOM", "budget"])("should refuse a %s return before mounting", async (shape) => {
    const value: Record<string, unknown> = gantt();
    const props = value.props as Record<string, unknown>;
    if (shape === "function") props.callback = () => {};
    if (shape === "cycle") props.self = props;
    if (shape === "DOM") props.node = document.createElement("div");
    if (shape === "budget") props.label = "é".repeat(524289);
    const { figure, diagnostics } = render(() => value as ReturnType<typeof gantt>);
    await settled(figure, "invalid");
    expect(figure.querySelector("svg")).toBeNull();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.code).toBe("diagram-payload-invalid");
  });

  it("should measure normalized props at the inclusive UTF-8 budget", () => {
    const value = { component: "GanttChart", props: { label: "" } };
    const overhead = JSON.stringify(value.props).length;
    value.props.label = "x".repeat(1048576 - overhead);
    expect(normalizeDiagram(value)).toBeDefined();
    value.props.label += "x";
    expect(normalizeDiagram(value)).toBeUndefined();
  });

  it.each([true, false])("should discard late %s settlement after destroy", async (success) => {
    const pending = deferred<ReturnType<typeof gantt> | null>();
    const { node, figure, diagnostics, stop } = render(() => pending.promise);
    stop();
    pending.resolve(success ? gantt() : null);
    await Promise.resolve();
    await Promise.resolve();
    expect(node.childElementCount).toBe(0);
    expect(figure.dataset.diagramState).toBe("pending");
    expect(diagnostics).toEqual([]);
  });

  it("should retry only pending figures on resolver replacement and discard the old result", async () => {
    const pending = deferred<ReturnType<typeof gantt> | null>();
    const { figure, diagnostics, stop } = render(() => pending.promise);
    const replacement = vi.fn(() => gantt());
    stop.setDiagramResolver(replacement);
    await settled(figure, "resolved");
    const svg = figure.querySelector("svg");
    pending.resolve(null);
    await Promise.resolve();
    stop.setDiagramResolver(replacement);
    expect(replacement).toHaveBeenCalledTimes(1);
    expect(figure.querySelector("svg")).toBe(svg);
    expect(diagnostics).toEqual([]);
  });

  it("should discard a replaced render and keep the new content when the old cleanup runs", async () => {
    const pending = deferred<null>();
    const { node, diagnostics, stop } = render(() => pending.promise);
    stops.push(renderDossier(node, inputsFixture.root.document, vi.fn()));
    pending.resolve(null);
    await Promise.resolve();
    expect(node.querySelector("figure")).toBeNull();
    expect(diagnostics).toEqual([]);
    stop();
    expect(node.querySelector("[data-st-inputs]")).not.toBeNull();
  });

  it("should preserve resolved and terminal figures while replacing only a pending resolver", async () => {
    const { figure, stop } = render();
    const replacement = vi.fn(() => gantt());
    stop.setDiagramResolver(replacement);
    expect(figure.dataset.diagramState).toBe("unresolved");
    expect(replacement).not.toHaveBeenCalled();
  });

  it("should re-call only the pending diagram in a mixed render", async () => {
    const envelope = structuredClone(fixture);
    const second = { kind: "diagram", targetRef: "skeleton-layout-engine", renderComponent: "GanttChart",
      alt: "Second diagram", id: "second", sourceRef: "engram:second" };
    envelope.root.document.sections.push(second);
    const pending = deferred<null>();
    const node = document.createElement("div");
    const diagnostics = vi.fn();
    const original = vi.fn((ref: string) => ref === "engram:second" ? pending.promise : gantt());
    const stop = renderDossier(node, envelope.root.document, vi.fn(), { diagramResolver: original, onDiagramDiagnostic: diagnostics });
    stops.push(stop);
    const figures = node.querySelectorAll("figure");
    await settled(figures[0]!, "resolved");
    const svg = figures[0]!.querySelector("svg");
    const replacement = vi.fn(gantt);
    stop.setDiagramResolver(replacement);
    await settled(figures[1]!, "resolved");
    expect(original).toHaveBeenCalledTimes(2);
    expect(replacement).toHaveBeenCalledExactlyOnceWith("engram:second", expect.objectContaining({ diagramId: "second" }));
    expect(figures[0]!.querySelector("svg")).toBe(svg);
    pending.resolve(null);
    await Promise.resolve();
    expect(diagnostics).not.toHaveBeenCalled();
  });

  it("should render payload strings literally without payload-derived attributes", async () => {
    const injection = '<script>alert(1)</script><img src=x onerror=alert(1)> href="evil"';
    const value = gantt();
    value.props.label = injection;
    value.props.data[0]!.task = injection;
    Object.assign(value.props.data[0]!, { category: injection });
    const { figure } = render(() => value);
    await settled(figure, "resolved");
    expect(figure.textContent).toContain(injection);
    expect(figure.querySelector("script,img,[href],[onerror],[src]")).toBeNull();
    expect([...figure.querySelectorAll("*")].flatMap((node) => [...node.attributes]).some((attr) => attr.value.includes(injection))).toBe(false);
  });

  it("should preserve inline preformatted source and render prose/question inputs as text", () => {
    const node = document.createElement("div");
    stops.push(renderDossier(node, inlineFixture.root.document, vi.fn()));
    expect(node.querySelector("figure pre")?.textContent).toBe("graph TD\n  start --> finish");
    expect(node.querySelector("figure")?.hasAttribute("data-diagram-state")).toBe(false);
    stops.push(renderDossier(node, inputsFixture.root.document, vi.fn()));
    expect(node.querySelectorAll("[data-st-inputs]")).toHaveLength(2);
    expect(node.querySelectorAll("[data-st-completion-criterion]")).toHaveLength(2);
    expect(node.querySelector("[data-st-inputs] code")?.textContent).toBe("local-notes");
    expect(DOSSIER_CSS).toContain("@media print");
  });
});

describe("Gantt marker domain", () => {
  it.each([320, Number.MAX_VALUE / 2, Number.MAX_VALUE])("should resolve multiple tasks with finite vertical geometry when height is %s", async (height) => {
    const props = {
      data: [
        { task: "Prototype", start: 0, end: 1 },
        { task: "Pilot", start: 1, end: 2 },
        { task: "Rollout", start: 2, end: 3 },
      ],
      label: "Roadmap", marker: 2, height,
    };
    expect(validateGanttProps(props)).toBe(true);
    const { figure, diagnostics } = render(() => ({ component: "GanttChart", props }));
    await settled(figure, "resolved");
    expect(diagnostics).toEqual([]);
    const bars = figure.querySelectorAll("svg rect");
    expect(bars).toHaveLength(3);
    for (const [index, bar] of bars.entries()) {
      const y = Number(bar.getAttribute("y"));
      const barHeight = Number(bar.getAttribute("height"));
      expect((y - 24) / (height - 24)).toBeCloseTo(index / 3);
      expect(barHeight).toBeGreaterThan(0);
      expect(y / height + barHeight / height).toBeLessThanOrEqual(1);
    }
    expect(figure.querySelector("svg line")?.getAttribute("y2")).toBe(String(height));
    for (const shape of figure.querySelectorAll("svg rect, svg line")) {
      for (const name of ["x", "x1", "x2", "width", "y", "y1", "y2", "height"]) {
        if (!shape.hasAttribute(name)) continue;
        const value = Number(shape.getAttribute(name));
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(name.startsWith("y") || name === "height" ? height : 640);
      }
    }
  });

  it.each([
    ["above the task", 0, 4, 8, 1],
    ["below the task", 0, 4, -4, 0],
    ["at the positive finite extreme", 0, 1, Number.MAX_VALUE, 1],
    ["at the negative finite extreme", 0, 1, -Number.MAX_VALUE, 0],
    ["between opposite finite task extremes", -Number.MAX_VALUE, Number.MAX_VALUE, 0, 0.5],
    ["opposite a positive extreme task", Number.MAX_VALUE / 2, Number.MAX_VALUE, -Number.MAX_VALUE, 0],
    ["with no tasks", undefined, undefined, Number.MAX_VALUE, 1],
  ] as const)("should keep a marker %s visible with finite coordinates", (_name, start, end, marker, fraction) => {
    for (const width of [640, Number.MAX_VALUE]) {
      const props = { data: start === undefined ? [] : [{ task: "Prototype", start, end }], label: "Roadmap", marker, width };
      expect(validateGanttProps(props)).toBe(true);
      const node = document.createElement("div");
      renderGantt(node, props, "Prototype roadmap");
      const line = node.querySelector("svg line")!;
      const coordinate = Number(line.getAttribute("x1"));
      expect(Number.isFinite(coordinate)).toBe(true);
      expect(coordinate / width).toBeCloseTo(fraction);
      expect(line.getAttribute("x2")).toBe(line.getAttribute("x1"));
      for (const shape of node.querySelectorAll("svg rect, svg line")) {
        for (const name of ["x", "x1", "x2", "width"]) {
          if (!shape.hasAttribute(name)) continue;
          const value = Number(shape.getAttribute(name));
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(width);
        }
      }
    }
  });
});

describe("Gantt checker contract fixtures (B10)", () => {
  it("should follow the generated task and props contract, excluding class", () => {
    const schema = ganttContract.frameworks.svelte.props;
    expect(schema.required).toEqual(["data", "label"]);
    expect(Object.keys(schema.properties).filter((key) => key !== "class").sort()).toEqual(["data", "height", "label", "marker", "width"]);
    expect(schema.$defs.GanttChartTask.required).toEqual(["end", "start", "task"]);
    expect(validateGanttProps(gantt().props)).toBe(true);
  });
  it.each([
    { data: [{ start: 0, end: 1 }], label: "Roadmap" },
    { data: [{ task: " ", start: 0, end: 1 }], label: "Roadmap" },
    { data: [{ task: "Prototype", start: Infinity, end: 1 }], label: "Roadmap" },
    { data: [{ task: "Prototype", start: 0, end: NaN }], label: "Roadmap" },
    { ...gantt().props, class: "host" },
    { ...gantt().props, data: Array(501).fill(gantt().props.data[0]) },
  ])("should reject invalid task or props %#", async (props) => {
    expect(validateGanttProps(props)).toBe(false);
    const { figure, diagnostics } = render(() => ({ component: "GanttChart", props }));
    await settled(figure, "invalid");
    expect(diagnostics[0]?.code).toBe("diagram-payload-invalid");
  });
});

describe("BPMN delegation (B5, B13)", () => {
  const payload = () => ({ component: "BpmnCanvas", props: { document: { $type: "bpmn:Definitions" } } });

  it("should load BPMN on demand, validate F1, serialize and mount in a named container", async () => {
    const { figure } = render(payload, "BpmnCanvas");
    await settled(figure, "resolved");
    expect(bpmn.validate).toHaveBeenCalledWith(payload().props.document);
    expect(bpmn.toXml).toHaveBeenCalledWith(payload().props.document);
    expect(bpmn.mount).toHaveBeenCalledTimes(1);
    const [container, , , signal] = bpmn.mount.mock.calls[0]!;
    expect(container.getAttribute("role")).toBe("img");
    expect(container.getAttribute("aria-label")).toBe("Roadmap from prototype to rollout");
    expect(signal?.aborted).toBe(false);
  });

  it("should show invalid when F1 hydration refuses", async () => {
    bpmn.validate.mockReturnValue([{ severity: "error" }]);
    const { figure, diagnostics } = render(payload, "BpmnCanvas");
    await settled(figure, "invalid");
    expect(bpmn.mount).not.toHaveBeenCalled();
    expect(diagnostics[0]?.code).toBe("diagram-payload-invalid");
  });

  it("should show invalid when canvas readiness resolves with an error diagnostic", async () => {
    const cleanup = vi.fn();
    bpmn.mount.mockImplementation(async (_node, _payload, note) => {
      note({ code: "import-failed", severity: "error", path: "", source: "bpmn-canvas", message: "Canvas import failed" });
      return cleanup;
    });
    const { figure, diagnostics } = render(payload, "BpmnCanvas");
    await settled(figure, "invalid");
    expect(cleanup).toHaveBeenCalledOnce();
    expect(diagnostics).toEqual([expect.objectContaining({ code: "diagram-payload-invalid", severity: "warning" })]);
  });

  it("should discard settlement during the lazy import", async () => {
    const { stop, node, diagnostics } = render(payload, "BpmnCanvas");
    // resolver continuation queues the dynamic import; cleanup precedes import settlement.
    await Promise.resolve();
    stop();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(node.childElementCount).toBe(0);
    expect(bpmn.mount).not.toHaveBeenCalled();
    expect(diagnostics).toEqual([]);
  });

  it("should discard a late serialization result before mounting", async () => {
    const pending = deferred<{ ok: boolean; xml: string; warnings: never[] }>();
    bpmn.toXml.mockReturnValue(pending.promise);
    const { stop, diagnostics } = render(payload, "BpmnCanvas");
    await vi.waitFor(() => expect(bpmn.toXml).toHaveBeenCalledOnce());
    stop();
    pending.resolve({ ok: true, xml: "<definitions/>", warnings: [] });
    await Promise.resolve();
    expect(bpmn.mount).not.toHaveBeenCalled();
    expect(diagnostics).toEqual([]);
  });

  it("should abort a pending canvas mount immediately on destroy", async () => {
    const pending = deferred<() => void>();
    const cleanup = vi.fn();
    bpmn.mount.mockReturnValue(pending.promise);
    const { stop, node, diagnostics } = render(payload, "BpmnCanvas");
    await vi.waitFor(() => expect(bpmn.mount).toHaveBeenCalledOnce());
    const signal = bpmn.mount.mock.calls[0]![3];
    stop();
    expect(signal?.aborted).toBe(true);
    pending.resolve(cleanup);
    await Promise.resolve();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(node.childElementCount).toBe(0);
    expect(diagnostics).toEqual([]);
  });
});

describe("runtime/render-action integration (B4, B11, B12, B16, B17)", () => {
  it("should settle rendered with a never-settling resolver and forward host warnings", async () => {
    const runtime = createElementRuntime("DecisionDossier");
    await runtime.ingest(fixture, undefined);
    expect(runtime.state).toBe("rendered");
    const ready = vi.fn();
    runtime.onSettle(ready);
    expect(ready).toHaveBeenCalledOnce();
    const node = document.createElement("div");
    const action = renderDossierAction(node, { runtime, diagramResolver: () => new Promise(() => {}) });
    stops.push(action.destroy);
    await vi.waitFor(() => expect(node.querySelector("figure")?.dataset.diagramState).toBe("pending"));
    action.update({ runtime, diagramResolver: () => null });
    await vi.waitFor(() => expect(node.querySelector("figure")?.dataset.diagramState).toBe("unresolved"));
    expect(runtime.state).toBe("rendered");
    expect(runtime.diagnostics).toEqual([expect.objectContaining({ code: "diagram-unresolved", severity: "warning", source: "host", path: "/root/document/sections/3" })]);
  });

  it("should discard the previous render and diagnostics when the envelope changes", async () => {
    const runtime = createElementRuntime("DecisionDossier");
    await runtime.ingest(fixture, undefined);
    const pending = deferred<null>();
    const node = document.createElement("div");
    const action = renderDossierAction(node, { runtime, diagramResolver: () => pending.promise });
    stops.push(action.destroy);
    await vi.waitFor(() => expect(node.querySelector("figure")).not.toBeNull());
    await runtime.ingest(inputsFixture, undefined);
    action.update({ runtime });
    pending.resolve(null);
    await vi.waitFor(() => expect(node.querySelector("figure")).toBeNull());
    expect(runtime.diagnostics).toEqual([]);
  });

  it("should add zero resolver calls for select/fold and keep resolved content on replacement", async () => {
    const runtime = createElementRuntime("DecisionDossier");
    const envelope = structuredClone(fixture);
    Object.assign(envelope.root.document.sections[2]!.options![0]!, { body: "Detailed argument. ".repeat(30) });
    await runtime.ingest(envelope, undefined);
    const node = document.createElement("div");
    const resolver = vi.fn(gantt);
    const action = renderDossierAction(node, { runtime, diagramResolver: resolver });
    stops.push(action.destroy);
    await vi.waitFor(() => expect(node.querySelector("figure")?.dataset.diagramState).toBe("resolved"));
    node.querySelector<HTMLButtonElement>("[data-option-id]")!.click();
    node.querySelector<HTMLButtonElement>("[data-option-fold]")!.click();
    const svg = node.querySelector("svg");
    const replacement = vi.fn(gantt);
    action.update({ runtime, diagramResolver: replacement });
    expect(node.querySelector("svg")).toBe(svg);
    expect(resolver).toHaveBeenCalledOnce();
    expect(replacement).not.toHaveBeenCalled();
  });
});
