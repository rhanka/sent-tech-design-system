import { dispatchIntent } from "./intents.js";
import type { ElementRuntime } from "./element-runtime.svelte.js";

interface RenderActionOptions {
  readonly runtime: ElementRuntime;
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
