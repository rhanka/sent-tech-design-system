/** Instance-owned, bounded memoisation around the complete layout/routing call. */
import {
  canonicalise,
  collapsedOf,
  tryCanonicalise,
  type OccurrenceRef,
  type SemanticDocument,
  type ViewDocument,
} from "@sentropic/diagram-core";

import { layoutDocument } from "./engine.js";
import { digestOf, layoutFingerprint } from "./fingerprint.js";
import { layoutFolded, layoutMeasured } from "./measured.js";
import { DEFAULT_ALLOCATED_LINES } from "./measure.js";
import { DEFAULT_LAYOUT_METRICS, type LayoutOptions, type LayoutResult, type LevelOrientation, type TextRole } from "./types.js";

export interface LayoutCacheOptions {
  readonly maxEntries?: number;
  readonly maxBytes?: number;
  readonly tokens?: Readonly<Record<string, number>>;
  readonly verifyImmutability?: boolean;
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

export interface LayoutCache {
  layout(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): LayoutResult;
  layoutFolded(document: SemanticDocument, sourceView: ViewDocument, options: LayoutOptions): LayoutResult;
  has(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): boolean;
  clear(): void;
  dispose(): void;
  stats(): LayoutCacheStats;
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

const roles: readonly TextRole[] = ["kicker", "title", "body", "detail", "footer", "subtitle", "legend-label", "edge-label"];
const cameraTokens = new Set([
  "--st-component-diagramScene-maxDisplayScale", "--st-component-diagramScene-minReadableScale",
  "--st-component-diagramScene-transitionDuration", "--st-foundation-motion-easing",
  "diagramScene.maxDisplayScale", "diagramScene.minReadableScale", "diagramScene.transitionDuration", "foundation.motion.easing",
]);

export function createLayoutCache(config: LayoutCacheOptions = {}): LayoutCache {
  const maxEntries = config.maxEntries ?? 32;
  const maxBytes = config.maxBytes ?? 16 * 1024 * 1024;
  if (!Number.isInteger(maxEntries) || maxEntries < 0 || !Number.isFinite(maxBytes) || maxBytes < 0) {
    throw new RangeError("cache bounds must be finite and non-negative; maxEntries must be an integer");
  }
  const entries = new Map<string, Entry>();
  const bases = new Map<string, Set<Entry>>();
  let measurers = new WeakMap<Function, { version: string | undefined; digest: string }>();
  // Documents, presentations and views are immutable inputs. Weak keys avoid
  // retaining an input graph after its caller and the bounded entries release it.
  let inputDigests = new WeakMap<object, string>();
  let bytes = 0;
  let hits = 0;
  let misses = 0;
  let evictions = 0;
  let disposed = false;

  function inputDigest(value: object, normalised: () => unknown = () => value): string | undefined {
    const known = inputDigests.get(value);
    if (known !== undefined) return known;
    const encoded = tryCanonicalise(normalised());
    if (!encoded.ok) return undefined;
    const digest = digestOf(encoded.text);
    inputDigests.set(value, digest);
    return digest;
  }

  function measurerDigest(options: LayoutOptions, measured: boolean): string {
    const fn = measured ? options.measureLines : options.measureText;
    if (fn === undefined) return "missing";
    const known = measurers.get(fn);
    if (known !== undefined && known.version === fn.version) return known.digest;
    const probe = measured
      ? roles.map((role) => options.measureLines!({ text: "Mm09 É—", role, availableWidth: 290, allocatedLines: DEFAULT_ALLOCATED_LINES[role], folded: false }))
      : (["node", "container-title", "edge-label"] as const).map((role) => options.measureText("Mm09 É—", role));
    const digest = digestOf(canonicalise({ version: fn.version, probe }));
    measurers.set(fn, { version: fn.version, digest });
    return digest;
  }

  function keys(document: SemanticDocument, options: LayoutOptions, sourceView?: ViewDocument): { base: string; exact: string } | undefined {
    const collapsed = [...new Set(options.collapsed ?? (sourceView === undefined ? [] : [...collapsedOf(sourceView)] as OccurrenceRef[]))].sort();
    const tokens = Object.fromEntries(Object.entries(config.tokens ?? {}).filter(([name]) => !cameraTokens.has(name)));
    const { previousOrientation: _previous, ...baseOptions } = options;
    const fingerprint = layoutFingerprint({ options: { ...baseOptions, collapsed }, tokens });
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
    if (documentDigest === undefined || presentationDigest === undefined || sourceViewDigest === undefined) return undefined;
    const metrics = { ...DEFAULT_LAYOUT_METRICS, ...options.metrics };
    const input = tryCanonicalise({
      fingerprint, targetWidth: options.targetWidth,
      // The fingerprint already resolves row gaps and routing metrics. These
      // remaining compatibility metrics also affect the returned view bytes.
      metrics: Object.fromEntries((["nodePaddingX", "nodePaddingY", "nodeMinWidth", "nodeMinHeight", "containerPadding", "titlePaddingY", "rankGap"] as const).map((name) => [name, name === "rankGap" ? options.hints?.rankGap ?? metrics.rankGap : metrics[name]])),
      pathKind: measured ? "measured" : "compatibility",
      documentDigest, presentationDigest, sourceViewDigest, registry,
      bindings: options.bindings === undefined ? "" : inputDigest(options.bindings),
    });
    // Invalid serialisable inputs still reach the engine's normal refusal path.
    if (!input.ok) return undefined;
    const base = digestOf(input.text) + measurerDigest(options, measured);
    return { base, exact: base + digestOf(canonicalise(options.previousOrientation ?? {})) };
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
    const result = sourceView !== undefined || options.presentation !== undefined
      ? layoutMeasured(document, options, sourceView)
      : layoutDocument(document, options);
    if (disposed || key === undefined || result.status === "refused" || maxEntries === 0) return result;
    const viewText = canonicalise(result.view, "view");
    const size = utf8ByteLength(viewText) + utf8ByteLength(canonicalise(result.measurements ?? null)) + utf8ByteLength(canonicalise(result.labelBoxes ?? null)) + utf8ByteLength(canonicalise(result.edgeBundles ?? null)) + utf8ByteLength(canonicalise(result.channels ?? null));
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
    measurers = new WeakMap();
    inputDigests = new WeakMap();
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
  };
}
