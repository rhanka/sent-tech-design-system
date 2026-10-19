// P0 content profile: extension list and serialisation configuration
// (spec §6.1, §6.5).
//
// `StarterKit` is never enabled wholesale: the core composes these granular
// extensions so an upstream default can never silently widen the profile
// (spec §6.1).
//
// v3 history note: there is no `@tiptap/extension-history` on the Tiptap v3
// line. Undo/redo is the `UndoRedo` extension from the `@tiptap/extensions`
// package, which is why the P0 list below names `@tiptap/extensions` where
// the spec draft named the v2 history package. All peers stay on the v3
// major line.
//
// Runtime note (packaging, spec §11 RED-P): this module composes no live
// extension object. `createP0Extensions()` returns frozen descriptor data
// naming the exact packages the runtime editor (RT-1+) instantiates, so the
// neutral core imports no `@tiptap/*` runtime module and stays side-effect
// free in Node. The P0 wiring smoke (`packaging.test.ts`) asserts the set is
// non-empty without touching the document.

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

/** One composed P0 extension, as data. The runtime editor instantiates the
    named package export with `options` where present. */
export interface P0ExtensionDescriptor {
  /** Extension name as registered in the editor schema. */
  name:
    | "document"
    | "paragraph"
    | "text"
    | "bold"
    | "italic"
    | "code"
    | "hardBreak"
    | "undoRedo"
    | "placeholder";
  /** Package providing the extension on the v3 line. */
  package: (typeof P0_EXTENSION_NAMES)[number];
  /** Composition note for the runtime wiring (attribute names, catalogue
      reads). No behaviour lives here. */
  note: string;
}

/** Compose the P0 extension set for the editor schema, as frozen descriptor
    data in `P0_EXTENSION_NAMES` order. No DOM access, no runtime import. */
export function createP0Extensions(): readonly P0ExtensionDescriptor[] {
  const descriptors: P0ExtensionDescriptor[] = [
    { name: "document", package: "@tiptap/extension-document", note: "Root node." },
    {
      name: "paragraph",
      package: "@tiptap/extension-paragraph",
      note: "The only editable block in P0; carries the paragraphId attribute (spec §5.2).",
    },
    { name: "text", package: "@tiptap/extension-text", note: "Inline text." },
    { name: "bold", package: "@tiptap/extension-bold", note: "Editable mark; keyboard and Markdown input." },
    { name: "italic", package: "@tiptap/extension-italic", note: "Editable mark; keyboard and Markdown input." },
    {
      name: "code",
      package: "@tiptap/extension-code",
      note: "Inline code mark only; no code block follows from this mark.",
    },
    {
      name: "hardBreak",
      package: "@tiptap/extension-hard-break",
      note: "Inside a paragraph.",
    },
    {
      name: "undoRedo",
      package: "@tiptap/extensions",
      note: "UndoRedo from @tiptap/extensions; there is no @tiptap/extension-history on the v3 line.",
    },
    {
      name: "placeholder",
      package: "@tiptap/extension-placeholder",
      note: "Placeholder display reads messages.placeholder; shown only when editable and empty.",
    },
  ];
  for (const descriptor of descriptors) Object.freeze(descriptor);
  return Object.freeze(descriptors);
}

/** Markdown bridge serialisation configuration (spec §6.5), as data. The
    live bridge is the official `@tiptap/markdown` package on the same v3
    major as the core; the neutral core carries the selection here so no
    runtime import is needed. Editable paragraphs serialise through the
    bridge entry `getMarkdown` on the `markdown` storage key; preserved
    `raw` slices are never regenerated from an AST and are spliced back at
    their block positions by the host adapter. */
export const P0_MARKDOWN_SERIALISATION = {
  bridgePackage: "@tiptap/markdown",
  bridgeRange: "^3.32.0",
  storageKey: "markdown",
  serializeEntry: "getMarkdown",
  editableSource: "paragraph text carried as Markdown inline source",
  preservedHandling: "raw slices spliced back byte-identical by the host adapter",
} as const;
