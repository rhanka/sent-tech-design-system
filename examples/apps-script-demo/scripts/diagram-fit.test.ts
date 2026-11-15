// The diagram must be framed whole by the figure at every page width: the
// component does not draw below its readable scale, so the page picks the fold
// state. These tests run the real layout engine (no browser, no DOM).
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
  assert.deepEqual(names(3), ["path"]);
});

test("negative witness: under generic@1 a folded container keeps its members on the drawing", () => {
  const legacy = JSON.parse(JSON.stringify(diagramDocument).replaceAll("generic@2", "generic@1"));
  assert.equal(names(3, legacy).length, 11);
});

test("the fold states get narrower, down to one card", () => {
  const widths = foldLevelExtents().map((extent) => extent.width);
  assert.deepEqual(widths, [...widths].sort((a, b) => b - a));
  assert.deepEqual(foldLevelExtents().at(-1), { x: 0, y: 0, width: 460, height: 200 });
});

test("the state picked is framed whole at every figure width from 240 to 1600 px", () => {
  for (const windowHeight of [320, 480, 640, 900, 1200]) {
    for (let width = 240; width <= 1600; width += 1) {
      const level = pickFoldLevel(width, windowHeight);
      const fit = sceneFit({ bounds: foldLevelExtents()[level]!, viewWidth: width, windowHeight });
      assert.equal(fit.pans, false, `figure ${width} px, window ${windowHeight} px, level ${level}`);
      assert.ok(fit.zoom >= 0.45 * FIT_MARGIN - 1e-9, `margin at ${width} px, window ${windowHeight} px`);
      if (level > 0) assert.equal(framesWhole(level - 1, width, windowHeight), false, `a more detailed state fits at ${width} px`);
    }
  }
});

test("page widths: everything unfolded on a desktop, one card on a phone", () => {
  assert.equal(pickFoldLevel(1056, 900), 0); // 1280 px page: .demo-main is 68rem minus its padding
  assert.equal(pickFoldLevel(736, 1024), 2); // 768 px page
  assert.equal(pickFoldLevel(296, 640), 3); // 320 px page
  assert.equal(pickFoldLevel(0, 0), 3); // not measured
});

test("negative witness: the unfolded drawing is not framed by a phone-width figure", () => {
  assert.equal(framesWhole(0, 296, 640), false);
  assert.equal(sceneFit({ bounds: foldLevelExtents()[0]!, viewWidth: 296, windowHeight: 640 }).pans, true);
});
