// Neutral rich-text core entry point. Side-effect free on import: loading
// this module touches no DOM global and no framework module (asserted by
// `src/packaging.test.ts`, RT-0 half of RED-P).
//
// RT-0: every entry below exists as a stub so the RED tests load; calling any
// factory throws `RT-0 RED: … not implemented` until phase B lands.

export type {
  RichTextBlock,
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
  RichTextUnsupportedPasteEvent,
} from "./model.js";
export {
  RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE,
  RICH_TEXT_CAPTURE_UNAVAILABLE_NAME,
} from "./model.js";
export type { RichTextMessageKey, RichTextMessages } from "./messages.js";
export {
  RICH_TEXT_MESSAGE_KEYS,
  RICH_TEXT_MESSAGE_NAMESPACE,
} from "./messages.js";
export {
  P0_EXTENSION_NAMES,
  P0_UNDO_REDO_SOURCE,
  RICH_TEXT_PROFILE_ID,
  createP0Extensions,
} from "./profile.js";
export {
  PARAGRAPH_ID_ATTRIBUTE,
  PARAGRAPH_ID_DOM_ATTRIBUTE,
  PRESERVED_BLOCK_DOM_ATTRIBUTE,
  createParagraphIdentityPlugin,
} from "./identity.js";
export type { ParagraphIdentityPluginOptions } from "./identity.js";
export type { DocumentFromSourceOptions, SourceSegment } from "./codec.js";
export { documentFromSource, segmentSource, sourceFromDocument } from "./codec.js";
export { RICH_TEXT_TOKEN_PREFIX } from "./theme.js";
export type {
  HeadlessEditor,
  HeadlessEditorCallbacks,
  HeadlessEditorOptions,
  PastePayload,
  RichTextSelectionSnapshot,
} from "./editor.js";
export { createHeadlessEditor } from "./editor.js";
