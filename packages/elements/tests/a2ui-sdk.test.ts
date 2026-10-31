/**
 * AC-L1 / U-2: the A2UI SDK acceptance test (§5.2, §17 U-2).
 *
 * Whether A2UI SDKs accept a catalogue with `x-` keywords and an empty
 * `functions` is UNKNOWN per the spec (no v0.9.x meta-schema exists), so this
 * test never skips silently: it runs the load, compares the outcome with the
 * RECORDED outcome in `a2ui-sdk.outcome.json`, and fails when the two
 * disagree — a refusal must be recorded verbatim (U-2 stays open), and an
 * acceptance must be recorded too (U-2 closes).
 *
 * RED HISTORY (observed before the implementation existed, 2026-10-30):
 * `catalog.json` did not exist, so the load failed with ENOENT and the
 * outcome comparison failed.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { Catalog } from "@a2ui/web_core";

import { A2UI_PROTOCOL_VERSION } from "../src/contracts/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, "..");

interface RecordedOutcome {
  readonly sdk: string;
  readonly protocolVersion: string;
  readonly outcome: "accepted" | "refused";
  readonly detail: string;
}

const recorded = JSON.parse(readFileSync(join(here, "a2ui-sdk.outcome.json"), "utf8")) as RecordedOutcome;
const catalog = JSON.parse(readFileSync(join(packageDir, "catalog.json"), "utf8"));

/** Runs the load exactly as a host would, returning the outcome to compare. */
function loadWithSdk(): { outcome: "accepted" | "refused"; detail: string } {
  try {
    const loaded = Catalog.fromJson(catalog, A2UI_PROTOCOL_VERSION);
    const names = [...loaded.components.keys()].sort();
    return { outcome: "accepted", detail: `components loaded: ${names.join(", ")}` };
  } catch (error) {
    return { outcome: "refused", detail: error instanceof Error ? error.message : String(error) };
  }
}

describe("AC-L1 / U-2: the A2UI SDK loads the committed catalogue", () => {
  const result = loadWithSdk();

  it("the SDK in the devDependency is the exact recorded version", async () => {
    const sdkPackage = JSON.parse(
      readFileSync(join(packageDir, "..", "..", "node_modules", "@a2ui", "web_core", "package.json"), "utf8"),
    ) as { version: string };
    expect(sdkPackage.version).toBe(recorded.sdk);
  });

  it(`the recorded outcome is reproduced (never skipped): ${recorded.outcome}`, () => {
    expect(result.outcome).toBe(recorded.outcome);
    expect(result.detail).toBe(recorded.detail);
  });

  it("the entry schemas validate the catalogued payloads (without envelope fields)", () => {
    // U-2 measures catalogue acceptance; this asserts the accepted catalogue
    // is usable: each entry's compiled schema parses its own example payload.
    const loaded = Catalog.fromJson(catalog, A2UI_PROTOCOL_VERSION);
    const examples = (catalog as { components: Record<string, { "x-sentropic": { example: unknown } }> }).components;
    for (const [name, entry] of [...loaded.components]) {
      const payload = { ...(examples[name]!["x-sentropic"].example as Record<string, unknown>) };
      delete payload["id"];
      delete payload["component"];
      const parsed = entry.schema.safeParse(payload);
      expect(parsed.success, `${name}: ${JSON.stringify(parsed.success ? null : parsed.error.issues)}`).toBe(true);
    }
  });

  it("toJson keeps the x-sentropic extension (2020-12 treats it as an annotation)", () => {
    const loaded = Catalog.fromJson(catalog, A2UI_PROTOCOL_VERSION);
    const roundTrip = loaded.toJson() as { components: Record<string, Record<string, unknown>> };
    for (const name of Object.keys(catalog.components)) {
      expect(roundTrip.components[name]!["x-sentropic"]).toBeDefined();
    }
  });
});
