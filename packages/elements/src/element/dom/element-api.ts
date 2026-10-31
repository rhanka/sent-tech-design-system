/**
 * The wrapper API every element exposes on the custom element itself
 * (§6.2, AC-L2): `element.state`, `element.diagnostics` and
 * `element.ready`, defined on the registered class's prototype after the
 * Svelte custom element is defined. The values live in each instance's
 * runtime (`element-runtime.svelte.ts`); this module only connects them.
 *
 * `ready` settles (never rejects) the first time the element reaches
 * `rendered` or `refused` — the host's synchronization point for one
 * envelope render.
 */

import type { Diagnostic } from "../../validate/index.js";
import type { ElementRuntime, ElementState } from "./element-runtime.svelte.js";

const runtimes = new WeakMap<HTMLElement, ElementRuntime>();
const readyDeferreds = new WeakMap<HTMLElement, { promise: Promise<void>; resolve: () => void }>();

function deferred(element: HTMLElement): { promise: Promise<void>; resolve: () => void } {
  let existing = readyDeferreds.get(element);
  if (existing === undefined) {
    let resolve!: () => void;
    const promise = new Promise<void>((settle) => {
      resolve = settle;
    });
    existing = { promise, resolve };
    readyDeferreds.set(element, existing);
    const runtime = runtimes.get(element);
    runtime?.onSettle(resolve);
  }
  return existing;
}

/** The themed-root action calls this with the host element (see element-action.ts). */
export function registerRuntime(element: HTMLElement, runtime: ElementRuntime): void {
  runtimes.set(element, runtime);
  const pending = readyDeferreds.get(element);
  if (pending !== undefined) runtime.onSettle(pending.resolve);
}

/** Extend one registered custom element with the wrapper API. */
export function patchElementApi(tag: string): void {
  const constructor = customElements.get(tag);
  if (constructor === undefined) {
    throw new Error(`the ${tag} element is not registered; import its module first`);
  }
  const prototype = constructor.prototype as HTMLElement;
  Object.defineProperty(prototype, "state", {
    get(this: HTMLElement): ElementState {
      return runtimes.get(this)?.state ?? "idle";
    },
  });
  Object.defineProperty(prototype, "diagnostics", {
    get(this: HTMLElement): readonly Diagnostic[] {
      return runtimes.get(this)?.diagnostics ?? [];
    },
  });
  Object.defineProperty(prototype, "ready", {
    get(this: HTMLElement): Promise<void> {
      return deferred(this).promise;
    },
  });
}
