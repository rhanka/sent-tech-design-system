// P0 extension instantiation for the "./editor" entry (spec §6.1).
//
// Only this module graph (the `editor*.ts` files) instantiates Tiptap
// extensions. `src/profile.ts` ("." entry) carries the same set as frozen
// descriptor data; this module is where the descriptors become live
// extensions. `StarterKit` is never enabled: the granular extensions below
// mirror `P0_EXTENSION_NAMES` in composition order so an upstream default can
// never silently widen the profile.

import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Code } from "@tiptap/extension-code";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Placeholder } from "@tiptap/extension-placeholder";
import { UndoRedo } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { Extension, Node, isNodeEmpty } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  PARAGRAPH_ID_ATTRIBUTE,
  PARAGRAPH_ID_DOM_ATTRIBUTE,
  PRESERVED_BLOCK_DOM_ATTRIBUTE,
} from "./identity.js";
import { RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE } from "./messages.js";

export interface P0EditorExtensionOptions {
  /** Placeholder text or a live reader. A function is read on every
      placeholder-decoration build, so a locale switch re-renders the
      visible placeholder with no document transaction (§5.7). */
  placeholder: string | (() => string);
  /** Live `data-untranslated` value for the placeholder-displaying
      paragraphs, or null when the placeholder key is translated. Read on
      every decoration build, so the missing-key marker survives the
      ProseMirror re-renders that wipe manually set DOM attributes (§5.7).
      The adapter owns the value through `setPlaceholder`. */
  placeholderMarker: () => string | null;
  /** Whether the editor is currently editable. The marker decorates only
      when true, mirroring the placeholder's own `showOnlyWhenEditable`. */
  isEditable: () => boolean;
  /** Whether this editor mounts a collaboration binding (bound mode). The
      full profile composes its helper set accordingly: a helper that
      creates content the projection never sees must stay out, because the
      bound ProseMirror document is the deterministic projection of the
      shared state on every replica. */
  bound: boolean;
}

/** Paragraph with the opaque identity attribute (spec §5.2): the attribute
    is `paragraphId`, rendered to the DOM as `data-paragraph-id`. Shared with
    the full module graph, which carries no P0 duplication. */
export const ParagraphWithIdentity = Paragraph.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      [PARAGRAPH_ID_ATTRIBUTE]: {
        default: "",
        parseHTML: (element: HTMLElement): string =>
          element.getAttribute(PARAGRAPH_ID_DOM_ATTRIBUTE) ?? "",
        renderHTML: (attributes: Record<string, unknown>): Record<string, string> => {
          const id = attributes[PARAGRAPH_ID_ATTRIBUTE];
          return typeof id === "string" && id !== ""
            ? { [PARAGRAPH_ID_DOM_ATTRIBUTE]: id }
            : {};
        },
      },
    };
  },
});

/** Preserved block (spec §6.3): an atom block node carrying every unsupported
    block verbatim. `raw` is never regenerated from an AST; it travels in the
    attributes and renders as inert text inside a non-editable region. Shared
    with the full module graph. */
export const PreservedBlock = Node.create({
  name: "preservedBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      [PARAGRAPH_ID_ATTRIBUTE]: { default: "" },
      raw: { default: "" },
      preservedKind: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: `div[${PRESERVED_BLOCK_DOM_ATTRIBUTE}]`,
        getAttrs: (dom: HTMLElement | string): Record<string, string> => {
          if (typeof dom === "string") return {};
          return {
            [PARAGRAPH_ID_ATTRIBUTE]:
              dom.getAttribute(PARAGRAPH_ID_DOM_ATTRIBUTE) ?? "",
            raw: dom.textContent ?? "",
            preservedKind:
              dom.getAttribute(PRESERVED_BLOCK_DOM_ATTRIBUTE) ?? "",
          };
        },
      },
    ];
  },
  renderHTML({ node }: { node: { attrs: Record<string, unknown> } }) {
    const id = node.attrs[PARAGRAPH_ID_ATTRIBUTE];
    const kind = node.attrs["preservedKind"];
    const raw = node.attrs["raw"];
    return [
      "div",
      {
        [PRESERVED_BLOCK_DOM_ATTRIBUTE]:
          typeof kind === "string" ? kind : "",
        [PARAGRAPH_ID_DOM_ATTRIBUTE]: typeof id === "string" ? id : "",
        contenteditable: "false",
      },
      typeof raw === "string" ? raw : "",
    ];
  },
});

