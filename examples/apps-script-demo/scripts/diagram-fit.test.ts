// The diagram must be framed whole by the figure wherever one of its fold
// states can be: the component does not draw below its readable scale, so the
// page picks the fold state. Below that width (a phone) the page opens the
// state that keeps the structure, which scrolls. These tests run the real
// layout engine (no browser, no DOM).
import assert from "node:assert/strict";
import { test } from "node:test";
import { cardLineMeasurer, defaultCardMeasure, sceneCardMeasure } from "@sentropic/diagram-canvas/diagramCardModel";
import { layoutScene, resolveScene, sceneFit } from "@sentropic/diagram-canvas/diagramSceneModel";
import { m3ProfileRegistry, shippedExecutorBindings } from "@sentropic/diagram-core";
import { diagramDocument, diagramFoldLevels, diagramPresentation } from "../src/data.js";
import { FIT_MARGIN, foldLevelExtents, framesWhole, pickFoldLevel } from "../src/diagram-fit.js";

const sceneAt = (level: number, document: unknown = diagramDocument) => {
  const input = {
    document: document as typeof diagramDocument,
    presentation: diagramPresentation,
    registry: m3ProfileRegistry,
    bindings: shippedExecutorBindings,
    measureLines: cardLineMeasurer(sceneCardMeasure(defaultCardMeasure)),
    collapsed: diagramFoldLevels[level]!,
  };
  const result = layoutScene(input);
  assert.equal(result.status, "laid-out");
  if (result.status !== "laid-out") throw new Error("unreachable");
  return { result, scene: resolveScene(result, input) };
};
const names = (level: number, document?: unknown) =>
  sceneAt(level, document).scene.nodes.map((node) => node.occurrence.replace("occurrence:e.", "")).sort();

test("every fold state lays out without a warning", () => {
  diagramFoldLevels.forEach((_, level) => assert.deepEqual(sceneAt(level).result.warnings, [], `level ${level}`));
});

test("folding hides the members of the folded containers", () => {
  assert.equal(names(0).length, 11);
  assert.deepEqual(names(1), ["client", "gateway", "ingestion", "path", "processing", "queue", "storage", "validator", "worker"]);
  assert.deepEqual(names(2), ["client", "ingestion", "path", "processing", "storage"]);
  assert.equal(diagramFoldLevels.length, 3);
});

test("every fold state the page opens keeps the structure: the client, the three stages and links between them", () => {
  diagramFoldLevels.forEach((_, level) => {
    const { scene } = sceneAt(level);
    for (const name of ["client", "ingestion", "processing", "storage"]) assert.ok(names(level).includes(name), `level ${level}: ${name}`);
    assert.ok(scene.edges.length >= 3, `level ${level}: ${scene.edges.length} links`);
    for (const edge of scene.edges) assert.ok(edge.points.length >= 2, `level ${level}: ${edge.occurrence}`);
  });
  assert.equal(sceneAt(0).scene.edges.length, 6);
});

test("negative witness: under generic@1 a folded container keeps its members on the drawing", () => {
  const legacy = JSON.parse(JSON.stringify(diagramDocument).replaceAll("generic@2", "generic@1"));
  assert.equal(names(2, legacy).length, 11);
});

test("the fold states get narrower, down to the three stages folded", () => {
  const widths = foldLevelExtents().map((extent) => extent.width);
  assert.deepEqual(widths, [...widths].sort((a, b) => b - a));
  assert.deepEqual(foldLevelExtents().at(-1), { x: 0, y: 0, width: 1060, height: 624 });
});

test("from 240 to 1600 px the state picked is framed whole, or is the last one where no state can be", () => {
  const last = diagramFoldLevels.length - 1;
  let framedFrom: number | undefined;
  for (const windowHeight of [320, 480, 640, 900, 1200]) {
    for (let width = 240; width <= 1600; width += 1) {
      const level = pickFoldLevel(width, windowHeight);
      const fit = sceneFit({ bounds: foldLevelExtents()[level]!, viewWidth: width, windowHeight });
      if (level > 0) assert.equal(framesWhole(level - 1, width, windowHeight), false, `a more detailed state fits at ${width} px`);
      if (level === last && !framesWhole(last, width, windowHeight)) {
        // Too small for any state: the last one, at the readable scale (or
        // within the margin of it), where the figure scrolls.
        assert.ok(fit.zoom < 0.45 * FIT_MARGIN, `figure ${width} px, window ${windowHeight} px`);
        continue;
      }
      assert.equal(fit.pans, false, `figure ${width} px, window ${windowHeight} px, level ${level}`);
      // The margin, less the 2 px paint inset of the fit box and the 0.001 zoom step.
      assert.ok(fit.zoom >= 0.45 * (FIT_MARGIN - 0.01), `margin at ${width} px, window ${windowHeight} px`);
      if (windowHeight === 900) framedFrom ??= width;
    }
  }
  // In a 900 px high window every figure from this width up is framed whole.
  assert.equal(framedFrom, 518);
});

test("page widths: everything unfolded on a desktop, the three stages folded on a tablet and on a phone", () => {
  assert.equal(pickFoldLevel(1056, 900), 0); // 1280 px page: .demo-main is 68rem minus its padding
  assert.equal(pickFoldLevel(736, 1024), 2); // 768 px page
  assert.equal(framesWhole(2, 736, 1024), true);
  assert.equal(pickFoldLevel(296, 640), 2); // 320 px page: scrolls
  assert.equal(framesWhole(2, 296, 640), false);
  assert.equal(pickFoldLevel(0, 0), 2); // not measured
});

test("negative witness: the unfolded drawing is not framed by a phone-width figure", () => {
  assert.equal(framesWhole(0, 296, 640), false);
  assert.equal(sceneFit({ bounds: foldLevelExtents()[0]!, viewWidth: 296, windowHeight: 640 }).pans, true);
});
