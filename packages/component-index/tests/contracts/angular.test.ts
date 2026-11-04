import { describe, expect, it } from "vitest";
import { join } from "node:path";

import { loadDeclarationProgram } from "../../src/generator/contracts/loader.js";
import { extractAngular, type FrameworkInput } from "../../src/generator/contracts/angular.js";

const FIXTURE = join(import.meta.dirname, "fixtures", "angular-fixture.d.ts");

function inputFor(identifier: string): FrameworkInput {
  const loaded = loadDeclarationProgram([FIXTURE]);
  const declFile = loaded.program.getSourceFile(FIXTURE);
  if (declFile === undefined) throw new Error("fixture file missing from program");
  return {
    program: loaded.program,
    checker: loaded.checker,
    declFile,
    repoDeclPath: "packages/component-index/tests/contracts/fixtures/angular-fixture.d.ts",
    declarationDigest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    packageName: "@sentropic/fixture-angular",
    packageVersion: "0.0.0",
    identifier,
  };
}

describe("K1b Angular extractor (spec 7.5)", () => {
  it("maps ɵcmp aliases, EventEmitter payloads and ng-content slots", () => {
    const body = extractAngular(inputFor("Pane"));
    expect(body.status).toBe("complete");
    expect(Object.keys(body.props?.["properties"] ?? {})).toEqual(["custom", "open", "title"]);
    expect(body.events.map((event) => event.name).sort()).toEqual(["changed", "closed"]);
    expect(body.events.find((event) => event.name === "closed")).not.toHaveProperty("payload");
    expect(body.events.find((event) => event.name === "changed")).toMatchObject({
      payload: { type: "string" },
    });
    expect(body.slots.map((slot) => slot.name).sort()).toEqual(["default", "footer"]);
  });

  it("flags XProps discrepancies as partial with a warning", () => {
    const body = extractAngular(inputFor("Broken"));
    expect(body.status).toBe("partial");
    expect(body.warnings.some((warning) => warning.includes("extra"))).toBe(true);
  });

  it("treats void | undefined emit params as payload-less (real EventEmitter shape)", () => {
    // Real @angular/core declares emit(value?: T): under strictNullChecks
    // EventEmitter<void> reads as void | undefined. The union must strip
    // undefined and leave no payload, while EventEmitter<string> keeps
    // its string payload.
    const body = extractAngular(inputFor("Pane"));
    const closed = body.events.find((event) => event.name === "closed");
    const changed = body.events.find((event) => event.name === "changed");
    expect(closed).toBeDefined();
    expect(closed).not.toHaveProperty("payload");
    expect(changed).toMatchObject({ payload: { type: "string" } });
    // No silent {} payload and no loss row for the void case.
    expect(body.unresolved.map((row) => row.name)).not.toContain("closed");
    expect(body.replaced.map((row) => row.name)).not.toContain("closed");
  });
});
