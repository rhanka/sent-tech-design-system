// @vitest-environment node
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_DISPLAY_SCALE, FIT_ASPECT } from "@sentropic/diagram-canvas";
import DiagramSceneFigure from "./DiagramSceneFigure.vue";
import { flowFixture } from "../../diagram-canvas/dist-test-support/flowFixture.js";

describe("DC-2c Vue server render", () => {
  for (const count of [0, 1]) it(`renders ${count} flows without DOM globals`, async () => {
    expect(typeof window).toBe("undefined");expect(typeof document).toBe("undefined");
    const f=flowFixture(count),body=await renderToString(createSSRApp({render:()=>h(DiagramSceneFigure,{document:f.document,registry:f.options.registry,bindings:f.options.bindings,presentation:f.presentation,measureLines:f.options.measureLines})}));
    expect(body).toContain(`data-zoom="${DEFAULT_MAX_DISPLAY_SCALE}"`);expect(body).toContain(`aspect-ratio:${FIT_ASPECT}`);
    expect(body).toContain('data-scene-occurrence="occurrence:e.a"');expect(body).not.toContain("data-flow-pulse");
    if(count===1){expect(body).toContain('data-flow-arrow="occurrence:r.z"');expect(body).toMatch(/data-flow-badge="occurrence:r.z"[^>]*>1<\/button>/);}
    else {expect(body).not.toContain("data-flow-badge");expect(body).not.toContain("data-flow-active");}
  });
});
