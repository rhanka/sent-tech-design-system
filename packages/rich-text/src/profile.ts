// P0 content profile: extension list and serialisation configuration
// (spec §6.1, §6.5). RT-0: identifier and extension-name data are fixed;
// the factory that composes the live extensions is a stub (phase B).
//
// v3 history note (recorded at lot start): there is no
// `@tiptap/extension-history` on the Tiptap v3 line. Undo/redo is the
// `UndoRedo` extension from the `@tiptap/extensions` package, which is why
// the P0 list below names `@tiptap/extensions` where the spec draft named
// the v2 history package. All peers stay on the v3 major line.

/** Content profile identifier carried by `RichTextDocument.format`. */
export const RICH_TEXT_PROFILE_ID = "focus.markdown.p0@1" as const;

/** P0 extension packages, in composition order. `StarterKit` is never
    enabled wholesale: the core composes these granular extensions so an
    upstream default can never silently widen the profile (spec §6.1). */
export const P0_EXTENSION_NAMES = [
  "@tiptap/extension-document",
  "@tiptap/extension-paragraph",
  "@tiptap/extension-text",
  "@tiptap/extension-bold",
  "@tiptap/extension-italic",
  "@tiptap/extension-code",
  "@tiptap/extension-hard-break",
  "@tiptap/extensions",
  "@tiptap/extension-placeholder",
] as const;

/** Undo/redo source on the v3 line: `UndoRedo` from `@tiptap/extensions`. */
export const P0_UNDO_REDO_SOURCE = {
  package: "@tiptap/extensions",
  export: "UndoRedo",
} as const;

/** Compose the live P0 extensions for the editor schema (phase B).
    RT-0 RED stub: throws because the extensions are not wired. */
export function createP0Extensions(): unknown[] {
  throw new Error("RT-0 RED: P0 extensions not wired (phase B)");
}
