// Full-profile extension instantiation for the "./editor" entry
// (CL-2F §2.8 F01–F19, R-FULL-PROFILE-1).
//
// This is the separate full module graph (review 1 item 11): it carries the
// eight full extension packages (heading, list, blockquote, code block,
// horizontal rule, strike, underline, link) plus the full-only editing
// helpers. The P0 module path (`editor.ts` + `editor-extensions.ts`) never
// imports it, so an absent/P0 mount evaluates none of those packages.
//
// Loading is on demand: `createRichTextEditor` dynamically imports this
// module on the first `profile: "full"` mount, and the import
// self-registers the factory (review 2 blocking 1). The module is internal
// to the package — not a package export — so no P0 path references it.
// The generic
// Markdown manager extension is intentionally absent here (review 1 item 12):
// the full wire is the DS-owned pure bridge in `editor-full-markdown.ts`,
// and no generic Markdown HTML fallback renders in full.

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
import { Strike } from "@tiptap/extension-strike";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Code } from "@tiptap/extension-code";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Dropcursor, Gapcursor, TrailingNode } from "@tiptap/extensions";
import { mergeAttributes } from "@tiptap/core";
import { isAllowedHref } from "./collaboration.js";
import { Extension } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { Fragment } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import {
  PARAGRAPH_ID_ATTRIBUTE,
  PARAGRAPH_ID_DOM_ATTRIBUTE,
} from "./identity.js";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { registerFullEditorExtensions } from "./editor.js";
import type { P0EditorExtensionOptions } from "./editor-extensions.js";
import {
  ParagraphWithIdentity,
  PreservedBlock,
  createHistoryExtension,
  createPlaceholderMarkerExtension,
} from "./editor-extensions.js";

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
    rendering stays inert (activation is intercepted at the editor props).
    Every check decodes entities first, consistently with the bridge. */
const SafeLink = Link.configure({
  openOnClick: false,
  linkOnPaste: true,
  autolink: true,
  defaultProtocol: "http",
  HTMLAttributes: {},
  validate: (url: string): boolean => isAllowedHref(url),
  isAllowedUri: (url: string): boolean => isAllowedHref(url),
  shouldAutoLink: (url: string): boolean => isAllowedHref(url),
}).extend({
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    if (this.editor !== undefined && !this.editor.isEditable) {
      // Inert read-only/disabled rendering (spec §2.8): selectable text
      // with no navigable href, target or title. Copy keeps link data
      // from the live document state, never from this DOM.
      return ["a", {}, 0];
    }
    return ["a", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

/** Refuse transactions that would introduce a forbidden link target
    (R-FULL-URL-1 commands/edits): any link mark failing the validator after
    entity decoding refuses the whole transaction. Live documents never
    carry such marks (structured imports and pastes refuse first), so a
    refused transaction always introduces a new one. */
const forbiddenLinkGuardKey = new PluginKey("richTextForbiddenLinkGuard");

const ForbiddenLinkGuard = Extension.create({
  name: "richTextForbiddenLinkGuard",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: forbiddenLinkGuardKey,
        filterTransaction: (transaction: Transaction): boolean => {
          if (!transaction.docChanged) return true;
          let forbidden = false;
          transaction.doc.descendants((node: ProseMirrorNode) => {
            for (const mark of node.marks ?? []) {
              if (mark.type.name !== "link") continue;
              const href = mark.attrs["href"];
              // The single validator decodes entities itself: the
              // entity-decoded and raw forms both refuse here.
              if (
                typeof href === "string" &&
                href !== "" &&
                !isAllowedHref(href)
              ) {
                forbidden = true;
                return false;
              }
            }
            return !forbidden;
          });
          return !forbidden;
        },
      }),
    ];
  },
});

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
    order (CL-2F §2.8 F01–F19): document, paragraph (identity-carrying), text,
    heading, lists, list item, blockquote, code block, horizontal rule, bold,
    italic, combinable code, strike, underline, the validated link, hard break,
    undo/redo history, placeholder (+ marker, supplied by the caller through
    the shared options), the default editing helpers (drop/gap cursor, list
    keymap, trailing node) contributing no Markdown token, and the
    DS-internal preserved block. `StarterKit` is never enabled. */
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
    Dropcursor,
    Gapcursor,
    ListKeymap,
    // After ListKeymap: for the shared Backspace binding the later
    // extension wins, so the DS rejoin preempts the library no-op.
    FullListJoinBackwards,
    TrailingNode,
    ForbiddenLinkGuard,
    PreservedBlock,
  ];
}

/** Explicit full-graph loading (review 1 item 11): register the full
    extension factory so `createRichTextEditor` with `profile: "full"` can
    instantiate it. Idempotent. Importing this module alone (for example from
    a P0-only consumer) registers nothing until this runs. */
export function ensureFullEditorExtensionsRegistered(): void {
  registerFullEditorExtensions(createFullEditorExtensions);
}
