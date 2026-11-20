// @sentropic/design-system-review-core public entry point.

export {
  COMMENT_STATE_UI_LABELS,
  MAX_SECTION_KEY_LENGTH,
  getCommentStateLabel,
  normalizeCommentTarget,
} from "./types.js";
export type {
  AnchorPayload,
  CollaborationActor,
  CollaborationActorKind,
  Comment,
  CommentAuthor,
  CommentAuthorship,
  CommentProvenance,
  CommentState,
  CommentTarget,
  CommentTargetKind,
  CommentThreadSummary,
  ElementAnchorPayload,
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

export {
  ANCHOR_KEY_PREFIX,
  AnchorTooLongError,
  AnchorValidationError,
  MAX_QUOTE_CONTEXT_LENGTH,
  decodeAnchor,
  encodeAnchor,
  tryEncodeAnchor,
} from "./anchor-codec.js";
export type {
  DecodeAnchorOptions,
  EncodeAnchorOptions,
  TryEncodeAnchorResult,
} from "./anchor-codec.js";

export {
  createAnchor,
  createAnchorFromElement,
  createAnchorFromRegion,
  createAnchorFromSelection,
  resolveAnchor,
} from "./anchor-dom.js";
export type {
  AnchorResolutionStrategy,
  OrphanedAnchor,
  ResolveAnchorOptions,
  ResolveAnchorResult,
  ResolvedElementAnchor,
  ResolvedRegionAnchor,
  ResolvedTextAnchor,
} from "./anchor-dom.js";
