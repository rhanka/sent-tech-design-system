/** Instance-owned, bounded memoisation around the complete layout/routing call. */
import {
  canonicalise,
  collapsedOf,
  tryCanonicalise,
  type OccurrenceRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { measureLegendProbe } from "../presentation/linkLegend.js";
import { isR7ConnectorPresentation } from "../r7Mode.js";
import { layoutDocument } from "./engine.js";
import { digestOf, layoutFingerprint } from "./fingerprint.js";
import { computeNominalCompositionPlan, layoutFolded, layoutMeasured } from "./measured.js";
import { DEFAULT_ALLOCATED_LINES } from "./measure.js";
import {
  buildLayoutKeyRecord,
  createSubtreeMemo,
  foldNeutralView,
  type NominalCompositionPlan,
  type SubtreeMemo,
} from "./plan.js";
import { type LayoutOptions, type LayoutResult, type LevelOrientation, type TextRole } from "./types.js";

export interface LayoutCacheOptions {
  readonly maxEntries?: number;
  readonly maxBytes?: number;
  readonly tokens?: Readonly<Record<string, number>>;
  readonly verifyImmutability?: boolean;
  /** Enable D-6 subtree memoisation for composed scenes (default `true`; optimisation only). */
  readonly subtreeMemo?: boolean;
}

/** Public configuration name shared by framework host entrypoints. */
export type LayoutCacheConfig = LayoutCacheOptions;

export interface LayoutCacheStats {
  readonly entries: number;
  readonly bytes: number;
  readonly hits: number;
  readonly misses: number;
  readonly evictions: number;
}

export interface LayoutCachePlanStats {
  readonly planEntries: number;
  readonly planHits: number;
  readonly planMisses: number;
  readonly planEvictions: number;
  readonly memoHits: number;
  readonly memoMisses: number;
}

export interface LayoutCache {
  layout(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): LayoutResult;
  layoutFolded(document: SemanticDocument, sourceView: ViewDocument, options: LayoutOptions): LayoutResult;
  has(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): boolean;
  clear(): void;
  dispose(): void;
  stats(): LayoutCacheStats;
  planStats(): LayoutCachePlanStats;
}

type Orientations = Readonly<Record<string, LevelOrientation>>;
interface Entry {
  readonly base: string;
  readonly exact: string;
  /** One recent alias per entry keeps orientation-key retention bounded too. */
  alias?: string;
  readonly previous: Orientations;
  readonly result: Extract<LayoutResult, { status: "laid-out" }>;
  readonly bytes: number;
  readonly digest?: string;
}

interface PlanCacheEntry {
  readonly plan: NominalCompositionPlan;
  readonly memo?: SubtreeMemo;
}

/** Pure ES2022: lone surrogates encode as the three-byte replacement character. */
function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && text.charCodeAt(index + 1) >= 0xdc00 && text.charCodeAt(index + 1) <= 0xdfff) {
      bytes += 4;
      index += 1;
    } else bytes += 3;
  }
  return bytes;
}

const roles: readonly TextRole[] = ["kicker", "title", "body", "detail", "footer", "subtitle", "legend-label", "edge-label", "flow-badge"];
const cameraTokens = new Set([
  "--st-component-diagramScene-maxDisplayScale", "--st-component-diagramScene-minReadableScale",
  "--st-component-diagramScene-transitionDuration", "--st-foundation-motion-easing",
  "diagramScene.maxDisplayScale", "diagramScene.minReadableScale", "diagramScene.transitionDuration", "foundation.motion.easing",
]);

