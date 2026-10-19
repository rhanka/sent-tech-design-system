// Paste handling for the "./editor" entry (spec §7).
//
// Clipboard payloads enter only through the P0 schema: `text/html` through
// ProseMirror's own clipboard parser (`DOMParser` constrained to the P0
// schema), `text/plain` carrying Markdown through `@tiptap/markdown` (a
// payload that parses to any non-paragraph block is refused whole). Pasted
// identity attributes are stripped before parsing and every inserted block
// receives a fresh allocator identity (§5.2 rule 1): pasted attributes are
// never trusted.
//
// Refusal and degradation are reported through `onUnsupportedPaste` with the
// `rejectedKinds` vocabulary of spec §5.5; a refused paste inserts nothing.

import { DOMParser, Fragment, Slice } from "@tiptap/pm/model";
import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";
import type { MarkdownManager } from "@tiptap/markdown";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";

export interface PastePayloadInput {
  text?: string;
  html?: string;
}

export type PastePlan =
  | { outcome: "refuse"; rejectedKinds: string[] }
  | { outcome: "insert"; paragraphs: JSONContent[]; imageReported: boolean };

const REFUSAL_TAGS: { selector: string; kind: string }[] = [
  { selector: "table", kind: "table" },
  { selector: "pre", kind: "codeBlock" },
  { selector: "h1,h2,h3,h4,h5,h6", kind: "heading" },
  { selector: "ul,ol,li,dl,dt,dd", kind: "list" },
  { selector: "blockquote", kind: "blockquote" },
  { selector: "hr", kind: "horizontalRule" },
  { selector: "figure", kind: "image" },
];

/** Elements dropped with their content, silently: never content, never a
    refusal on their own. */
const INERT_SELECTORS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "noscript",
  "template",
  "link",
  "meta",
].join(",");

function reportKind(into: string[], kind: string): void {
  if (!into.includes(kind)) into.push(kind);
}

function withFreshId(paragraph: JSONContent, allocateId: () => string): JSONContent {
  return {
    ...paragraph,
    attrs: {
      ...(paragraph.attrs ?? {}),
      [PARAGRAPH_ID_ATTRIBUTE]: allocateId(),
    },
  };
}

/** Sanitize pasted HTML to inert, identity-free markup: strip every pasted
    identity attribute (rule 1, §5.2 — never trusted), unwrap pasted
    preserved regions to their text (paste never creates a preserved block,
    §6.3), drop inert elements with their content, and degrade images to
    their alt text as plain paragraphs (§7 rule 4). Shared by the paste plan
    and the `transformPastedHTML` pipeline layer so both paths agree. */
export function sanitizePastedHtml(html: string): {
  html: string;
  imageSeen: boolean;
} {
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;

  // Rule 1 (§5.2): strip every pasted identity attribute before parsing.
  for (const element of root.querySelectorAll("[data-paragraph-id]")) {
    element.removeAttribute("data-paragraph-id");
  }
  // Paste never creates a preserved block (§6.3): pasted preserved regions
  // are unwrapped to their text before parsing.
  for (const element of root.querySelectorAll("[data-preserved-block]")) {
    element.removeAttribute("data-preserved-block");
  }
  // Inert elements vanish with their content.
  for (const element of root.querySelectorAll(INERT_SELECTORS)) {
    element.remove();
  }
  // Images degrade to their alt text as plain paragraphs (§7 rule 4).
  let imageSeen = false;
  for (const image of root.querySelectorAll("img")) {
    imageSeen = true;
    const alt = image.getAttribute("alt") ?? "";
    if (alt !== "") {
      const paragraph = document.createElement("p");
      paragraph.textContent = alt;
      image.replaceWith(paragraph);
    } else {
      image.remove();
    }
  }
  const holder = document.createElement("div");
  holder.appendChild(root);
  return { html: holder.innerHTML, imageSeen };
}

