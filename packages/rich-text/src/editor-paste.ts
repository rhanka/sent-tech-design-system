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
import {
  PARAGRAPH_ID_ATTRIBUTE,
  PRESERVED_BLOCK_DOM_ATTRIBUTE,
} from "./identity.js";

export interface PastePayloadInput {
  text?: string;
  html?: string;
}

export type PastePlan =
  | { outcome: "refuse"; rejectedKinds: string[] }
  | {
      outcome: "insert";
      paragraphs: JSONContent[];
      imageReported: boolean;
      /** Native slice openness from `data-pm-slice` (R10): an open slice
          stays inline at the drop/paste point instead of splitting blocks.
          Closed clipboard content (no marker) stays `0, 0`. */
      openStart: number;
      openEnd: number;
    };

const REFUSAL_TAGS: { selector: string; kind: string }[] = [
  { selector: "table", kind: "table" },
  { selector: "pre", kind: "codeBlock" },
  { selector: "h1,h2,h3,h4,h5,h6", kind: "heading" },
  { selector: "ul,ol,li,dl,dt,dd", kind: "list" },
  { selector: "blockquote", kind: "blockquote" },
  { selector: "hr", kind: "horizontalRule" },
];
// `figure` is classified separately in `planHtmlPaste`: a figure holding
// only images degrades to their alt texts, while a figure with remaining
// structural content (caption or elements) refuses whole as `image`.

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
    §6.3), drop inert elements with their content, degrade images to their
    alt text in their own context (§7 rule 4: inline content stays inline —
    never a nested `<p>` — while block-level images become paragraphs), and
    report whether a `figure` wrapper carries structural content beyond its
    images (that block still refuses whole, R8). Shared by the paste plan
    and the `transformPastedHTML` pipeline layer so both paths agree. */
export function sanitizePastedHtml(html: string): {
  html: string;
  imageSeen: boolean;
  figureStructural: boolean;
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
  let imageSeen = false;
  // Figures first: an image inside a `figure` degrades to its alt text, but
  // any remaining structural content (caption or elements) keeps the whole
  // paste refused — image degradation and structural blocks are distinct.
  let figureStructural = false;
  for (const figure of root.querySelectorAll("figure")) {
    const probe = figure.cloneNode(true) as HTMLElement;
    for (const probeImage of probe.querySelectorAll("img")) {
      probeImage.remove();
    }
    const restText = (probe.textContent ?? "").trim();
    if (restText !== "" || probe.querySelectorAll("*").length > 0) {
      figureStructural = true;
    }
    for (const image of figure.querySelectorAll("img")) {
      imageSeen = true;
      const alt = image.getAttribute("alt") ?? "";
      if (alt !== "") {
        image.replaceWith(document.createTextNode(alt));
      } else {
        image.remove();
      }
    }
    if (!figureStructural) {
      // The figure held only images: unwrap so the alt texts stay inline.
      figure.replaceWith(...figure.childNodes);
    }
  }
  // Images degrade to their alt text in their own context (§7 rule 4): an
  // image inside a paragraph becomes text inside that paragraph (a nested
  // `<p>` would restructure the HTML and drop its siblings); a block-level
  // image becomes a paragraph of its own.
  for (const image of root.querySelectorAll("img")) {
    imageSeen = true;
    const alt = image.getAttribute("alt") ?? "";
    if (alt === "") {
      image.remove();
      continue;
    }
    if (image.closest("p") !== null) {
      image.replaceWith(document.createTextNode(alt));
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = alt;
      image.replaceWith(paragraph);
    }
  }
  const holder = document.createElement("div");
  holder.appendChild(root);
  return { html: holder.innerHTML, imageSeen, figureStructural };
}

/** Read the native slice openness (`data-pm-slice="openStart openEnd …"`)
    carried by ProseMirror-produced clipboard HTML. Foreign HTML carries no
    marker and stays closed. */
function readSliceOpenness(root: HTMLElement): {
  openStart: number;
  openEnd: number;
} {
  const marker = root.querySelector("[data-pm-slice]");
  const raw = marker?.getAttribute("data-pm-slice") ?? "";
  const match = /^(\d+) (\d+)/.exec(raw);
  if (!match) return { openStart: 0, openEnd: 0 };
  return {
    openStart: Math.min(Number(match[1]), 1),
    openEnd: Math.min(Number(match[2]), 1),
  };
}

/** True when clipboard HTML carries ProseMirror's native slice marker
    (`data-pm-slice="openStart openEnd …"`): the payload entered from a
    ProseMirror view, so its whitespace parses with ProseMirror's own
    preservation, never HTML collapsing (N2). Shape mirrors ProseMirror's
    own `sliceData` detection in `parseFromClipboard`. */
function hasNativeSliceMarker(root: HTMLElement): boolean {
  const marker = root.querySelector("[data-pm-slice]");
  const raw = marker?.getAttribute("data-pm-slice") ?? "";
  return /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(raw) !== null;
}

/** Preserved-block kinds carried by clipboard HTML, read from the raw
    payload before sanitising strips the marker (N7). Labels mirror the
    drop path: the marker value, or `preservedBlock` when it is empty. */
function preservedKindsIn(html: string): string[] {
  const template = document.createElement("template");
  template.innerHTML = html;
  const kinds: string[] = [];
  const selector = `[${PRESERVED_BLOCK_DOM_ATTRIBUTE}]`;
  for (const element of template.content.querySelectorAll(selector)) {
    const kind = element.getAttribute(PRESERVED_BLOCK_DOM_ATTRIBUTE);
    const label = kind !== null && kind !== "" ? kind : "preservedBlock";
    if (!kinds.includes(label)) kinds.push(label);
  }
  return kinds;
}

