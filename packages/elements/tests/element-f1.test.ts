/**
 * The minimal F1→XML adapter of the `<st-bpmn-canvas>` element (§6.2, §10.2,
 * §14 L2): a moddle-JSON tree (`bpmn:Definitions`) becomes BPMN XML "at the
 * edge" — the owner rule « un seul modèle JSON moddle de bout en bout, XML
 * seulement en sortie » (§10.2).
 *
 * The adapter is MINIMAL and is replaced by the real F1 `hydrate`/`project`
 * once `@sentropic/bpmn-canvas` publishes it (§3.3 F1, U-7): it covers the
 * core BPMN + DI subset through bpmn-moddle's meta-model (unknown `$type`
 * refused, references resolved through the document's id index) and refuses
 * everything it cannot render — exactly the F1 behaviours measured on the
 * unpushed workbench (`BC-WB:src/io/moddle-json.ts`): `unknown-type` on an
 * unregistered `$type`, `unsupported-extension` on a qualified attribute or
 * an unregistered `xmlns`.
 *
 * RED HISTORY (observed 2026-11-05, before the implementation existed):
 * the suite failed at import — `src/element/f1/f1-to-xml.js` did not exist
 * (vitest: "Failed to resolve import").
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { f1ToXml } from "../src/element/f1/f1-to-xml.js";

const here = dirname(fileURLToPath(import.meta.url));

/** The committed F1 fixture used by the browser suite too (one source). */
const f1Path = join(here, "fixtures", "f1-order-process.json");
const f1OrderProcess = JSON.parse(readFileSync(f1Path, "utf8")) as unknown;

describe("the minimal F1→XML adapter", () => {
  it("turns the order-process fixture into BPMN XML with resolved references", async () => {
    const result = await f1ToXml(f1OrderProcess);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result.xml).toContain('<bpmn:definitions');
    expect(result.xml).toContain('id="order-process-definitions"');
    expect(result.xml).toContain('targetNamespace="https://example.com/order"');
    expect(result.xml).toContain('id="task-check-payment"');
    // references hydrate as ids, not elements (§10.2: one moddle JSON model)
    expect(result.xml).toContain('sourceRef="event-order-received"');
    expect(result.xml).toContain('targetRef="task-check-payment"');
    // DI rides along untouched — the plane, shapes and edges all serialize
    expect(result.xml).toContain("bpmndi:BPMNPlane");
    expect(result.xml).toContain("bpmndi:BPMNShape");
    expect(result.xml).toContain("bpmndi:BPMNEdge");
    expect(result.xml).toContain("<dc:Bounds");
    expect(result.xml).toContain("<di:waypoint");
    expect(result.warnings).toEqual([]);
  });

  it("refuses an unregistered $type with F1's own code (unknown-type)", async () => {
    const result = await f1ToXml({
      $type: "bpmn:Definitions",
      id: "d",
      targetNamespace: "https://x.example",
      rootElements: [{ $type: "acme:Widget", id: "w" }],
    });
    expect(result).toEqual({
      ok: false,
      code: "unknown-type",
      message: expect.stringContaining("acme:Widget"),
      pointer: "/rootElements/0/$type",
    });
  });

  it("refuses a reference that names no element in the document (unresolved-reference)", async () => {
    const result = await f1ToXml({
      $type: "bpmn:Definitions",
      id: "d",
      targetNamespace: "https://x.example",
      rootElements: [
        {
          $type: "bpmn:Process",
          id: "p",
          flowElements: [
            { $type: "bpmn:StartEvent", id: "s" },
            { $type: "bpmn:SequenceFlow", id: "f", sourceRef: "s", targetRef: "nope" },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected a refusal");
    expect(result.code).toBe("unresolved-reference");
    expect(result.message).toContain("nope");
  });

  it("refuses a tree that carries a function (§4.1: the envelope is data only)", async () => {
    const result = await f1ToXml({
      $type: "bpmn:Definitions",
      id: "d",
      targetNamespace: "https://x.example",
      evil: () => "no",
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected a refusal");
    expect(result.code).toBe("unsupported-extension");
  });

  it("refuses a non-object root and a tree with no $type (missing-$type)", async () => {
    expect((await f1ToXml("bpmn:Definitions")).ok).toBe(false);
    expect((await f1ToXml({ id: "d" })).ok).toBe(false);
    const refused = await f1ToXml({ id: "d" });
    expect(refused.ok).toBe(false);
    if (refused.ok) throw new Error("expected a refusal");
    expect(refused.code).toBe("missing-$type");
  });

  it("is not a global-lookup engine: the same tree twice yields the same XML", async () => {
    const a = await f1ToXml(f1OrderProcess);
    const b = await f1ToXml(f1OrderProcess);
    expect(a).toEqual(b);
  });
});
