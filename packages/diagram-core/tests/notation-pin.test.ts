/**
 * `diagram-notation@1` pin: the digest is recomputed from the canonical bytes
 * of `{ schema, rules }` at test time and compared with the exported digest,
 * the pin and a literal. Editing the schema or the rules without a new
 * vocabulary version turns this red.
 *
 * The executor (`validateNotation`, `resolveNotation`) is not part of this
 * package yet: these tests gate the frozen vocabulary only.
 */
import { createHash } from "node:crypto";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";

import * as core from "../src/index.js";
import {
  canonicalBytes,
  DIAGRAM_NOTATION_DIGEST,
  DIAGRAM_NOTATION_ENCODINGS,
  DIAGRAM_NOTATION_NATURES,
  DIAGRAM_NOTATION_PIN,
  DIAGRAM_NOTATION_ROLES,
  DIAGRAM_NOTATION_RULES,
  DIAGRAM_NOTATION_SCHEMA,
  DIAGRAM_NOTATION_VARIANTS,
  DIAGRAM_NOTATION_VOCABULARY,
  DS_LAYOUT_VOCABULARY_PIN,
  sha256Hex,
  type NotationBlock,
} from "../src/index.js";

const PIN_LITERAL = "b4bfa7174a7a53ec23b8a8d7580d6bdfc3bab7f29deb1204aa2e4ce12424909f";

function expectDeepFrozen(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  expect(Object.isFrozen(value)).toBe(true);
  for (const child of Object.values(value)) expectDeepFrozen(child);
}

