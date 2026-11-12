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
