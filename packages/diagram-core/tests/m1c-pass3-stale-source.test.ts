/**
 * M1-c pass-3 RED witness: stale-source replace-view keeps the source revision,
 * and a source ahead of the document is refused.
 * English in code.
 */
import { describe, expect, it } from "vitest";

import {
  applyInverse,
  applyTransaction,
  defaultProfileRegistry,
  viewRef,
} from "../src/index.js";
import { readFixture, stateOf } from "./fixtures.js";

const registry = defaultProfileRegistry;

describe("stale-source replace-view keeps the source revision", () => {
  it("replacement and undo keep view:detail at revision 2 while the document stays at 4", () => {
    const base = stateOf(readFixture("valid/generic-state.json"));
    expect(base.document.revision).toBe(4);
    const stale = base.views["view:detail"];
    expect(stale).toBeDefined();
    if (stale === undefined) return;
    expect(stale.revision).toBe(2);
    const replaced = applyTransaction(
      base,
      {
        commandId: "stale-fold",
        baseRevision: 4,
        commands: [{ kind: "replace-view", view: stale.viewId, source: stale, collapsed: [] }],
      },
      { registry },
    );
    expect(replaced.status).toBe("applied");
    if (replaced.status !== "applied") return;
    expect(replaced.state.document.revision).toBe(4);
    const afterReplace = replaced.state.views[stale.viewId];
    expect(afterReplace?.revision).toBe(2);
    expect(replaced.inverse.kind).toBe("invertible");
    if (replaced.inverse.kind !== "invertible") return;
    const undone = applyInverse(replaced.state, replaced.inverse, { commandId: "undo-stale" }, { registry });
    expect(undone.status).toBe("applied");
    if (undone.status !== "applied") return;
    expect(undone.state.document.revision).toBe(4);
    expect(undone.state.views[stale.viewId]?.revision).toBe(2);
  });

  it("a source ahead of the document is refused with revision-divergence", () => {
    const base = stateOf(readFixture("valid/generic-state.json"));
    const stale = base.views["view:detail"];
    expect(stale).toBeDefined();
    if (stale === undefined) return;
    const outcome = applyTransaction(
      base,
      {
        commandId: "ahead",
        baseRevision: 4,
        commands: [
          {
            kind: "replace-view",
            view: stale.viewId,
            source: { ...stale, revision: 5 },
            collapsed: [],
          },
        ],
      },
      { registry },
    );
    expect(outcome.status).toBe("rejected");
    if (outcome.status !== "rejected") return;
    expect(outcome.diagnostics[0]?.code).toBe("revision-divergence");
    expect(outcome.diagnostics[0]?.path).toBe("commands[0].source.revision");
    expect(viewRef("detail")).toBe(stale.viewId);
  });
});
