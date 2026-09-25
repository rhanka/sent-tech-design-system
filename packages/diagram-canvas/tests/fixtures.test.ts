/**
 * The fixture is a state `diagram-core` ACCEPTS. Without this suite, every scene
 * assertion in this package could be describing a document the model would
 * refuse, and would then be measuring the scene builder against fiction.
 */
import { defaultProfileRegistry, formatDiagnostics, validateState } from "@sentropic/diagram-core";
import { describe, expect, it } from "vitest";

import { occurrenceCount, sampleState, sampleView } from "./fixtures.js";

describe("the fixture state", () => {
  it("passes diagram-core's own validation with no diagnostic", () => {
    const diagnostics = validateState(sampleState(), { registry: defaultProfileRegistry });
    expect(formatDiagnostics(diagnostics)).toBe("");
    expect(diagnostics).toEqual([]);
  });

  it("holds the seven occurrences the scene suites count on", () => {
    expect(occurrenceCount(sampleView())).toBe(7);
  });
});
