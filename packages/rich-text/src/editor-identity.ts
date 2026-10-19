// Live paragraph-identity ProseMirror plugin (spec §5.2).
//
// The `"."` entry (`src/identity.ts`) carries the attribute contract as
// data; this module is the live plugin that enforces carriage on real
// transactions: split keeps the leading identity and allocates fresh tail
// identities, merge retires the consumed identity without reallocating it,
// undo/redo restore identities by construction (history replays documents,
// and this plugin only repairs missing or duplicated attributes, never
// valid ones), internal and external pastes receive fresh identities because
// pasted attributes are never trusted.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";

export const paragraphIdentityPluginKey = new PluginKey(
  "richTextParagraphIdentity",
);

const IDENTITY_NODE_TYPES = new Set(["paragraph", "preservedBlock"]);

/** Allocate with retired-ID non-reuse inside the editor session: identities
    the merge path retired are never handed out again by this factory. */
export function createSessionAllocator(
  allocate: () => string,
  retired: Set<string>,
): () => string {
  return () => {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const id = allocate();
      if (!retired.has(id)) return id;
    }
    return allocate();
  };
}

/** Wrap the live plugin as a Tiptap extension so the editor factory can
    compose it with the P0 set. The fix-up transaction carries the
    `richTextIdentityFix` meta so the factory never emits it as a gesture. */
export function createParagraphIdentityExtension(
  allocateId: () => string,
): Extension {
  const plugin = createLiveParagraphIdentityPlugin(allocateId);
  return Extension.create({
    name: "richTextParagraphIdentity",
    addProseMirrorPlugins() {
      return [plugin];
    },
  });
}

/** The live identity plugin: after every transaction, every paragraph and
    preserved block carries a non-empty identity unique within the document.
    The first occurrence of an identity keeps it; later duplicates (split
    tails copied by ProseMirror, pasted slices carrying foreign attributes)
    and empty attributes receive fresh allocator identities. */
export function createLiveParagraphIdentityPlugin(
  allocateId: () => string,
): Plugin {
  return new Plugin({
    key: paragraphIdentityPluginKey,
    appendTransaction(_transactions, _oldState, newState) {
      const seen = new Set<string>();
      const repairs: { pos: number; id: string }[] = [];
      newState.doc.descendants((node, pos) => {
        if (!IDENTITY_NODE_TYPES.has(node.type.name)) return true;
        const current = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
        if (typeof current === "string" && current !== "" && !seen.has(current)) {
          seen.add(current);
          return true;
        }
        let fresh = allocateId();
        while (seen.has(fresh)) fresh = allocateId();
        seen.add(fresh);
        repairs.push({ pos, id: fresh });
        return true;
      });
      if (repairs.length === 0) return null;
      const tr = newState.tr;
      for (const repair of repairs) {
        tr.setNodeAttribute(repair.pos, PARAGRAPH_ID_ATTRIBUTE, repair.id);
      }
      tr.setMeta("richTextIdentityFix", true);
      return tr;
    },
  });
}
