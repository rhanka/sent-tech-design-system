import { setImmediate } from "node:timers/promises";
import { describe, expect, it, vi } from "vitest";

import {
  MAX_SECTION_KEY_LENGTH,
  ReviewAdapterError,
  createFixtureCommentsAdapter,
  isHumanComment,
  type CollaborationActor,
  type CommentTarget,
  type CommentsAdapter,
  type ReplyCommentInput,
  type ReviewComment,
} from "../src/index.js";

const TENANT = "ws-demo";
const TARGET: CommentTarget = { kind: "artifact", id: "art-1" };

const ALICE: CollaborationActor = {
  actorId: "user-alice",
  kind: "human",
  displayLabel: "Alice",
  color: "#2563eb",
};

const BOB: CollaborationActor = {
  actorId: "user-bob",
  kind: "human",
  displayLabel: "Bob",
  color: "#16a34a",
};

const CLAUDE: CollaborationActor = {
  actorId: "agent-claude",
  kind: "agent",
  displayLabel: "Claude",
  color: "#7c3aed",
};

function makeFixture() {
  return createFixtureCommentsAdapter({
    caller: { userId: ALICE.actorId },
    workspaceMembers: [ALICE.actorId, BOB.actorId],
    authorshipResolver: {
      resolveHumanActor: (id) => {
        if (id === ALICE.actorId) return ALICE;
        if (id === BOB.actorId) return BOB;
        return undefined;
      },
    },
  });
}

