import {
  CommentNotFoundError,
  InMemoryCommentStore,
  ThreadNotFoundError,
  type CommentStore,
  type NewComment,
} from "@sentropic/comments";
import { describe, expect, it } from "vitest";

import { createFixtureCommentsAdapter, type FixtureCommentsAdapterHandle } from "../src/index.js";

const tenant = { tenantId: "tenant-a", workspaceId: "workspace-a", userId: "alice" };
const author = { id: tenant.userId };
const artifact = { kind: "artifact", id: "artifact-a" } as const;
type Backend = CommentStore | FixtureCommentsAdapterHandle["store"];

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

  it.each(["listByTarget", "listThreadSummaries"] as const)("%s matches records by kind and id", async (verb) => {
    const { store, reference } = makeStores(["t-1", "c-1", "t-2", "c-2", "t-3", "c-3"]);
    const query = { kind: "record", id: "record-a" } as const;
    for (const backend of [store, reference]) {
      await backend.add(tenant, {
        tenant, author, target: { ...query, recordType: "folder", sectionKey: "description" }, body: "Folder",
      });
      const initiative = await backend.add(tenant, {
        tenant, author, target: { ...query, recordType: "initiative" }, body: "Initiative",
      });
      await backend.setState(tenant, initiative.threadId, "closed");
      await backend.add(tenant, { tenant, author, target: { ...query, kind: "field" }, body: "Different kind" });
    }

    const all = await reference[verb](tenant, query);
    expect(all).toHaveLength(2);
    expect(await store[verb](tenant, query)).toEqual(all);
    for (const filter of [
      { ...query, sectionKey: "description" },
      { ...query, status: "closed" },
      { ...query, recordType: "folder" },
      { ...query, id: "missing" },
    ] as const) {
      expect(await store[verb](tenant, filter)).toEqual(await reference[verb](tenant, filter));
    }
  });

  it("replays the ten port verbs through edits, state and assignment cascades, and root deletion", async () => {
    const { store, reference } = makeStores(["t-1", "c-1", "c-2", "t-2", "c-3"]);
    const anchored = { ...artifact, sectionKey: "a1:root" };
    const input = { tenant, target: anchored, author, body: "Root" };

    async function replay(backend: Backend) {
      const root = await backend.add(tenant, input);
      const fromSameScope = await backend.get({ ...tenant, userId: "bob" }, root.id);
      const closed = await backend.setState(tenant, root.threadId, "closed");
      const reply = await backend.add(tenant, {
        ...input, body: "Agent reply", threadId: root.threadId, provenance: { toolCallId: "tool-1" },
      });
      const separate = await backend.add(tenant, { ...input, body: "Separate thread" });
      const openRows = await backend.listByTarget(tenant, { ...anchored, status: "open" });
      const closedSummaries = await backend.listThreadSummaries(tenant, { ...anchored, status: "closed" });
      const edited = await backend.edit(tenant, reply.id, { body: "Edited reply" });
      const afterRowEdit = await backend.listThread(tenant, root.threadId);
      const editedThread = await backend.editThread(tenant, root.threadId, { content: "Thread edit", assignedTo: "bob" });
      const assigned = await backend.assign(tenant, root.threadId, "alice");
      const unassigned = await backend.assign(tenant, root.threadId, null);
      const reopened = await backend.setState(tenant, root.threadId, "open");
      await backend.delete(tenant, root.id);
      const deleted = await backend.get(tenant, root.id);
      const survivors = await backend.listThread(tenant, root.threadId);
      const summaries = await backend.listThreadSummaries(tenant, anchored);
      return {
        root, fromSameScope, closed, reply, separate, openRows, closedSummaries, edited, afterRowEdit,
        editedThread, assigned, unassigned, reopened, deleted, survivors, summaries,
      };
    }

    const expected = await replay(reference);
    expect(expected.closedSummaries).toMatchObject([{ status: "closed", messageCount: 2 }]);
    expect(expected.deleted).toBeNull();
    expect(expected.survivors).toMatchObject([{ id: expected.reply.id, target: anchored, state: "open" }]);
    expect(await replay(store)).toEqual(expected);
  });

  it.each([
    { ...tenant, tenantId: "tenant-b" },
    { ...tenant, workspaceId: "workspace-b" },
  ])("matches isolation for $tenantId in $workspaceId", async (otherScope) => {
    const { store, reference } = makeStores(["t-1", "c-1"]);
    const input = { tenant, target: artifact, author, body: "Private" };
    const root = await reference.add(tenant, input);
    expect(await store.add(tenant, input)).toEqual(root);

    async function readOutsideScope(backend: Backend) {
      return {
        row: await backend.get(otherScope, root.id),
        thread: await backend.listThread(otherScope, root.threadId),
        rows: await backend.listByTarget(otherScope, artifact),
        summaries: await backend.listThreadSummaries(otherScope, artifact),
      };
    }

    expect(await readOutsideScope(store)).toEqual(await readOutsideScope(reference));
    const { id, threadId } = root;
    const attempts: Array<[(backend: Backend) => Promise<unknown>, typeof CommentNotFoundError | typeof ThreadNotFoundError]> = [
      [(backend) => backend.add(otherScope, { ...input, tenant: otherScope, threadId }), ThreadNotFoundError],
      [(backend) => backend.edit(otherScope, id, { body: "Edited" }), CommentNotFoundError],
      [(backend) => backend.editThread(otherScope, threadId, { content: "Edited", assignedTo: "bob" }), ThreadNotFoundError],
      [(backend) => backend.delete(otherScope, id), CommentNotFoundError],
      [(backend) => backend.setState(otherScope, threadId, "closed"), ThreadNotFoundError],
      [(backend) => backend.assign(otherScope, threadId, "bob"), ThreadNotFoundError],
      [(backend) => backend.add(tenant, { ...input, target: { ...artifact, id: "other" }, threadId }), ThreadNotFoundError],
    ];
    for (const [attempt, c2Error] of attempts) {
      await expect(attempt(reference)).rejects.toBeInstanceOf(c2Error);
      await expect(attempt(store)).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    }
    expect(await store.listThread(tenant, threadId)).toEqual(await reference.listThread(tenant, threadId));
  });

  it("preserves the C2 id tiebreaker for rows with the same timestamp", async () => {
    const time = makeClock()();
    const ids = ["thread", "Z-root", "a-reply"];
    const reference = new InMemoryCommentStore({ generateId: () => ids.shift()!, now: () => time });
    const input = { tenant, target: artifact, author, body: "Root" };
    const root = await reference.add(tenant, input);
    await reference.add(tenant, { ...input, body: "Reply", threadId: root.threadId });
    const rows = await reference.listThread(tenant, root.threadId);
    const { store } = createFixtureCommentsAdapter({ caller: { userId: author.id }, initialComments: rows });
    expect(await store.listThread(tenant, root.threadId)).toEqual(rows);
    expect(await store.listByTarget(tenant, artifact)).toEqual(await reference.listByTarget(tenant, artifact));
    expect(await store.listThreadSummaries(tenant, artifact)).toEqual(await reference.listThreadSummaries(tenant, artifact));
  });

  it("projects normalized targets, inherited reply anchors and persisted provenance onto C2 rows", async () => {
    const { adapter, reference, setCaller, clearLiveSessions } = makeStores(["t-1", "c-1", "c-2"]);
    const target = { ...artifact, sectionKey: "a1:root" };
    const legacyTarget = { kind: "record", id: artifact.id, recordType: "artifact", sectionKey: target.sectionKey } as const;
    const root = await adapter.create({
      tenant: tenant.workspaceId, target: legacyTarget, body: "Root",
    });
    const expectedRoot = await reference.add(tenant, { tenant, target, author, body: "Root" });
    const agent = { actorId: "agent-a", kind: "agent", displayLabel: "Agent A", color: "#2563eb" } as const;
    setCaller({ userId: author.id, actorKind: "agent", agentActor: agent });
    const reply = await adapter.reply({
      tenant: tenant.workspaceId, target: artifact, threadId: root.threadId, body: "Reply",
      provenance: { toolCallId: " tool-1 ", runId: "live-run" },
    });
    await reference.add(tenant, {
      tenant, target, author, threadId: expectedRoot.threadId, body: "Reply", provenance: { toolCallId: "tool-1" },
    });
    expect(reply.authorship).toMatchObject({ author: agent, runId: "live-run", sponsor: { actorId: author.id } });

    async function expectProjectedRows() {
      const listed = await adapter.list(tenant.workspaceId, artifact);
      const expected = await reference.listByTarget(tenant, artifact);
      expect(listed.map(({ authorship, ...row }) => row)).toEqual(
        expected.map((row) => ({ ...row, tenant: { tenantId: tenant.tenantId, workspaceId: tenant.workspaceId } })),
      );
    }

    await expectProjectedRows();
    await adapter.remove(tenant.workspaceId, root.id);
    await reference.delete(tenant, expectedRoot.id);
    clearLiveSessions();
    await expectProjectedRows();
    const [remaining] = await adapter.list(tenant.workspaceId, artifact);
    expect(remaining?.authorship.author.displayLabel).toBe("Agent");
    expect(remaining?.authorship.runId).toBeUndefined();
  });
});
