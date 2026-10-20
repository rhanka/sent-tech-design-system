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
import { Node } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import {
  PARAGRAPH_ID_ATTRIBUTE,
  PARAGRAPH_ID_DOM_ATTRIBUTE,
  PRESERVED_BLOCK_DOM_ATTRIBUTE,
} from "./identity.js";

export interface P0EditorExtensionOptions {
  placeholder: string;
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
    UndoRedo,
    Placeholder.configure({ placeholder: options.placeholder }),
    Markdown,
    PreservedBlock,
  ];
}
