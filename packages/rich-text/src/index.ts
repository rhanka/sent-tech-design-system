// Pure rich-text entry (spec §4.2, entry ".").
//
// Side-effect free on import: loading this module touches no DOM global, no
// `@tiptap/*` or `prosemirror-*` module and no framework module (asserted by
// `src/packaging.test.ts`, RT-0 half of RED-P). Every import specifier in the
// "." graph is relative: the pure entry needs no runtime package, no
// framework module and no Node built-in.
//
// The Tiptap-bound factory lives in the "./editor" entry (`src/editor.ts`)
// and is never re-exported here.

export type {
  FullInlineSegment,
  RichTextBlock,
  RichTextCaptureResult,
  RichTextCaptureUnavailableMessage,
  RichTextCaptureUnavailableName,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextEditorHandle,
  RichTextExternalConflictEvent,
  RichTextFormat,
  RichTextGesture,
  RichTextGestureKind,
  RichTextReadiness,
  RichTextRepresentability,
  RichTextUnsupportedPasteEvent,
} from "./model.js";
export {
  RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE,
  RICH_TEXT_CAPTURE_UNAVAILABLE_NAME,
} from "./model.js";
export type {
  CollabMessageKey,
  RichTextMessageKey,
  RichTextMessages,
} from "./messages.js";
export {
  COLLAB_MESSAGE_KEYS,
  COLLAB_MESSAGE_NAMESPACE,
  RICH_TEXT_MESSAGE_KEYS,
  RICH_TEXT_MESSAGE_NAMESPACE,
  RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
  collabUntranslatedDataValue,
  formatCollabUntranslatedMarker,
  formatUntranslatedMarker,
  untranslatedDataValue,
} from "./messages.js";
export type {
  FullExtensionDescriptor,
  P0ExtensionDescriptor,
  RichTextProfile,
} from "./profile.js";
export {
  FULL_EXTENSION_NAMES,
  FULL_MARKDOWN_SERIALISATION,
  FULL_PROFILE_ID,
  P0_EXTENSION_NAMES,
  P0_MARKDOWN_SERIALISATION,
  P0_UNDO_REDO_SOURCE,
  RICH_TEXT_PROFILE_ID,
  createFullExtensions,
  createP0Extensions,
} from "./profile.js";
export type {
  ParagraphIdentityPluginDescriptor,
  ParagraphIdentityPluginOptions,
} from "./identity.js";
export {
  PARAGRAPH_ID_ATTRIBUTE,
  PARAGRAPH_ID_DOM_ATTRIBUTE,
  PRESERVED_BLOCK_DOM_ATTRIBUTE,
  createParagraphIdentityPlugin,
} from "./identity.js";
export type {
  ExternalUpdateDecision,
  ExternalUpdateInput,
} from "./document.js";
export {
  copyRichTextCaptureResult,
  copyRichTextDocument,
  createCaptureTracker,
  createCaptureUnavailableError,
  decideExternalUpdate,
  richTextDocumentsEqual,
} from "./document.js";
export type { CaptureTracker } from "./document.js";
export type { RichTextStyleBinding } from "./theme.js";
export {
  RICH_TEXT_CLASS_MAPPING,
  RICH_TEXT_TOKEN_PREFIX,
} from "./theme.js";
export type {
  AgentDocumentState,
  AgentEditOperation,
  AgentFieldState,
  AgentInlineSegment,
  AgentOperationResult,
  AgentParagraphState,
  AgentPatch,
  AgentPatchKey,
  EffectiveEditableInput,
  AgentPatchProfile,
  AgentPatchReceipt,
  AgentPatchResult,
  AgentReadRequest,
  AnchorRange,
  AwarenessCursor,
  CollaborationActor,
  CollaborationActorKind,
  CollaborationCapabilities,
  CollaborationProvider,
  ComposerCaptureResult,
  ComposerEditorHandle,
  ComposerEditorProps,
  ComposerKeyEvent,
  DocumentRevision,
  FieldBindingIdentity,
  FormattingIntent,
  FullBlockMetadata,
  FullContainerMetadata,
  InlineMarkKey,
  LiveSessionAdmissionDecision,
  LiveSessionAdmissionRequest,
  LiveSessionHandle,
  LiveSessionOpenAdmission,
  LiveSessionOpenRefusal,
  LockSnapshot,
  LockUnitRef,
  MarkProvenanceConflict,
  PatchRefusalReason,
  PatchValidationResult,
  PresenceBadgeRole,
  PresenceBadgeState,
  PresenceSnapshot,
  ReadRequestValidationResult,
  RelativeAnchor,
  RichTextInlineMarks,
  SchemaEpochAcknowledgement,
} from "./collaboration.js";
export {
  COLLABORATION_FALLBACK_COLOR,
  MAX_ANCHOR_REQUESTS,
  MAX_HREF_UNITS,
  MAX_ID_UNITS,
  MAX_LANGUAGE_UNITS,
  MAX_LIST_QUOTE_DEPTH,
  MAX_METADATA_BYTES,
  MAX_OPERATION_INSERT_UNITS,
  MAX_PATCH_INSERT_UNITS,
  MAX_PATCH_OPERATIONS,
  MAX_PATCH_SERIALIZED_BYTES,
  MAX_READ_ANCHORS,
  MAX_READ_PARAGRAPHS,
  MAX_READ_SERIALIZED_BYTES,
  MAX_READ_TEXT_UNITS,
  MAX_TITLE_UNITS,
  computeEffectiveEditable,
  createPresenceSnapshot,
  decideLiveSessionAdmission,
  derivePresenceBadgeState,
  isAllowedHref,
  isLockExpired,
  validateAgentPatch,
  validateAgentReadRequest,
  validateCollaborationColor,
  validateFullBlockMetadata,
} from "./collaboration.js";
export {
  composerDocumentFromText,
  composerFullDocumentForText,
  composerFullDocumentFromText,
  composerFullSeededDocumentForText,
  composerFullSeededDocumentFromText,
  composerFullSeededTextFromDocument,
  composerFullTextFromDocument,
  composerTextFromDocument,
  joinComposerText,
  splitComposerText,
} from "./composer-document.js";
export type { ComposerFullSeededDocument } from "./composer-document.js";
export type {
  FullNormalizationRule,
  FullParseResult,
  FullSerializeOptions,
} from "./editor-full-markdown.js";
export {
  FULL_NORMALIZATION_MANIFEST,
  canonicalHrDefaults,
  canonicalPlainMetadata,
  escapeInlineText,
  isPlainMetadata,
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
