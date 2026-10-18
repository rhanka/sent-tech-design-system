/**
 * h2a's real dossier diagrams (SPEC §10.5, defects L-R7/L-R10): the five
 * `generic@1` documents h2a's dossier builder produced, copied verbatim
 * (`h2a-ecosystem.json` holds `scenes.{overview,models,knowledge,interfaces}`
 * and `h2a-fixture.json` the fifth). At 1200 px and 360 px each is laid out,
 * passes `validateView`, and carries no `label-unplaced`; `knowledge` at
 * 360 px is left-to-right at zoom 1. The measurer is the dossier host's:
 * 7 px per character, 16 px lines, every role alike.
 */
import { readFileSync } from "node:fs";

import {
  defaultProfileRegistry,
  formatDiagnostics,
  hasErrors,
  serialiseView,
  validateDocument,
  validateView,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  layoutDocument,
  type TextMeasurer,
} from "../../src/index.js";
import { replayUnheldLabels, shuffled } from "./fixtures.js";

/** The dossier host's measurer: 7 px per character, 16 px lines. */
const measure: TextMeasurer = (text) => ({ width: text.length * 7, height: 16 });

const directory = new URL(".", import.meta.url);
const ecosystem = JSON.parse(
  readFileSync(new URL("./h2a-ecosystem.json", directory), "utf8"),
) as { scenes: Record<string, { document: SemanticDocument }> };
const fixtureFile = JSON.parse(readFileSync(new URL("./h2a-fixture.json", directory), "utf8")) as SemanticDocument & {
  document?: SemanticDocument;
  scene?: SemanticDocument;
};

const documents: readonly (readonly [string, SemanticDocument])[] = [
  ...Object.entries(ecosystem.scenes).map(
    ([name, scene]) => [`ecosystem:${name}`, scene.document] as const,
  ),
  ["fixture", fixtureFile.documentId !== undefined ? fixtureFile : (fixtureFile.document ?? fixtureFile.scene!)],
];

const laidOut = (document: SemanticDocument, targetWidth: number) => {
  const refused = validateDocument(document, { registry: defaultProfileRegistry });
  expect(hasErrors(refused)).toBe(false);
  const result = layoutDocument(document, { registry: defaultProfileRegistry, measureText: measure, targetWidth });
  if (result.status !== "laid-out") throw new Error(`refused at ${targetWidth} px: ${JSON.stringify(result)}`);
  const diagnostics = validateView(result.view, document, { registry: defaultProfileRegistry });
  expect(formatDiagnostics(diagnostics)).toBe("");
  return result;
};

/**
 * The renderer replay: `placeEdgeLabels` on the final view — routes read back
 * with `relationRoute`, sizes from the same measurer, node and title shapes
 * read back from the view, relation ids in sorted order — holds every label,
 * exactly as the engine's last round did.
 */
const replayHoldsEveryLabel = (document: SemanticDocument, targetWidth: number): void => {
  const result = laidOut(document, targetWidth);
  expect(replayUnheldLabels(document, result.view, measure), `replay at ${targetWidth} px`).toEqual([]);
};

describe("h2a dossier diagrams", () => {
  for (const [name, document] of documents) {
    for (const targetWidth of [1200, 360]) {
      it(`${name} at ${targetWidth} px lays out with no label-unplaced and a valid view`, () => {
        const result = laidOut(document, targetWidth);
        expect(result.warnings.filter((warning) => warning.code === "label-unplaced")).toEqual([]);
        console.info(`${name} at ${targetWidth} px: ${result.fit.direction} ${result.fit.width}x${result.fit.height} zoom ${result.fit.zoom}${result.fit.pans ? " pans" : ""}`);
      });

      it(`${name} at ${targetWidth} px holds every label on the replay`, () => {
        replayHoldsEveryLabel(document, targetWidth);
      });
    }
  }

  it("knowledge at 360 px is left-to-right at zoom 1", () => {
    const knowledge = documents.find(([name]) => name === "ecosystem:knowledge")![1]!;
    const result = laidOut(knowledge, 360);
    expect(result.fit.direction).toBe("left-to-right");
    expect(result.fit.zoom).toBe(1);
    expect(result.fit.pans).toBe(false);
  });

  it("laying out twice, or shuffled, gives byte-identical views", () => {
    for (const [, document] of documents) {
      for (const targetWidth of [1200, 360]) {
        const reference = serialiseView(laidOut(document, targetWidth).view);
        expect(serialiseView(laidOut(document, targetWidth).view)).toBe(reference);
        expect(serialiseView(laidOut(shuffled(document, 7), targetWidth).view)).toBe(reference);
      }
    }
  });
});
