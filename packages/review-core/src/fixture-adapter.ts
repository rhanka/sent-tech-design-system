// Port-shaped in-memory FIXTURE adapter for tests and demos ONLY (SPEC-r5 §1, §1.4, §5).
// Never a production store: implements the C2 cluster-mesh semantics in memory so the
// UI kit and tests can exercise every contract rule without a live backend.

import {
  ReviewAdapterError,
  type CommentsAdapter,
  type CreateCommentInput,
  type ReplyCommentInput,
} from "./adapter.js";
import {
  isNonEmptyToolCallId,
  resolveAuthorshipFromFallback,
  type AuthorshipResolver,
  type ResolvedAgentSession,
} from "./authorship.js";
import { compareIsoTimestamps } from "./threads.js";
import {
  MAX_SECTION_KEY_LENGTH,
  normalizeCommentState,
  normalizeCommentTarget,
  type CollaborationActor,
  type CollaborationActorKind,
  type Comment,
  type CommentProvenance,
  type CommentState,
  type CommentTarget,
  type CommentThreadSummary,
  type LegacyWireCommentState,
  type ReviewComment,
} from "./types.js";

export interface FixtureCallerContext {
  /** Authenticated user id written to `comments.created_by` (author of record / sponsor). */
  userId: string;
  /** True caller kind; defaults to `'human'`. */
  actorKind?: CollaborationActorKind;
  /** Optional live agent actor enriched host-side for writes by this caller. */
  agentActor?: CollaborationActor;
  /** Optional live runId enriched host-side (never persisted on the wire row). */
  runId?: string;
  /** Admin override for edit/delete of other authors' rows. */
  isAdmin?: boolean;
  /** Artifact `comment` right (defaults to true). */
  canComment?: boolean;
}

export type FixtureInitialComment = Omit<Comment, "state"> & {
  state: LegacyWireCommentState;
};

export interface FixtureCommentsAdapterOptions {
  caller: FixtureCallerContext;
  /** Optional allowlist of valid workspace member ids for `assign`. */
  workspaceMembers?: readonly string[];
  /** Optional resolver for human actors and external live sessions. */
  authorshipResolver?: AuthorshipResolver;
  /** Optional seed comments (supports legacy `'resolved'` state and `record/artifact` target). */
  initialComments?: readonly FixtureInitialComment[];
  /** Optional deterministic clock returning ISO timestamps. */
  now?: () => string;
  /** Expose optional `reanchor` verb (absent by default per SPEC-r5 §1 / S5). */
  enableReanchor?: boolean;
}

export interface FixtureCommentsAdapterHandle {
  readonly adapter: CommentsAdapter;
  /** Switch the authenticated caller for subsequent calls in tests/demos. */
  setCaller(caller: FixtureCallerContext): void;
  /** Register or replace a host-side live session mapping `toolCallId -> agent + runId`. */
  registerLiveSession(toolCallId: string, session: ResolvedAgentSession): void;
  /** Drop host-side live session metadata (simulates reload / expired session fallback). */
  clearLiveSessions(): void;
  /** Read a snapshot of raw stored rows (for test assertions). */
  snapshotRaw(): Comment[];
}

function targetMatches(rowTarget: CommentTarget, queryTarget: CommentTarget): boolean {
  const normRow = normalizeCommentTarget(rowTarget);
  const normQuery = normalizeCommentTarget(queryTarget);
  if (normRow.kind !== normQuery.kind || normRow.id !== normQuery.id) {
    return false;
  }
  if (normRow.recordType !== normQuery.recordType) {
    return false;
  }
  if (normQuery.sectionKey !== undefined && normRow.sectionKey !== normQuery.sectionKey) {
    return false;
  }
  return true;
}

function subscriptionMatches(rowTarget: CommentTarget, subTarget: CommentTarget): boolean {
  return targetMatches(rowTarget, subTarget);
}

function validateSectionKey(sectionKey: string | undefined): void {
  if (sectionKey !== undefined && sectionKey.length > MAX_SECTION_KEY_LENGTH) {
    throw new ReviewAdapterError(
      "SECTION_KEY_TOO_LONG",
      400,
      `sectionKey length ${sectionKey.length} exceeds ${MAX_SECTION_KEY_LENGTH} characters.`,
    );
  }
}

