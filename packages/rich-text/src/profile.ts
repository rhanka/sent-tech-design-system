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
// naming the exact packages the `"./editor"` entry instantiates, so the pure
// entry imports no `@tiptap/*` runtime module and stays side-effect free in
// Node. The P0 wiring smoke (`packaging.test.ts`) asserts the set is
// non-empty without touching the document.

/** Content profile identifier carried by `RichTextDocument.format`. */
export const RICH_TEXT_PROFILE_ID = "focus.markdown.p0@1" as const;

/** Full profile identifier (CL-2F, R-FULL-PROFILE-1). */
export const FULL_PROFILE_ID = "ds.markdown.full@1" as const;

/** Accepted profile names on both surfaces (R-FULL-PROFILE-1). */
export type RichTextProfile = "p0" | "full";

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

/** Full extension packages in composition order (CL-2F §2.8 F01–F19).
    P0 set plus heading, lists, blockquote, code block, strike, underline,
    horizontal rule and link. `StarterKit` is never enabled. */
export const FULL_EXTENSION_NAMES = [
  "@tiptap/extension-document",
  "@tiptap/extension-paragraph",
  "@tiptap/extension-text",
  "@tiptap/extension-heading",
  "@tiptap/extension-list",
  "@tiptap/extension-blockquote",
  "@tiptap/extension-code-block",
  "@tiptap/extension-horizontal-rule",
  "@tiptap/extension-bold",
  "@tiptap/extension-italic",
  "@tiptap/extension-code",
  "@tiptap/extension-strike",
  "@tiptap/extension-underline",
  "@tiptap/extension-link",
  "@tiptap/extension-hard-break",
  "@tiptap/extensions",
  "@tiptap/extension-placeholder",
] as const;

/** One composed full extension, as data. */
export interface FullExtensionDescriptor {
  name:
    | "document"
    | "paragraph"
    | "text"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "blockquote"
    | "codeBlock"
    | "horizontalRule"
    | "bold"
    | "italic"
    | "code"
    | "strike"
    | "underline"
    | "link"
    | "hardBreak"
    | "undoRedo"
    | "placeholder"
    | "dropcursor"
    | "gapcursor"
    | "trailingNode";
  package: string;
  note: string;
}

/** Compose the full extension set as frozen descriptor data. */
export function createFullExtensions(): readonly FullExtensionDescriptor[] {
  const descriptors: FullExtensionDescriptor[] = [
    { name: "document", package: "@tiptap/extension-document", note: "Root node." },
    { name: "paragraph", package: "@tiptap/extension-paragraph", note: "Text block; carries paragraphId." },
    { name: "text", package: "@tiptap/extension-text", note: "Inline text." },
    { name: "heading", package: "@tiptap/extension-heading", note: "Levels 1-6; carries paragraphId." },
    { name: "bulletList", package: "@tiptap/extension-list", note: "Bullet list wrapper." },
    { name: "orderedList", package: "@tiptap/extension-list", note: "Ordered list wrapper with start/type." },
    { name: "listItem", package: "@tiptap/extension-list", note: "List item; carries listItemId." },
    { name: "blockquote", package: "@tiptap/extension-blockquote", note: "Quote wrapper." },
    { name: "codeBlock", package: "@tiptap/extension-code-block", note: "Fenced block with language; carries paragraphId." },
    { name: "horizontalRule", package: "@tiptap/extension-horizontal-rule", note: "Atomic rule; carries paragraphId." },
    { name: "bold", package: "@tiptap/extension-bold", note: "Bold mark." },
    { name: "italic", package: "@tiptap/extension-italic", note: "Italic mark." },
    { name: "code", package: "@tiptap/extension-code", note: "Inline code mark." },
    { name: "strike", package: "@tiptap/extension-strike", note: "Strike mark." },
    { name: "underline", package: "@tiptap/extension-underline", note: "Underline mark; Markdown emits <u>." },
    { name: "link", package: "@tiptap/extension-link", note: "Link mark; href validated by R-FULL-URL-1." },
    { name: "hardBreak", package: "@tiptap/extension-hard-break", note: "Inline hard break." },
    { name: "undoRedo", package: "@tiptap/extensions", note: "UndoRedo from @tiptap/extensions." },
    { name: "placeholder", package: "@tiptap/extension-placeholder", note: "Placeholder display only." },
    { name: "dropcursor", package: "@tiptap/extensions", note: "Dropcursor helper; no Markdown token." },
    { name: "gapcursor", package: "@tiptap/extensions", note: "Gapcursor helper; no Markdown token." },
    { name: "trailingNode", package: "@tiptap/extensions", note: "TrailingNode helper; trailing paragraph is identified content." },
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
export const FULL_MARKDOWN_SERIALISATION = {
  bridgePackage: "@tiptap/markdown",
  bridgeRange: "^3.32.0",
  storageKey: "markdown",
  serializeEntry: "getMarkdown",
  editableSource: "full document carried as Markdown per §2.9 with F10/F16 normalizations",
  preservedHandling: "raw slices spliced back byte-identical by the host adapter",
} as const;

export const P0_MARKDOWN_SERIALISATION = {
  bridgePackage: "@tiptap/markdown",
  bridgeRange: "^3.32.0",
  storageKey: "markdown",
  serializeEntry: "getMarkdown",
  editableSource: "paragraph text carried as Markdown inline source",
  preservedHandling: "raw slices spliced back byte-identical by the host adapter",
} as const;