/** Classify and parse an HTML clipboard payload through the P0 schema.
    Whitespace parses with ProseMirror's preservation for native slices
    (`data-pm-slice`, as `parseFromClipboard` does with
    `preserveWhitespace: !!(asText || sliceData)`) and for `text/plain`
    targets (literal paragraphs never normalise whitespace, N2); foreign
    HTML into Markdown keeps HTML collapsing. */
export function planHtmlPaste(
  schema: Schema,
  html: string,
  allocateId: () => string,
  options?: { preserveWhitespace?: boolean },
): PastePlan {
  // A copied preserved region never flattens into paragraphs (N7): the
  // marker is classified BEFORE `sanitizePastedHtml` strips it, and the
  // whole payload is refused — mirroring the drop path, which refuses a
  // slice carrying a preserved node before identity repair could re-label
  // it. Paste never creates a preserved block (§6.3).
  const preserved = preservedKindsIn(html);
  if (preserved.length > 0) {
    return { outcome: "refuse", rejectedKinds: preserved };
  }
  const sanitized = sanitizePastedHtml(html);
  const holder = document.createElement("div");
  holder.innerHTML = sanitized.html;
  const root = holder;
  const imageSeen = sanitized.imageSeen;

  // Rule 5 (§7): any non-paragraph block refuses the whole paste. Scan in
  // document order so `rejectedKinds` follows the clipboard order. A
  // structural `figure` (caption or elements beyond degraded images)
  // refuses as `image`: degradation and structural blocks are distinct.
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
  if (sanitized.figureStructural) reportKind(refused, "image");
  // A structural figure refuses through its `image` kind; plain image
  // degradation (alt text kept) never refuses on its own.
  const refusing = sanitized.figureStructural
    ? [...refused]
    : refused.filter((kind) => kind !== "image");
  if (refusing.length > 0) {
    return { outcome: "refuse", rejectedKinds: refused };
  }
  const { openStart, openEnd } = readSliceOpenness(root);
  // Whitespace is preserved when the target is plain OR the payload carries
  // a native slice marker (N2 residual): an explicit `false` for a Markdown
  // target must not hide the marker, so this is a disjunction — never `??`.
  const slice = DOMParser.fromSchema(schema).parseSlice(root, {
    preserveWhitespace:
      options?.preserveWhitespace === true || hasNativeSliceMarker(root),
  });
  // Keep every representable inline slice content (R3): bare inline HTML
  // such as `<strong>bold</strong>` parses to top-level inline nodes, not
  // paragraphs — dropping them loses valid text and reports nothing.
  // Consecutive top-level inline nodes form one paragraph of their own.
  const paragraphs: JSONContent[] = [];
  let pendingInline: JSONContent[] = [];
  const flushInline = (): void => {
    if (pendingInline.length > 0) {
      const inline = pendingInline;
      pendingInline = [];
      paragraphs.push(
        withFreshId({ type: "paragraph", content: inline }, allocateId),
      );
    }
  };
  slice.content.forEach((node) => {
    if (node.type.name === "paragraph") {
      flushInline();
      paragraphs.push(withFreshId(node.toJSON() as JSONContent, allocateId));
      return;
    }
    if (node.isText) {
      pendingInline.push(node.toJSON() as JSONContent);
      return;
    }
    if (node.isInline) {
      pendingInline.push(node.toJSON() as JSONContent);
      return;
    }
    // Non-paragraph blocks were refused above; anything else is dropped.
  });
  flushInline();
  return {
    outcome: "insert",
    paragraphs,
    imageReported: imageSeen,
    openStart: paragraphs.length === 0 ? 0 : openStart,
    openEnd: paragraphs.length === 0 ? 0 : openEnd,
  };
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
  if (text === "") {
    return {
      outcome: "insert",
      paragraphs: [],
      imageReported: false,
      openStart: 0,
      openEnd: 0,
    };
  }
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
  return {
    outcome: "insert",
    paragraphs,
    imageReported: imageSeen,
    openStart: 0,
    openEnd: 0,
  };
}

/** Classify a `text/plain` clipboard payload as literal text: no bridge, no
    marks, no Markdown rules. Lines split ProseMirror-style (one or more line
    breaks separate paragraphs, mirroring the default clipboard parser), so a
    multi-paragraph copy round-trips its block boundaries. */
export function planLiteralPaste(
  text: string,
  allocateId: () => string,
): PastePlan {
  if (text === "") {
    return {
      outcome: "insert",
      paragraphs: [],
      imageReported: false,
      openStart: 0,
      openEnd: 0,
    };
  }
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
  return {
    outcome: "insert",
    paragraphs,
    imageReported: false,
    openStart: 0,
    openEnd: 0,
  };
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

/** Build a ProseMirror slice from planned paragraph JSON for insertion,
    preserving the native slice openness (R10): an open slice stays inline
    at the insertion point, while effectively inserted blocks still carry
    their fresh identities. */
export function sliceForParagraphs(
  schema: Schema,
  paragraphs: readonly JSONContent[],
  openStart = 0,
  openEnd = 0,
): Slice {
  const nodes = paragraphs.map((paragraph) =>
    schema.nodeFromJSON(paragraph),
  );
  if (nodes.length === 0) return new Slice(Fragment.empty, 0, 0);
  return new Slice(
    Fragment.from(nodes),
    Math.min(Math.max(openStart, 0), 1),
    Math.min(Math.max(openEnd, 0), 1),
  );
}
