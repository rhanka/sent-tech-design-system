// @sentropic/design-system-review-core public entry point.

export {
  COMMENT_STATE_UI_LABELS,
  MAX_SECTION_KEY_LENGTH,
  getCommentStateLabel,
  normalizeCommentState,
  normalizeCommentTarget,
  toLegacyWireCommentState,
} from "./types.js";
export type {
  AnchorPayload,
  CollaborationActor,
  CollaborationActorKind,
  Comment,
  CommentAuthorRef,
  CommentAuthorship,
  CommentProvenance,
  CommentState,
  CommentTarget,
  CommentTargetKind,
  CommentThreadSummary,
  ElementAnchorPayload,
  LegacyWireCommentState,
  RegionAnchorPayload,
  RegionRect,
  ReviewComment,
  ReviewThread,
  TenantContext,
  TextAnchorPayload,
  TextPositionSelector,
  TextQuoteSelector,
} from "./types.js";

export {
  FALLBACK_ACTOR_COLOR,
  GENERIC_AGENT_LABEL,
  assertValidAgentWriteProvenance,
  canEditOrDeleteComment,
  formatSyntheticToolCallId,
  isAgentProvenance,
  isHumanComment,
  isNonEmptyToolCallId,
  resolveAuthorshipFromFallback,
} from "./authorship.js";
export type {
  AuthorshipResolver,
  CanEditOrDeleteOptions,
  ResolvedAgentSession,
} from "./authorship.js";

export { ReviewAdapterError } from "./adapter.js";
export type {
  CommentsAdapter,
  CreateCommentInput,
  ReplyCommentInput,
  ReviewAdapterErrorCode,
} from "./adapter.js";

export { createFixtureCommentsAdapter } from "./fixture-adapter.js";
export type {
  FixtureCallerContext,
  FixtureCommentsAdapterHandle,
  FixtureCommentsAdapterOptions,
  FixtureInitialComment,
} from "./fixture-adapter.js";

export { groupCommentsIntoThreads } from "./threads.js";
export type { AnchorDecoder, GroupThreadsOptions } from "./threads.js";

export { countThreadsByFilter, filterThreads } from "./filters.js";
export type { ThreadFilter, ThreadFilterCounts } from "./filters.js";

export {
  countUnreadComments,
  countUnreadThreads,
  isCommentUnread,
  isUnread,
} from "./unread.js";
export type { ThreadReadState } from "./unread.js";

export { DEFAULT_PIN_GAP, layoutPins } from "./layout-pins.js";
export type { PinInput, PinLayoutOptions, PositionedPin } from "./layout-pins.js";
