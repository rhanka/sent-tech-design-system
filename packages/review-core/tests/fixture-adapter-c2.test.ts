import { InMemoryCommentStore, type NewComment } from "@sentropic/comments";
import { describe, expect, it } from "vitest";

import { createFixtureCommentsAdapter } from "../src/index.js";

const tenant = { tenantId: "tenant-a", workspaceId: "workspace-a", userId: "alice" };
const author = { id: tenant.userId };
const artifact = { kind: "artifact", id: "artifact-a" } as const;

function makeClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 19, 12, 0, tick++));
}

function makeStores(ids: string[]) {
  const clock = makeClock();
  const fixture = createFixtureCommentsAdapter({
    caller: { userId: tenant.userId },
    tenantId: tenant.tenantId,
    now: () => clock().toISOString(),
  });
  const reference = new InMemoryCommentStore({
    generateId: () => {
      const id = ids.shift();
      if (id === undefined) throw new Error("C2 generated an unexpected ID");
      return id;
    },
    now: makeClock(),
  });
  return { ...fixture, reference };
}

describe("fixture parity with the C2 store at sentropic 13490b16b", () => {
  it.each([true, false])("uses the root's summary metadata (root assigned: %s)", async (assigned) => {
    const { adapter, store, reference } = makeStores(["t-1", "c-1", "c-2"]);
    const root: NewComment = {
      tenant, target: artifact, author, body: "Root",
      ...(assigned ? { assignedTo: "alice" } : {}),
    };
    for (const backend of [store, reference]) {
      const { threadId } = await backend.add(tenant, root);
      await backend.add(tenant, {
        tenant, threadId, target: { ...artifact, sectionKey: "a1:reply" },
        author: { id: "bob" }, body: "Reply", assignedTo: "bob",
      });
    }

    const expected = await reference.listThreadSummaries(tenant, artifact);
    expect(expected).toHaveLength(1);
    expect(expected[0]?.assignee).toBe(assigned ? "alice" : "bob");
    // DS-7 requires the root assignee even when C2 falls back to a reply's assignee.
    expect(await store.listThreadSummaries(tenant, artifact)).toEqual(
      expected.map((summary) => ({ ...summary, assignee: root.assignedTo })),
    );
    const summaries = await adapter.threadSummaries?.(tenant.workspaceId, artifact);
    expect(summaries).toHaveLength(1);
    expect(summaries?.[0]?.target).toEqual(artifact);
    expect(summaries?.[0]?.assignedTo).toBe(root.assignedTo);
  });
});