describe("diagram-notation@1 pin", () => {
  it("recomputes the digest from the canonical bytes of schema and rules", () => {
    const bytes = canonicalBytes({ schema: DIAGRAM_NOTATION_SCHEMA, rules: DIAGRAM_NOTATION_RULES });
    const recomputed = sha256Hex(bytes);
    expect(recomputed).toBe(DIAGRAM_NOTATION_DIGEST);
    expect(recomputed).toBe(DIAGRAM_NOTATION_PIN.contentDigest);
    expect(recomputed).toBe(PIN_LITERAL);
    expect(createHash("sha256").update(bytes, "utf8").digest("hex")).toBe(PIN_LITERAL);
  });

  it("is a PresentationPin with a bare 64-hex digest", () => {
    expect(DIAGRAM_NOTATION_PIN).toEqual({ id: "diagram-notation", version: "1", contentDigest: PIN_LITERAL });
    expect(DIAGRAM_NOTATION_PIN.contentDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(DIAGRAM_NOTATION_VOCABULARY).toBe(`${DIAGRAM_NOTATION_PIN.id}@${DIAGRAM_NOTATION_PIN.version}`);
    expect(DIAGRAM_NOTATION_SCHEMA["$id"]).toBe("engram:diagram-notation-schema/1");
  });

  it("moves when the schema or the rules change", () => {
    const schema = JSON.parse(JSON.stringify(DIAGRAM_NOTATION_SCHEMA)) as Record<string, unknown>;
    const rules = JSON.parse(JSON.stringify(DIAGRAM_NOTATION_RULES)) as { roles: { lane: { icon: string } } };
    expect(sha256Hex(canonicalBytes({ rules, schema }))).toBe(PIN_LITERAL);
    rules.roles.lane.icon = "optional";
    expect(sha256Hex(canonicalBytes({ schema, rules }))).not.toBe(PIN_LITERAL);
    const rules2 = JSON.parse(JSON.stringify(DIAGRAM_NOTATION_RULES)) as unknown;
    expect(sha256Hex(canonicalBytes({ schema: { ...schema, title: "x" }, rules: rules2 }))).not.toBe(PIN_LITERAL);
  });

  it("keeps schema, rules and pin deeply frozen", () => {
    expectDeepFrozen(DIAGRAM_NOTATION_SCHEMA);
    expectDeepFrozen(DIAGRAM_NOTATION_RULES);
    expectDeepFrozen(DIAGRAM_NOTATION_PIN);
    expect(() => Object.assign(DIAGRAM_NOTATION_PIN, { version: "2" })).toThrow();
  });

  it("is exported from the package entry next to the layout vocabulary pin", () => {
    expect(core.DIAGRAM_NOTATION_PIN).toBe(DIAGRAM_NOTATION_PIN);
    expect(core.DS_LAYOUT_VOCABULARY_PIN).toBe(DS_LAYOUT_VOCABULARY_PIN);
    expect(typeof core.validateLayoutHints).toBe("function");
    expect(DIAGRAM_NOTATION_PIN.contentDigest).not.toBe(DS_LAYOUT_VOCABULARY_PIN.contentDigest);
  });
});

describe("diagram-notation@1 schema and rules", () => {
  const ajv = new Ajv2020({ strict: true });
  const accepts = ajv.compile(DIAGRAM_NOTATION_SCHEMA as Record<string, unknown>);

  const block: NotationBlock = {
    vocabulary: "diagram-notation@1",
    entityTypes: {
      service: { role: "card", nature: "component", icon: "service", kicker: { attribute: "tier", values: { core: "Core" }, default: "Service" } },
      domain: { role: "container", nature: "component", icon: "domain", holds: ["card", "entity-table"] },
      team: { role: "lane", nature: "responsibility", holds: ["flow-node"] },
      table: { role: "entity-table", nature: "data" },
      step: { role: "flow-node", nature: "activity", variant: "task" },
    },
    relationTypes: {
      calls: { encoding: "arrow", ends: "arrow", provisional: { attribute: "status", equals: "provisional" } },
      contains: {
        encoding: "containment",
        lift: { via: { profile: "app", type: "contains" }, ancestors: [{ profile: "app", type: "domain" }] },
        fallback: { encoding: "footer", on: "child", label: "in" },
      },
      owner: { encoding: "detail", on: "owned", label: "Owned by" },
    },
  };

  it("accepts a block using every role and every encoding", () => {
    expect(accepts(block)).toBe(true);
    expect(new Set(Object.values(block.entityTypes).map((node) => node.role))).toEqual(new Set(DIAGRAM_NOTATION_ROLES));
  });

  it.each([
    ["another vocabulary", { ...block, vocabulary: "diagram-notation@2" }],
    ["an unknown mode", { ...block, mode: "lenient" }],
    ["an unknown block property", { ...block, theme: "dark" }],
    ["a node without nature", { ...block, entityTypes: { x: { role: "card" } } }],
    ["an unknown role", { ...block, entityTypes: { x: { role: "pill", nature: "component" } } }],
    ["an unknown node property", { ...block, entityTypes: { x: { role: "card", nature: "component", badge: "1" } } }],
    ["a text above 40", { ...block, entityTypes: { x: { role: "card", nature: "component", kicker: "k".repeat(41) } } }],
    ["a lookup without default", { ...block, entityTypes: { x: { role: "card", nature: "component", icon: { attribute: "a", values: {} } } } }],
    ["a relation without encoding", { ...block, relationTypes: { r: { ends: "arrow" } } }],
    ["an unknown encoding", { ...block, relationTypes: { r: { encoding: "badge" } } }],
    ["a lift without ancestors", { ...block, relationTypes: { r: { encoding: "containment", lift: { via: { profile: "p", type: "t" }, ancestors: [] } } } }],
    ["no relationTypes", { vocabulary: "diagram-notation@1", entityTypes: {} }],
  ])("refuses %s structurally", (_name, value) => {
    expect(accepts(value)).toBe(false);
  });

  it("has a rule row for every member of every closed set", () => {
    expect(Object.keys(DIAGRAM_NOTATION_RULES.roles).sort()).toEqual([...DIAGRAM_NOTATION_ROLES].sort());
    expect(Object.keys(DIAGRAM_NOTATION_RULES.variants).sort()).toEqual([...DIAGRAM_NOTATION_NATURES].sort());
    expect(Object.keys(DIAGRAM_NOTATION_RULES.encodings).sort()).toEqual([...DIAGRAM_NOTATION_ENCODINGS].sort());
    expect(Object.values(DIAGRAM_NOTATION_RULES.variants).flat().sort()).toEqual([...DIAGRAM_NOTATION_VARIANTS].sort());
  });

  it("keeps the rules inside the schema's closed sets", () => {
    const relation = (DIAGRAM_NOTATION_SCHEMA["$defs"] as Record<string, { properties: Record<string, unknown> }>)["relation"];
    const admitted = Object.keys(relation?.properties ?? {});
    for (const rule of Object.values(DIAGRAM_NOTATION_RULES.encodings)) {
      for (const property of rule.properties) expect(admitted).toContain(property);
      for (const property of rule.required) expect(rule.properties).toContain(property);
    }
    for (const rule of Object.values(DIAGRAM_NOTATION_RULES.roles)) {
      for (const nature of rule.natures) expect(DIAGRAM_NOTATION_NATURES).toContain(nature);
      for (const held of rule.holds) expect(DIAGRAM_NOTATION_ROLES).toContain(held);
    }
    // A component is a card or a container, a lane is a responsibility, and nothing else.
    expect(DIAGRAM_NOTATION_RULES.roles.card.natures).toEqual(["component"]);
    expect(DIAGRAM_NOTATION_RULES.roles.container.natures).toEqual(["component"]);
    expect(DIAGRAM_NOTATION_RULES.roles.lane.natures).toEqual(["responsibility"]);
    expect(DIAGRAM_NOTATION_RULES.roles["entity-table"].holds).toEqual([]);
  });
});
