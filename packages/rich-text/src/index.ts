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
