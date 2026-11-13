/**
 * The `bpmn-canvas` ENGINE CHUNK (§6.6): everything `<st-bpmn-canvas>` needs
 * beyond the core — the F1 → BPMN 2.0 serialization, the semantic port that
 * makes F1 hydration the authoritative validation, and the canvas mount.
 * Dynamically imported by the element's core action (`render-action.ts`),
 * so a page that never mounts the element never downloads this chunk —
 * bpmn-moddle and the canvas library live here, not in the core bundle.
 */

import { f1ToXml, hydrateF1 } from "../../f1/f1-to-xml.js";
import { createBpmnCanvasPort } from "../../../ports/bpmn-canvas.js";
import type { SemanticPort } from "../../../ports/types.js";

/** The §4.3 semantic port: hydrating the F1 document IS the validation. */
export const port: SemanticPort = createBpmnCanvasPort((document: unknown) => hydrateF1(document));

/** The payload serializer the runtime calls (§4.3: engine owns the semantics). */
export const toXml = f1ToXml;

export { renderBpmn } from "../../bpmn-mount.js";
