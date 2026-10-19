// Opaque per-block identity attribute (spec §5.2).
// RT-0: attribute-name data are fixed; the ProseMirror plugin factory is a
// stub (phase B). The component treats identities as opaque: it never parses,
// derives, sorts by or displays them as content. Fresh identities come only
// through the host-injected allocator; the core default (`crypto.randomUUID`)
// is acceptable only for non-manifest hosts, because deterministic seeding and
// retired-ID non-reuse belong to the producer/host, never to the component.

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

/** Build the identity-carriage plugin: split keeps the leading identity and
    allocates fresh tail identities; merge retires consumed identities without
    reallocating them; undo restores identities; pasted copies and external
    payloads receive fresh identities after incoming identity attributes are
    stripped (phase B). RT-0 RED stub: throws. */
export function createParagraphIdentityPlugin(
  _options: ParagraphIdentityPluginOptions,
): unknown {
  throw new Error("RT-0 RED: paragraph-identity plugin not wired (phase B)");
}