export function createLayoutCache(config: LayoutCacheOptions = {}): LayoutCache {
  const maxEntries = config.maxEntries ?? 32;
  const maxBytes = config.maxBytes ?? 16 * 1024 * 1024;
  const useSubtreeMemo = config.subtreeMemo !== false;
  if (!Number.isInteger(maxEntries) || maxEntries < 0 || !Number.isFinite(maxBytes) || maxBytes < 0) {
    throw new RangeError("cache bounds must be finite and non-negative; maxEntries must be an integer");
  }
  const entries = new Map<string, Entry>();
  const bases = new Map<string, Set<Entry>>();
  const plans = new Map<string, PlanCacheEntry>();
  let measurers = new WeakMap<Function, { version: string | undefined; flows: boolean; digest: string }>();
  // Documents, presentations and views are immutable inputs. Weak keys avoid
  // retaining an input graph after its caller and the bounded entries release it.
  let inputDigests = new WeakMap<object, string>();
  let neutralViewDigests = new WeakMap<object, string>();
  let bytes = 0;
  let hits = 0;
  let misses = 0;
  let evictions = 0;
  let planHits = 0;
  let planMisses = 0;
  let planEvictions = 0;
  let disposed = false;

  function digestWith(map: WeakMap<object, string>, value: object, normalised: () => unknown = () => value): string | undefined {
    const known = map.get(value);
    if (known !== undefined) return known;
    const encoded = tryCanonicalise(normalised());
    if (!encoded.ok) return undefined;
    const digest = digestOf(encoded.text);
    map.set(value, digest);
    return digest;
  }

  function inputDigest(value: object, normalised: () => unknown = () => value): string | undefined {
    return digestWith(inputDigests, value, normalised);
  }

  function measurerDigest(options: LayoutOptions, measured: boolean, flows: boolean): string {
    const fn = measured ? options.measureLines : options.measureText;
    if (fn === undefined) return "missing";
    const known = measurers.get(fn);
    let digest: string;
    if (known !== undefined && known.version === fn.version && known.flows === flows) {
      digest = known.digest;
    } else {
      const probe = measured
        ? roles.filter((role) => flows || role !== "flow-badge").map((role) => options.measureLines!({ text: "Mm09 É—", role, availableWidth: 290, allocatedLines: DEFAULT_ALLOCATED_LINES[role], folded: false }))
        : (["node", "container-title", "edge-label"] as const).map((role) => options.measureText("Mm09 É—", role));
      digest = digestOf(canonicalise({ version: fn.version, probe }));
      measurers.set(fn, { version: fn.version, flows, digest });
    }
    if (measured && options.hints?.composition !== undefined && options.measureLines !== undefined) {
      const legendProbe = measureLegendProbe(options.measureLines, options.legendTitle, options.legendLabels);
      return digest + digestOf(canonicalise(legendProbe));
    }
    return digest;
  }

  function keys(
    document: SemanticDocument,
    options: LayoutOptions,
    sourceView?: ViewDocument,
  ): { base: string; exact: string; planKey?: string } | undefined {
    const collapsed = [...new Set(options.collapsed ?? (sourceView === undefined ? [] : [...collapsedOf(sourceView)] as OccurrenceRef[]))].sort();
    const tokens = Object.fromEntries(Object.entries(config.tokens ?? {}).filter(([name]) => !cameraTokens.has(name)));
    const { previousOrientation: _previous, ...baseOptions } = options;
    void _previous;
    const r7Routing = isR7ConnectorPresentation(options.presentation, sourceView, document);
    const fingerprint = layoutFingerprint({ options: { ...baseOptions, collapsed }, tokens, r7Routing });
    // Camera is host state; measured layout overwrites it rather than reading it.
    const source = (): unknown => sourceView === undefined ? undefined : {
      ...sourceView, presentation: { ...sourceView.presentation, camera: undefined },
    };
    const measured = sourceView !== undefined || options.presentation !== undefined;
    const documentDigest = inputDigest(document);
    const presentationDigest = options.presentation === undefined ? "" : inputDigest(options.presentation);
    const sourceViewDigest = sourceView === undefined ? "" : inputDigest(sourceView, source);
    const registry = [...options.registry.list()].sort().map((id) => {
      const profile = options.registry.get(id);
      return profile === undefined ? [id] : [id, profile.version, inputDigest(profile)];
    });
    const bindingsDigest = options.bindings === undefined ? "" : inputDigest(options.bindings);
    if (documentDigest === undefined || presentationDigest === undefined || sourceViewDigest === undefined) return undefined;
    const input = tryCanonicalise(
      buildLayoutKeyRecord({
        fingerprint,
        options,
        measured,
        documentDigest,
        presentationDigest,
        sourceViewDigest,
        registryDigest: registry,
        bindingsDigest,
        includeTargetWidth: true,
      }),
    );
    // Invalid serialisable inputs still reach the engine's normal refusal path.
    if (!input.ok) return undefined;
    const mDigest = measurerDigest(options, measured, Object.values(document.relations).some((r) => r.type === "flow-step"));
    const base = digestOf(input.text) + mDigest;
    const composed = measured && options.hints?.composition !== undefined;
    // Include previousOrientation in the exact result key for composed scenes too (F-4):
    // fixed-point aliasing still hits via find(), while genuinely different previousOrientation
    // misses the result cache and exercises the plan/memo path rather than short-circuiting.
    const exact = base + digestOf(canonicalise(options.previousOrientation ?? {}));
    if (!composed) return { base, exact };

    // Derived nominal plan key (§4.2 S-1): same record without fold, previousOrientation, or targetWidth,
    // using the fold-neutral source view digest and the same measurer digest (legend probe included).
    const planFingerprint = layoutFingerprint({ options: { ...baseOptions, collapsed: [] }, tokens, r7Routing });
    const neutralSourceDigest =
      sourceView === undefined ? "" : digestWith(neutralViewDigests, sourceView, () => foldNeutralView(sourceView));
    if (neutralSourceDigest === undefined) return { base, exact };
    const planInput = tryCanonicalise(
      buildLayoutKeyRecord({
        fingerprint: planFingerprint,
        options,
        measured,
        documentDigest,
        presentationDigest,
        sourceViewDigest: neutralSourceDigest,
        registryDigest: registry,
        bindingsDigest,
        includeTargetWidth: false,
      }),
    );
    if (!planInput.ok) return { base, exact };
    return { base, exact, planKey: digestOf(planInput.text) + mDigest };
  }

  function find(key: { base: string; exact: string }, previous: Orientations = {}): Entry | undefined {
    const candidates = bases.get(key.base);
    if (candidates === undefined) return undefined;
    for (const entry of candidates) if (entry.exact === key.exact || entry.alias === key.exact) return entry;
    for (const entry of candidates) {
      if (Object.entries(entry.result.orientations ?? {}).every(([level, emitted]) => previous[level] === emitted || previous[level] === entry.previous[level])) return entry;
    }
    return undefined;
  }

  function remove(entry: Entry): void {
    entries.delete(entry.exact);
    bytes -= entry.bytes;
    const bucket = bases.get(entry.base)!;
    bucket.delete(entry);
    if (bucket.size === 0) bases.delete(entry.base);
  }

  function resolvePlanEntry(
    planKey: string,
    document: SemanticDocument,
    options: LayoutOptions,
    sourceView?: ViewDocument,
  ): { readonly status: "ok"; readonly entry: PlanCacheEntry } | { readonly status: "refused"; readonly result: LayoutResult } {
    const existing = plans.get(planKey);
    if (existing !== undefined) {
      planHits += 1;
      plans.delete(planKey);
      plans.set(planKey, existing);
      return { status: "ok", entry: existing };
    }
    planMisses += 1;
    const built = computeNominalCompositionPlan(document, options, sourceView);
    if (built.status === "refused") return built;
    const entry: PlanCacheEntry = {
      plan: built.plan,
      ...(useSubtreeMemo ? { memo: createSubtreeMemo() } : {}),
    };
    if (!disposed && maxEntries > 0) {
      plans.set(planKey, entry);
      while (plans.size > maxEntries) {
        const oldest = plans.keys().next().value;
        if (oldest === undefined) break;
        plans.delete(oldest);
        planEvictions += 1;
      }
    }
    return { status: "ok", entry };
  }

  function layout(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): LayoutResult {
    const key = disposed ? undefined : keys(document, options, sourceView);
    const entry = key === undefined ? undefined : find(key, options.previousOrientation);
    if (entry !== undefined) {
      if (config.verifyImmutability && entry.digest !== digestOf(canonicalise(entry.result.view, "view"))) {
        throw new Error("cached layout view was mutated by its caller");
      }
      hits += 1;
      entry.alias = key!.exact;
      entries.delete(entry.exact);
      entries.set(entry.exact, entry);
      return entry.result;
    }
    misses += 1;
    let result: LayoutResult;
    if (sourceView !== undefined || options.presentation !== undefined) {
      if (key?.planKey !== undefined) {
        const resolved = resolvePlanEntry(key.planKey, document, options, sourceView);
        if (resolved.status === "refused") return resolved.result;
        result = layoutMeasured(document, options, sourceView, {
          plan: resolved.entry.plan,
          ...(resolved.entry.memo === undefined ? {} : { memo: resolved.entry.memo }),
        });
      } else {
        result = layoutMeasured(document, options, sourceView);
      }
    } else {
      result = layoutDocument(document, options);
    }
    if (disposed || key === undefined || result.status === "refused" || maxEntries === 0) return result;
    const viewText = canonicalise(result.view, "view");
    const size = utf8ByteLength(viewText) + utf8ByteLength(canonicalise(result.measurements ?? null)) + utf8ByteLength(canonicalise(result.labelBoxes ?? null)) + utf8ByteLength(canonicalise(result.edgeBundles ?? null)) + utf8ByteLength(canonicalise(result.channels ?? null)) + (result.linkLegend === undefined ? 0 : utf8ByteLength(canonicalise(result.linkLegend)));
    if (size > maxBytes) return result;
    const stored: Entry = {
      base: key.base, exact: key.exact, previous: { ...options.previousOrientation }, result, bytes: size,
      ...(config.verifyImmutability ? { digest: digestOf(viewText) } : {}),
    };
    entries.set(stored.exact, stored);
    const bucket = bases.get(key.base) ?? new Set<Entry>();
    bucket.add(stored);
    bases.set(key.base, bucket);
    bytes += size;
    while (entries.size > maxEntries || bytes > maxBytes) {
      remove(entries.values().next().value!);
      evictions += 1;
    }
    return result;
  }

  function clear(): void {
    entries.clear();
    bases.clear();
    plans.clear();
    measurers = new WeakMap();
    inputDigests = new WeakMap();
    neutralViewDigests = new WeakMap();
    bytes = 0;
  }

  return {
    layout,
    layoutFolded: (document, sourceView, options) => {
      if (sourceView.semanticDocumentId !== document.documentId) {
        misses += 1;
        return layoutFolded(document, sourceView, options);
      }
      return layout(document, options, sourceView);
    },
    has: (document, options, sourceView) => {
      if (disposed) return false;
      const key = keys(document, options, sourceView);
      return key !== undefined && find(key, options.previousOrientation) !== undefined;
    },
    clear,
    dispose: () => { clear(); disposed = true; },
    stats: () => ({ entries: entries.size, bytes, hits, misses, evictions }),
    planStats: () => {
      let memoHits = 0;
      let memoMisses = 0;
      for (const entry of plans.values()) {
        if (entry.memo !== undefined) {
          const st = entry.memo.stats();
          memoHits += st.hits;
          memoMisses += st.misses;
        }
      }
      return { planEntries: plans.size, planHits, planMisses, planEvictions, memoHits, memoMisses };
    },
  };
}
