/**
 * DE-2 step 7 (OWNER-ADDENDA asks 5 & 6):
 * - Arrow-direction convention (`source` = initiator of the action) with opt-in lint
 * - No opaque acronym as zone tag (`kicker`), opt-in non-blocking lint with DLR-315 allowlist
 */
import {
  CURRENT_SCHEMA_VERSION,
  DIAGRAM_PRESENTATION_CONTRACT_PIN,
  documentRef,
  entityRef,
  m3ProfileRegistry,
  occurrenceRef,
  relationRef,
  shippedExecutorBindings,
  type Entity,
  type Relation,
  type SemanticDocument,
} from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import {
  ARROW_DIRECTION_CONVENTION,
  createLayoutCache,
  DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST,
  isOpaqueAcronymZoneTag,
  layoutDocument,
  lintArrowDirection,
  lintDiagramConventions,
  lintZoneTagAcronyms,
} from "../../src/index.js";
import { layoutScene } from "../../src/presentation/diagramSceneModel.js";
import { measure } from "./fixtures.js";
import { pinnedMeasurer } from "./dc2a/scenes.js";

describe("isOpaqueAcronymZoneTag and DLR-315 allowlist (DE-2 ask 6)", () => {
  it("flags bare opaque acronyms without a descriptive label", () => {
    for (const tag of ["IAM", "VPC", "GCP", "CI/CD", "S3", "K8S", "BQ", "FS", "LLM", "API", "IAM · VPC", "DLR-315"]) {
      expect(isOpaqueAcronymZoneTag(tag), tag).toBe(true);
    }
  });

  it("accepts acronyms accompanied by a descriptive label and normal words", () => {
    for (const tag of [
      "IAM — Identity & Access Management",
      "IAM (Identity & Access)",
      "VPC · Réseau privé",
      "CI/CD — Build Pipeline",
      "Exécution · CLI",
      "GCP PROJECT (PROD)",
      "Zone Alpha",
      "Backend Services",
      "Plateforme Données",
      "CATALOGUE",
      "ORGANISATION",
      "Core",
      "App",
      "",
    ]) {
      expect(isOpaqueAcronymZoneTag(tag), tag).toBe(false);
    }
  });

  it("allows all existing DLR-315 product kickers by default", () => {
    expect(DEFAULT_ZONE_TAG_ACRONYM_ALLOWLIST).toEqual(
      expect.arrayContaining([
        "H2A",
        "SENTROPIC",
        "ENGRAM",
        "DESIGN SYSTEM",
        "SENTROPIC & 3RD PARTIES",
        "SENTROPIC & TIERS",
      ]),
    );
    for (const kicker of [
      "H2A",
      "h2a",
      "SENTROPIC",
      "ENGRAM",
      "DESIGN SYSTEM",
      "SENTROPIC & 3RD PARTIES",
      "SENTROPIC & TIERS",
    ]) {
      expect(isOpaqueAcronymZoneTag(kicker), kicker).toBe(false);
    }
  });

  it("supports extending the allowlist per caller", () => {
    expect(isOpaqueAcronymZoneTag("ACME")).toBe(true);
    expect(isOpaqueAcronymZoneTag("ACME", ["ACME"])).toBe(false);
  });
});

