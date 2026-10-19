// Opaque per-block identity attribute (spec §5.2).
//
// The component treats identities as opaque: it never parses, derives,
// sorts by or displays them as content. Fresh identities come only through
// the host-injected allocator; the core default (`crypto.randomUUID`) is
// acceptable only for non-manifest hosts, because deterministic seeding and
// retired-ID non-reuse belong to the producer/host, never to the component.
//
// Runtime note (packaging, spec §11 RED-P): the live ProseMirror plugin is
// composed in the `"./editor"` entry, which owns the `@tiptap/*` imports.
// This module carries the attribute contract as data plus a descriptor
// factory, so the pure entry stays runtime-import free.

/** ProseMirror node attribute carrying the opaque block identity. */
export const PARAGRAPH_ID_ATTRIBUTE = "paragraphId" as const;

/** DOM rendering of the identity attribute. */
export const PARAGRAPH_ID_DOM_ATTRIBUTE = "data-paragraph-id" as const;

/** DOM marker rendered on preserved (non-editable) blocks. */
export const PRESERVED_BLOCK_DOM_ATTRIBUTE = "data-preserved-block" as const;

export interface ParagraphIdentityPluginOptions {
  /** Host identity allocator for split tails, pasted blocks and inserts. */
  allocateId: () => string;
}

/** Data-level wiring of the identity-carriage plugin: the exact attribute
    names the runtime plugin enforces plus the host allocator it calls.
    Carriage rules (spec §5.2, implemented by the runtime editor and the
    headless factory): split keeps the leading identity and allocates fresh
    tail identities; merge retires consumed identities without reallocating
    them; undo restores identities; pasted copies and external payloads
    receive fresh identities after incoming identity attributes are
    stripped. */
export interface ParagraphIdentityPluginDescriptor {
  pluginKey: "richTextParagraphIdentity";
  paragraphIdAttribute: typeof PARAGRAPH_ID_ATTRIBUTE;
  domAttribute: typeof PARAGRAPH_ID_DOM_ATTRIBUTE;
  preservedBlockAttribute: typeof PRESERVED_BLOCK_DOM_ATTRIBUTE;
  allocateId: () => string;
}

/** Describe the identity-carriage plugin wiring for the given allocator.
    Pure data; the live ProseMirror plugin is composed in the runtime
    editor against these exact attribute names. */
export function createParagraphIdentityPlugin(
  options: ParagraphIdentityPluginOptions,
): ParagraphIdentityPluginDescriptor {
  return Object.freeze({
    pluginKey: "richTextParagraphIdentity",
    paragraphIdAttribute: PARAGRAPH_ID_ATTRIBUTE,
    domAttribute: PARAGRAPH_ID_DOM_ATTRIBUTE,
    preservedBlockAttribute: PRESERVED_BLOCK_DOM_ATTRIBUTE,
    allocateId: options.allocateId,
  });
}