/** Classify and parse an HTML clipboard payload through the P0 schema. */
export function planHtmlPaste(
  schema: Schema,
  html: string,
  allocateId: () => string,
): PastePlan {
  const sanitized = sanitizePastedHtml(html);
  const holder = document.createElement("div");
  holder.innerHTML = sanitized.html;
  const root = holder;
  const imageSeen = sanitized.imageSeen;

  // Rule 5 (§7): any non-paragraph block refuses the whole paste. Scan in
  // document order so `rejectedKinds` follows the clipboard order.
  const refused: string[] = [];
  if (imageSeen) refused.push("image");
  const ordered = root.querySelectorAll(
    REFUSAL_TAGS.map((entry) => entry.selector).join(","),
  );
  for (const element of ordered) {
    const tag = element.tagName.toLowerCase();
    const entry = REFUSAL_TAGS.find((candidate) =>
      candidate.selector.split(",").includes(tag),
    );
    if (entry) reportKind(refused, entry.kind);
  }
  const refusing = refused.filter((kind) => kind !== "image");
  if (refusing.length > 0) {
    return { outcome: "refuse", rejectedKinds: refused };
  }
  const slice = DOMParser.fromSchema(schema).parseSlice(root);
  const paragraphs: JSONContent[] = [];
  slice.content.forEach((node) => {
    if (node.type.name === "paragraph") {
      paragraphs.push(withFreshId(node.toJSON() as JSONContent, allocateId));
    }
  });
  return { outcome: "insert", paragraphs, imageReported: imageSeen };
}

const MARKDOWN_REFUSAL_TYPES: Record<string, string> = {
  heading: "heading",
  codeBlock: "codeBlock",
  bulletList: "list",
  orderedList: "list",
  listItem: "list",
  blockquote: "blockquote",
  table: "table",
  tableRow: "table",
  tableCell: "table",
  tableHeader: "table",
  horizontalRule: "horizontalRule",
  image: "image",
};

/** Top-level marked token types (the bridge's own lexer) that refuse a
    plain-text paste whole. The P0 schema has no node for them, so the bridge
    cannot even parse them into paragraphs. */
const LEXER_REFUSAL_TYPES: Record<string, string> = {
  heading: "heading",
  code: "codeBlock",
  table: "table",
  list: "list",
  blockquote: "blockquote",
  hr: "horizontalRule",
  html: "rawHtml",
  image: "image",
};

interface LexerToken {
  type: string;
  raw?: string;
  tokens?: LexerToken[];
}

/** True when a lexed token tree carries an image (degraded to alt text). */
function lexerTreeHasImage(tokens: LexerToken[] | undefined): boolean {
  if (tokens === undefined) return false;
  return tokens.some(
    (token) =>
      token.type === "image" || lexerTreeHasImage(token.tokens),
  );
}

/** Inline image nodes degrade to their alt text; true when any was seen. */
function degradeInlineImages(content: JSONContent[] | undefined): {
  content: JSONContent[] | undefined;
  imageSeen: boolean;
} {
  if (content === undefined) return { content, imageSeen: false };
  let imageSeen = false;
  const next: JSONContent[] = [];
  for (const child of content) {
    if (child.type === "image") {
      imageSeen = true;
      const alt = (child.attrs as Record<string, unknown> | undefined)?.["alt"];
      if (typeof alt === "string" && alt !== "") {
        next.push({ type: "text", text: alt });
      }
      continue;
    }
    next.push(child);
  }
  return { content: next, imageSeen };
}

/** Classify and parse a plain-text clipboard payload through the Markdown
    bridge: a payload that parses to any non-paragraph block is refused
    whole (§7 rule 5, §6.3). */
