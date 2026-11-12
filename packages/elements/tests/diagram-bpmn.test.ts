// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { renderBpmn } from "../src/element/dom/engines/bpmn-canvas.js";

const canvas = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@sentropic/bpmn-canvas", () => ({ createBpmnCanvas: canvas.create }));
afterEach(() => canvas.create.mockReset());
const payload = { kind: "bpmn" as const, xml: "<definitions/>", assetBase: undefined, watermark: undefined };

it("should abort and destroy a pending BPMN canvas before its ready promise settles", async () => {
  let settle!: () => void;
  const ready = new Promise<void>((resolve) => { settle = resolve; });
  const destroy = vi.fn();
  canvas.create.mockReturnValue({ ready, destroy, getDiagnostics: () => [] });
  const controller = new AbortController();
  const render = renderBpmn(document.createElement("div"), payload, vi.fn(), controller.signal);
  const engineSignal = canvas.create.mock.calls[0]![1].signal as AbortSignal;
  expect(engineSignal.aborted).toBe(false);
  controller.abort();
  expect(engineSignal.aborted).toBe(true);
  expect(destroy).toHaveBeenCalledOnce();
  settle();
  const stop = await render;
  stop();
  expect(destroy).toHaveBeenCalledOnce();
});

it("should mount no canvas when its parent render is already aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await renderBpmn(document.createElement("div"), payload, vi.fn(), controller.signal);
  expect(canvas.create).not.toHaveBeenCalled();
});

it("should destroy the canvas when engine readiness rejects", async () => {
  const destroy = vi.fn();
  canvas.create.mockReturnValue({ ready: Promise.reject(new Error("mount failed")), destroy, getDiagnostics: () => [] });
  await expect(renderBpmn(document.createElement("div"), payload, vi.fn())).rejects.toThrow("mount failed");
  expect(destroy).toHaveBeenCalledOnce();
});
