// Neutral rich-text core entry point. Side-effect free on import: loading
// this module touches no DOM global and no framework module (asserted by
// `src/packaging.test.ts`, RT-0 half of RED-P). Every import specifier in
// the core graph is relative: the core needs no runtime package, no
// framework module and no Node built-in.

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
  RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE,
  formatUntranslatedMarker,
  untranslatedDataValue,
} from "./messages.js";
export type { P0ExtensionDescriptor } from "./profile.js";
export {
  P0_EXTENSION_NAMES,
  P0_MARKDOWN_SERIALISATION,
  P0_UNDO_REDO_SOURCE,
  RICH_TEXT_PROFILE_ID,
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
  BridgePreservedKind,
  DocumentFromSourceOptions,
  SourceSegment,
  TextPasteAnalysis,
} from "./codec.js";
export {
  analyzeTextPaste,
  documentFromSource,
  extractMarkdownImageAlt,
  isBlockquoteLine,
  isFencedCodeLine,
  isHeadingLine,
  isHorizontalRuleLine,
  isListItemLine,
  isMarkdownImageLine,
  isMarkdownTableBlock,
  segmentSource,
  sourceFromDocument,
} from "./codec.js";
export type { RichTextStyleBinding } from "./theme.js";
export {
  RICH_TEXT_CLASS_MAPPING,
  RICH_TEXT_TOKEN_PREFIX,
} from "./theme.js";
export type {
  HeadlessEditor,
  HeadlessEditorCallbacks,
  HeadlessEditorOptions,
  PastePayload,
  RichTextSelectionSnapshot,
} from "./editor.js";
export { createHeadlessEditor } from "./editor.js";
