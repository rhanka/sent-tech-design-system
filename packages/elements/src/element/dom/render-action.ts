/**
 * The core-chunk render actions of the two LAZY elements (§6.6): the wrapper
 * templates use these actions, and the actions import the engine chunks
 * DYNAMICALLY — this is the lazy boundary. A page that mounts only
 * `<st-bar-chart>` downloads the core chunk alone; the `bpmn-canvas` chunk
 * (bpmn-moddle + the canvas library) and the `focus` chunk load on the
 * first mount of their element and are memoized per page by the runtime's
 * engine cache. Cancellation is ticket-based: a re-render or destroy
 * during a pending load never mounts a stale canvas.
 */

import { dispatchIntent } from "./intents.js";
import type { ElementPayload, ElementRuntime } from "./element-runtime.svelte.js";

/** The render actions' shared parameter: the wrapper's runtime. */
export interface RenderActionOptions {
  readonly runtime: ElementRuntime;
}

/** The mount/update/destroy action the bpmn wrapper template uses. */
export function renderBpmnAction(node: HTMLElement, options: RenderActionOptions) {
  let current: RenderActionOptions = options;
  let ticket = 0;
  let stop: (() => void) | undefined;

  async function apply(): Promise<void> {
    const mine = ++ticket;
    const payload = current.runtime.payload;
    if (payload === null || payload.kind !== "bpmn") return;
    const engine = await import("./engines/bpmn-canvas.js");
    if (mine !== ticket) return;
    stop?.();
    stop = await engine.renderBpmn(node, payload, current.runtime.noteEngineDiagnostic);
    if (mine !== ticket) {
      stop?.();
      stop = undefined;
    }
  }

  void apply();
  return {
    update(next: RenderActionOptions) {
      current = next;
      void apply();
    },
    destroy() {
      ticket++;
      stop?.();
      stop = undefined;
    },
  };
}

/** The mount/update/destroy action the dossier wrapper template uses. */
export function renderDossierAction(node: HTMLElement, options: RenderActionOptions) {
  let current: RenderActionOptions = options;
  let ticket = 0;
  let stop: (() => void) | undefined;

  async function apply(): Promise<void> {
    const mine = ++ticket;
    const payload = current.runtime.payload;
    if (payload === null || payload.kind !== "dossier") return;
    const engine = await import("./engines/focus-renderer.js");
    if (mine !== ticket) return;
    stop?.();
    // The §4.6 intent: one card click, dispatched from inside the shadow
    // root as a composed event — the page hears it through the boundary.
    stop = engine.renderDossier(node, payload.document, (optionId) => {
      dispatchIntent(node, "choose-option", optionId);
    });
    if (mine !== ticket) {
      stop?.();
      stop = undefined;
    }
  }

  void apply();
  return {
    update(next: RenderActionOptions) {
      current = next;
      void apply();
    },
    destroy() {
      ticket++;
      stop?.();
      stop = undefined;
    },
  };
}
