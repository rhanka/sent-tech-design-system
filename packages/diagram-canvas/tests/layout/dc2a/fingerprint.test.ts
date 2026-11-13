/**
 * DC-2a §6.6 — the DC-2b seam: the fingerprint of a measured layout call,
 * over resolved numbers. `diagram-canvas` ships no cache; DC-2b keys its own
 * on this digest.
 */
import { describe, expect, it } from "vitest";

import {
  LAYOUT_ENGINE_VERSION,
  layoutFingerprint,
  layoutFingerprintInputs,
  type LayoutFingerprintInput,
  type LayoutOptions,
} from "../../../src/index.js";
import { layScene, occurrenceOf, sceneInput } from "./scenes.js";

const of = (options: LayoutFingerprintInput["options"], extra: Omit<LayoutFingerprintInput, "options"> = {}): string =>
  layoutFingerprint({ options, ...extra });

describe("DC-2a layout fingerprint (§6.6)", () => {
  it("resolves defaults in one place: absent options and the explicit DS defaults give one fingerprint", () => {
    const explicit: LayoutFingerprintInput["options"] = {
      rowPack: { targetAspect: 1.78, tallBias: 1.6, emptyPenaltyWeight: 0.4, orientationHysteresis: 0.08 },
      metrics: { rowGapInline: 96, rowGapBlock: 72, gapInlineMax: 240, gapBlockMax: 240 },
      collapsed: [],
      previousOrientation: {},
      hints: {},
    };
    expect(of({})).toBe(of(explicit));
    expect(of({})).toMatch(/^[0-9a-f]{16}$/);
    expect(layoutFingerprintInputs({ options: {} })).toMatchObject({
      engine: LAYOUT_ENGINE_VERSION,
      rowPack: { targetAspect: 1.78, tallBias: 1.6, emptyPenaltyWeight: 0.4, orientationHysteresis: 0.08 },
      gaps: { cardX: 96, cardY: 72, zoneX: 96, zoneY: 72, maxX: 240, maxY: 240 },
      fold: [],
      previousOrientation: [],
    });
  });

  it("changes with every input the placement depends on", () => {
    const base = of({});
    const variants: LayoutFingerprintInput["options"][] = [
      { collapsed: [occurrenceOf("sys-h2a")] },
      { rowPack: { targetAspect: 1.5 } },
      { rowPack: { tallBias: 1 } },
      { rowPack: { emptyPenaltyWeight: 0.8 } },
      { rowPack: { orientationHysteresis: 0.04 } },
      { metrics: { rowGapInline: 16 } },
      { metrics: { gapBlockMax: 28 } },
      { hints: { cardGapY: 20 } },
      { previousOrientation: { root: "columns" } },
      { hints: { rootOrder: ["entity:a" as never] } },
      { hints: { stretch: true } },
      { hints: { grouping: [{ id: "g", direction: "rows", items: ["entity:a" as never] }] } },
    ];
    const seen = new Set<string>([base]);
    for (const variant of variants) {
      const fingerprint = of(variant);
      expect(seen.has(fingerprint), JSON.stringify(variant)).toBe(false);
      seen.add(fingerprint);
    }
  });

  it("ignores what never re-packs a measured view, and the order of its records", () => {
    // D-3: the target width is not an input of measured placement.
    const options = { targetWidth: 360 } as unknown as LayoutFingerprintInput["options"];
    expect(of(options)).toBe(of({}));
    expect(of({ collapsed: [occurrenceOf("b"), occurrenceOf("a")] })).toBe(of({ collapsed: [occurrenceOf("a"), occurrenceOf("b")] }));
    expect(of({ previousOrientation: { root: "rows", "occurrence:e.z": "columns" } })).toBe(
      of({ previousOrientation: { "occurrence:e.z": "columns", root: "rows" } }),
    );
  });

  it("token version = digest of the resolved token numbers; measured sizes digest when a cache has them", () => {
    const tokens = { "diagramScene.maxDisplayScale": 0.62, "diagramScene.minReadableScale": 0.45 };
    expect(of({}, { tokens })).not.toBe(of({}));
    expect(of({}, { tokens })).toBe(of({}, { tokens: { "diagramScene.minReadableScale": 0.45, "diagramScene.maxDisplayScale": 0.62 } }));
    expect(of({}, { tokens: { ...tokens, "diagramScene.maxDisplayScale": 0.6 } })).not.toBe(of({}, { tokens }));
    // A gap token reaches the engine as a metric: it changes the token digest in the same call.
    const inputs = layoutFingerprintInputs({ options: { metrics: { rowGapBlock: 20 } } });
    expect(inputs["tokens"]).not.toBe(layoutFingerprintInputs({ options: {} })["tokens"]);
  });

  it("S-3: equal fingerprints mean equal bytes on the scenes; the measured sizes of a view key its cache entry", () => {
    const input = sceneInput("case-b", "unfolded");
    const options: Partial<LayoutOptions> = { collapsed: input.collapsed, hints: { ordering: input.ordering, rootOrder: input.rootOrder } };
    const first = layScene(input, {}, { rootOrder: input.rootOrder });
    const second = layScene(input, {}, { rootOrder: input.rootOrder });
    expect(JSON.stringify(second.view)).toBe(JSON.stringify(first.view));
    const folded = sceneInput("case-b", "folded");
    expect(of(options)).not.toBe(of({ ...options, collapsed: folded.collapsed }));
    // Feeding the emitted orientation map back is a new cache key and the same bytes (O-5).
    expect(of({ ...options, previousOrientation: first.orientations })).not.toBe(of(options));
    expect(JSON.stringify(layScene(input, { previousOrientation: first.orientations }, { rootOrder: input.rootOrder }).view)).toBe(JSON.stringify(first.view));
  });
});
