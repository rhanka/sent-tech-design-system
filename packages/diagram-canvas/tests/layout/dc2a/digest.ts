/**
 * DC-2a determinism digest (AC-7): one digest per view of the ten scenes over
 * everything a measured layout emits — the canonical view, the orientation
 * record, the label boxes and the warnings. Shared by the in-process gate and
 * the fresh-process child.
 */
import { serialiseView } from "@sentropic/diagram-core";

import { digestOf } from "../../../src/index.js";
import { CASE_IDS, layScene, sceneInput, viewNamesOf } from "./scenes.js";

export function sceneDigests(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const caseId of CASE_IDS) {
    for (const viewName of viewNamesOf(caseId)) {
      const input = sceneInput(caseId, viewName);
      const layout = layScene(input, {}, { rootOrder: input.rootOrder });
      out[`${caseId}/${viewName}`] = digestOf(
        [
          serialiseView(layout.view),
          JSON.stringify(Object.entries(layout.orientations)),
          JSON.stringify([...layout.labelBoxes]),
          JSON.stringify(layout.warnings),
        ].join("\n"),
      );
    }
  }
  return out;
}
