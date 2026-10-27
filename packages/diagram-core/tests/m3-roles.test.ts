/**
 * M3 §5.2 — type-family role satisfaction and matrix pairs.
 *
 * A new-format role's `entityTypes` is satisfied iff the target's resolved
 * chain contains an allowed family root; refined containers parent through any
 * hierarchy declared with that family. The retained endpoint codes, paths,
 * messages and details are unchanged, with no `seenChain`.
 */
import { describe, expect, it } from "vitest";

import {
  BPMN_SKELETON_PROFILE_ID,
  defaultProfileRegistry,
  text,
  validateDocument,
  type Profile,
  type SemanticDocument,
} from "../src/index.js";
import { baseDocument, ent, explicitLegacyOptions, port, rel, scopedOptions } from "./m3-helpers.js";
import { readFixture, stateOf } from "./fixtures.js";

const matrixProfile: Profile = {
  id: "synthetic@2",
  name: "synthetic",
  version: 2,
  completeness: "complete",
  entityTypes: [
    {
      id: "application-component",
      label: "Application component",
      attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
    },
    {
      id: "data-object",
      label: "Data object",
      attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
    },
  ],
  portTypes: [],
  relationTypes: [
    {
      id: "access",
      label: "Access",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
      ],
    },
  ],
  constraints: [
    {
      kind: "relationship-matrix",
      matrixId: "archimate-3.2",
      sourceRole: "source",
      targetRole: "target",
      tuples: [{ relationType: "access", sourceType: "application-component", targetType: "data-object" }],
    },
  ],
  limits: {},
  notes: [],
};

function matrixDocument(source: string, target: string): SemanticDocument {
  return {
    ...baseDocument(["synthetic@2"]),
    entities: {
      "entity:d": ent("d", "synthetic@2", "data-object", { name: text("D") }),
      "entity:c": ent("c", "synthetic@2", "application-component", { name: text("C") }),
    },
    relations: {
      "relation:r": rel("r", "synthetic@2", "access", [
        { role: "source", target: `entity:${source}` },
        { role: "target", target: `entity:${target}` },
      ]),
    },
  };
}

const syntheticProfile: Profile = {
  id: "synthetic@2",
  name: "synthetic",
  version: 2,
  completeness: "complete",
  entityTypes: [
    {
      id: "process",
      label: "Process",
      attributes: [{ name: "name", kind: "text", required: true, maxLength: 200 }],
    },
    {
      id: "task",
      label: "Task",
      attributes: [{ name: "name", kind: "text", maxLength: 200 }],
    },
  ],
  portTypes: [{ id: "port", label: "Port", directions: ["in", "out"] }],
  relationTypes: [
    {
      id: "link",
      label: "Link",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["process"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
      ],
    },
    {
      id: "kind-link",
      label: "Kind link",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
      ],
    },
  ],
  constraints: [],
  limits: {},
  notes: [],
};

function refinementDocument(): SemanticDocument {
  return {
    ...baseDocument(["synthetic@2"]),
    typeDefinitions: {
      "custom-process": { id: "custom-process", profile: "synthetic@2", baseType: "process", attributes: [] },
    },
    entities: {
      "entity:p": ent("p", "synthetic@2", "custom-process", { name: text("P") }),
      "entity:q": ent("q", "synthetic@2", "process", { name: text("Q") }),
    },
    relations: {
      "relation:r": rel("r", "synthetic@2", "link", [
        { role: "source", target: "entity:p" },
        { role: "target", target: "entity:q" },
      ]),
    },
  };
}