describe("DS-1 port-shaped in-memory fixture adapter (C2 semantics)", () => {
  it("isolates store reads for different tenants in the same workspace", async () => {
    const { adapter, store } = makeFixture();
    const tenant = { workspaceId: TENANT, tenantId: "tenant-a", userId: ALICE.actorId };
    const root = await store.add(tenant, { tenant, target: TARGET, body: "Private", author: { id: ALICE.actorId } });
    const otherUser = { ...tenant, userId: BOB.actorId };
    expect(await store.get(otherUser, root.id)).toEqual(root);

    const otherTenant = { ...tenant, tenantId: "tenant-b" };
    expect(await store.get(otherTenant, root.id)).toBeNull();
    expect(await store.listThread(otherTenant, root.threadId)).toEqual([]);
    expect(await store.listByTarget(otherTenant, TARGET)).toEqual([]);
    expect(await store.listThreadSummaries(otherTenant, TARGET)).toEqual([]);
    expect(await adapter.list(TENANT, TARGET)).toEqual([]);
  });

  it("rejects store mutations against another tenant in the same workspace", async () => {
    const { store } = makeFixture();
    const tenant = { workspaceId: TENANT, tenantId: "tenant-a" };
    const otherTenant = { ...tenant, tenantId: "tenant-b" };
    const author = { id: ALICE.actorId };
    const root = await store.add(tenant, { tenant, target: TARGET, body: "Private", author });
    const { id, threadId } = root;
    const notFound = { code: "NOT_FOUND", status: 404 };
    await expect(store.edit(otherTenant, id, { body: "Edited" })).rejects.toMatchObject(notFound);
    await expect(store.delete(otherTenant, id)).rejects.toMatchObject(notFound);
    await expect(store.add(otherTenant, { tenant: otherTenant, threadId, target: TARGET, body: "Reply", author }))
      .rejects.toMatchObject(notFound);
    await expect(store.editThread(otherTenant, threadId, { content: "Edited", assignedTo: BOB.actorId }))
      .rejects.toMatchObject(notFound);
    await expect(store.setState(otherTenant, threadId, "closed")).rejects.toMatchObject(notFound);
    await expect(store.assign(otherTenant, threadId, BOB.actorId)).rejects.toMatchObject(notFound);
    expect(await store.listThread(tenant, threadId)).toEqual([root]);
  });

  it.each([
    { tenantId: "tenant-b", workspaceId: TENANT },
    { tenantId: "tenant-a", workspaceId: "ws-other" },
  ])("isolates live sessions from $tenantId in $workspaceId", async (otherScope) => {
    const { adapter, store, setCaller, registerLiveSession } = createFixtureCommentsAdapter({
      caller: { userId: ALICE.actorId, actorKind: "agent", agentActor: CLAUDE, runId: "run-alice" },
      tenantId: "tenant-a",
    });
    const toolCallId = "shared-tool-call";
    const aliceComment = await adapter.create({
      tenant: TENANT, target: TARGET, body: "Alice's comment", provenance: { toolCallId },
    });
    const otherAgent = { ...CLAUDE, actorId: "agent-other", displayLabel: "Other agent" };
    setCaller({ userId: BOB.actorId, actorKind: "agent", agentActor: otherAgent, runId: "run-bob" });
    await store.add(otherScope, {
      tenant: otherScope, target: TARGET, body: "Bob's comment", author: { id: BOB.actorId },
      provenance: { toolCallId },
    });

    expect(aliceComment.authorship).toMatchObject({ author: CLAUDE, runId: "run-alice" });
    expect(await adapter.list(TENANT, TARGET)).toEqual([aliceComment]);

    registerLiveSession(otherScope, toolCallId, { actor: otherAgent, runId: "run-other" });
    expect(await adapter.list(TENANT, TARGET)).toEqual([aliceComment]);
    registerLiveSession({ tenantId: "tenant-a", workspaceId: TENANT }, ` ${toolCallId} `, {
      actor: CLAUDE, runId: "run-reloaded",
    });
    expect(await adapter.list(TENANT, TARGET)).toMatchObject([{ authorship: { author: CLAUDE, runId: "run-reloaded" } }]);
  });

  it("rejects replies against a different target and edits by an author without comment rights", async () => {
    const { adapter, setCaller } = makeFixture();
    const root = await adapter.create({ tenant: TENANT, target: TARGET, body: "Original" });
    await expect(adapter.reply({
      tenant: TENANT,
      target: { ...TARGET, id: "another-artifact" },
      threadId: root.threadId,
      body: "Wrong target",
    })).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });

    setCaller({ userId: ALICE.actorId, canComment: false });
    await expect(adapter.edit(TENANT, root.id, "No longer allowed")).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    await expect(adapter.remove(TENANT, root.id)).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    expect(await adapter.list(TENANT, TARGET)).toEqual([root]);
  });

  it("uses store thread verbs and keeps store-only helpers off the adapter", async () => {
    const fixture = makeFixture();
    const { adapter, store } = fixture;
    const tenant = { workspaceId: TENANT };
    const target = { ...TARGET, sectionKey: "a1:thread" };
    const root = await adapter.create({ tenant: TENANT, target, body: "Original" });
    fixture.setCaller({ userId: BOB.actorId });
    const reply = await adapter.reply({ tenant: TENANT, target: TARGET, threadId: root.threadId, body: "Reply" });
    expect(await store.get(tenant, root.threadId)).toBeNull();
    expect(await store.get(tenant, root.id)).toMatchObject({ body: "Original" });
    expect((await store.listThread(tenant, root.threadId)).map(({ id }) => id)).toEqual([root.id, reply.id]);

    const patch = { content: "Update all rows", assignedTo: ALICE.actorId };
    await expect(store.editThread(tenant, root.threadId, patch)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect((await store.listThread(tenant, root.threadId)).map(({ body }) => body)).toEqual(["Original", "Reply"]);
    fixture.setCaller({ userId: ALICE.actorId, isAdmin: true });
    expect(await store.editThread(tenant, root.threadId, patch)).toMatchObject([
      { body: patch.content, assignedTo: ALICE.actorId },
      { body: patch.content, assignedTo: ALICE.actorId },
    ]);
    await expect(adapter.setState(TENANT, root.threadId, "closed")).resolves.toBeUndefined();
    await expect(adapter.assign(TENANT, root.threadId, null)).resolves.toBeUndefined();
    expect(await store.listThreadSummaries(tenant, TARGET)).toMatchObject([
      { threadId: root.threadId, target, messageCount: 2, status: "closed" },
    ]);
    expect(await adapter.threadSummaries?.(TENANT, TARGET)).toMatchObject([
      { threadId: root.threadId, target, commentCount: 2, status: "closed" },
    ]);
    expect((await adapter.list(TENANT, TARGET)).every((row) => row.assignedTo === undefined)).toBe(true);
    for (const verb of ["get", "listThread", "editThread", "reanchor"]) expect(verb in adapter).toBe(false);
  });

  it("filters summaries by whole-thread status after a reply to a closed thread", async () => {
    const { adapter, store } = makeFixture();
    const tenant = { workspaceId: TENANT };
    const root = await adapter.create({ tenant: TENANT, target: TARGET, body: "Original" });
    await adapter.setState(TENANT, root.threadId, "closed");
    const reply = await adapter.reply({ tenant: TENANT, target: TARGET, threadId: root.threadId, body: "Reply" });
    const open = await adapter.create({ tenant: TENANT, target: TARGET, body: "Open thread" });

    expect(await store.listThreadSummaries(tenant, { ...TARGET, status: "open" })).toMatchObject([
      { threadId: open.threadId, messageCount: 1, status: "open" },
    ]);
    expect(await store.listThreadSummaries(tenant, { ...TARGET, status: "closed" })).toMatchObject([
      { threadId: root.threadId, rootMessage: root.body, lastMessage: reply.body, messageCount: 2, status: "closed" },
    ]);
    expect(await store.listByTarget(tenant, { ...TARGET, status: "open" })).toMatchObject([
      { id: reply.id }, { id: open.id },
    ]);
  });

  it("creates a root even when the caller supplies a threadId", async () => {
    const { adapter } = makeFixture();
    const input = { tenant: TENANT, target: TARGET, body: "Original" };
    const root = await adapter.create(input);
    const created = await adapter.create({ ...input, body: "Another root", threadId: root.threadId } as ReplyCommentInput);
    expect(created.threadId).not.toBe(root.threadId);
    expect(await adapter.list(TENANT, TARGET)).toEqual([root, created]);
  });

  it("rejects a reply without a threadId and leaves the store untouched", async () => {
    const { adapter } = makeFixture();
    const input = { tenant: TENANT, target: TARGET, body: "Reply" };
    await expect(adapter.reply(input as ReplyCommentInput)).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
    expect(await adapter.list(TENANT, TARGET)).toEqual([]);
  });

  it.each([
    {
      verb: "setState",
      mutate: (adapter: CommentsAdapter, threadId: string) => adapter.setState(TENANT, threadId, "closed"),
      expected: { state: "closed" },
    },
    {
      verb: "assign",
      mutate: (adapter: CommentsAdapter, threadId: string) => adapter.assign(TENANT, threadId, BOB.actorId),
      expected: { assignedTo: BOB.actorId },
    },
  ])("waits for the $verb confirmation read after committing the mutation", async ({ mutate, expected }) => {
    const { adapter, store } = makeFixture();
    const root = await adapter.create({ tenant: TENANT, target: TARGET, body: "Original" });
    let releaseRead!: () => void;
    const blockedRead = new Promise<void>((resolve) => { releaseRead = resolve; });
    const listThread = store.listThread;
    const read = vi.spyOn(store, "listThread").mockImplementation(async (tenant, threadId) => {
      const rows = await listThread(tenant, threadId);
      await blockedRead;
      expect(rows).toMatchObject([expected]);
      return rows;
    });

    const mutation = mutate(adapter, root.threadId);
    const pending = Symbol("pending");
    try {
      expect(await Promise.race([mutation, setImmediate(pending)])).toBe(pending);
      expect(read).toHaveBeenCalledExactlyOnceWith({ workspaceId: TENANT }, root.threadId);
    } finally {
      releaseRead();
      await expect(mutation).resolves.toBeUndefined();
    }
  });

  it("should mint distinct threadId !== comment.id and enforce threadId vs commentId verb keys", async () => {
    const fixture = makeFixture();
    const adapter: CommentsAdapter = fixture.adapter;

    const root = await adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: "a1:demo-anchor" },
      body: "Check Q4 numbers",
    });

    expect(root.threadId).toBeTruthy();
    expect(root.threadId).not.toBe(root.id);
    expect(root.state).toBe("open");
    expect(root.author).toEqual({ id: ALICE.actorId });
    expect(root.authorship).toEqual({ author: ALICE });

    // Passing comment.id to setState or assign MUST fail (404 semantics)
    await expect(adapter.setState(TENANT, root.id, "closed")).rejects.toThrow(ReviewAdapterError);
    await expect(adapter.assign(TENANT, root.id, BOB.actorId)).rejects.toThrow(ReviewAdapterError);

    // Passing threadId to edit or remove MUST fail (404 semantics)
    await expect(adapter.edit(TENANT, root.threadId, "Oops")).rejects.toThrow(ReviewAdapterError);
    await expect(adapter.remove(TENANT, root.threadId)).rejects.toThrow(ReviewAdapterError);
  });

  it("should propagate/inherit thread sectionKey on reply and keep anchor if root row is deleted", async () => {
    const fixture = makeFixture();
    const createdEvents: ReviewComment[] = [];
    const unsubCreated = fixture.adapter.onCommentCreated?.((c) => createdEvents.push(c));

    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: "a1:kept-anchor" },
      body: "Root comment",
    });

    // Non-creator participant (Bob) replies WITHOUT passing sectionKey -> C2 inherits it
    fixture.setCaller({ userId: BOB.actorId });
    const reply = await fixture.adapter.reply({
      tenant: TENANT,
      target: { kind: "artifact", id: "art-1" },
      threadId: root.threadId,
      body: "Good catch, updating.",
    });

    expect(reply.target.sectionKey).toBe("a1:kept-anchor");
    expect(createdEvents).toHaveLength(2);
    expect(createdEvents[1]?.target.sectionKey).toBe("a1:kept-anchor");

    // Alice deletes her root row -> reply survives with sectionKey intact
    fixture.setCaller({ userId: ALICE.actorId });
    await fixture.adapter.remove(TENANT, root.id);

    const remaining = await fixture.adapter.list(TENANT, TARGET);
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(reply.id);
    expect(remaining[0]?.target.sectionKey).toBe("a1:kept-anchor");

    unsubCreated?.();
  });

  it("should enforce C2 permissions: any commenter can reply/close/reopen/assign; edit/delete stay author-or-admin", async () => {
    const fixture = makeFixture();
    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: TARGET,
      body: "Original text",
    });

    // Bob (participant with comment right) cannot edit or delete Alice's row
    fixture.setCaller({ userId: BOB.actorId });
    await expect(fixture.adapter.edit(TENANT, root.id, "Hijacked")).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
    await expect(fixture.adapter.remove(TENANT, root.id)).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });

    // Bob CAN close, reopen, assign, and unassign (null) by threadId
    await fixture.adapter.setState(TENANT, root.threadId, "closed");
    let rows = await fixture.adapter.list(TENANT, TARGET);
    expect(rows[0]?.state).toBe("closed");

    await fixture.adapter.setState(TENANT, root.threadId, "open");
    rows = await fixture.adapter.list(TENANT, TARGET);
    expect(rows[0]?.state).toBe("open");

    await fixture.adapter.assign(TENANT, root.threadId, BOB.actorId);
    rows = await fixture.adapter.list(TENANT, TARGET);
    expect(rows[0]?.assignedTo).toBe(BOB.actorId);

    // assign(null) MUST truly unassign, never reassign to creator
    await fixture.adapter.assign(TENANT, root.threadId, null);
    rows = await fixture.adapter.list(TENANT, TARGET);
    expect(rows[0]?.assignedTo).toBeUndefined();

    // Non-workspace-member assignee rejected
    await expect(fixture.adapter.assign(TENANT, root.threadId, "track-item-42")).rejects.toMatchObject({
      code: "INVALID_ASSIGNEE",
      status: 400,
    });

    // Caller without comment right is refused
    fixture.setCaller({ userId: "viewer-only", canComment: false });
    await expect(
      fixture.adapter.setState(TENANT, root.threadId, "closed"),
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // Admin can edit another user's row
    fixture.setCaller({ userId: "admin-1", isAdmin: true });
    const edited = await fixture.adapter.edit(TENANT, root.id, "Moderated text");
    expect(edited.body).toBe("Moderated text");
    expect(edited.updatedAt).toBeTruthy();
  });

  it("should enforce mandatory provenance.toolCallId on non-human writes, drop persisted runId, and enrich runId host-side", async () => {
    const fixture = makeFixture();
    const created: ReviewComment[] = [];
    fixture.adapter.onCommentCreated?.((c) => created.push(c));

    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: "a1:anchor-1" },
      body: "Please fix typo",
    });

    // Agent write without toolCallId (even with runId!) MUST reject
    fixture.setCaller({
      userId: ALICE.actorId,
      actorKind: "agent",
      agentActor: CLAUDE,
      runId: "run-99",
    });
    await expect(
      fixture.adapter.reply({
        tenant: TENANT,
        target: TARGET,
        threadId: root.threadId,
        body: "Trying without toolCallId",
        provenance: { runId: "run-99" },
      }),
    ).rejects.toMatchObject({
      code: "PROVENANCE_TOOL_CALL_ID_REQUIRED",
      status: 400,
    });

    // Agent write WITH non-empty toolCallId succeeds
    const agentReply = await fixture.adapter.reply({
      tenant: TENANT,
      target: TARGET,
      threadId: root.threadId,
      body: "Resolved in commit abc123",
      provenance: { toolCallId: "agent:sess-1:1", runId: "run-99" },
    });

    // Stored provenance drops runId (PgCommentStore behaviour), while authorship.runId is enriched host-side
    expect(agentReply.author).toEqual({ id: ALICE.actorId });
    expect(agentReply.provenance).toEqual({ toolCallId: "agent:sess-1:1" });
    expect("runId" in (agentReply.provenance ?? {})).toBe(false);
    expect(agentReply.authorship).toEqual({
      author: CLAUDE,
      sponsor: ALICE,
      runId: "run-99",
    });

    // Human-only h2a bridge filter check (§4)
    expect(created.filter(isHumanComment).map((c) => c.id)).toEqual([root.id]);

    // Clearing live sessions falls back to generic "Agent" with no runId
    fixture.clearLiveSessions();
    const listed = await fixture.adapter.list(TENANT, TARGET);
    const reloadedReply = listed.find((c) => c.id === agentReply.id)!;
    expect(reloadedReply.authorship.sponsor).toEqual(ALICE);
    expect(reloadedReply.authorship.author.kind).toBe("agent");
    expect(reloadedReply.authorship.author.displayLabel).toBe("Agent");
    expect(reloadedReply.authorship.author.actorId).not.toBe(ALICE.actorId);
    expect(reloadedReply.authorship.runId).toBeUndefined();
  });

  it("should never copy assignedTo onto reply rows while thread summaries expose status and thread assignee", async () => {
    const fixture = makeFixture();
    const root = await fixture.adapter.create({
      tenant: TENANT,
      target: { ...TARGET, sectionKey: "a1:assign-test" },
      body: "Root comment",
    });

    // Create does not auto-assign
    expect(root.assignedTo).toBeUndefined();

    // Assign thread to Bob
    await fixture.adapter.assign(TENANT, root.threadId, BOB.actorId);

    // Reply must NOT copy assignedTo onto the new row (SPEC-r6 §1)
    fixture.setCaller({ userId: BOB.actorId });
    const reply = await fixture.adapter.reply({
      tenant: TENANT,
      target: TARGET,
      threadId: root.threadId,
      body: "Reply without copied assignee",
    });
    expect(reply.assignedTo).toBeUndefined();
    const rawReply = fixture.snapshotRaw().find((r) => r.id === reply.id);
    expect(rawReply?.assignedTo).toBeUndefined();

    // threadSummaries uses contract field `status` (open|closed) and preserves thread assignee
    const openSummaries = await fixture.adapter.threadSummaries?.(TENANT, TARGET);
    expect(openSummaries).toHaveLength(1);
    expect(openSummaries?.[0]?.status).toBe("open");
    expect("state" in (openSummaries?.[0] ?? {})).toBe(false);
    expect(openSummaries?.[0]?.assignedTo).toBe(BOB.actorId);

    await fixture.adapter.setState(TENANT, root.threadId, "closed");
    const closedSummaries = await fixture.adapter.threadSummaries?.(TENANT, TARGET);
    expect(closedSummaries?.[0]?.status).toBe("closed");
  });

  it("should enforce 2048-char sectionKey cap, tenant isolation, subscribe notifications, target normalisation, and strict open|closed states", async () => {
    // Legacy 'resolved' wire state must be rejected on seed ingest (SPEC-r6 §1.1: no legacy mapping)
    expect(() =>
      createFixtureCommentsAdapter({
        caller: { userId: ALICE.actorId },
        initialComments: [
          {
            id: "c-bad-state",
            tenant: { workspaceId: TENANT },
            target: { kind: "artifact", id: "art-1" },
            threadId: "t-bad",
            author: { id: ALICE.actorId },
            state: "resolved" as unknown as "closed",
            body: "Invalid legacy wire state",
            createdAt: "2026-11-18T10:00:00.000Z",
          },
        ],
      }),
    ).toThrow(ReviewAdapterError);

    const fixture = createFixtureCommentsAdapter({
      caller: { userId: ALICE.actorId },
      tenantId: "ten-1",
      initialComments: [
        {
          id: "c-seed",
          tenant: { workspaceId: TENANT, tenantId: "ten-1", userId: ALICE.actorId },
          target: { kind: "record", id: "art-1", recordType: "artifact", sectionKey: "a1:seed" },
          threadId: "t-seed",
          author: { id: ALICE.actorId, kind: "human", displayLabel: "Alice" },
          state: "closed",
          body: "Closed seed row",
          createdAt: "2026-11-18T10:00:00.000Z",
        },
      ],
    });

    expect(fixture.adapter.reanchor).toBeUndefined();

    const initial = await fixture.adapter.list(TENANT, TARGET);
    expect(initial).toHaveLength(1);
    expect(initial[0]?.state).toBe("closed");
    expect(initial[0]?.tenant).toEqual({
      workspaceId: TENANT,
      tenantId: "ten-1",
      userId: ALICE.actorId,
    });
    expect(initial[0]?.author).toEqual({
      id: ALICE.actorId,
      kind: "human",
      displayLabel: "Alice",
    });
    expect(initial[0]?.target).toEqual({ kind: "artifact", id: "art-1", sectionKey: "a1:seed" });

    // Legacy 'resolved' wire state must also be rejected on setState
    await expect(
      fixture.adapter.setState(TENANT, "t-seed", "resolved" as unknown as "closed"),
    ).rejects.toMatchObject({
      code: "INVALID_STATE",
      status: 400,
    });

    // Other tenant sees nothing
    expect(await fixture.adapter.list("ws-other", TARGET)).toEqual([]);

    // Over-cap sectionKey (> 2048) rejected
    await expect(
      fixture.adapter.create({
        tenant: TENANT,
        target: { ...TARGET, sectionKey: "a1:" + "x".repeat(MAX_SECTION_KEY_LENGTH) },
        body: "Too long anchor",
      }),
    ).rejects.toMatchObject({
      code: "SECTION_KEY_TOO_LONG",
      status: 400,
    });

    // Subscribe fires on mutations and stops on unsubscribe
    const snapshots: number[] = [];
    const unsub = fixture.adapter.subscribe?.(TENANT, TARGET, (rows) => snapshots.push(rows.length));
    await fixture.adapter.create({ tenant: TENANT, target: TARGET, body: "New note" });
    expect(snapshots).toEqual([2]);
    unsub?.();
    await fixture.adapter.create({ tenant: TENANT, target: TARGET, body: "After unsub" });
    expect(snapshots).toEqual([2]);
  });
});
