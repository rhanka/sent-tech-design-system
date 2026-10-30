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
import { Heading } from "@tiptap/extension-heading";
import {
  BulletList,
  ListItem,
  ListKeymap,
  OrderedList,
} from "@tiptap/extension-list";
import { Blockquote } from "@tiptap/extension-blockquote";
import { CodeBlock } from "@tiptap/extension-code-block";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Code } from "@tiptap/extension-code";
import { Strike } from "@tiptap/extension-strike";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Dropcursor, Gapcursor, TrailingNode, UndoRedo } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { isAllowedHref } from "./collaboration.js";
import { Extension, Node, isNodeEmpty } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
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
}

/** Paragraph with the opaque identity attribute (spec §5.2): the attribute
    is `paragraphId`, rendered to the DOM as `data-paragraph-id`. */
const ParagraphWithIdentity = Paragraph.extend({
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
    attributes and renders as inert text inside a non-editable region. */
const PreservedBlock = Node.create({
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

/** Heading with the opaque identity attribute (CL-2F R-FULL-META-1). */
const HeadingWithIdentity = Heading.extend({
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

/** Code block with the opaque identity attribute (CL-2F R-FULL-CODE-1). */
const CodeBlockWithIdentity = CodeBlock.extend({
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

/** Horizontal rule atom with the opaque identity attribute (R-FULL-HR-1). */
const HorizontalRuleWithIdentity = HorizontalRule.extend({
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

/** List run attributes (CL-2F R-FULL-META-1/2): the stable run identity and
    the tight/loose grouping live on the wrapper node so a loose run survives
    capture/remount. Neither is rendered to the DOM: pasted wrappers always
    open fresh runs with fresh identities. */
function listRunAttributes(): Record<string, unknown> {
  return {
    listRunId: { default: "" },
    listTight: { default: true },
  };
}

/** Bullet list carrying the run attributes. */
const BulletListWithRun = BulletList.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      ...listRunAttributes(),
    };
  },
});

/** Ordered list carrying the run attributes beside start/type. */
const OrderedListWithRun = OrderedList.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      ...listRunAttributes(),
    };
  },
});

/** Inline code without the exclusivity default (R-FULL-MARK-1): combining
    marks are preserved, never silently discarded. */
const CodeCombinable = Code.extend({
  excludes: "",
});

/** Link with the single href validator (R-FULL-URL-1) on every path and no
    click navigation: editable links never navigate on click, and read-only
    rendering stays inert (activation is intercepted at the editor props). */
const SafeLink = Link.configure({
  openOnClick: false,
  linkOnPaste: true,
  autolink: true,
  defaultProtocol: "http",
  HTMLAttributes: {},
  validate: (url: string): boolean => isAllowedHref(url),
  isAllowedUri: (url: string): boolean => isAllowedHref(url),
  shouldAutoLink: (url: string): boolean => isAllowedHref(url),
});

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

/** Join the current list item backwards into its previous sibling (CL-2F
    FK2): Backspace at the start of a non-first item's first paragraph
    rejoins the upper paragraph instead of the library no-op. Same-type
    textblocks merge; other children move into the previous item. The
    consumed item identity retires with its node; the previous item keeps
    its own identity and run. First items keep the library lift. */
const FullListJoinBackwards = Extension.create({
  name: "richTextFullListJoin",
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { $from, empty } = state.selection;
        if (empty !== true || $from.parentOffset !== 0) return false;
        if ($from.parent.type.name !== "paragraph") return false;
        // Nearest listItem ancestor whose first child holds the cursor
        // (`index(depth)` counts the item's children before the position).
        let itemDepth = -1;
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          if ($from.node(depth).type.name === "listItem") {
            if ($from.index(depth) !== 0) return false;
            itemDepth = depth;
            break;
          }
        }
        if (itemDepth === -1) return false;
        const list = $from.node(itemDepth - 1);
        if (list.type.name !== "bulletList" && list.type.name !== "orderedList") {
          return false;
        }
        // The item's own index within its list (`index(itemDepth - 1)`
        // counts the list's children before the position).
        const itemIndex = $from.index(itemDepth - 1);
        if (itemIndex === 0) return false;
        const itemPos = $from.before(itemDepth);
        const item = $from.node(itemDepth);
        const prevItem = list.child(itemIndex - 1);
        const prevLast = prevItem.lastChild;
        if (prevLast === null || prevLast === undefined) return false;
        const curFirst = item.firstChild;
        if (curFirst === null || curFirst === undefined) return false;
        const mergeParagraphs =
          prevLast.type.name === "paragraph" && curFirst.type.name === "paragraph";
        let tr = state.tr;
        // End of the previous last block's content (before its two closes).
        const joinPoint = itemPos - 2;
        if (mergeParagraphs) {
          tr = tr.insert(joinPoint, curFirst.content);
        }
        // Move the remaining (or all) children into the previous item.
        const moved = item.content.content.filter(
          (_child, index) => !(mergeParagraphs && index === 0),
        );
        if (moved.length > 0) {
          const insertAt = tr.mapping.map(itemPos) - 1;
          tr = tr.insert(insertAt, Fragment.from(moved));
        }
        const mappedStart = tr.mapping.map(itemPos);
        const mappedEnd = tr.mapping.map(itemPos + item.nodeSize);
        tr = tr.delete(mappedStart, mappedEnd);
        const mappedJoin = tr.mapping.map(joinPoint, -1);
        tr = tr.setSelection(TextSelection.create(tr.doc, mappedJoin));
        editor.view.dispatch(tr);
        return true;
      },
    };
  },
});

/** Instantiate the full extension set in `FULL_EXTENSION_NAMES` composition
    order (CL-2F §2.8 F01–F19): the P0 core plus headings, lists, blockquote,
    code block, horizontal rule, strike, underline and the validated link,
    with the default editing helpers (drop/gap cursor, list keymap, trailing
    node) contributing no Markdown token. `StarterKit` is never enabled. */
export function createFullEditorExtensions(
  options: P0EditorExtensionOptions,
): AnyExtension[] {
  return [
    Document,
    ParagraphWithIdentity,
    Text,
    HeadingWithIdentity,
    BulletListWithRun,
    OrderedListWithRun,
    ListItem,
    Blockquote,
    CodeBlockWithIdentity,
    HorizontalRuleWithIdentity,
    Bold,
    Italic,
    CodeCombinable,
    Strike,
    Underline,
    SafeLink,
    HardBreak,
    createHistoryExtension(),
    Placeholder.configure({ placeholder: options.placeholder }),
    createPlaceholderMarkerExtension(
      options.placeholderMarker,
      options.isEditable,
    ),
    Markdown,
    Dropcursor,
    Gapcursor,
    ListKeymap,
    // After ListKeymap: for the shared Backspace binding the later
    // extension wins, so the DS rejoin preempts the library no-op.
    FullListJoinBackwards,
    TrailingNode,
    PreservedBlock,
  ];
}