export function planTextPaste(
  manager: MarkdownManager,
  text: string,
  allocateId: () => string,
): PastePlan {
  if (text === "") return { outcome: "insert", paragraphs: [], imageReported: false };
  // Refusal is classified from the bridge's own lexer: with only the P0
  // extensions registered, the bridge parses table/code/list payloads to an
  // empty document, so the parsed shape alone cannot refuse them.
  const refused: string[] = [];
  let imageSeen = false;
  try {
    const lexer = (
      manager.instance as unknown as {
        lexer: (source: string) => LexerToken[];
      }
    ).lexer;
    for (const token of lexer(text)) {
      if (token.type === "space" || token.type === "def") continue;
      const kind = LEXER_REFUSAL_TYPES[token.type];
      if (kind !== undefined) {
        reportKind(refused, kind);
        continue;
      }
      if (lexerTreeHasImage(token.tokens)) {
        imageSeen = true;
        reportKind(refused, "image");
      }
    }
  } catch {
    // Lexer unavailable: fall through to the parsed-shape classification.
  }
  if (refused.some((kind) => kind !== "image")) {
    return { outcome: "refuse", rejectedKinds: refused };
  }
  let parsed: (JSONContent & { content?: JSONContent[] }) | null = null;
  try {
    parsed = manager.parse(text) as JSONContent & { content?: JSONContent[] };
  } catch {
    return { outcome: "refuse", rejectedKinds: ["rawHtml"] };
  }
  const paragraphs: JSONContent[] = [];
  for (const block of parsed?.content ?? []) {
    if (block.type === "text") {
      // The bridge degrades a standalone image to its bare alt text.
      imageSeen = true;
      reportKind(refused, "image");
      paragraphs.push(
        withFreshId(
          { type: "paragraph", content: [{ type: "text", text: block.text ?? "" }] },
          allocateId,
        ),
      );
      continue;
    }
    if (block.type === "paragraph") {
      const degraded = degradeInlineImages(block.content);
      if (degraded.imageSeen) {
        imageSeen = true;
        reportKind(refused, "image");
      }
      paragraphs.push(
        withFreshId({ ...block, content: degraded.content }, allocateId),
      );
      continue;
    }
    if (block.type === "image") {
      imageSeen = true;
      reportKind(refused, "image");
      const alt = (block.attrs as Record<string, unknown> | undefined)?.["alt"];
      if (typeof alt === "string" && alt !== "") {
        paragraphs.push(
          withFreshId(
            { type: "paragraph", content: [{ type: "text", text: alt }] },
            allocateId,
          ),
        );
      }
      continue;
    }
    reportKind(refused, MARKDOWN_REFUSAL_TYPES[block.type ?? ""] ?? "rawHtml");
  }
  const refusing = refused.filter((kind) => kind !== "image");
  if (refusing.length > 0) {
    return { outcome: "refuse", rejectedKinds: refused };
  }
  return { outcome: "insert", paragraphs, imageReported: imageSeen };
}

/** Classify a `text/plain` clipboard payload as literal text: no bridge, no
    marks, no Markdown rules. Lines split ProseMirror-style (one or more line
    breaks separate paragraphs, mirroring the default clipboard parser), so a
    multi-paragraph copy round-trips its block boundaries. */
export function planLiteralPaste(
  text: string,
  allocateId: () => string,
): PastePlan {
  if (text === "") return { outcome: "insert", paragraphs: [], imageReported: false };
  const paragraphs: JSONContent[] = text
    .split(/(?:\r\n?|\n)+/)
    .map((line) =>
      withFreshId(
        line === ""
          ? { type: "paragraph" }
          : { type: "paragraph", content: [{ type: "text", text: line }] },
        allocateId,
      ),
    );
  return { outcome: "insert", paragraphs, imageReported: false };
}

/** Strip every mark from planned paragraph JSON (the `text/plain` HTML-paste
    path: pasted rich text degrades to literal characters). */
export function stripPlannedMarks(paragraphs: readonly JSONContent[]): JSONContent[] {
  const stripNode = (node: JSONContent): JSONContent => {
    const { marks: _dropped, ...rest } = node as JSONContent & {
      marks?: unknown;
    };
    const content = Array.isArray(rest.content)
      ? (rest.content as JSONContent[]).map(stripNode)
      : rest.content;
    return { ...rest, ...(content === undefined ? {} : { content }) };
  };
  return paragraphs.map(stripNode);
}

/** Build a ProseMirror slice from planned paragraph JSON for insertion. */
export function sliceForParagraphs(
  schema: Schema,
  paragraphs: readonly JSONContent[],
): Slice {
  const nodes = paragraphs.map((paragraph) =>
    schema.nodeFromJSON(paragraph),
  );
  return new Slice(Fragment.from(nodes), 0, 0);
}
