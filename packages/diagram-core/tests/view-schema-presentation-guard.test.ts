/**
 * No presentation change beside the view-schema pin (item 5).
 *
 * Presentation entry 2 keeps the external digest
 * `c430ff66df3b04e6d792dd1a60e40e01dbeaffa47b206da0021a937ca83fa4f9`
 * and `presentation-apply.ts` / `presentation-validate.ts` bytes stay
 * unchanged. A change touching those bytes would require a presentation
 * catalog revision, so this test stops that drift here.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";
import { resolveGovernedCatalog } from "../src/presentation-catalog.js";
import { canonicalBytes, sha256Hex } from "../src/sha256.js";
import { DIAGRAM_VIEW_SCHEMA_V2_PIN } from "../src/view-schema-pin.js";

const ENTRY_DIGEST = "c430ff66df3b04e6d792dd1a60e40e01dbeaffa47b206da0021a937ca83fa4f9";
const APPLY_SHA = "28c3607e5c4868d44c137b66fe8e6f6ed99cb578fc52a52f67442cca41802cd8";
const VALIDATE_SHA = "488d8499b8f4e624af56d0c4f4c07496cc09863ec1e65e9f522c6fc05a4db06e";

describe("view-schema pin keeps presentation entry 2 untouched", () => {
  it("keeps the external entry 2 digest", () => {
    const catalog = resolveGovernedCatalog() as unknown as { entry: Record<string, unknown> };
    const digest = sha256Hex(canonicalBytes(catalog.entry));
    expect(digest).toBe(ENTRY_DIGEST);
    expect(createHash("sha256").update(canonicalBytes(catalog.entry), "utf8").digest("hex")).toBe(ENTRY_DIGEST);
  });

  it("never substitutes a view-schema pin into presentation authentication", () => {
    expect(DIAGRAM_VIEW_SCHEMA_V2_PIN.id).toBe("diagram-view-schema");
    expect(DIAGRAM_VIEW_SCHEMA_V2_PIN.id).not.toBe("diagram-presentation");
    expect(core.DIAGRAM_PRESENTATION_CONTRACT_PIN.id).toBe("diagram-presentation");
  });

  it("keeps presentation-apply.ts and presentation-validate.ts bytes unchanged", () => {
    const applyBytes = readFileSync(new URL("../src/presentation-apply.ts", import.meta.url), "utf8");
    const validateBytes = readFileSync(new URL("../src/presentation-validate.ts", import.meta.url), "utf8");
    expect(createHash("sha256").update(applyBytes, "utf8").digest("hex")).toBe(APPLY_SHA);
    expect(createHash("sha256").update(validateBytes, "utf8").digest("hex")).toBe(VALIDATE_SHA);
    expect(core.DIAGRAM_PRESENTATION_COMPATIBILITY).toEqual({
      adapter: `ds:rhanka/sent-tech-design-system/packages/diagram-core/src/presentation-validate.ts@e3bc10cc9e59d48bb807afc41173ba83f6698940#sha256=${VALIDATE_SHA}`,
      renderer: `ds:rhanka/sent-tech-design-system/packages/diagram-core/src/presentation-apply.ts@e3bc10cc9e59d48bb807afc41173ba83f6698940#sha256=${APPLY_SHA}`,
    });
  });
});