describe("endpoint kind refusal, unchanged", () => {
  it("reports role/source accepts entity, not a port, with the exact native object", () => {
    const document: SemanticDocument = {
      ...baseDocument(["synthetic@2"]),
      entities: {
        "entity:e": ent("e", "synthetic@2", "process", { name: text("E") }),
        "entity:q": ent("q", "synthetic@2", "process", { name: text("Q") }),
      },
      ports: { "port:p": port("p", "synthetic@2", "port", "e") },
      relations: {
        "relation:r": rel("r", "synthetic@2", "kind-link", [
          { role: "source", target: "port:p" },
          { role: "target", target: "entity:q" },
        ]),
      },
    };
    for (const options of [explicitLegacyOptions([syntheticProfile]), scopedOptions([syntheticProfile])]) {
      expect(validateDocument(document, options)).toEqual([
        {
          code: "endpoint-target-not-allowed",
          severity: "error",
          path: "relations.relation:r.endpoints[0].target",
          message: "role source accepts entity, not a port",
          refs: ["port:p"],
          details: { seenKind: "port", allowed: "entity" },
        },
      ]);
    }
  });
});

describe("endpoint family roles", () => {
  it("refuses a refinement under the legacy adapter with the exact native object", () => {
    expect(validateDocument(refinementDocument(), explicitLegacyOptions([syntheticProfile]))).toEqual([
      {
        code: "endpoint-target-not-allowed",
        severity: "error",
        path: "relations.relation:r.endpoints[0].target",
        message: "role source accepts entity types process; entity:p is a custom-process",
        refs: ["entity:p"],
        details: { seenType: "custom-process", allowed: "process" },
      },
    ]);
  });

  it("accepts the same refinement under the scoped adapter through its family root", () => {
    expect(validateDocument(refinementDocument(), scopedOptions([syntheticProfile]))).toEqual([]);
  });

  it("keeps the bpmn@1 custom-process distinction under the retained adapter", () => {
    const fixture = readFixture("valid/bpmn-skeleton-document.json");
    const source = stateOf(fixture).document;
    const process = source.entities["entity:process"] as NonNullable<(typeof source.entities)[string]>;
    const broken: SemanticDocument = {
      ...source,
      typeDefinitions: {
        "custom-process": {
          id: "custom-process",
          profile: BPMN_SKELETON_PROFILE_ID,
          baseType: "process",
          attributes: [],
        },
      },
      entities: {
        ...source.entities,
        "entity:process": { ...process, type: "custom-process" },
      },
    };
    expect(validateDocument(broken, { registry: defaultProfileRegistry })).toEqual([
      {
        code: "endpoint-target-not-allowed",
        severity: "error",
        path: "relations.relation:c1.endpoints[0].target",
        message:
          "role parent accepts entity types process, subProcess, participant, lane; entity:process is a custom-process",
        refs: ["entity:process"],
        details: { seenType: "custom-process", allowed: "process,subProcess,participant,lane" },
      },
    ]);
  });
});

describe("relationship-matrix pairs", () => {
  it("refuses a reversed pair with the exact matrix object", () => {
    expect(validateDocument(matrixDocument("d", "c"), scopedOptions([matrixProfile]))).toEqual([
      {
        code: "relationship-matrix-violation",
        severity: "error",
        path: "relations.relation:r.endpoints",
        message: "relation relation:r of type access is not allowed from data-object to application-component by matrix archimate-3.2",
        refs: ["relation:r", "entity:d", "entity:c"],
        details: {
          matrixId: "archimate-3.2",
          relationType: "access",
          sourceType: "data-object",
          targetType: "application-component",
        },
      },
    ]);
  });

  it("accepts the admitted ordered pair", () => {
    expect(validateDocument(matrixDocument("c", "d"), scopedOptions([matrixProfile]))).toEqual([]);
  });

  it("gives unknown-type diagnostics precedence and never duplicates a failure", () => {
    const dangling: SemanticDocument = {
      ...matrixDocument("c", "d"),
      relations: {
        "relation:r": rel("r", "synthetic@2", "access", [
          { role: "source", target: "entity:c" },
          { role: "target", target: "entity:absent" },
        ]),
      },
    };
    expect(
      validateDocument(dangling, scopedOptions([matrixProfile])).map((entry) => entry.code),
    ).toEqual(["dangling-reference"]);
  });
});