/** Missing-placeholder marker (spec §5.7): a decoration-backed
    `data-untranslated` on exactly the paragraph the placeholder decorates.
    Manually set DOM attributes do not survive ProseMirror re-renders (a
    re-render replaces the paragraph element and reapplies only decoration
    attributes), so the marker lives in the decoration set beside the
    placeholder text: it appears and disappears with the same builds, with
    no document transaction. The adapter keeps the live value current
    through `setPlaceholder`; when translated (null) no marker decorates. */
export function createPlaceholderMarkerExtension(
  getMarker: () => string | null,
  isEditable: () => boolean,
): AnyExtension {
  const plugin = new Plugin({
    key: new PluginKey("richTextPlaceholderMarker"),
    props: {
      decorations(state) {
        const marker = getMarker();
        if (marker === null || !isEditable()) return null;
        // Mirror the placeholder's own rule (showOnlyCurrent): only the
        // top-level textblock at the selection anchor displays.
        const { anchor } = state.selection;
        const resolved = state.doc.resolve(anchor);
        const node =
          resolved.depth > 0 ? resolved.node(1) : resolved.nodeAfter;
        const nodeStart =
          resolved.depth > 0 ? resolved.before(1) : anchor;
        if (
          node === null ||
          node === undefined ||
          !node.type.isTextblock ||
          node.isLeaf ||
          !isNodeEmpty(node)
        ) {
          return null;
        }
        return DecorationSet.create(state.doc, [
          Decoration.node(nodeStart, nodeStart + node.nodeSize, {
            [RICH_TEXT_UNTRANSLATED_DATA_ATTRIBUTE]: marker,
          }),
        ]);
      },
    },
  });
  return Extension.create({
    name: "richTextPlaceholderMarker",
    addProseMirrorPlugins() {
      return [plugin];
    },
  });
}

/** The history extension of the P0 set (spec §4.5, CL-2 §6.3 seam 3): the
    single replacement point where the DS binding's `UndoManager` (with no
    ProseMirror history) takes the place of `UndoRedo` when a collaboration
    binding is present (CL-3, `editor-collaboration.ts`). Controlled mode
    keeps this `UndoRedo` unchanged. Exactly one history mechanism exists in
    either mode. */
export function createHistoryExtension(): AnyExtension {
  return UndoRedo;
}

/** The single history replacement point (spec §4.5, CL-3a): when bound, the
    extension composition drops the `UndoRedo` entry returned above. The Yjs
    `UndoManager` itself lands in CL-3b; until then bound undo/redo fail
    closed through the placeholder and never double-record. */
export function removeHistoryExtension(extensions: AnyExtension[]): AnyExtension[] {
  return extensions.filter((extension) => extension.name !== "undoRedo");
}

/** Instantiate the P0 extension set in `P0_EXTENSION_NAMES` composition
    order: document, paragraph (identity-carrying), text, bold, italic, code,
    hard break, undo/redo history, placeholder, Markdown bridge, and the
    DS-internal preserved block. */
export function createP0EditorExtensions(
  options: P0EditorExtensionOptions,
): AnyExtension[] {
  return [
    Document,
    ParagraphWithIdentity,
    Text,
    Bold,
    Italic,
    Code,
    HardBreak,
    createHistoryExtension(),
    Placeholder.configure({ placeholder: options.placeholder }),
    createPlaceholderMarkerExtension(
      options.placeholderMarker,
      options.isEditable,
    ),
    Markdown,
    PreservedBlock,
  ];
}
