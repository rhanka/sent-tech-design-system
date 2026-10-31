/**
 * The shared orchestration of the three element wrappers (§6.2): one runes
 * holder per element instance, driving the template of its wrapper
 * component. The wrapper calls `ingest` from an effect whenever its
 * envelope or hostConfig prop changes. `ingest` validates FIRST in core
 * through the L1 singleton (§4.3, §6.6: an invalid envelope renders its
 * diagnostics without loading an engine), refuses envelopes bound to
 * another component (B7), loads the LAZY engine chunk only for a
 * renderable envelope of the two semantic components and registers its
 * port (§6.6), then produces the render payload or the §4.5 refusal the
 * error panel lists.
 *
 * `element-api.ts` exposes the holder's state through the custom element's
 * prototype (`element.state`, `element.diagnostics`, `element.ready`), so
 * hosts observe the element itself, never the runtime.
 */

import type { Diagnostic } from "../../validate/index.js";
import { engineLoadFailed } from "../../validate/diagnostics.js";
import { normalizeEnvelopeInput } from "../../validate/envelope.js";
import { getValidator, registerPort, type EngineChunkName } from "./validator.js";

/** The wrapper states a host can observe. */
export type ElementState = "idle" | "rendering" | "rendered" | "refused";

/** What one wrapper renders after a clean validation. */
export type ElementPayload =
  | { readonly kind: "bar-chart"; readonly props: Record<string, unknown> }
  | {
      readonly kind: "bpmn";
      readonly xml: string;
      readonly assetBase: string | undefined;
      readonly watermark: { readonly hidden: true; readonly license: string } | undefined;
    }
  | { readonly kind: "dossier"; readonly document: unknown };

/** The hostConfig shape the elements read (§6.5). */
export interface HostConfig {
  readonly theme?: unknown;
  readonly colorScheme?: unknown;
  readonly locale?: unknown;
  readonly assetBase?: unknown;
  readonly bpmn?: {
    readonly watermark?: {
      readonly hidden?: unknown;
      readonly license?: unknown;
    };
  };
}

/** The catalogue components L2 wraps. */
export type ElementComponent = "BarChart" | "BpmnCanvas" | "DecisionDossier";

/** The engine module each lazy component loads (chunk names per §6.6). */
const ENGINE_CHUNKS: Record<Exclude<ElementComponent, "BarChart">, EngineChunkName> = {
  BpmnCanvas: "bpmn-canvas",
  DecisionDossier: "focus",
};

/** Memoized engine chunk loads — one dynamic import per page and engine. */
const engineCache = new Map<ElementComponent, Promise<unknown>>();

async function loadEngine(component: ElementComponent): Promise<unknown> {
  const cached = engineCache.get(component);
  if (cached !== undefined) return cached;
  const loading =
    component === "BpmnCanvas"
      ? import("./engines/bpmn-canvas.js")
      : component === "DecisionDossier"
        ? import("./engines/focus-renderer.js")
        : Promise.reject(new Error("core components load no engine chunk"));
  const tracked = loading.catch((error) => {
    engineCache.delete(component);
    throw error;
  });
  engineCache.set(component, tracked);
  return tracked;
}

/** The envelope root: `component`, `id` and the component's props. */
function envelopeRoot(envelope: unknown): Record<string, unknown> {
  return (envelope as { root?: Record<string, unknown> }).root ?? {};
}

/**
 * B7: the elements are component-bound. The §4.5 code list is closed and
 * has no element-binding code; `unknown-component` fits because the
 * element's catalogue is the singleton of its own component — a
 * mismatching envelope targets no entry the element can render.
 * Rejected: `schema-violation` (the envelope IS schema-valid),
 * `semantic-invalid` (the owning runtime never saw it). The path is the
 * offending value, like every catalogue-side diagnostic.
 */
