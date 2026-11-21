/**
 * BPMN semantic engine. F1 hydration validates the document and produces XML.
 * The canvas view loads separately after this engine accepts the document.
 */

import { f1ToXml, hydrateF1 } from "../../f1/f1-to-xml.js";
import { createBpmnCanvasPort } from "../../../ports/bpmn-canvas.js";
import type { SemanticPort } from "../../../ports/types.js";

/** The §4.3 semantic port: hydrating the F1 document IS the validation. */
export const port: SemanticPort = createBpmnCanvasPort((document: unknown) => hydrateF1(document));

/** The payload serializer the runtime calls (§4.3: engine owns the semantics). */
export const toXml = f1ToXml;
