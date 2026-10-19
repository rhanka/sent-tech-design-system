// Injected labels and messages (spec §5.7).
//
// The catalogue shape is fixed here; resolution happens host-side at
// production/build time and the component only receives the resolved
// `messages` object. The marker helpers below are pure functions over the
// key namespace: they carry no language and touch no DOM.

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

/** Attribute carrying the untranslated-key reference on a marker element. */
export const RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE =
  "data-untranslated" as const;

/** Visible marker text for a missing catalogue key, e.g.
    `⟦untranslated:rich-text.editorLabel⟧` (spec §5.7). */
export function formatUntranslatedMarker(key: RichTextMessageKey): string {
  return `⟦untranslated:${RICH_TEXT_MESSAGE_NAMESPACE}.${key}⟧`;
}

/** Value of the marker's data attribute, e.g. `rich-text.editorLabel`. */
export function untranslatedDataValue(key: RichTextMessageKey): string {
  return `${RICH_TEXT_MESSAGE_NAMESPACE}.${key}`;
}
