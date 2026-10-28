/**
 * M1-c pass-3 RED witness: the native revision policy survives redo chains.
 * English in code.
 */
import { describe, expect, it } from "vitest";

import { applyInverse, applyTransaction, defaultProfileRegistry, occurrenceRef, viewRef } from "../src/index.js";
import { readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;

describe("native revision policy through redo chains", () => {
  it("remove then undo, redo, undo bumps every time: 4-5-6-7-8", () => {
    const base = stateOf(readFixture("valid/generic-state.json"));
    expect(base.document.revision).toBe(4);
    const first = applyTransaction(
      base,
      {
        commandId: "remove",
        baseRevision: 4,
        commands: [{ kind: "remove-occurrence", view: viewRef("main"), occurrence: occurrenceRef("gamma-1") }],
      },
      { registry },
    );
    expect(first.status).toBe("applied");
    if (first.status !== "applied") return;
    const documents = [4, first.state.document.revision];
    const touched = [base.views["view:main"]?.revision ?? 4, first.state.views["view:main"]?.revision ?? -1];
    let current = first;
    for (let step = 0; step < 3; step += 1) {
      expect(current.inverse.kind).toBe("invertible");
      if (current.inverse.kind !== "invertible") return;
      const next = applyInverse(current.state, current.inverse, { commandId: `invert-${step}` }, { registry });
      expect(next.status).toBe("applied");
      if (next.status !== "applied") return;
      documents.push(next.state.document.revision);
      touched.push(next.state.views["view:main"]?.revision ?? -1);
      current = next;
    }
    expect(documents).toEqual([4, 5, 6, 7, 8]);
    expect(touched).toEqual([4, 5, 6, 7, 8]);
  });
});
