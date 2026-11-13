import {
  canonicalise, createProfileRegistry, defaultProfileRegistry, documentRef, entityRef, occurrenceRef, viewRef,
  serialiseView, type ViewDocument,
} from "@sentropic/diagram-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createLayoutCache, type LayoutOptions, type LayoutResult } from "../../src/index.js";
import * as engine from "../../src/layout/engine.js";
import * as measured from "../../src/layout/measured.js";
import * as fingerprint from "../../src/layout/fingerprint.js";
import { buildDocument, measure } from "./fixtures.js";
import { pinnedMeasurer } from "./dc2a/scenes.js";

const document = buildDocument({ nodes: ["a"], links: [] });
const options: LayoutOptions = { registry: defaultProfileRegistry, measureText: measure, targetWidth: 1440 };
const fresh = engine.layoutDocument(document, options);
if (fresh.status !== "laid-out") throw new Error("cache test fixture refused");
const laidOut = fresh;
const mockPipeline = () => vi.spyOn(engine, "layoutDocument").mockImplementation(() => structuredClone(laidOut));
afterEach(() => vi.restoreAllMocks());

describe("layout cache", () => {
  it("should miss when the effective compatibility rank gap changes", () => {
    const cache = createLayoutCache();
    const first = cache.layout(document, { ...options, hints: { rankGap: 48 } });
    const second = cache.layout(document, { ...options, hints: { rankGap: 96 } });
    expect(second).not.toBe(first);
    expect(second).toEqual(engine.layoutDocument(document, { ...options, hints: { rankGap: 96 } }));
    expect(cache.stats()).toMatchObject({ misses: 2, hits: 0 });
    expect(cache.layout(document, { ...options, hints: { rankGap: 48 }, metrics: { rankGap: 99 } })).toBe(first);
  });

  it("should return the original object and canonical bytes without running the pipeline again", () => {
    const run = vi.spyOn(engine, "layoutDocument");
    const cache = createLayoutCache({ verifyImmutability: true });
    const first = cache.layout(document, options);
    const before = cache.stats();
    expect(cache.has(structuredClone(document), { ...options })).toBe(true);
    expect(cache.stats()).toEqual(before);
    expect(Object.is(cache.layout(structuredClone(document), options), first)).toBe(true);
    expect(first.status === "laid-out" && serialiseView(first.view)).toBe(serialiseView(laidOut.view));
    expect(run).toHaveBeenCalledTimes(1);
    expect(cache.stats()).toMatchObject({ hits: 1, misses: 1, entries: 1, evictions: 0 });
  });

  it("should canonicalise duplicate and unordered fold ids", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    const a = occurrenceRef("a"), b = occurrenceRef("b");
    const first = cache.layout(document, { ...options, collapsed: [b, a, a] });
    expect(cache.layout(document, { ...options, collapsed: [a, b] })).toBe(first);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("should share a state between omitted and explicit resolved row-pack defaults", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    const first = cache.layout(document, options);
    expect(cache.layout(document, {
      ...options, rowPack: { targetAspect: 1.78, tallBias: 1.6, emptyPenaltyWeight: 0.4, orientationHysteresis: 0.08 },
      metrics: { rowGapInline: 96, rowGapBlock: 72, gapInlineMax: 240, gapBlockMax: 240 },
    })).toBe(first);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("should invalidate each layout input including compatibility metrics and target width", () => {
    mockPipeline();
    const cache = createLayoutCache();
    const first = cache.layout(document, options);
    const variants: LayoutOptions[] = [
      { ...options, targetWidth: 360 },
      { ...options, collapsed: [occurrenceRef("a")] },
      { ...options, hints: { rootOrder: [entityRef("a")] } },
      { ...options, rowPack: { targetAspect: 2 } },
      { ...options, rowPack: { orientationHysteresis: 0.2 } },
      { ...options, viewId: viewRef("other") },
      ...(["nodePaddingX", "nodePaddingY", "nodeMinWidth", "nodeMinHeight", "containerPadding", "titlePaddingY", "rankGap", "clearance", "slotSpacing", "labelMargin", "rowGapInline", "rowGapBlock", "gapInlineMax", "gapBlockMax"] as const)
        .map((metric) => ({ ...options, metrics: { [metric]: 99 } })),
      { ...options, bindings: { schemaVersion: "1", rows: [] } },
      { ...options, registry: createProfileRegistry(defaultProfileRegistry.list().map((id) => ({ ...defaultProfileRegistry.get(id)!, version: 42 }))) },
    ];
    for (const variant of variants) expect(cache.layout(document, variant)).not.toBe(first);
    expect(cache.layout({ ...document, revision: document.revision + 1 }, options)).not.toBe(first);
    vi.spyOn(fingerprint, "layoutFingerprint").mockReturnValue("future-engine");
    expect(cache.layout(document, options)).not.toBe(first);
    expect(cache.stats().hits).toBe(0);
  });

  it("should fingerprint a measurer's version and role probes once per reference", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    const measureText = Object.assign(vi.fn(measure), { version: "v1" });
    const input = { ...options, measureText };
    const first = cache.layout(document, input);
    cache.layout(document, input);
    expect(measureText).toHaveBeenCalledTimes(3);
    expect(measureText.mock.calls.map((call) => call[1])).toEqual(["node", "container-title", "edge-label"]);
    // An equal function's probe permits reuse; a new advance or version invalidates.
    expect(cache.layout(document, { ...options, measureText: Object.assign((text: string, role: Parameters<typeof measure>[1]) => measure(text, role), { version: "v1" }) })).toBe(first);
    expect(cache.layout(document, { ...options, measureText: (text, role) => ({ ...measure(text, role), width: 99 }) })).not.toBe(first);
    measureText.version = "v2";
    expect(cache.layout(document, input)).not.toBe(first);
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("should probe all eight measured roles and invalidate presentation and source content", () => {
    const run = vi.spyOn(measured, "layoutMeasured").mockReturnValue(laidOut);
    const measureLines = vi.fn(pinnedMeasurer);
    const cache = createLayoutCache();
    const source = laidOut.view;
    const input = { ...options, measureLines };
    cache.layout(document, input, source);
    cache.layout(document, input, source);
    expect(measureLines.mock.calls.map(([request]) => request.role)).toEqual(["kicker", "title", "body", "detail", "footer", "subtitle", "legend-label", "edge-label"]);
    expect(measureLines.mock.calls.every(([request]) => request.text === "Mm09 É—" && request.availableWidth === 290)).toBe(true);
    cache.layout(document, input, { ...source, revision: source.revision + 1 });
    cache.layout(document, { ...input, presentation: { contract: { id: "diagram-presentation", version: 1 } } as unknown as LayoutOptions["presentation"] & {} }, source);
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("should derive effective folds from the retained view and keep camera state outside the key", () => {
    vi.spyOn(measured, "layoutMeasured").mockReturnValue(laidOut);
    const source = { ...laidOut.view, groups: { fold: { occurrence: occurrenceRef("a"), collapsed: true } } } as unknown as ViewDocument;
    const cache = createLayoutCache();
    const first = cache.layout(document, { ...options, measureLines: pinnedMeasurer }, source);
    expect(cache.layout(document, { ...options, measureLines: pinnedMeasurer, collapsed: [occurrenceRef("a")] }, source)).toBe(first);
    const cameraView = { ...source, presentation: { ...source.presentation, camera: { x: 10, y: 20, zoom: 0.5 } } };
    expect(cache.layout(document, { ...options, measureLines: pinnedMeasurer }, cameraView)).toBe(first);
  });

  it("should separate layout tokens from camera and motion tokens", () => {
    const run = mockPipeline();
    const tokens = { "--st-component-diagramZone-childGapInline": 24, "--st-component-diagramScene-maxDisplayScale": 0.9, "--st-component-diagramScene-transitionDuration": 240 };
    const cache = createLayoutCache({ tokens });
    const first = cache.layout(document, options);
    tokens["--st-component-diagramScene-maxDisplayScale"] = 0.8;
    tokens["--st-component-diagramScene-transitionDuration"] = 0;
    expect(cache.layout(document, options)).toBe(first);
    tokens["--st-component-diagramZone-childGapInline"] = 30;
    expect(cache.layout(document, options)).not.toBe(first);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("should alias the orientation fixed point but miss a genuine hysteresis flip", () => {
    const run = vi.spyOn(measured, "layoutMeasured").mockImplementation(() => ({ ...laidOut, orientations: { root: "rows", a: "columns" } }));
    const cache = createLayoutCache();
    const input = { ...options, measureLines: pinnedMeasurer };
    const first = cache.layout(document, input, laidOut.view);
    expect(cache.has(document, { ...input, previousOrientation: { root: "rows", a: "columns" } }, laidOut.view)).toBe(true);
    expect(cache.layout(document, { ...input, previousOrientation: { root: "rows" } }, laidOut.view)).toBe(first);
    expect(cache.layout(document, { ...input, previousOrientation: { root: "columns" } }, laidOut.view)).not.toBe(first);
    expect(run).toHaveBeenCalledTimes(2);
    expect(cache.stats()).toMatchObject({ entries: 2, hits: 1, misses: 2 });
  });

  const state = (n: number): LayoutOptions => ({ ...options, collapsed: [occurrenceRef(`state-${n}`)] });
  it("should retain exactly 32 states for two full passes at default bounds", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    const results = Array.from({ length: 32 }, (_, n) => cache.layout(document, state(n)));
    expect(cache.stats()).toMatchObject({ entries: 32, hits: 0, misses: 32, evictions: 0 });
    for (let n = 0; n < 32; n++) expect(cache.layout(document, state(n))).toBe(results[n]);
    expect(cache.stats()).toMatchObject({ entries: 32, hits: 32, misses: 32, evictions: 0 });
    expect(run).toHaveBeenCalledTimes(32);
  });

  it("should evict the eight oldest of 40 states and hit all 32 retained states", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    for (let n = 0; n < 40; n++) cache.layout(document, state(n));
    expect(cache.stats()).toMatchObject({ entries: 32, misses: 40, evictions: 8 });
    for (let n = 0; n < 8; n++) expect(cache.has(document, state(n))).toBe(false);
    for (let n = 8; n < 40; n++) cache.layout(document, state(n));
    expect(cache.stats()).toMatchObject({ entries: 32, hits: 32, misses: 40, evictions: 8 });
    cache.layout(document, state(0));
    expect(run).toHaveBeenCalledTimes(41);
  });

  it("should refresh recency on a hit while has leaves recency unchanged", () => {
    mockPipeline();
    const cache = createLayoutCache({ maxEntries: 2 });
    cache.layout(document, state(0)); cache.layout(document, state(1));
    cache.layout(document, state(0));
    expect(cache.has(document, state(1))).toBe(true);
    cache.layout(document, state(2));
    expect(cache.has(document, state(0))).toBe(true);
    expect(cache.has(document, state(1))).toBe(false);
  });

  it("should account for UTF-8 bytes and evict by bytes or bypass oversized results", () => {
    vi.spyOn(engine, "layoutDocument").mockReturnValue({ ...laidOut, view: { ...laidOut.view, groups: { unicode: { id: "unicode", label: "É— 😀" } } } });
    const probe = createLayoutCache();
    const result = probe.layout(document, options);
    if (result.status !== "laid-out") throw new Error("refused");
    const size = Buffer.byteLength(canonicalise(result.view)) + Buffer.byteLength("null") * 4;
    expect(Buffer.byteLength(canonicalise(result.view))).toBeGreaterThan(canonicalise(result.view).length);
    expect(probe.stats().bytes).toBe(size);
    const cache = createLayoutCache({ maxBytes: size });
    cache.layout(document, state(0)); cache.layout(document, state(1));
    expect(cache.stats()).toMatchObject({ entries: 1, bytes: size, evictions: 1 });
    const tiny = createLayoutCache({ maxBytes: size - 1 });
    expect(tiny.layout(document, options).status).toBe("laid-out");
    expect(tiny.stats()).toMatchObject({ entries: 0, bytes: 0, misses: 1 });
  });

  it("should bypass refusals, invalid inputs, and mismatched folded documents", () => {
    const cache = createLayoutCache();
    for (let n = 0; n < 2; n++) expect(cache.layout(document, { ...options, targetWidth: NaN }).status).toBe("refused");
    const wrong = { ...laidOut.view, semanticDocumentId: documentRef("another") };
    expect(cache.layoutFolded(document, wrong, options)).toEqual(measured.layoutFolded(document, wrong, options));
    expect(cache.stats()).toMatchObject({ entries: 0, bytes: 0, hits: 0, misses: 3 });
  });

  it("should clear retained objects and make disposal idempotent and terminal", () => {
    const run = mockPipeline();
    const cache = createLayoutCache();
    cache.layout(document, options); cache.clear();
    expect(cache.stats()).toMatchObject({ entries: 0, bytes: 0 });
    cache.layout(document, options); cache.dispose(); cache.dispose();
    expect(cache.has(document, options)).toBe(false);
    cache.layout(document, options); cache.layout(document, options);
    expect(cache.stats()).toMatchObject({ entries: 0, bytes: 0, hits: 0, misses: 4 });
    expect(run).toHaveBeenCalledTimes(4);
  });

  it("should detect caller mutation when explicit verification is enabled", () => {
    mockPipeline();
    const cache = createLayoutCache({ verifyImmutability: true });
    const result = cache.layout(document, options);
    if (result.status !== "laid-out") throw new Error("refused");
    (result.view as { revision: number }).revision++;
    expect(() => cache.layout(document, options)).toThrow("mutated");
  });

  it("should reject invalid bounds and allow a disabled cache", () => {
    for (const config of [{ maxEntries: -1 }, { maxEntries: 0.5 }, { maxBytes: Infinity }, { maxBytes: -1 }]) expect(() => createLayoutCache(config)).toThrow(RangeError);
    mockPipeline();
    const cache = createLayoutCache({ maxEntries: 0 });
    cache.layout(document, options);
    expect(cache.stats().entries).toBe(0);
  });
});