function validateBody(body: string): void {
  if (body.trim().length === 0) {
    throw new ReviewAdapterError("INVALID_BODY", 400, "Comment body must not be empty.");
  }
}

function cloneRawComment(row: Comment): Comment {
  const target = normalizeCommentTarget(row.target);
  const copy: Comment = {
    id: row.id,
    tenant:
      row.tenant.tenantId !== undefined
        ? { workspaceId: row.tenant.workspaceId, tenantId: row.tenant.tenantId }
        : { workspaceId: row.tenant.workspaceId },
    target,
    threadId: row.threadId,
    author: { id: row.author.id },
    state: row.state,
    body: row.body,
    createdAt: row.createdAt,
  };
  if (row.assignedTo !== undefined) {
    copy.assignedTo = row.assignedTo;
  }
  if (row.provenance !== undefined) {
    const prov: CommentProvenance = {};
    if (row.provenance.toolCallId !== undefined) {
      prov.toolCallId = row.provenance.toolCallId;
    }
    copy.provenance = prov;
  }
  if (row.updatedAt !== undefined) {
    copy.updatedAt = row.updatedAt;
  }
  return copy;
}

/**
 * Creates a port-shaped in-memory fixture implementing `CommentsAdapter` with C2
 * semantics (SPEC-r5 §1, §1.3, §1.4, §5). Intended for unit tests and demos only.
 */
