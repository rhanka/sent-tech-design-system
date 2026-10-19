// Injected labels and messages (spec §5.7).
// RT-0: type declarations and namespace data only. No runtime behaviour.

export interface RichTextMessages {
  editorLabel: string; // accessible name of the editing region
  placeholder: string; // shown only when editable and empty
  preservedBlockLabel: string; // accessible name template for a preserved block, "{kind}" interpolated
  externalConflictLabel: string;
}

/** Key namespace of the catalogue. A missing key renders the marker
    `⟦untranslated:rich-text.<key>⟧` with `data-untranslated` set (spec §5.7);
    the marker is never a hard-coded sentence in any language. */
export const RICH_TEXT_MESSAGE_NAMESPACE = "rich-text" as const;

export const RICH_TEXT_MESSAGE_KEYS = [
  "editorLabel",
  "placeholder",
  "preservedBlockLabel",
  "externalConflictLabel",
] as const;

export type RichTextMessageKey = (typeof RICH_TEXT_MESSAGE_KEYS)[number];