function componentMismatch(component: ElementComponent, found: string): Diagnostic {
  const tag = `st-${component.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
  return {
    code: "unknown-component",
    path: "/root/component",
    message: `<${tag}> requires root.component "${component}", got "${found}"`,
    severity: "error",
    source: "catalog",
    detail: { expected: component, found },
  };
}

/**
 * B8: the ONLY first-pass failure that may still load an engine is the
 * missing semantic port of THIS component's own lazy chunk (a structurally
 * clean envelope whose engine simply is not registered yet). Anything else
 * — structural, contract, mode, size, or another chunk's missing port —
 * refuses in core without loading.
 */
function needsOwnEngine(component: ElementComponent, errors: readonly Diagnostic[]): boolean {
  if (component === "BarChart") return false;
  const chunk = ENGINE_CHUNKS[component];
  return (
    errors.length > 0 &&
    errors.every(
      (diagnostic) =>
        diagnostic.code === "host-capability-missing" &&
        (diagnostic.detail as { chunk?: unknown } | undefined)?.chunk === chunk,
    )
  );
}

/**
 * §13.3/§13.4, W3: a watermark is passed to the engine ONLY as the §13.3
 * way-(a) form — `hidden: true` with a NON-BLANK license the host holds.
 * The license VALUE never appears in this file, and `hostConfig` is
 * readable in the browser (§6.5), so a host that puts a literal license
 * there is caught by the W4 guard, not by this element.
 */
export function bpmnWatermark(hostConfig: HostConfig | undefined):
  | { readonly hidden: true; readonly license: string }
  | undefined {
  const watermark = hostConfig?.bpmn?.watermark;
  if (watermark === undefined) return undefined;
  const { hidden, license } = watermark;
  if (hidden !== true) return undefined;
  if (typeof license !== "string" || license.trim() === "") return undefined;
  return { hidden: true, license };
}

/**
 * Create the runtime of one element instance. Called once from the wrapper
 * component's script; the returned holder is reactive in that component.
 */
export function createElementRuntime(component: ElementComponent) {
  let state = $state<ElementState>("idle");
  let diagnostics = $state<readonly Diagnostic[]>([]);
  let payload = $state<ElementPayload | null>(null);
  const settleListeners = new Set<() => void>();
  let settled = false;
  let sequence = 0;

  /** Notify the `element.ready` promise of the first terminal state. */
  function settle(next: ElementState) {
    state = next;
    if (!settled && (next === "rendered" || next === "refused")) {
      settled = true;
      for (const listener of settleListeners) listener();
    }
  }

  /** Subscribe to the first rendered/refused transition. */
  function onSettle(listener: () => void): () => void {
    if (settled) listener();
    else settleListeners.add(listener);
    return () => settleListeners.delete(listener);
  }

  /** A diagnostic the element itself produces (engine load, island). */
  function ownDiagnostics(...found: readonly Diagnostic[]): void {
    diagnostics = [...found];
  }

  /**
   * Append a diagnostic the ENGINE produced while rendering (a §4.5
   * warning such as `watermark-refused`, or an asset-rule degradation the
   * bpmn engine reports through `onDiagnostic`). Duplicated by
   * code+path+message, so a re-render of the same warning stays one row.
   */
  function noteEngineDiagnostic(diagnostic: Diagnostic): void {
    const duplicate = diagnostics.some(
      (existing) =>
        existing.code === diagnostic.code &&
        existing.path === diagnostic.path &&
        existing.message === diagnostic.message,
    );
    if (!duplicate) diagnostics = [...diagnostics, diagnostic];
  }

  async function ingest(envelope: unknown, hostConfig: HostConfig | undefined): Promise<void> {
    const ticket = ++sequence;
    state = "rendering";
    try {
      // B1: the canonical form, once — size and both validators judge the
      // JSON value the host transmits, never the raw JS object (§4.3).
      // Rendering reads this form too, so `undefined` props vanish there.
      const normalized = normalizeEnvelopeInput(envelope);
      // B8: validate FIRST in core, without loading any engine chunk (§6.6).
      const first = getValidator().validate(normalized.ok ? normalized.value : envelope);
      if (ticket !== sequence) return;
      // B7: component-bound before anything engine-shaped. A mismatching
      // envelope refuses here even when it is structurally valid (and even
      // when the first pass asks for ANOTHER chunk's port): this element
      // never renders another component and never loads for one.
      const seen = (
        (normalized.ok ? normalized.value : envelope) as { root?: { component?: unknown } }
      )?.root?.component;
      if (typeof seen === "string" && seen !== component) {
        diagnostics = [componentMismatch(component, seen)];
        payload = null;
        settle("refused");
        return;
      }
      const errors = first.filter((diagnostic) => diagnostic.severity === "error");
      if (errors.length > 0 && !needsOwnEngine(component, errors)) {
        diagnostics = [...first];
        payload = null;
        settle("refused");
        return;
      }
      if (component !== "BarChart" && errors.length > 0) {
        // Structurally clean, port missing: load THIS component's chunk,
        // register its port, and validate again — semantics included.
        const engine = await loadEngine(component);
        registerPort(ENGINE_CHUNKS[component], (engine as { port: import("../../ports/types.js").SemanticPort }).port);
        if (ticket !== sequence) return;
        const second = getValidator().validate(normalized.ok ? normalized.value : envelope);
        if (ticket !== sequence) return;
        const secondErrors = second.filter((diagnostic) => diagnostic.severity === "error");
        if (secondErrors.length > 0) {
          diagnostics = [...second];
          payload = null;
          settle("refused");
          return;
        }
        diagnostics = [...second];
      } else {
        diagnostics = [...first];
      }
      if (!normalized.ok) {
        // Unreachable: an unserializable envelope always fails validation
        // above. Kept so the render below provably reads the JSON form.
        payload = null;
        settle("refused");
        return;
      }
      const root = envelopeRoot(normalized.value);
      if (component === "BarChart") {
        const { component: _c, id: _i, ...props } = root;
        payload = { kind: "bar-chart", props };
      } else if (component === "BpmnCanvas") {
        const { toXml } = (await loadEngine(component)) as {
          toXml: (document: unknown) => Promise<
            { ok: true; xml: string; warnings: readonly unknown[] } | { ok: false; code: string; message: string }
          >;
        };
        const xml = await toXml(root.document);
        if (ticket !== sequence) return;
        if (!xml.ok) {
          diagnostics = [
            {
              code: "semantic-invalid",
              path: "/root/document",
              message: xml.message,
              severity: "error",
              source: "bpmn-canvas",
              detail: { code: xml.code },
            },
          ];
          payload = null;
          settle("refused");
          return;
        }
        payload = {
          kind: "bpmn",
          xml: xml.xml,
          assetBase: typeof hostConfig?.assetBase === "string" ? hostConfig.assetBase : undefined,
          watermark: bpmnWatermark(hostConfig),
        };
      } else {
        payload = { kind: "dossier", document: root.document };
      }
      settle("rendered");
    } catch (error) {
      if (ticket !== sequence) return;
      const cause = error instanceof Error ? error.message : String(error);
      const chunk = ENGINE_CHUNKS[component as Exclude<ElementComponent, "BarChart">];
      ownDiagnostics(
        chunk === undefined
          ? {
              code: "semantic-invalid",
              path: "",
              message: `the element failed to render the envelope: ${cause}`,
              severity: "error",
              source: "host",
              detail: { cause },
            }
          : engineLoadFailed(chunk, cause),
      );
      settle("refused");
    }
  }

  return {
    get state() {
      return state;
    },
    get diagnostics() {
      return diagnostics;
    },
    get payload() {
      return payload;
    },
    ingest,
    onSettle,
    noteEngineDiagnostic,
  };
}

export type ElementRuntime = ReturnType<typeof createElementRuntime>;
