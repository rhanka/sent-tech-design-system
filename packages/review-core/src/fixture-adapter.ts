// Port-shaped in-memory FIXTURE adapter for tests and demos ONLY (SPEC-r6 §1, §1.4, §5).
// Never a production store: implements the C2 cluster-mesh semantics in memory so the
// UI kit and tests can exercise every contract rule without a live backend.

import {
  ReviewAdapterError,
  type CommentsAdapter,
  type CreateCommentInput,
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
  normalizeCommentTarget,
  type CollaborationActor,
  type CollaborationActorKind,
  type Comment,
  type CommentAuthor,
  type CommentProvenance,
  type CommentState,
  type CommentTarget,
  type CommentThreadSummary,
  type ReviewComment,
  type TenantContext,
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

export type FixtureInitialComment = Comment;

export interface FixtureCommentsAdapterOptions {
  caller: FixtureCallerContext;
  /** Tenant bound to the UI adapter, whose string scope identifies the workspace. */
  tenantId?: string;
  /** Optional allowlist of valid workspace member ids for `assign`. */
  workspaceMembers?: readonly string[];
  /** Optional resolver for human actors and external live sessions. */
  authorshipResolver?: AuthorshipResolver;
  /** Optional seed comments (`open|closed` state only; supports `record/artifact` target normalisation). */
  initialComments?: readonly FixtureInitialComment[];
  /** Optional deterministic clock returning ISO timestamps. */
  now?: () => string;
  /** Expose optional `reanchor` verb (absent by default per SPEC-r6 §1 / S5). */
  enableReanchor?: boolean;
}

export interface FixtureCommentsAdapterHandle {
  readonly adapter: CommentsAdapter;
  /** In-memory implementation of the ten CommentStore verbs for contract tests. */
  readonly store: FixtureCommentStore;
  /** Switch the authenticated caller for subsequent calls in tests/demos. */
  setCaller(caller: FixtureCallerContext): void;
  /** Register or replace a host-side live session for this tenant and workspace. */
  registerLiveSession(tenant: TenantContext, toolCallId: string, session: ResolvedAgentSession): void;
  /** Drop host-side live session metadata (simulates reload / expired session fallback). */
  clearLiveSessions(): void;
  /** Read a snapshot of raw stored rows (for test assertions). */
  snapshotRaw(): Comment[];
}

type NewComment = Pick<Comment, "tenant" | "target" | "author" | "body" | "assignedTo" | "provenance"> & {
  threadId?: string;
};
type TargetQuery = Pick<CommentTarget, "kind" | "id" | "sectionKey"> & { status?: CommentState };
type StoreThreadSummary = {
  threadId: string;
  contextType?: string;
  target: CommentTarget;
  sectionKey?: string;
  rootMessage: string;
  rootMessageAt: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  status: CommentState;
  assignee?: string;
};

/** CommentStore signatures at sentropic 13490b16b. */
interface FixtureCommentStore {
  add(tenant: TenantContext, input: NewComment): Promise<Comment>;
  get(tenant: TenantContext, id: string): Promise<Comment | null>;
  edit(tenant: TenantContext, id: string, patch: { body?: string }): Promise<Comment>;
  editThread(tenant: TenantContext, threadId: string, patch: { content: string; assignedTo: string }): Promise<Comment[]>;
  delete(tenant: TenantContext, id: string): Promise<void>;
  listByTarget(tenant: TenantContext, query: TargetQuery): Promise<Comment[]>;
  listThread(tenant: TenantContext, threadId: string): Promise<Comment[]>;
  listThreadSummaries(tenant: TenantContext, query: TargetQuery): Promise<StoreThreadSummary[]>;
  setState(tenant: TenantContext, threadId: string, state: CommentState): Promise<Comment[]>;
  assign(tenant: TenantContext, threadId: string, assigneeId: string | null): Promise<Comment[]>;
}

function tenantMatches(rowTenant: TenantContext, tenant: TenantContext): boolean {
  return rowTenant.workspaceId === tenant.workspaceId && rowTenant.tenantId === tenant.tenantId;
}

function liveSessionKey(tenant: TenantContext, toolCallId: string): string {
  return JSON.stringify([tenant.tenantId, tenant.workspaceId, toolCallId.trim()]);
}

function targetMatches(rowTarget: CommentTarget, queryTarget: CommentTarget): boolean {
  const normRow = normalizeCommentTarget(rowTarget);
  const normQuery = normalizeCommentTarget(queryTarget);
  if (normRow.kind !== normQuery.kind || normRow.id !== normQuery.id) {
    return false;
  }
  if (normQuery.sectionKey !== undefined && normRow.sectionKey !== normQuery.sectionKey) {
    return false;
  }
  return true;
}

function byCreatedThenId(a: Comment, b: Comment): number {
  const byCreated = compareIsoTimestamps(a.createdAt, b.createdAt);
  if (byCreated !== 0) return byCreated;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
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

function assertValidCommentState(state: unknown): asserts state is CommentState {
  if (state !== "open" && state !== "closed") {
    throw new ReviewAdapterError(
      "INVALID_STATE",
      400,
      `Invalid comment state '${String(state)}'; expected 'open' or 'closed'.`,
    );
  }
}

function cloneTenant(tenant: TenantContext): TenantContext {
  const copy: TenantContext = { workspaceId: tenant.workspaceId };
  if (tenant.tenantId !== undefined) {
    copy.tenantId = tenant.tenantId;
  }
  if (tenant.userId !== undefined) {
    copy.userId = tenant.userId;
  }
  return copy;
}

function cloneAuthor(author: CommentAuthor): CommentAuthor {
  const copy: CommentAuthor = { id: author.id };
  if (author.kind !== undefined) {
    copy.kind = author.kind;
  }
  if (author.displayLabel !== undefined) {
    copy.displayLabel = author.displayLabel;
  }
  return copy;
}

function cloneRawComment(row: Comment): Comment {
  const target = normalizeCommentTarget(row.target);
  const copy: Comment = {
    id: row.id,
    tenant: cloneTenant(row.tenant),
    target,
    threadId: row.threadId,
    author: cloneAuthor(row.author),
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
 * semantics (SPEC-r6 §1, §1.3, §1.4, §5). Intended for unit tests and demos only.
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

  // Seed initial comments (strict `open|closed` state vocabulary; normalises `record/artifact` targets)
  for (const seed of options.initialComments ?? []) {
    assertValidCommentState(seed.state);
    const normalizedTarget = normalizeCommentTarget(seed.target);
    validateSectionKey(normalizedTarget.sectionKey);
    const stored: Comment = {
      id: seed.id,
      tenant: cloneTenant(seed.tenant),
      target: normalizedTarget,
      threadId: seed.threadId,
      author: cloneAuthor(seed.author),
      state: seed.state,
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
      const { toolCallId } = provenance;
      if (toolCallId !== undefined) {
        const session = liveSessions.get(liveSessionKey(comment.tenant, toolCallId));
        if (session !== undefined) return session;
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

  function workspaceTenant(workspaceId: string): TenantContext {
    return options.tenantId === undefined ? { workspaceId } : { workspaceId, tenantId: options.tenantId };
  }

  function matchingRows(tenant: TenantContext, target: TargetQuery): Comment[] {
    return rows
      .filter((row) => tenantMatches(row.tenant, tenant) && targetMatches(row.target, target) &&
        (target.status === undefined || row.state === target.status))
      .sort(byCreatedThenId);
  }

  function notifySubscribers(tenant: string, affectedTarget: CommentTarget): void {
    for (const sub of subscriptions) {
      if (sub.tenant === tenant && targetMatches(affectedTarget, sub.target)) {
        sub.cb(matchingRows(workspaceTenant(sub.tenant), sub.target).map(toReviewComment));
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
    tenant: TenantContext,
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
      liveSessions.set(liveSessionKey(tenant, toolCallId), session);
    }

    // Persisted provenance carries toolCallId only; runId is dropped at write (§1.3).
    return { toolCallId };
  }

  function threadRows(tenant: TenantContext, threadId: string): Comment[] {
    return rows
      .filter((row) => tenantMatches(row.tenant, tenant) && row.threadId === threadId)
      .sort(byCreatedThenId);
  }

  function requireThread(tenant: TenantContext, threadId: string): Comment[] {
    const thread = threadRows(tenant, threadId);
    if (thread.length === 0) {
      throw new ReviewAdapterError("NOT_FOUND", 404, `Thread '${threadId}' was not found in tenant '${tenant.workspaceId}'.`);
    }
    return thread;
  }

  function findRow(tenant: TenantContext, id: string): Comment | undefined {
    return rows.find((row) => tenantMatches(row.tenant, tenant) && row.id === id);
  }

  function requireWritableRow(tenant: TenantContext, id: string): Comment {
    assertCanComment();
    const row = findRow(tenant, id);
    if (!row) {
      throw new ReviewAdapterError("NOT_FOUND", 404, `Comment '${id}' was not found in tenant '${tenant.workspaceId}'.`);
    }
    assertAuthorOrAdmin(row);
    return row;
  }

  function validateAssignee(tenant: TenantContext, assigneeId: string | null): void {
    if (assigneeId !== null && workspaceMembers && !workspaceMembers.has(assigneeId)) {
      throw new ReviewAdapterError("INVALID_ASSIGNEE", 400, `Assignee '${assigneeId}' is not a member of workspace '${tenant.workspaceId}'.`);
    }
  }

  function firstAnchoredRow(thread: Comment[]): Comment | undefined {
    return thread.find((row) => row.target.sectionKey !== undefined && row.target.sectionKey.length > 0);
  }

  function updateThread(thread: Comment[], update: (row: Comment) => void): Comment[] {
    const timestamp = now();
    for (const row of thread) {
      update(row);
      row.updatedAt = timestamp;
    }
    return thread.map(cloneRawComment);
  }

  const store: FixtureCommentStore = {
    async add(tenant, input) {
      assertCanComment();
      validateBody(input.body);
      const target = normalizeCommentTarget(input.target);
      let threadId = input.threadId;
      if (threadId !== undefined) {
        const { sectionKey, ...targetScope } = target;
        const thread = requireThread(tenant, threadId).filter((row) => targetMatches(row.target, targetScope));
        if (thread.length === 0) {
          throw new ReviewAdapterError("NOT_FOUND", 404, `Thread '${threadId}' was not found for the target.`);
        }
        const inherited = firstAnchoredRow(thread)?.target.sectionKey;
        if (sectionKey === undefined && inherited !== undefined) target.sectionKey = inherited;
      }
      validateSectionKey(target.sectionKey);
      if (input.assignedTo !== undefined) validateAssignee(tenant, input.assignedTo);
      const storedProvenance = normalizeAndValidateWriteProvenance(tenant, input.provenance);
      if (threadId === undefined) {
        do {
          threadId = `t-${nextThreadSeq++}`;
        } while (rows.some((row) => row.threadId === threadId));
      }
      let id: string;
      do {
        id = `c-${nextCommentSeq++}`;
      } while (findRow(tenant, id));
      const row: Comment = {
        id,
        tenant: cloneTenant(tenant),
        target,
        threadId,
        author: cloneAuthor(input.author),
        state: "open",
        body: input.body,
        createdAt: now(),
        ...(input.assignedTo !== undefined ? { assignedTo: input.assignedTo } : {}),
        ...(storedProvenance !== undefined ? { provenance: storedProvenance } : {}),
      };
      rows.push(row);
      return cloneRawComment(row);
    },

    async get(tenant, id) {
      const row = findRow(tenant, id);
      return row ? cloneRawComment(row) : null;
    },

    async edit(tenant, id, { body }) {
      const row = requireWritableRow(tenant, id);
      if (body !== undefined) {
        validateBody(body);
        row.body = body;
      }
      row.updatedAt = now();
      return cloneRawComment(row);
    },

    async editThread(tenant, threadId, { content, assignedTo }) {
      assertCanComment();
      validateBody(content);
      const thread = requireThread(tenant, threadId);
      for (const row of thread) assertAuthorOrAdmin(row);
      validateAssignee(tenant, assignedTo);
      return updateThread(thread, (row) => {
        row.body = content;
        row.assignedTo = assignedTo;
      });
    },

    async delete(tenant, id) {
      const row = requireWritableRow(tenant, id);
      rows.splice(rows.indexOf(row), 1);
    },

    async listByTarget(tenant, query) {
      return matchingRows(tenant, query).map(cloneRawComment);
    },

    async listThread(tenant, threadId) {
      return threadRows(tenant, threadId).map(cloneRawComment);
    },

    async listThreadSummaries(tenant, query) {
      const { status, ...targetQuery } = query;
      const grouped = new Map<string, Comment[]>();
      for (const row of matchingRows(tenant, targetQuery)) {
        const thread = grouped.get(row.threadId);
        if (thread) thread.push(row);
        else grouped.set(row.threadId, [row]);
      }
      const summaries = [...grouped].map(([threadId, thread]): StoreThreadSummary => {
        const root = thread[0]!;
        const last = thread.at(-1)!;
        const target = normalizeCommentTarget(root.target);
        const assignee = root.assignedTo;
        return {
          threadId,
          target,
          rootMessage: root.body,
          rootMessageAt: root.createdAt,
          lastMessage: last.body,
          lastMessageAt: last.createdAt,
          messageCount: thread.length,
          status: thread.some((row) => row.state === "closed") ? "closed" : "open",
          ...(target.recordType !== undefined ? { contextType: target.recordType } : {}),
          ...(target.sectionKey !== undefined ? { sectionKey: target.sectionKey } : {}),
          ...(assignee !== undefined ? { assignee } : {}),
        };
      });
      return status === undefined ? summaries : summaries.filter((summary) => summary.status === status);
    },

    async setState(tenant, threadId, state) {
      assertCanComment();
      assertValidCommentState(state);
      return updateThread(requireThread(tenant, threadId), (row) => { row.state = state; });
    },

    async assign(tenant, threadId, assigneeId) {
      assertCanComment();
      const thread = requireThread(tenant, threadId);
      validateAssignee(tenant, assigneeId);
      return updateThread(thread, (row) => {
        if (assigneeId === null) delete row.assignedTo;
        else row.assignedTo = assigneeId;
      });
    },
  };

  async function addComment(input: CreateCommentInput, threadId?: string): Promise<ReviewComment> {
    const { tenant: workspaceId, target, body, provenance } = input;
    const tenant = workspaceTenant(workspaceId);
    const row = await store.add(tenant, {
      tenant,
      target,
      body,
      author: { id: currentCaller.userId },
      ...(provenance !== undefined ? { provenance } : {}),
      ...(threadId !== undefined ? { threadId } : {}),
    });
    const view = toReviewComment(row);
    for (const listener of createdListeners) listener(view);
    notifySubscribers(workspaceId, row.target);
    return view;
  }

  async function notifyConfirmedThread(tenant: TenantContext, threadId: string): Promise<void> {
    const [first] = await store.listThread(tenant, threadId);
    if (first) notifySubscribers(tenant.workspaceId, first.target);
  }

  const adapter: CommentsAdapter = {
    async list(workspaceId, target) {
      return (await store.listByTarget(workspaceTenant(workspaceId), target)).map(toReviewComment);
    },

    async threadSummaries(workspaceId, target) {
      const tenant = workspaceTenant(workspaceId);
      const summaries = await store.listThreadSummaries(tenant, target);
      return Promise.all(summaries.map(async (summary): Promise<CommentThreadSummary> => {
        const matching = (await store.listThread(tenant, summary.threadId)).filter((row) => targetMatches(row.target, target));
        const last = matching.at(-1);
        const updatedAt = last?.updatedAt ?? summary.lastMessageAt;
        return {
          threadId: summary.threadId,
          target: summary.target,
          status: summary.status,
          commentCount: summary.messageCount,
          createdAt: summary.rootMessageAt,
          ...(updatedAt !== summary.rootMessageAt ? { updatedAt } : {}),
          ...(summary.assignee !== undefined ? { assignedTo: summary.assignee } : {}),
        };
      }));
    },

    create: (input) => addComment(input),

    async reply(input) {
      const { threadId } = input;
      if (typeof threadId !== "string" || threadId.length === 0) {
        throw new ReviewAdapterError("NOT_FOUND", 404, "A reply requires an existing threadId.");
      }
      return addComment(input, threadId);
    },

    async edit(workspaceId, commentId, body) {
      const row = await store.edit(workspaceTenant(workspaceId), commentId, { body });
      notifySubscribers(workspaceId, row.target);
      return toReviewComment(row);
    },

    async remove(workspaceId, commentId) {
      const tenant = workspaceTenant(workspaceId);
      const row = await store.get(tenant, commentId);
      await store.delete(tenant, commentId);
      if (row) notifySubscribers(workspaceId, row.target);
    },

    async setState(workspaceId, threadId, state) {
      const tenant = workspaceTenant(workspaceId);
      await store.setState(tenant, threadId, state);
      await notifyConfirmedThread(tenant, threadId);
    },

    async assign(workspaceId, threadId, assigneeId) {
      const tenant = workspaceTenant(workspaceId);
      await store.assign(tenant, threadId, assigneeId);
      await notifyConfirmedThread(tenant, threadId);
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
      const thread = requireThread(workspaceTenant(tenant), threadId);
      updateThread(thread, (row) => {
        row.target = { ...row.target, sectionKey };
      });
      notifySubscribers(tenant, thread[0]!.target);
    };
  }

  return {
    adapter,
    store,
    setCaller(caller: FixtureCallerContext): void {
      currentCaller = { ...caller };
    },
    registerLiveSession(tenant: TenantContext, toolCallId: string, session: ResolvedAgentSession): void {
      liveSessions.set(liveSessionKey(tenant, toolCallId), session);
    },
    clearLiveSessions(): void {
      liveSessions.clear();
    },
    snapshotRaw(): Comment[] {
      return rows.map(cloneRawComment);
    },
  };
}
