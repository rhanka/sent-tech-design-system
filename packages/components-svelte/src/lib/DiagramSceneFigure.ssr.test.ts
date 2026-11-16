// @vitest-environment node
/**
 * DC-2a lot L4 — the scene host renders on a server: no `window`, no
 * `document`, no observer at module or init time. This file runs in the
 * `node` environment, where any of those names is a ReferenceError.
 */
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_DISPLAY_SCALE, FIT_ASPECT } from "@sentropic/diagram-canvas";
// Host inputs, read from the built sibling workspace (see the jsdom test).
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  m3ProfileRegistry,
  shippedExecutorBindings,
} from "../../../diagram-core/dist/index.js";
import DiagramSceneFigure from "./DiagramSceneFigure.svelte";
import type { DiagramSceneFigureProps } from "./DiagramSceneFigure.svelte";

describe("DiagramSceneFigure on the server", () => {
  it("renders the scene at its fit in a nominal 16:9 box without touching the DOM globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
    const props = {
      document: {
        documentId: "document:ssr",
        schemaVersion: CURRENT_SCHEMA_VERSION,
        revision: 1,
        profileRefs: ["generic@2"],
        typeDefinitions: {},
        entities: {
          "entity:solo": {
            id: "entity:solo",
            profile: "generic@2",
            type: "node",
            attributes: { name: { kind: "text", value: "solo" } },
          },
        },
        relations: {},
        ports: {},
        resources: {},
        extensions: [],
      },
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation: {
        contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
        entities: { "occurrence:e.solo": { form: "card", text: { title: "Card solo", body: "Does one thing" } } },
        legends: {},
        categoryTokens: [],
      },
      title: "Scene",
    } as unknown as DiagramSceneFigureProps;
    const { body } = render(DiagramSceneFigure, { props });
    expect(body).toContain("Card solo");
    expect(body).toContain('data-scene-occurrence="occurrence:e.solo"');
    // One card fits: readout 100 % at the maximum display scale.
    expect(body).toContain(`data-zoom="${DEFAULT_MAX_DISPLAY_SCALE}"`);
    expect(body).toContain('data-zoom-readout="100"');
    expect(body).toContain(`aspect-ratio:${FIT_ASPECT}`);
    expect(body).toContain('aria-label="Zoom in"');
    expect(body).toContain('aria-label="Zoom out"');
  });
});

describe("DC-2c A14 static flow output", () => {
  it("renders arrows and numbered badge text on the server", async () => {
    const { flowFixture } = await import("../../../diagram-canvas/test-support/flowFixture.js");
    const fixture = flowFixture(1);
    const { body } = render(DiagramSceneFigure, { props: { document: fixture.document, registry: fixture.options.registry, bindings: fixture.options.bindings, presentation: fixture.presentation, measureLines: fixture.options.measureLines } });
    expect(body).toContain('data-flow-arrow="occurrence:r.z"');
    expect(body).toMatch(/data-flow-badge="occurrence:r.z"[^>]*>1<\/button>/);
    expect(body).not.toContain("data-flow-pulse");
  });
  it("retains the normalized no-flow DOM contract including complete accessible text", async () => {
    const { readFileSync, writeFileSync } = await import("node:fs");
    const { flowFixture } = await import("../../../diagram-canvas/test-support/flowFixture.js");
    const f = flowFixture(0);
    const { body } = render(DiagramSceneFigure, { props: { document: f.document, registry: f.options.registry, bindings: f.options.bindings, presentation: f.presentation, measureLines: f.options.measureLines } });
    // Conditional ERD markup can add inter-element whitespace without changing the DOM.
    const normalize = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/\bsvelte-[a-z0-9]+/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    const baseline = new URL("./flow-fixtures/before.html", import.meta.url);
    if (process.env.UPDATE_DIAGRAM_SSR === '1') writeFileSync(baseline, body);
    expect(normalize(body)).toBe(normalize(readFileSync(baseline, "utf8")));
  });
});
