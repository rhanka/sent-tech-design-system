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
import type { Transaction } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";

/** Meta that lets the explicit external-replacement path (mount and rule-4
    application) replace preserved nodes. No user transaction carries it. */
export const PRESERVED_REPLACE_META = "richTextAllowPreservedReplace";

/** Meta carried by the identity repair transaction (never a gesture). */
export const IDENTITY_FIX_META = "richTextIdentityFix";

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

/** Hooks for the live identity plugin. */
export interface LiveParagraphIdentityHooks {
  /** Identities consumed by a select-all replacement (N8): every old block
      identity that vanished with the replaced content, so the session
      retires them and never reallocates them (§5.2). */
  onRetire?: (ids: readonly string[]) => void;
}

/** Wrap the live plugin as a Tiptap extension so the editor factory can
    compose it with the P0 set. The fix-up transaction carries the
    `richTextIdentityFix` meta so the factory never emits it as a gesture. */
export function createParagraphIdentityExtension(
  allocateId: () => string,
  hooks?: LiveParagraphIdentityHooks,
): Extension {
  const plugin = createLiveParagraphIdentityPlugin(allocateId, hooks);
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
    and empty attributes receive fresh allocator identities — except the
    select-all replacement below, which keeps the first paragraph identity
    on the emptied block (N8, §5.2). */
export function createLiveParagraphIdentityPlugin(
  allocateId: () => string,
  hooks?: LiveParagraphIdentityHooks,
): Plugin {
  return new Plugin({
    key: paragraphIdentityPluginKey,
    appendTransaction(_transactions, oldState, newState) {
      // Select-all replacement (N8): the native select-all delete swaps the
      // whole content for one empty paragraph whose identity attribute is
      // empty. §5.2 keeps the first paragraph's identity on the emptied
      // block instead of minting a fresh one: reuse the old first paragraph
      // identity (no allocator call) and retire every other vanished
      // identity. A lone empty paragraph can only arise this way with an
      // empty attribute (a valid identity keeps itself below), so this
      // pre-check never fires for mounts or external replacements, which
      // carry their own identities.
      const only =
        newState.doc.childCount === 1 ? newState.doc.firstChild : null;
      const onlyId =
        only !== null && only !== undefined
          ? only.attrs[PARAGRAPH_ID_ATTRIBUTE]
          : undefined;
      if (
        only !== null &&
        only !== undefined &&
        only.type.name === "paragraph" &&
        only.textContent === "" &&
        onlyId === ""
      ) {
        const before: string[] = [];
        oldState.doc.forEach((node) => {
          if (node.type.name === "paragraph") {
            const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
            if (typeof id === "string" && id !== "") before.push(id);
          }
        });
        const first = before[0];
        if (first !== undefined) {
          const tr = newState.tr;
          tr.setNodeAttribute(0, PARAGRAPH_ID_ATTRIBUTE, first);
          tr.setMeta(IDENTITY_FIX_META, true);
          const vanished = before.filter((id) => id !== first);
          if (vanished.length > 0) hooks?.onRetire?.(vanished);
          return tr;
        }
      }
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
      tr.setMeta(IDENTITY_FIX_META, true);
      return tr;
    },
  });
}

/** Inventory of every preserved block for the guard: identity plus the exact
    verbatim payload, one entry per node. Empty and duplicated identities are
    included as their own entries, so a dropped or pasted copy carrying an
    empty or copied identity cannot hide behind the id-keyed map: any added,
    removed or altered preserved node changes the sorted inventory. */
function preservedInventory(
  doc: { descendants(
    fn: (node: {
      type: { name: string };
      attrs: Record<string, unknown>;
    }) => boolean | void,
  ): void },
): string[] {
  const entries: string[] = [];
  doc.descendants((node) => {
    if (node.type.name !== "preservedBlock") return true;
    const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
    const raw = node.attrs["raw"];
    const kind = node.attrs["preservedKind"];
    entries.push(
      `${typeof id === "string" ? id : ""}::${
        typeof raw === "string" ? raw : ""
      }::${typeof kind === "string" ? kind : ""}`,
    );
    return true;
  });
  return entries.sort();
}

/** The preserved-block guard (§6.3): no user transaction deletes, replaces
    or introduces a preserved node. Select-all delete and a paste spanning a
    preserved block are filtered here; only a transaction carrying
    `PRESERVED_REPLACE_META` (the explicit external-replacement path) may
    replace one. Identity repairs carry their own meta and pass through. */
export function createPreservedGuardPlugin(
  isPlainText: () => boolean,
): Plugin {
  return new Plugin({
    key: new PluginKey("richTextPreservedGuard"),
    filterTransaction(tr: Transaction, state: EditorState): boolean {
      if (tr.getMeta(PRESERVED_REPLACE_META) === true) return true;
      if (tr.getMeta(IDENTITY_FIX_META) === true) return true;
      // The transaction under test already carries its steps: `tr.doc` is
      // the post-transaction document. Every preserved node counts, empty or
      // duplicated identities included, so a second preserved block smuggled
      // in with an empty or copied identity still changes the inventory.
      const before = preservedInventory(state.doc);
      const after = preservedInventory(tr.doc);
      if (before.length !== after.length) return false;
      return before.every((entry, index) => entry === after[index]);
    },
    appendTransaction(
      _transactions: readonly Transaction[],
      _oldState: EditorState,
      newState: EditorState,
    ): Transaction | null {
      // `text/plain` carries no marks (§6.1): strip any mark the P0 input
      // rules or rich-text insertion left behind, keeping the characters.
      if (!isPlainText()) return null;
      let tr: Transaction | null = null;
      newState.doc.descendants((node, pos) => {
        if (!node.isText || node.marks.length === 0) return true;
        if (tr === null) tr = newState.tr;
        for (const mark of node.marks) {
          tr = (tr as Transaction).removeMark(pos, pos + node.nodeSize, mark.type);
        }
        return true;
      });
      return tr;
    },
  });
}

/** Wrap the preserved guard as a Tiptap extension. */
export function createPreservedGuardExtension(
  isPlainText: () => boolean,
): Extension {
  const plugin = createPreservedGuardPlugin(isPlainText);
  return Extension.create({
    name: "richTextPreservedGuard",
    addProseMirrorPlugins() {
      return [plugin];
    },
  });
}