describe("lintArrowDirection (DE-2 ask 5)", () => {
  it("documents source-is-initiator and emits nothing when initiator metadata is absent", () => {
    expect(ARROW_DIRECTION_CONVENTION).toBe("source-is-initiator");
    const warnings = lintArrowDirection({
      edges: [
        { id: "occurrence:r.1", sourceEntity: "entity:a", targetEntity: "entity:b", arrowhead: "arrow" },
      ],
    });
    expect(warnings).toEqual([]);
  });

  it("passes when source is the declared initiator and flags inverted edges as info", () => {
    const warnings = lintArrowDirection({
      edges: [
        { id: "occurrence:r.ok", sourceEntity: "entity:client", targetEntity: "entity:api", arrowhead: "arrow" },
        { id: "occurrence:r.inv", sourceEntity: "entity:api", targetEntity: "entity:client", arrowhead: "arrow" },
        { id: "occurrence:r.undir", sourceEntity: "entity:api", targetEntity: "entity:client", arrowhead: "none" },
      ],
      initiators: {
        "occurrence:r.ok": "entity:client",
        "occurrence:r.inv": "client",
        "occurrence:r.undir": "entity:client",
      },
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      severity: "info",
      code: "arrow-direction-convention",
      refs: ["occurrence:r.inv"],
      details: {
        convention: "source-is-initiator",
        reason: "source-not-initiator",
        source: "entity:api",
        target: "entity:client",
        initiator: "client",
      },
    });
  });

  it("returns no diagnostics from lintDiagramConventions when opt-in flags are off", () => {
    expect(
      lintDiagramConventions({
        edges: [{ id: "r1", sourceEntity: "entity:b", targetEntity: "entity:a", initiator: "entity:a" }],
        zones: [{ id: "z1", tag: "IAM" }],
      }),
    ).toEqual([]);
    expect(
      lintZoneTagAcronyms({
        zones: [
          { id: "z-dlr", tag: "H2A" },
          { id: "z-ok", tag: "IAM — Identity & Access" },
          { id: "z-bad", tag: "VPC" },
        ],
      }).map((w) => ({ code: w.code, severity: w.severity, refs: w.refs })),
    ).toEqual([{ code: "zone-tag-opaque-acronym", severity: "info", refs: ["z-bad"] }]);
  });
});