export function createFixtureCommentsAdapter(
  options: FixtureCommentsAdapterOptions,
): FixtureCommentsAdapterHandle {
  let currentCaller: FixtureCallerContext = { ...options.caller };
  const workspaceMembers = options.workspaceMembers
    ? new Set(options.workspaceMembers)
    : undefined;
  const liveSessions = new Map<string, ResolvedAgentSession>();
  const rows: Comment[] = [];

  let nextCommentSeq = 1;
  let nextThreadSeq = 1;
  let syntheticTick = 0;

  const now =
    options.now ??
    (() => {
      syntheticTick += 1;
      return new Date(Date.UTC(2026, 10, 19, 12, 0, syntheticTick)).toISOString();
    });

  // Seed initial comments (normalising legacy wire states and targets)
  for (const seed of options.initialComments ?? []) {
    const normalizedTarget = normalizeCommentTarget(seed.target);
    validateSectionKey(normalizedTarget.sectionKey);
    const stored: Comment = {
      id: seed.id,
      tenant:
        seed.tenant.tenantId !== undefined
          ? { workspaceId: seed.tenant.workspaceId, tenantId: seed.tenant.tenantId }
          : { workspaceId: seed.tenant.workspaceId },
      target: normalizedTarget,
      threadId: seed.threadId,
      author: { id: seed.author.id },
      state: normalizeCommentState(seed.state),
      body: seed.body,
      createdAt: seed.createdAt,
    };
    if (seed.assignedTo !== undefined) {
      stored.assignedTo = seed.assignedTo;
    }
    if (seed.provenance?.toolCallId !== undefined && seed.provenance.toolCallId.trim().length > 0) {
      // PgCommentStore persists toolCallId only, never runId (§1.3).
      stored.provenance = { toolCallId: seed.provenance.toolCallId.trim() };
    }
    if (seed.updatedAt !== undefined) {
      stored.updatedAt = seed.updatedAt;
    }
    rows.push(stored);
  }

  interface Subscription {
    tenant: string;
    target: CommentTarget;
    cb: (comments: ReviewComment[]) => void;
  }

  const subscriptions = new Set<Subscription>();
  const createdListeners = new Set<(comment: ReviewComment) => void>();

  const combinedResolver: AuthorshipResolver = {
    ...(options.authorshipResolver?.defaultColor !== undefined
      ? { defaultColor: options.authorshipResolver.defaultColor }
      : {}),
    resolveHumanActor(userId) {
      return options.authorshipResolver?.resolveHumanActor?.(userId);
    },
    resolveAgentFromProvenance(provenance, comment) {
      const toolCallId = provenance.toolCallId?.trim();
      if (toolCallId && liveSessions.has(toolCallId)) {
        return liveSessions.get(toolCallId);
      }
      return options.authorshipResolver?.resolveAgentFromProvenance?.(provenance, comment);
    },
  };

  function toReviewComment(row: Comment): ReviewComment {
    const cloned = cloneRawComment(row);
    const authorship = resolveAuthorshipFromFallback(cloned, combinedResolver);
    return {
      ...cloned,
      authorship,
    };
  }

  function listMatching(tenant: string, target: CommentTarget): ReviewComment[] {
    return rows
      .filter((row) => row.tenant.workspaceId === tenant && targetMatches(row.target, target))
      .sort((a, b) => compareIsoTimestamps(a.createdAt, b.createdAt))
      .map(toReviewComment);
  }

  function notifySubscribers(tenant: string, affectedTarget: CommentTarget): void {
    for (const sub of subscriptions) {
      if (sub.tenant === tenant && subscriptionMatches(affectedTarget, sub.target)) {
        sub.cb(listMatching(sub.tenant, sub.target));
      }
    }
  }

  function assertCanComment(): void {
    if (currentCaller.canComment === false) {
      throw new ReviewAdapterError(
        "FORBIDDEN",
        403,
        `Caller '${currentCaller.userId}' does not hold the comment right.`,
      );
    }
  }

  function assertAuthorOrAdmin(row: Comment): void {
    if (row.author.id !== currentCaller.userId && currentCaller.isAdmin !== true) {
      throw new ReviewAdapterError(
        "FORBIDDEN",
        403,
        `Only the author ('${row.author.id}') or an admin may modify comment '${row.id}'.`,
      );
    }
  }

  function normalizeAndValidateWriteProvenance(
    provenance: CommentProvenance | undefined,
  ): CommentProvenance | undefined {
    const actorKind = currentCaller.actorKind ?? "human";
    if (actorKind !== "human") {
      if (!isNonEmptyToolCallId(provenance)) {
        throw new ReviewAdapterError(
          "PROVENANCE_TOOL_CALL_ID_REQUIRED",
          400,
          `Non-human (${actorKind}) writes require a non-empty provenance.toolCallId.`,
        );
      }
    } else if (provenance !== undefined && !isNonEmptyToolCallId(provenance)) {
      throw new ReviewAdapterError(
        "PROVENANCE_TOOL_CALL_ID_REQUIRED",
        400,
        "Supplying provenance without a non-empty toolCallId is refused (runId alone is dropped at write).",
      );
    }

    if (!isNonEmptyToolCallId(provenance)) {
      return undefined;
    }

    const toolCallId = provenance!.toolCallId!.trim();
    const liveRunId = currentCaller.runId ?? provenance!.runId;
    if (currentCaller.agentActor !== undefined) {
      const session: ResolvedAgentSession = { actor: currentCaller.agentActor };
      if (liveRunId !== undefined && liveRunId.length > 0) {
        session.runId = liveRunId;
      }
      liveSessions.set(toolCallId, session);
    }

    // Persisted provenance carries toolCallId only; runId is dropped at write (§1.3).
    return { toolCallId };
  }

  const adapter: CommentsAdapter = {
    async list(tenant: string, target: CommentTarget): Promise<ReviewComment[]> {
      return listMatching(tenant, target);
    },

    async threadSummaries(tenant: string, target: CommentTarget): Promise<CommentThreadSummary[]> {
      const matching = rows.filter(
        (row) => row.tenant.workspaceId === tenant && targetMatches(row.target, target),
      );
      const grouped = new Map<string, Comment[]>();
      for (const row of matching) {
        const bucket = grouped.get(row.threadId);
        if (bucket) bucket.push(row);
        else grouped.set(row.threadId, [row]);
      }

      const summaries: CommentThreadSummary[] = [];
      for (const [threadId, threadRows] of grouped) {
        threadRows.sort((a, b) => compareIsoTimestamps(a.createdAt, b.createdAt));
        const first = threadRows[0]!;
        const last = threadRows[threadRows.length - 1]!;
        const state: CommentState = threadRows.some((r) => r.state === "closed")
          ? "closed"
          : "open";
        const summary: CommentThreadSummary = {
          threadId,
          target: normalizeCommentTarget(first.target),
          state,
          commentCount: threadRows.length,
          createdAt: first.createdAt,
        };
        const latestUpdated = last.updatedAt ?? last.createdAt;
        if (latestUpdated !== first.createdAt) {
          summary.updatedAt = latestUpdated;
        }
        if (last.assignedTo !== undefined) {
          summary.assignedTo = last.assignedTo;
        }
        summaries.push(summary);
      }

      summaries.sort((a, b) => compareIsoTimestamps(a.createdAt, b.createdAt));
      return summaries;
    },

    async create(input: CreateCommentInput): Promise<ReviewComment> {
      assertCanComment();
      validateBody(input.body);
      const normalizedTarget = normalizeCommentTarget(input.target);
      validateSectionKey(normalizedTarget.sectionKey);
      const storedProvenance = normalizeAndValidateWriteProvenance(input.provenance);

      const id = `c-${nextCommentSeq++}`;
      const threadId = `t-${nextThreadSeq++}`;
      const row: Comment = {
        id,
        tenant: { workspaceId: input.tenant },
        target: normalizedTarget,
        threadId,
        author: { id: currentCaller.userId },
        state: "open",
        body: input.body,
        createdAt: now(),
      };
      if (storedProvenance !== undefined) {
        row.provenance = storedProvenance;
      }

      rows.push(row);
      const view = toReviewComment(row);
      for (const listener of createdListeners) {
        listener(view);
      }
      notifySubscribers(input.tenant, row.target);
      return view;
    },

    async reply(input: ReplyCommentInput): Promise<ReviewComment> {
      assertCanComment();
      validateBody(input.body);
      const normalizedInputTarget = normalizeCommentTarget(input.target);

      const threadRows = rows
        .filter((row) => row.tenant.workspaceId === input.tenant && row.threadId === input.threadId)
        .sort((a, b) => compareIsoTimestamps(a.createdAt, b.createdAt));

      if (threadRows.length === 0) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Thread '${input.threadId}' was not found in tenant '${input.tenant}'.`,
        );
      }

      // Inherit thread's sectionKey when omitted by the caller (§1, §1.4 C2 rule)
      let effectiveSectionKey = normalizedInputTarget.sectionKey;
      if (effectiveSectionKey === undefined) {
        for (const existing of threadRows) {
          if (existing.target.sectionKey !== undefined && existing.target.sectionKey.length > 0) {
            effectiveSectionKey = existing.target.sectionKey;
            break;
          }
        }
      }
      validateSectionKey(effectiveSectionKey);

      const storedProvenance = normalizeAndValidateWriteProvenance(input.provenance);
      const target: CommentTarget = {
        kind: normalizedInputTarget.kind,
        id: normalizedInputTarget.id,
      };
      if (normalizedInputTarget.recordType !== undefined) {
        target.recordType = normalizedInputTarget.recordType;
      }
      if (effectiveSectionKey !== undefined) {
        target.sectionKey = effectiveSectionKey;
      }

      const inheritedAssignee = threadRows[threadRows.length - 1]?.assignedTo;
      const row: Comment = {
        id: `c-${nextCommentSeq++}`,
        tenant: { workspaceId: input.tenant },
        target,
        threadId: input.threadId,
        author: { id: currentCaller.userId },
        state: "open",
        body: input.body,
        createdAt: now(),
      };
      if (inheritedAssignee !== undefined) {
        row.assignedTo = inheritedAssignee;
      }
      if (storedProvenance !== undefined) {
        row.provenance = storedProvenance;
      }

      rows.push(row);
      const view = toReviewComment(row);
      for (const listener of createdListeners) {
        listener(view);
      }
      notifySubscribers(input.tenant, row.target);
      return view;
    },

    async edit(tenant: string, commentId: string, body: string): Promise<ReviewComment> {
      validateBody(body);
      const row = rows.find((r) => r.tenant.workspaceId === tenant && r.id === commentId);
      if (!row) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Comment '${commentId}' was not found in tenant '${tenant}'.`,
        );
      }
      assertAuthorOrAdmin(row);
      row.body = body;
      row.updatedAt = now();
      const view = toReviewComment(row);
      notifySubscribers(tenant, row.target);
      return view;
    },

    async setState(tenant: string, threadId: string, state: CommentState): Promise<void> {
      assertCanComment();
      const threadRows = rows.filter(
        (row) => row.tenant.workspaceId === tenant && row.threadId === threadId,
      );
      if (threadRows.length === 0) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Thread '${threadId}' was not found in tenant '${tenant}'.`,
        );
      }
      const timestamp = now();
      for (const row of threadRows) {
        row.state = state;
        row.updatedAt = timestamp;
      }
      notifySubscribers(tenant, threadRows[0]!.target);
    },

    async remove(tenant: string, commentId: string): Promise<void> {
      const idx = rows.findIndex((row) => row.tenant.workspaceId === tenant && row.id === commentId);
      if (idx === -1) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Comment '${commentId}' was not found in tenant '${tenant}'.`,
        );
      }
      const row = rows[idx]!;
      assertAuthorOrAdmin(row);
      rows.splice(idx, 1);
      notifySubscribers(tenant, row.target);
    },

    async assign(tenant: string, threadId: string, assigneeId: string | null): Promise<void> {
      assertCanComment();
      const threadRows = rows.filter(
        (row) => row.tenant.workspaceId === tenant && row.threadId === threadId,
      );
      if (threadRows.length === 0) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Thread '${threadId}' was not found in tenant '${tenant}'.`,
        );
      }
      if (assigneeId !== null && workspaceMembers && !workspaceMembers.has(assigneeId)) {
        throw new ReviewAdapterError(
          "INVALID_ASSIGNEE",
          400,
          `Assignee '${assigneeId}' is not a member of workspace '${tenant}'.`,
        );
      }
      const timestamp = now();
      for (const row of threadRows) {
        if (assigneeId === null) {
          delete row.assignedTo;
        } else {
          row.assignedTo = assigneeId;
        }
        row.updatedAt = timestamp;
      }
      notifySubscribers(tenant, threadRows[0]!.target);
    },

    subscribe(
      tenant: string,
      target: CommentTarget,
      cb: (comments: ReviewComment[]) => void,
    ): () => void {
      const entry: Subscription = {
        tenant,
        target: normalizeCommentTarget(target),
        cb,
      };
      subscriptions.add(entry);
      return () => {
        subscriptions.delete(entry);
      };
    },

    onCommentCreated(cb: (comment: ReviewComment) => void): () => void {
      createdListeners.add(cb);
      return () => {
        createdListeners.delete(cb);
      };
    },
  };

  if (options.enableReanchor === true) {
    adapter.reanchor = async (
      tenant: string,
      threadId: string,
      sectionKey: string,
    ): Promise<void> => {
      assertCanComment();
      validateSectionKey(sectionKey);
      const threadRows = rows.filter(
        (row) => row.tenant.workspaceId === tenant && row.threadId === threadId,
      );
      if (threadRows.length === 0) {
        throw new ReviewAdapterError(
          "NOT_FOUND",
          404,
          `Thread '${threadId}' was not found in tenant '${tenant}'.`,
        );
      }
      const timestamp = now();
      for (const row of threadRows) {
        row.target = { ...row.target, sectionKey };
        row.updatedAt = timestamp;
      }
      notifySubscribers(tenant, threadRows[0]!.target);
    };
  }

  return {
    adapter,
    setCaller(caller: FixtureCallerContext): void {
      currentCaller = { ...caller };
    },
    registerLiveSession(toolCallId: string, session: ResolvedAgentSession): void {
      liveSessions.set(toolCallId.trim(), session);
    },
    clearLiveSessions(): void {
      liveSessions.clear();
    },
    snapshotRaw(): Comment[] {
      return rows.map(cloneRawComment);
    },
  };
}
