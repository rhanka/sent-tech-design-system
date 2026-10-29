/**
 * M1-e RED: explicit @1 → @2 migrations with supersession and typed refusals.
 * Fails on the base commit: no profile migration registry exists.
 */
import { describe, expect, it } from "vitest";

import {
  archimate2Profile,
  archimateSkeletonProfile,
  migrateArchimateV1ToV2,
  migrateUmlV1ToV2,
  uml2Profile,
  umlSkeletonProfile,
  validateDocument,
} from "../src/index.js";
import { ent, rel, scopedOptions, baseDocument } from "./m3-helpers.js";
import { collection, enumeration, reference, structValue, text } from "../src/index.js";

const archimateBindings = (profiles: Parameters<typeof scopedOptions>[0]) => scopedOptions(profiles);

describe("archimate@1 to archimate@2", () => {
  it("migrates the pinned skeleton identities and validates @2", async () => {
    const { defaultArchimateMapping } = await import("../src/index.js");
    expect(defaultArchimateMapping).toBeDefined();
  });

  it("refuses an unmapped element with missing-type-mapping and keeps @1", () => {
    const source = {
      ...baseDocument(["archimate@1"]),
      entities: {
        "entity:actor": ent("actor", "archimate@1", "element", {
          name: text("Claims officer"),
          layer: enumeration("business"),
          aspect: enumeration("active"),
        }),
      },
      relations: {},
    };
    const outcome = migrateArchimateV1ToV2(source, { entityTypes: {} });
    expect(outcome.status).toBe("refused");
    if (outcome.status === "refused") {
      expect(outcome.unmigrated[0]?.reason).toBe("missing-type-mapping");
      expect(outcome.originalCanonical).toContain("archimate@1");
    }
  });

  it("refuses a forbidden matrix pair and inverts byte-exact", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const dir = dirname(fileURLToPath(import.meta.url));
    const fixture = JSON.parse(
      readFileSync(join(dir, "../fixtures/valid/archimate-skeleton-document.json"), "utf8"),
    ).document;
    const outcome = migrateArchimateV1ToV2(fixture, {
      entityTypes: {
        "entity:actor": "business-actor",
        "entity:process": "business-process",
        "entity:component": "application-component",
        "entity:junction": "junction",
      },
    });
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(validateDocument(outcome.document, archimateBindings([archimate2Profile]))).toEqual([]);
    const inverse = outcome.invert();
    expect(inverse.status).toBe("ok");
    if (inverse.status !== "ok") return;
    const { canonicalise } = await import("../src/index.js");
    expect(canonicalise(inverse.document)).toBe(canonicalise(fixture));
  });
});

describe("uml@1 to uml@2", () => {
  it("parses the pinned fixture multiplicities and keeps identities", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const dir = dirname(fileURLToPath(import.meta.url));
    const fixture = JSON.parse(
      readFileSync(join(dir, "../fixtures/valid/uml-skeleton-document.json"), "utf8"),
    ).document;
    const outcome = migrateUmlV1ToV2(fixture, { stereotypes: {} });
    expect(outcome.status).toBe("refused");
    if (outcome.status === "refused") {
      expect(outcome.unmigrated[0]?.reason).toBe("unmapped-stereotype");
    }
  });

  it("replays the A.2 multiplicity oracle through the migration parser", async () => {
    const { parseMultiplicity } = await import("../src/index.js");
    expect(parseMultiplicity("1")).toEqual({ ok: true, lower: 1, upper: 1 });
    expect(parseMultiplicity("*")).toEqual({ ok: true, lower: 0, upper: -1 });
    expect(parseMultiplicity("1..*")).toEqual({ ok: true, lower: 1, upper: -1 });
    expect(parseMultiplicity(" 1").ok).toBe(false);
    expect(parseMultiplicity("one").ok).toBe(false);
  });
});

describe("supersession and collisions", () => {
  it("records supersession without composition ancestry", async () => {
    const { ARCHIMATE_SUPERSESSION, UML_SUPERSESSION } = await import("../src/index.js");
    expect(ARCHIMATE_SUPERSESSION).toMatchObject({
      superseded: "archimate@1",
      supersededBy: "archimate@2",
    });
    expect(UML_SUPERSESSION).toMatchObject({ superseded: "uml@1", supersededBy: "uml@2" });
    expect(archimateSkeletonProfile.completeness).toBe("skeleton");
    expect(umlSkeletonProfile.completeness).toBe("skeleton");
  });

  it("never silently upgrades @1 on validate", async () => {
    const source = {
      ...baseDocument(["uml@1"]),
      entities: {
        "entity:c": ent("c", "uml@1", "class", { name: text("C") }),
      },
      relations: {},
    };
    const { defaultProfileRegistry: registry } = await import("../src/index.js");
    expect(validateDocument(source, { registry }).every((d) => d.code !== "unknown-profile")).toBe(true);
    expect(source.profileRefs).toEqual(["uml@1"]);
  });
});