describe("layout and scene integration of opt-in convention lints across fold states", () => {
  function buildConventionFixture(): {
    document: SemanticDocument;
    presentation: NonNullable<Parameters<typeof layoutDocument>[1]["presentation"]>;
  } {
    const entities: Record<string, Entity> = {};
    const relations: Record<string, Relation> = {};
    const add = (id: string, type: "node" | "container", name: string) => {
      entities[entityRef(id)] = {
        id: entityRef(id),
        profile: "generic@2",
        type,
        attributes: { name: { kind: "text", value: name } },
      };
    };
    add("zOuter", "container", "Platform Core");
    add("zInner", "container", "Private Network");
    add("zDlr", "container", "H2A Runtime");
    add("zLabeled", "container", "Identity Zone");
    add("a", "node", "Caller Service");
    add("b", "node", "Target Store");

    const contain = (p: string, c: string) => {
      const id = relationRef(`contains.${p}.${c}`);
      relations[id] = {
        id,
        profile: "generic@2",
        type: "contains",
        endpoints: [
          { role: "parent", target: entityRef(p) },
          { role: "child", target: entityRef(c) },
        ],
        attributes: {},
      };
    };
    contain("zOuter", "zInner");
    contain("zInner", "a");
    contain("zDlr", "b");

    relations[relationRef("l.ok")] = {
      id: relationRef("l.ok"),
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("a") },
        { role: "target", target: entityRef("b") },
      ],
      attributes: { label: { kind: "text", value: "writes" } },
    };
    relations[relationRef("l.inverted")] = {
      id: relationRef("l.inverted"),
      profile: "generic@2",
      type: "link",
      endpoints: [
        { role: "source", target: entityRef("b") },
        { role: "target", target: entityRef("a") },
      ],
      attributes: { label: { kind: "text", value: "callback" } },
    };

    const document: SemanticDocument = {
      documentId: documentRef("conventions-scene"),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      revision: 1,
      profileRefs: ["generic@2"],
      typeDefinitions: {},
      entities,
      relations,
      ports: {},
      resources: {},
      extensions: [],
    };
    const presentation = {
      contractPin: { ...DIAGRAM_PRESENTATION_CONTRACT_PIN },
      entities: {
        [occurrenceRef("e.zOuter")]: { form: "container" as const, text: { kicker: "SENTROPIC", title: "Platform Core" } },
        [occurrenceRef("e.zInner")]: { form: "container" as const, text: { kicker: "VPC", title: "Private Network" } },
        [occurrenceRef("e.zDlr")]: { form: "container" as const, text: { kicker: "H2A", title: "H2A Runtime" } },
        [occurrenceRef("e.zLabeled")]: {
          form: "container" as const,
          text: { kicker: "IAM — Identity & Access", title: "Identity Zone" },
        },
        [occurrenceRef("e.a")]: { form: "card" as const, text: { title: "Caller Service" } },
        [occurrenceRef("e.b")]: { form: "card" as const, text: { title: "Target Store" } },
      },
      legends: {},
      categoryTokens: [],
    };
    return { document, presentation };
  }

  it("emits zero convention warnings by default (opt-in off) and non-blocking info warnings when opted in", () => {
    const { document, presentation } = buildConventionFixture();
    const initiators = {
      [relationRef("l.ok")]: entityRef("a"),
      [relationRef("l.inverted")]: entityRef("a"),
    };

    // Opt-in OFF: zero convention diagnostics.
    const quiet = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: pinnedMeasurer,
      collapsed: [],
    });
    expect(quiet.status).toBe("laid-out");
    if (quiet.status !== "laid-out") return;
    expect(
      quiet.warnings.filter((w) => w.code === "arrow-direction-convention" || w.code === "zone-tag-opaque-acronym"),
    ).toEqual([]);

    // Opt-in ON: flags only `zInner` ("VPC") and `l.inverted`; allows `SENTROPIC`, `H2A`, and `"IAM — Identity & Access"`.
    const linted = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: pinnedMeasurer,
      collapsed: [],
      conventions: {
        arrowDirection: true,
        initiators,
        zoneTagAcronyms: true,
      },
    });
    expect(linted.status).toBe("laid-out");
    if (linted.status !== "laid-out") return;
    const arrowWarnings = linted.warnings.filter((w) => w.code === "arrow-direction-convention");
    const acronymWarnings = linted.warnings.filter((w) => w.code === "zone-tag-opaque-acronym");
    expect(arrowWarnings).toHaveLength(1);
    expect(arrowWarnings[0]!.severity).toBe("info");
    expect(arrowWarnings[0]!.details?.["initiator"]).toBe(entityRef("a"));
    expect(acronymWarnings).toHaveLength(1);
    expect(acronymWarnings[0]!.severity).toBe("info");
    expect(acronymWarnings[0]!.refs).toEqual([occurrenceRef("e.zInner")]);

    // Folding `zOuter` hides nested `zInner` ("VPC"), so acronym warning disappears;
    // lifted `l.inverted` still detects its inverted semantic initiator.
    const folded = layoutScene({
      document,
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      presentation,
      measureLines: pinnedMeasurer,
      collapsed: [occurrenceRef("e.zOuter")],
      conventions: {
        arrowDirection: true,
        initiators,
        zoneTagAcronyms: true,
      },
    });
    expect(folded.status).toBe("laid-out");
    if (folded.status !== "laid-out") return;
    expect(folded.warnings.filter((w) => w.code === "zone-tag-opaque-acronym")).toEqual([]);
    expect(folded.warnings.filter((w) => w.code === "arrow-direction-convention")).toHaveLength(1);
  });

  it("separates layout cache entries when convention lint options change", () => {
    const { document, presentation } = buildConventionFixture();
    const cache = createLayoutCache();
    const baseOptions = {
      registry: m3ProfileRegistry,
      bindings: shippedExecutorBindings,
      measureText: measure,
      measureLines: pinnedMeasurer,
      presentation,
      targetWidth: 1440,
      collapsed: [],
    };
    const off = cache.layout(document, baseOptions);
    const on = cache.layout(document, { ...baseOptions, conventions: { zoneTagAcronyms: true } });
    expect(off.status).toBe("laid-out");
    expect(on.status).toBe("laid-out");
    if (off.status !== "laid-out" || on.status !== "laid-out") return;
    expect(off.warnings.some((w) => w.code === "zone-tag-opaque-acronym")).toBe(false);
    expect(on.warnings.some((w) => w.code === "zone-tag-opaque-acronym")).toBe(true);
  });
});
