/**
 * The browser-side validator singleton (§4.3, §6.2, §6.4): the L1 pure
 * validator core wired to the committed catalogue artifacts, plus the
 * registry where the LAZY engine chunks register their semantic ports when
 * they load. The registry is consulted at VALIDATION time (a Proxy over the
 * mutable map), so an element can load its engine chunk first, register
 * the port, then validate — and a page that never mounts a lazy element
 * never loads the chunk (§6.6).
 *
 * The structure seam is the eval-free interpreter (§6.4), NOT the ajv
 * bridge: ajv materialises every compiled validator through the `Function`
 * constructor, which the pilot and strict CSP rows forbid, so this module
 * imports the core orchestrator and the interpreter directly — the barrel
 * (`validate/index.js`) statically imports the ajv bridge and would drag
 * it back into the browser chunk. `tests/structure-interpreter.test.ts`
 * pins the interpreter to ajv issue-for-issue.
 */

import catalogJson from "../../../catalog.json";
import envelopeJson from "../../../envelope.json";
import type { SemanticPort } from "../../ports/types.js";
import { a2uiCommonTypes } from "../../generated/a2ui-common-types.js";
import { createInterpreterStructure } from "../../structure/interpreter.js";
import { createEnvelopeValidatorCore, type EnvelopeValidator } from "../../validate/envelope.js";

/** The engine chunk names of the catalogue (§4.3 item 2). */
export type EngineChunkName = "bpmn-canvas" | "focus";

const ports = new Map<string, SemanticPort>();

/** Ports resolved at validation time, not at validator creation. */
function portRegistry(): Partial<Record<string, SemanticPort>> {
  return new Proxy(
    {},
    {
      get(_target, key: string) {
        return ports.get(key);
      },
    },
  ) as Partial<Record<string, SemanticPort>>;
}

let validator: EnvelopeValidator | undefined;

/** The singleton, created on first use against the committed artifacts. */
export function getValidator(): EnvelopeValidator {
  if (validator === undefined) {
    validator = createEnvelopeValidatorCore({
      catalog: catalogJson,
      envelopeSchema: envelopeJson,
      commonTypes: a2uiCommonTypes,
      ports: portRegistry(),
      structure: createInterpreterStructure({
        catalog: catalogJson,
        envelopeSchema: envelopeJson,
        commonTypes: a2uiCommonTypes,
      }),
    });
  }
  return validator;
}

/** Called by the lazy engine loaders before the envelope is validated. */
export function registerPort(chunk: EngineChunkName, port: SemanticPort): void {
  ports.set(chunk, port);
}
