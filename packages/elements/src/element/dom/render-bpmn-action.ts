import { engineLoadFailed } from "../../validate/diagnostics.js";
import type { ElementRuntime } from "./element-runtime.svelte.js";

interface RenderActionOptions {
  readonly runtime: ElementRuntime;
}

/** Load the canvas view only once a validated XML payload is ready. */
export function renderBpmnAction(node: HTMLElement, options: RenderActionOptions) {
  let controller: AbortController | undefined;

  function update({ runtime }: RenderActionOptions): void {
    controller?.abort();
    const payload = runtime.payload;
    if (payload?.kind !== "bpmn") return;
    controller = new AbortController();
    const { signal } = controller;

    void import("../bpmn-mount.js").then(async ({ renderBpmn }) => {
      if (!signal.aborted) await renderBpmn(node, payload, runtime.noteEngineDiagnostic, signal);
    }).catch((error: unknown) => {
      if (signal.aborted) return;
      runtime.noteEngineDiagnostic(engineLoadFailed("bpmn-canvas", error instanceof Error ? error.message : String(error)));
    });
  }

  update(options);
  return { update, destroy: () => controller?.abort() };
}
