// Authorship fallback ("owner id + provenance") and permission helpers (SPEC-r5 §1.3, §3, §4).

import type {
  CollaborationActor,
  CollaborationActorKind,
  Comment,
  CommentAuthorship,
  CommentProvenance,
  ReviewComment,
} from "./types.js";

export const GENERIC_AGENT_LABEL = "Agent";
export const FALLBACK_ACTOR_COLOR = "#64748b";

export interface ResolvedAgentSession {
  actor: CollaborationActor;
  runId?: string;
}

export interface AuthorshipResolver {
  /** Resolve the author of record (`comment.author.id`) to a human CollaborationActor. */
  resolveHumanActor?(userId: string): CollaborationActor | undefined;
  /**
   * Resolve the true agent/NHI actor (and optional live `runId`) from persisted
   * `provenance.toolCallId` and host session state.
   */
  resolveAgentFromProvenance?(
    provenance: CommentProvenance,
    comment: Comment,
  ): ResolvedAgentSession | CollaborationActor | undefined;
  /** Fallback colour when no actor record supplies one. */
  defaultColor?: string;
}

export interface CanEditOrDeleteOptions {
  /** Mirrors server-side admin/moderator override (`author-or-admin`). */
  canModerate?: boolean;
}

export function isNonEmptyToolCallId(provenance: CommentProvenance | undefined): boolean {
  return typeof provenance?.toolCallId === "string" && provenance.toolCallId.trim().length > 0;
}

/** True iff the comment carries valid non-human provenance (`provenance.toolCallId`). */
export function isAgentProvenance(provenance: CommentProvenance | undefined): boolean {
  return isNonEmptyToolCallId(provenance);
}

/**
 * Discriminator under the fallback (§1.3) and §4 `h2a send` bridge filter:
 * only comments without a non-empty `provenance.toolCallId` are human writes.
 */
export function isHumanComment(comment: Pick<Comment, "provenance">): boolean {
  return !isNonEmptyToolCallId(comment.provenance);
}

/** Synthetic token format required outside an MCP tool call (§1.3, §4). */
export function formatSyntheticToolCallId(sessionId: string, seq: number): string {
  const trimmed = sessionId.trim();
  if (trimmed.length === 0) {
    throw new Error("sessionId must be a non-empty string.");
  }
  if (!Number.isInteger(seq) || seq < 0) {
    throw new Error("seq must be a non-negative integer.");
  }
  return `agent:${trimmed}:${seq}`;
}

/**
 * Enforces SPEC-r5 §1.3: every non-human write MUST carry a non-empty
 * `provenance.toolCallId` (`runId` alone is dropped at write by `PgCommentStore`).
 */
export function assertValidAgentWriteProvenance(
  provenance: CommentProvenance | undefined,
  actorKind: CollaborationActorKind,
): void {
  if (actorKind !== "human" && !isNonEmptyToolCallId(provenance)) {
    throw new Error(
      `Non-human (${actorKind}) comment write requires a non-empty provenance.toolCallId.`,
    );
  }
}

function isResolvedAgentSession(
  value: ResolvedAgentSession | CollaborationActor,
): value is ResolvedAgentSession {
  return "actor" in value;
}

/**
 * Builds the `ReviewComment.authorship` view model under the zero-migration
 * fallback (SPEC-r5 §1.3):
 * - No `provenance.toolCallId` -> human comment (`author` = owner, no `sponsor`).
 *   Actor `kind` is NEVER inferred from an id string.
 * - Non-empty `provenance.toolCallId` -> agent/NHI comment sponsored by the owner
 *   (`sponsor` = author of record; `author` = resolved agent or generic "Agent"
 *   with an `actorId` distinct from the sponsor; `runId` enriched host-side only).
 */
export function resolveAuthorshipFromFallback(
  comment: Comment,
  resolver?: AuthorshipResolver,
): CommentAuthorship {
  const defaultColor = resolver?.defaultColor ?? FALLBACK_ACTOR_COLOR;
  const resolvedOwner = resolver?.resolveHumanActor?.(comment.author.id);
  const ownerActor: CollaborationActor = resolvedOwner ?? {
    actorId: comment.author.id,
    kind: "human",
    displayLabel: comment.author.id,
    color: defaultColor,
  };

  if (!isNonEmptyToolCallId(comment.provenance)) {
    return { author: ownerActor };
  }

  const provenance = comment.provenance!;
  const toolCallId = provenance.toolCallId!.trim();
  const resolved = resolver?.resolveAgentFromProvenance?.(provenance, comment);

  if (resolved) {
    if (isResolvedAgentSession(resolved)) {
      const authorship: CommentAuthorship = {
        author: resolved.actor,
        sponsor: ownerActor,
      };
      if (resolved.runId !== undefined && resolved.runId.length > 0) {
        authorship.runId = resolved.runId;
      }
      return authorship;
    }
    return {
      author: resolved,
      sponsor: ownerActor,
    };
  }

  return {
    author: {
      actorId: `agent:unresolved:${toolCallId}`,
      kind: "agent",
      displayLabel: GENERIC_AGENT_LABEL,
      color: defaultColor,
    },
    sponsor: ownerActor,
  };
}

/**
 * UI eligibility for edit/delete actions (SPEC-r5 §1, §3):
 * offered on human comments of the current user (or when `canModerate` is true).
 * Agent comments written under the user's owner id are NOT offered as own human edits.
 */
export function canEditOrDeleteComment(
  comment: ReviewComment,
  currentUser: Pick<CollaborationActor, "actorId">,
  options?: CanEditOrDeleteOptions,
): boolean {
  if (options?.canModerate === true) {
    return true;
  }
  return (
    comment.authorship.sponsor === undefined &&
    comment.authorship.author.kind === "human" &&
    comment.authorship.author.actorId === currentUser.actorId &&
    comment.author.id === currentUser.actorId
  );
}
