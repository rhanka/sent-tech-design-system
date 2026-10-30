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
  /** CL-2 live composition seam (§6.4): presence summary template,
      "{count}" interpolated with the co-viewer total. Optional: a missing
      key renders the `⟦untranslated:collab.presenceLabel⟧` marker. */
  presenceLabel?: string;
  /** CL-2 live composition seam (§6.4): lock summary template, "{holder}"
      interpolated with the holder display label. */
  lockLabel?: string;
  /** CL-2 live composition seam (§6.4): request-unlock action text. */
  unlockRequestLabel?: string;
  /** CL-2 live composition seam (§6.4): no-lock summary text. */
  noLockLabel?: string;
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

/** CL-2 live composition seam (§6.4): badge keys under the `collab.*`
    namespace. Every visible string stays injected; a missing key renders the
    marker `⟦untranslated:collab.<key>⟧` with `data-untranslated` set. */
export const COLLAB_MESSAGE_NAMESPACE = "collab" as const;

export const COLLAB_MESSAGE_KEYS = [
  "presenceLabel",
  "lockLabel",
  "unlockRequestLabel",
  "noLockLabel",
] as const;

export type CollabMessageKey = (typeof COLLAB_MESSAGE_KEYS)[number];

/** Visible marker text for a missing collab catalogue key, e.g.
    `⟦untranslated:collab.lockLabel⟧` (spec §6.2 R-API-5). */
export function formatCollabUntranslatedMarker(key: CollabMessageKey): string {
  return `⟦untranslated:${COLLAB_MESSAGE_NAMESPACE}.${key}⟧`;
}

/** Value of the marker's data attribute, e.g. `collab.lockLabel`. */
export function collabUntranslatedDataValue(key: CollabMessageKey): string {
  return `${COLLAB_MESSAGE_NAMESPACE}.${key}`;
}

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
