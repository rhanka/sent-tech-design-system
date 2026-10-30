// Full-profile Markdown bridge (CL-2F §2.9, R-FULL-CODE-1, R-FULL-MARK-1).
//
// Pure string <-> RichTextDocument conversion for `ds.markdown.full@1`.
// No DOM, no editor runtime, no network: plain TypeScript over the model.
// Inline link targets are validated with the CL-1M validator `isAllowedHref`
// from `./collaboration.js` (R-FULL-URL-1); an unsafe href refuses the whole
// parse, never a single link.
//
// Normalizations applied on serialize are listed in
// `FULL_NORMALIZATION_MANIFEST` (docs accepted by the host): F10-M closing
// fence, F16-M terminal hard-break elision, plus the §2.9 emission choices
// (underline `<u>`, `---` rules, `- ` markers, numeric ordered markers, ATX
// headings, backtick fences, `**`/`*`/`~~` delimiters).

import type {
  FullBlockMetadata,
  RichTextInlineMarks,
} from "./collaboration.js";
import { decodeHrefToken, isAllowedHref } from "./collaboration.js";
import type {
  FullInlineSegment,
  RichTextBlock,
  RichTextDocument,
} from "./model.js";

/** One accepted normalization entry (W1 receipt + host manifest). */
export interface FullNormalizationRule {
  id: string;
  description: string;
}

/** Host-accepted normalization manifest for the full wire (§2.9). */
export const FULL_NORMALIZATION_MANIFEST: readonly FullNormalizationRule[] = [
  { id: "F10-M", description: "Closing fence immediately after existing trailing LF; empty code has no blank body line." },
  { id: "F16-M", description: "Terminal hard-break runs of prose text blocks emit no bytes; capture retains them." },
  { id: "UNDERLINE-U", description: "Underline emits <u>…</u>; only the exact attribute-free token pair parses." },
  { id: "HR-DASH", description: "Horizontal rules emit ---; *** and ___ parse to the same atom." },
  { id: "LIST-MARKER", description: "Bullets emit '- '; '*'/'+' parse to bullets. Ordered items emit 'N. '; 'N)' parses." },
  { id: "ORDERED-TYPE", description: "Non-default ordered types stay in capture; the wire uses numeric markers." },
  { id: "SETEXT-ATX", description: "Setext headings parse and emit as ATX." },
  { id: "EMPHASIS-DELIM", description: "Bold emits **, italic emits *; __/…_ variants parse to the same marks." },
  { id: "INLINE-CODE-FENCE", description: "Inline code uses a backtick run longer than any internal run, with padding spaces." },
  { id: "AUTOLINK", description: "Bare-URL links emit <href> when label equals href; titles stay optional." },
  { id: "LINE-ENDING", description: "CRLF/CR normalize to LF before parsing." },
  { id: "SOFTBREAK", description: "Single newlines inside a paragraph join with a space." },
  { id: "TRAILING-NL", description: "Trailing newlines of the source elide on the wire; blocks carry the content." },
  { id: "BLANK-ONLY", description: "Whitespace-only inputs parse to identified empty blocks and re-emit the canonical blank wire." },
  { id: "LIST-INDENT", description: "Nested list indentation canonicalizes to two spaces per level." },
  { id: "HARD-BREAK-FORM", description: "Nonterminal breaks emit backslash + LF; two-space breaks parse to the same run." },
  { id: "TRAILING-SPACE", description: "Trailing spaces on a line are trimmed unless they form a parsed hard break." },
];

/** Canonical plain metadata for a text block with no wrappers. */
export function canonicalPlainMetadata(): FullBlockMetadata {
  return {
    blockKind: "paragraph",
    listKind: "none",
    listDepth: 0,
    blockquoteDepth: 0,
    containerOrder: [],
  };
}

/** Canonical defaults for a horizontal-rule atom with no wrappers. */
export function canonicalHrDefaults(): FullBlockMetadata {
  return {
    listKind: "none",
    listDepth: 0,
    blockquoteDepth: 0,
    containerOrder: [],
  };
}

/** True iff the metadata is the canonical plain text record. */
export function isPlainMetadata(metadata: FullBlockMetadata): boolean {
  return (
    (metadata.blockKind ?? "paragraph") === "paragraph" &&
    metadata.listKind === "none" &&
    metadata.listDepth === 0 &&
    metadata.blockquoteDepth === 0 &&
    metadata.containerOrder.length === 0
  );
}

function emptyMarks(): RichTextInlineMarks {
  return {};
}

function marksEqual(
  left: RichTextInlineMarks,
  right: RichTextInlineMarks,
): boolean {
  const lKeys = Object.keys(left).sort();
  const rKeys = Object.keys(right).sort();
  if (lKeys.length !== rKeys.length) return false;
  return lKeys.every(
    (key, index) =>
      key === rKeys[index] &&
      (left as Record<string, unknown>)[key] ===
        (right as Record<string, unknown>)[key],
  );
}

/** Escape Markdown inline special characters in plain text.
    Only characters that would re-parse structurally are escaped: the
    backslash always, backtick/asterisk/underscore/tilde when flanking makes
    them structural (handled by the caller passing the line remainder for
    `[` and `<`). */
export function escapeInlineText(text: string): string {
  return text.replace(/([\\`*_~])/g, "\\$1");
}

/** True when `[` at this position would open a link on re-parse. */
function bracketOpensLink(rest: string): boolean {
  return /^\[[^\]]*\]\(\s*\S/.test(rest);
}

/** True when `<` at this position would open underline/autolink on re-parse. */
function angleOpensMarkup(rest: string): boolean {
  return /^<\/?u>|^<((?:https?|mailto):[^<>\s]+)>/i.test(rest);
}

/** Emit literal text, escaping only characters structural at this position. */
function emitLiteralText(text: string, lineRest: string): string {
  let output = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i] as string;
    const rest = text.slice(i) + lineRest;
    void rest;
    if (char === "[") {
      output += bracketOpensLink(text.slice(i)) ? "\\[" : "[";
    } else if (char === "<") {
      output += angleOpensMarkup(text.slice(i)) ? "\\<" : "<";
    } else {
      output += escapeInlineText(char);
    }
  }
  return output;
}

interface InlineParseResult {
  segments: FullInlineSegment[];
  /** True when the whole input was refused (unsafe href). */
  refused: boolean;
}

/** Parse inline Markdown of one logical line into segments. */
function parseInlineLine(line: string): InlineParseResult {
  const segments: FullInlineSegment[] = [];
  let currentText = "";
  let currentMarks: RichTextInlineMarks = emptyMarks();
  const flush = (): void => {
    if (currentText !== "") {
      segments.push({ type: "text", text: currentText, marks: { ...currentMarks } });
      currentText = "";
    }
  };
  const pushBreak = (): void => {
    flush();
    segments.push({ type: "hardBreak" });
  };

  let index = 0;
  const linkStack: { label: string; marks: RichTextInlineMarks }[] = [];
  let bold = false;
  let italic = false;
  let strike = false;
  let underline = false;
  let inlineCode = false;
  let codeFenceLength = 0;
  const recompute = (): void => {
    currentMarks = emptyMarks();
    if (bold) currentMarks.bold = true;
    if (italic) currentMarks.italic = true;
    if (inlineCode) currentMarks.code = true;
    if (strike) currentMarks.strike = true;
    if (underline) currentMarks.underline = true;
    const top = linkStack[linkStack.length - 1];
    if (top !== undefined) {
      currentMarks.link = top.marks.link;
      if (top.marks.linkTitle !== undefined) currentMarks.linkTitle = top.marks.linkTitle;
    }
  };

  while (index < line.length) {
    const rest = line.slice(index);
    // Escapes.
    if (rest.startsWith("\\") && index + 1 < line.length) {
      const next = line[index + 1] as string;
      if ("\\`*_{}[]()#+-.!<>~".includes(next)) {
        currentText += next;
        index += 2;
        continue;
      }
      currentText += "\\";
      index += 1;
      continue;
    }
    // Inline code span.
    if (rest.startsWith("`")) {
      let run = 0;
      while (line[index + run] === "`") run += 1;
      if (!inlineCode) {
        // Opening run: find the first exact-length closing run. A longer
        // run is content, never a closer ("``a```" stays literal).
        let closing = -1;
        let scan = index + run;
        while (scan < line.length) {
          if (line[scan] !== "`") {
            scan += 1;
            continue;
          }
          let closeRun = 0;
          while (line[scan + closeRun] === "`") closeRun += 1;
          if (closeRun === run) {
            closing = scan;
            break;
          }
          scan += closeRun;
        }
        if (closing === -1) {
          currentText += "`".repeat(run);
          index += run;
          continue;
        }
        flush();
        inlineCode = true;
        codeFenceLength = run;
        recompute();
        index += run;
        continue;
      }
      if (run === codeFenceLength) {
        flush();
        inlineCode = false;
        recompute();
        index += run;
        continue;
      }
      // A shorter or longer run inside a span is literal content.
      currentText += "`".repeat(run);
      index += run;
      continue;
    }
    if (!inlineCode) {
      // Underline open: only the exact attribute-free `<u>` token opens.
      // Anything else starting with `<u` (attributes, case variants) stays
      // literal text and never renders HTML.
      if (rest.startsWith("<u>")) {
        flush();
        underline = true;
        recompute();
        index += 3;
        continue;
      }
      // Underline close: only a matching open pair consumes `</u>`. An
      // unmatched closer is literal text, never silently dropped.
      if (rest.startsWith("</u>") && underline) {
        flush();
        underline = false;
        recompute();
        index += 4;
        continue;
      }
      const prevChar = index > 0 ? (line[index - 1] as string) : "";
      const prevBlank = prevChar === "" || prevChar === " " || prevChar === "\t";
      // Strike (flanking: at least one side must join a word).
      if (rest.startsWith("~~")) {
        const after = line.slice(index + 2, index + 3);
        const afterBlank = after === "" || after === " " || after === "\t";
        if (!prevBlank || !afterBlank) {
          flush();
          strike = !strike;
          recompute();
          index += 2;
          continue;
        }
      }
      // Bold (** or __): underscore form never opens/closes inside a word.
      if (rest.startsWith("**") || rest.startsWith("__")) {
        const peer = rest.slice(0, 2);
        const after = line.slice(index + 2, index + 3);
        const afterBlank = after === "" || after === " " || after === "\t";
        const intraWord = peer === "__" && !prevBlank && !afterBlank;
        if (!intraWord && (!prevBlank || !afterBlank)) {
          flush();
          bold = !bold;
          recompute();
          index += 2;
          continue;
        }
      }
      // Italic * (flanking: at least one side must join a word).
      if (rest.startsWith("*")) {
        const after = line.slice(index + 1, index + 2);
        const afterBlank = after === "" || after === " " || after === "\t";
        if (!prevBlank || !afterBlank) {
          flush();
          italic = !italic;
          recompute();
          index += 1;
          continue;
        }
      }
      // Italic _: CommonMark left/right flanking. An underscore run opens
      // when left-flanking and not (right-flanking without a preceding
      // punctuation), and closes when right-flanking and not (left-flanking
      // without a following punctuation) — so `_italic_ tail` ends the
      // emphasis after a word char while `a_b` stays literal.
      if (rest.startsWith("_")) {
        const after = line.slice(index + 1, index + 2);
        const afterBlank = after === "" || after === " " || after === "\t";
        const isPrevPunct = !prevBlank && /[\p{P}\p{S}]/u.test(prevChar);
        const isAfterPunct = !afterBlank && /[\p{P}\p{S}]/u.test(after);
        const leftFlanking = !afterBlank && (!isAfterPunct || prevBlank || isPrevPunct);
        const rightFlanking = !prevBlank && (!isPrevPunct || afterBlank || isAfterPunct);
        const canOpen = leftFlanking && (!rightFlanking || isPrevPunct);
        const canClose = rightFlanking && (!leftFlanking || isAfterPunct);
        if ((!italic && canOpen) || (italic && canClose)) {
          flush();
          italic = !italic;
          recompute();
          index += 1;
          continue;
        }
      }
      // Autolink <href>: entities decode before validation, and the
      // decoded value is what the link stores.
      const autolink = /^<((?:https?|mailto):[^<>\s]+)>/i.exec(rest);
      if (autolink !== undefined && autolink !== null) {
        const href = decodeHrefToken(autolink[1] as string);
        if (!isAllowedHref(href)) return { segments: [], refused: true };
        flush();
        segments.push({ type: "text", text: href, marks: { ...currentMarks, link: href } });
        index += autolink[0].length;
        continue;
      }
      // Inline link [label](href "title"): titles support backslash-escaped
      // quotes so a title carrying `"` round-trips losslessly.
      if (rest.startsWith("[")) {
        const match = /^\[([^\]]*)\]\(\s*(\S+?)(?:\s+(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|\(((?:[^)\\]|\\.)*)\)))?\s*\)/.exec(rest);
        if (match !== null) {
          const label = match[1] as string;
          // Entities decode before validation (R-FULL-URL-1): an encoded
          // `jav&#x61;script:` refuses whole instead of passing as relative.
          const href = decodeHrefToken(match[2] as string);
          const rawTitle = (match[3] ?? match[4] ?? match[5] ?? undefined) as string | undefined;
          const title = rawTitle === undefined ? undefined : unescapeLinkTitle(rawTitle);
          if (!isAllowedHref(href)) return { segments: [], refused: true };
          flush();
          const labelParsed = parseInlineLine(label);
          if (labelParsed.refused) return { segments: [], refused: true };
          const linkMarks: RichTextInlineMarks = { ...currentMarks, link: href };
          if (title !== undefined) linkMarks.linkTitle = title;
          // Label runs inherit surrounding boolean marks plus the link.
          for (const segment of labelParsed.segments) {
            if (segment.type === "hardBreak") {
              segments.push(segment);
            } else {
              segments.push({
                type: "text",
                text: segment.text,
                marks: { ...segment.marks, ...linkMarks },
              });
            }
          }
          void linkStack;
          index += match[0].length;
          continue;
        }
      }
      // Bare-URL autolink (editor autolink behavior, R-FULL-URL-1):
      // entities decode before validation; the cursor advances over the
      // raw token while the link stores the decoded value.
      const bare = /^(https?:\/\/[^\s<]+|mailto:[^\s<]+)/i.exec(rest);
      if (bare !== null) {
        const raw = bare[1] as string;
        const href = decodeHrefToken(raw);
        if (isAllowedHref(href)) {
          flush();
          segments.push({ type: "text", text: href, marks: { ...currentMarks, link: href } });
          index += raw.length;
          continue;
        }
      }
    }
    currentText += line[index];
    index += 1;
  }
  flush();
  return { segments, refused: false };
}

/** Parse one paragraph's logical lines (soft-joined) into segments. */
function parseParagraphLines(lines: readonly string[]): InlineParseResult {
  const segments: FullInlineSegment[] = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex] as string;
    // A trailing backslash or two trailing spaces marks a prose hard break.
    let body = line;
    let hard = false;
    if (body.endsWith("\\")) {
      body = body.slice(0, -1);
      hard = true;
    } else if (/ {2,}$/.test(body)) {
      body = body.replace(/ {2,}$/, "");
      hard = true;
    } else {
      body = body.replace(/ +$/, "");
    }
    const parsed = parseInlineLine(body);
    if (parsed.refused) return { segments: [], refused: true };
    for (const segment of parsed.segments) segments.push(segment);
    if (hard) {
      segments.push({ type: "hardBreak" });
    } else if (lineIndex < lines.length - 1) {
      // Soft break joins with a space (SOFTBREAK).
      const last = segments[segments.length - 1];
      if (last !== undefined && last.type === "text") {
        last.text += " ";
      } else {
        segments.push({ type: "text", text: " ", marks: {} });
      }
    }
  }
  // Merge adjacent text runs carrying identical marks.
  const merged: FullInlineSegment[] = [];
  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (
      segment.type === "text" &&
      last !== undefined &&
      last.type === "text" &&
      marksEqual(last.marks, segment.marks)
    ) {
      last.text += segment.text;
    } else {
      merged.push(segment);
    }
  }
  return { segments: merged, refused: false };
}

export interface FullParseResult {
  document: RichTextDocument | null;
  /** Non-empty when the payload is refused whole (unsafe href). */
  refusedKinds: string[];
  /** Untouched source slice per block identity (R-FULL conversion seeds).
      `serializeFullDocument` re-emits these bytes for blocks the caller did
      not touch, so neighbor blocks survive an edit byte-identical. */
  seeds: Map<string, string>;
}

interface BlockContext {
  blockquoteDepth: number;
  listKind: "none" | "bullet" | "ordered";
  listDepth: number;
  listRunId: string | null;
  listItemId: string | null;
  orderedStart: number | null;
  orderedType: "1" | "a" | "A" | "i" | "I" | null;
  listTight: boolean;
  containerOrder: readonly ("quote" | "list")[];
}

function contextMetadata(
  context: BlockContext,
  blockKind: "paragraph" | "heading" | "codeBlock",
  extra?: { headingLevel?: 1 | 2 | 3 | 4 | 5 | 6; codeLanguage?: string | null },
): FullBlockMetadata {
  const base: FullBlockMetadata = {
    blockKind,
    listKind: context.listKind,
    listDepth: context.listDepth,
    blockquoteDepth: context.blockquoteDepth,
    containerOrder: [...context.containerOrder],
  } as FullBlockMetadata;
  if (context.listKind !== "none") {
    base.listItemId = context.listItemId ?? undefined;
    base.listRunId = context.listRunId ?? undefined;
  }
  if (blockKind === "heading") {
    (base as { headingLevel: 1 | 2 | 3 | 4 | 5 | 6 }).headingLevel =
      extra?.headingLevel ?? 1;
  }
  if (blockKind === "codeBlock") {
    (base as { codeLanguage: string | null }).codeLanguage =
      extra?.codeLanguage ?? null;
  }
  return base;
}

function isOrderedTypeToken(token: string): token is "1" | "a" | "A" | "i" | "I" {
  return token === "1" || token === "a" || token === "A" || token === "i" || token === "I";
}

/** Split source into lines with CRLF/CR normalized to LF (LINE-ENDING). */
function splitLines(markdown: string): string[] {
  return markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

interface PendingBlock {
  context: BlockContext;
  blockKind: "paragraph" | "heading" | "codeBlock";
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  codeLanguage?: string | null;
  codeLines?: string[];
  lines: string[];
  paragraphId: string;
  runSource: boolean;
  /** Exact source slice for the conversion seed. */
  source: string;
}

function makeBlockId(allocateId: () => string): string {
  return allocateId();
}

/** Parse a full Markdown string into a `ds.markdown.full@1` document.
    The empty wire parses to one empty paragraph (the editable empty
    document), so `""` round-trips instead of collapsing to zero blocks. */
export function parseFullMarkdown(
  markdown: string,
  allocateId: () => string,
): FullParseResult {
  const blocks: RichTextBlock[] = [];
  const seeds = new Map<string, string>();
  if (markdown === "") {
    const paragraphId = makeBlockId(allocateId);
    blocks.push({
      paragraphId,
      kind: "paragraph",
      metadata: canonicalPlainMetadata(),
      segments: [],
    });
    seeds.set(paragraphId, "");
    return { document: { format: "ds.markdown.full@1", blocks }, refusedKinds: [], seeds };
  }
  const lines = splitLines(markdown);
  let index = 0;

  const pushPending = (
    pending: PendingBlock,
    runOpeners: Map<string, PendingBlock>,
  ): FullParseResult | null => {
    if (pending.blockKind === "codeBlock") {
      const text = (pending.codeLines ?? []).join("\n");
      const segments: FullInlineSegment[] = [];
      if (text !== "") {
        const codeLines = text.split("\n");
        codeLines.forEach((codeLine, codeIndex) => {
          if (codeIndex > 0) segments.push({ type: "hardBreak" });
          if (codeLine !== "") {
            segments.push({ type: "text", text: codeLine, marks: {} });
          }
        });
      }
      // A trailing newline in the fenced body already produced its final
      // empty line split above (which yields the closing hard break);
      // pushing another one would duplicate the terminal break.
      blocks.push({
        paragraphId: pending.paragraphId,
        kind: "paragraph",
        metadata: contextMetadata(pending.context, "codeBlock", {
          codeLanguage: pending.codeLanguage ?? null,
        }),
        segments,
      });
      seeds.set(pending.paragraphId, pending.source);
      return null;
    }
    const image = pending.lines.some((entry) =>
      /!\[[^\]]*\]\([^)]*\)/.test(entry),
    );
    if (image) {
      blocks.push({
        paragraphId: pending.paragraphId,
        kind: "preserved",
        raw: pending.source,
        preservedKind: "image",
      });
      seeds.set(pending.paragraphId, pending.source);
      return null;
    }
    const parsed = parseParagraphLines(pending.lines);
    if (parsed.refused)
      return { document: null, refusedKinds: ["link"], seeds };
    const metadata = contextMetadata(pending.context, pending.blockKind, {
      headingLevel: pending.headingLevel,
      codeLanguage: null,
    });
    // Run-source opener records carry start/type/tight; members omit them.
    if (pending.context.listKind === "ordered" && pending.runSource) {
      metadata.orderedStart = pending.context.orderedStart ?? 1;
      const orderedType = pending.context.orderedType ?? "1";
      if (isOrderedTypeToken(orderedType)) metadata.orderedType = orderedType;
      metadata.listTight = pending.context.listTight;
    } else if (pending.context.listKind === "bullet" && pending.runSource) {
      metadata.listTight = pending.context.listTight;
    }
    if (pending.runSource) {
      runOpeners.set(pending.context.listRunId ?? pending.paragraphId, pending);
    }
    void runOpeners;
    blocks.push({
      paragraphId: pending.paragraphId,
      kind: "paragraph",
      metadata,
      segments: parsed.segments,
    });
    seeds.set(pending.paragraphId, pending.source);
    return null;
  };

  const runOpeners = new Map<string, PendingBlock>();
  // Stack of open list runs: each entry tracks its run id and tightness.
  // Placeholders fill skipped depths and never own an item.
  const listStack: {
    kind: "bullet" | "ordered";
    runId: string;
    tight: boolean;
    indent: number;
    /** The column where this level's item content starts (indent plus
        marker width): a deeper-indented marker nests only at or past it. */
    contentIndent: number;
    placeholder: boolean;
  }[] = [];

  const currentListContext = (
    blockquoteDepth: number,
  ): Omit<BlockContext, "listItemId" | "listRunId"> & {
    listItemId: string | null;
    listRunId: string | null;
  } => {
    const top = listStack[listStack.length - 1];
    if (top === undefined) {
      return {
        blockquoteDepth,
        listKind: "none",
        listDepth: 0,
        listRunId: null,
        listItemId: null,
        orderedStart: null,
        orderedType: null,
        listTight: true,
        containerOrder:
          blockquoteDepth > 0 ? (["quote"] as const) : ([] as unknown as readonly ("quote" | "list")[]),
      };
    }
    const order: ("quote" | "list")[] = [];
    if (blockquoteDepth > 0) order.push("quote");
    order.push("list");
    return {
      blockquoteDepth,
      listKind: top.kind,
      listDepth: listStack.length - 1,
      listRunId: top.runId,
      listItemId: null,
      orderedStart: null,
      orderedType: null,
      listTight: top.tight,
      containerOrder: order,
    };
  };

  let pendingParagraph: PendingBlock | null = null;
  const flushPending = (): FullParseResult | null => {
    if (pendingParagraph === null) return null;
    const result = pushPending(pendingParagraph, runOpeners);
    pendingParagraph = null;
    return result;
  };

  // Track blank-line separated looseness per run: a blank line inside a run
  // marks it loose.
  let blankSinceItem = false;

  while (index < lines.length) {
    const line = lines[index] as string;
    // Fenced code block.
    const fence = /^( {0,3})(`{3,}|~{3,})[ \t]*([^\s`]*)/.exec(line);
    if (fence !== null) {
      const fenceStart = index;
      const refused = flushPending();
      if (refused !== null) return refused;
      const marker = fence[2] as string;
      const language = (fence[3] as string) || null;
      const body: string[] = [];
      index += 1;
      let closed = false;
      while (index < lines.length) {
        const bodyLine = lines[index] as string;
        if (new RegExp(`^ {0,3}${marker[0]}{${marker.length},}[ \\t]*$`).test(bodyLine)) {
          closed = true;
          index += 1;
          break;
        }
        body.push(bodyLine);
        index += 1;
      }
      void closed;
      listStack.length = 0;
      const base = currentListContext(0);
      const paragraphId = makeBlockId(allocateId);
      pushPending(
        {
          context: {
            ...base,
            listItemId: base.listItemId,
            containerOrder: base.containerOrder,
          },
          blockKind: "codeBlock",
          codeLanguage: language,
          codeLines: body,
          lines: [],
          paragraphId,
          runSource: false,
          source: lines.slice(fenceStart, index).join("\n"),
        },
        runOpeners,
      );
      listStack.length = 0;
      blankSinceItem = false;
      continue;
    }
    // Blank line: closes paragraphs, separates blocks; may loosen lists.
    // A second consecutive blank at top level materializes an empty
    // paragraph block so consecutive empties round-trip (F01).
    if (/^[ \t]*$/.test(line)) {
      const refused = flushPending();
      if (refused !== null) return refused;
      let blanks = 0;
      while (index < lines.length && /^[ \t]*$/.test(lines[index] as string)) {
        blanks += 1;
        index += 1;
      }
      blankSinceItem = true;
      // A blank line after a list item keeps the run open (loose); extra
      // blanks outside any list become empty paragraph blocks. The count
      // inverts the serializer exactly (edge/middle runs carry floor(k/2),
      // a lone run carries ceil(k/2)) so consecutive empties round-trip.
      if (listStack.length === 0) {
        let hasAfter = false;
        for (let scan = index; scan < lines.length; scan += 1) {
          if (!/^[ \t]*$/.test(lines[scan] as string)) {
            hasAfter = true;
            break;
          }
        }
        const empties =
          blocks.length === 0 && !hasAfter
            ? Math.ceil(blanks / 2)
            : Math.floor(blanks / 2);
        for (let extra = 0; extra < empties; extra += 1) {
          const base = currentListContext(0);
          const emptyId = makeBlockId(allocateId);
          blocks.push({
            paragraphId: emptyId,
            kind: "paragraph",
            metadata: contextMetadata({ ...base, listItemId: null }, "paragraph"),
            segments: [],
          });
          seeds.set(emptyId, "");
        }
      }
      continue;
    }
    // ATX heading.
    const atx = /^( {0,3})(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/.exec(line);
    if (atx !== null && (atx[3] as string).trim() !== "") {
      const refused = flushPending();
      if (refused !== null) return refused;
      const level = (atx[2] as string).length as 1 | 2 | 3 | 4 | 5 | 6;
      listStack.length = 0;
      const base = currentListContext(0);
      const paragraphId = makeBlockId(allocateId);
      pushPending(
        {
          context: { ...base, listItemId: base.listItemId },
          blockKind: "heading",
          headingLevel: level,
          lines: [atx[3] as string],
          paragraphId,
          runSource: false,
          source: line,
        },
        runOpeners,
      );
      listStack.length = 0;
      blankSinceItem = false;
      index += 1;
      continue;
    }
    // Setext heading (SETEXT-ATX): text line followed by === or ---.
    const nextLine = index + 1 < lines.length ? (lines[index + 1] as string) : null;
    if (
      nextLine !== null &&
      /^[ \t]{0,3}(=+|-+)[ \t]*$/.test(nextLine) &&
      pendingParagraph === null &&
      !/^[ \t]*([-*+][ \t]|\d+[.)][ \t]|#{1,6}[ \t]|>)/.test(line) &&
      listStack.length === 0
    ) {
      const level = nextLine.trim().startsWith("=") ? 1 : 2;
      const base = currentListContext(0);
      const paragraphId = makeBlockId(allocateId);
      pushPending(
        {
          context: { ...base, listItemId: base.listItemId },
          blockKind: "heading",
          headingLevel: level as 1 | 2,
          lines: [line.trim()],
          paragraphId,
          runSource: false,
          source: `${line}\n${nextLine}`,
        },
        runOpeners,
      );
      listStack.length = 0;
      blankSinceItem = false;
      index += 2;
      continue;
    }
    // Horizontal rule (--- canonical; *** and ___ accepted).
    if (/^[ \t]{0,3}((-[ \t]*){3,}|(\*[ \t]*){3,}|(_[ \t]*){3,})$/.test(line)) {
      const refused = flushPending();
      if (refused !== null) return refused;
      const paragraphId = makeBlockId(allocateId);
      blocks.push({
        paragraphId,
        kind: "horizontalRule",
        hrMetadata: canonicalHrDefaults(),
      });
      seeds.set(paragraphId, line);
      listStack.length = 0;
      blankSinceItem = false;
      index += 1;
      continue;
    }
    // Blockquote group: strip markers and parse the inner content.
    if (/^[ \t]{0,3}>/.test(line)) {
      const refused = flushPending();
      if (refused !== null) return refused;
      const inner: string[] = [];
      while (index < lines.length && /^[ \t]{0,3}>/.test(lines[index] as string)) {
        const quoteLine = lines[index] as string;
        const stripped = quoteLine.replace(/^[ \t]{0,3}>[ \t]?/, "");
        // Nested quote depth counts extra leading markers.
        inner.push(stripped);
        index += 1;
      }
      // Depth: count markers on the first line.
      const firstMarkers = /^(?:[ \t]{0,3}>)+/.exec(line);
      const depth = firstMarkers !== null ? (firstMarkers[0].match(/>/g) ?? []).length : 1;
      const sub = parseBlocksWithDepth(inner, depth, allocateId, blocks);
      if (sub !== null) return sub;
      listStack.length = 0;
      blankSinceItem = false;
      continue;
    }
    // List item (bullet or ordered).
    const bullet = /^([ \t]*)([-*+])[ \t]+(.*)$/.exec(line);
    const ordered = /^([ \t]*)(\d+)([.)])[ \t]+(.*)$/.exec(line);
    if (bullet !== null || ordered !== null) {
      const refused = flushPending();
      if (refused !== null) return refused;
      const indentText = ((bullet?.[1] ?? ordered?.[1]) as string).replace(/\t/g, "  ");
      const indent = indentText.length;
      const markerWidth =
        bullet !== null
          ? 2
          : (ordered?.[2] as string).length + (ordered?.[3] as string).length + 1;
      const contentIndent = indent + markerWidth;
      // The nesting depth is structural, not two-space levels: a marker
      // nests under every open level whose content column it reaches, so
      // wide ordered markers ("10. ") keep their children at depth + 1 and
      // over-indented markers do not fabricate phantom levels.
      let depth = 0;
      for (const entry of listStack) {
        if (indent >= entry.contentIndent) depth += 1;
        else break;
      }
      const kind = bullet !== null ? "bullet" : "ordered";
      // The item identity is allocated first: a fresh run is keyed by its
      // opening item paragraph (R-FULL-META-1 listRunId).
      const itemContent = (bullet?.[3] ?? ordered?.[4] ?? "") as string;
      if (/^\[[ xX]\](\s|$)/.test(itemContent)) {
        const taskId = makeBlockId(allocateId);
        blocks.push({
          paragraphId: taskId,
          kind: "preserved",
          raw: line,
          preservedKind: "list",
        });
        seeds.set(taskId, line);
        blankSinceItem = false;
        index += 1;
        continue;
      }
      const itemId = makeBlockId(allocateId);
      while (listStack.length > depth + 1) listStack.pop();
      const top = listStack[listStack.length - 1];
      const sameLevel = listStack.length === depth + 1;
      let freshRun = false;
      if (
        top === undefined ||
        top.placeholder === true ||
        !sameLevel ||
        top.kind !== kind ||
        (blankSinceItem && depth === 0)
      ) {
        // New run at this depth: pop placeholders/deeper runs, fill skipped
        // depths with kind-only placeholders, then open the run on this item.
        while (listStack.length > depth) listStack.pop();
        while (listStack.length < depth) {
          const placeholderIndent = listStack.length * 2;
          listStack.push({
            kind: "bullet",
            runId: "",
            tight: true,
            indent: placeholderIndent,
            contentIndent: placeholderIndent + 2,
            placeholder: true,
          });
        }
        listStack.push({ kind, runId: itemId, tight: true, indent, contentIndent, placeholder: false });
        freshRun = true;
      } else if (blankSinceItem) {
        top.tight = false;
      }
      const run = listStack[listStack.length - 1] as {
        kind: "bullet" | "ordered";
        runId: string;
        tight: boolean;
        indent: number;
        contentIndent: number;
        placeholder: boolean;
      };
      const content = (bullet?.[3] ?? ordered?.[4] ?? "") as string;
      const base = currentListContext(0);
      void base;
      const order: ("quote" | "list")[] = ["list"];
      const context: BlockContext = {
        blockquoteDepth: 0,
        listKind: kind,
        listDepth: depth,
        listRunId: run.runId,
        listItemId: itemId,
        orderedStart:
          kind === "ordered" && ordered !== null ? parseInt(ordered[2] as string, 10) : null,
        orderedType: "1",
        listTight: run.tight,
        containerOrder: order,
      };
      const itemStart = index;
      const pending: PendingBlock = {
        context,
        blockKind: "paragraph",
        lines: [content],
        paragraphId: itemId,
        runSource: freshRun,
        source: "",
      };
      // Collect continuation lines: indented content or blank-then-indented.
      index += 1;
      const continuations: string[] = [];
      while (index < lines.length) {
        const cont = lines[index] as string;
        if (/^[ \t]*$/.test(cont)) {
          // Look ahead: blank followed by an indented line continues the item.
          const after = lines[index + 1] as string | undefined;
          if (after !== undefined && /^[ \t]{2,}\S/.test(after) && !/^([ \t]*)([-*+]|\d+[.)])[ \t]+/.test(after)) {
            continuations.push("");
            index += 1;
            continue;
          }
          break;
        }
        if (/^([ \t]*)([-*+]|\d+[.)])[ \t]+/.test(cont)) break;
        if (/^[ \t]{0,3}>/.test(cont) || /^( {0,3})(`{3,}|~{3,})/.test(cont)) break;
        if (/^[ \t]{0,3}((-[ \t]*){3,}|(\*[ \t]*){3,}|(_[ \t]*){3,})$/.test(cont)) break;
        if (/^( {0,3})(#{1,6})[ \t]+/.test(cont)) break;
        const stripped = cont.replace(/^ {0,4}/, "");
        continuations.push(stripped);
        index += 1;
      }
      pending.source = lines.slice(itemStart, index).join("\n");
      const refusedPush = pushPending(pending, runOpeners);
      if (refusedPush !== null) return refusedPush;
      // Continuation paragraphs share the item/run ids, never run values.
      for (const contLine of continuations) {
        if (contLine === "") continue;
        const contContext: BlockContext = {
          ...context,
          orderedStart: null,
          orderedType: null,
          listTight: true,
        };
        const contPending: PendingBlock = {
          context: contContext,
          blockKind: "paragraph",
          lines: [contLine],
          paragraphId: makeBlockId(allocateId),
          runSource: false,
          source: contLine,
        };
        const refusedCont = pushPending(contPending, runOpeners);
        if (refusedCont !== null) return refusedCont;
      }
      blankSinceItem = false;
      continue;
    }
    // Table block (out of schema): consecutive pipe lines with a delimiter
    // row become one preserved block; never flattened into paragraphs.
    if (line.includes("|") && pendingParagraph === null) {
      let tableEnd = index;
      while (
        tableEnd < lines.length &&
        (lines[tableEnd] as string).includes("|") &&
        !/^[ \t]*$/.test(lines[tableEnd] as string)
      ) {
        tableEnd += 1;
      }
      const tableLines = lines.slice(index, tableEnd);
      const hasDelimiter = tableLines.some((entry) =>
        /^[ \t]*\|?[ \t:|-]+\|?[ \t:|-]*[ \t]*$/.test(entry) && /[-:]/.test(entry),
      );
      if (hasDelimiter && tableLines.length >= 2) {
        const refused = flushPending();
        if (refused !== null) return refused;
        listStack.length = 0;
        const tableId = makeBlockId(allocateId);
        const raw = tableLines.join("\n");
        blocks.push({
          paragraphId: tableId,
          kind: "preserved",
          raw,
          preservedKind: "table",
        });
        seeds.set(tableId, raw);
        blankSinceItem = false;
        index = tableEnd;
        continue;
      }
    }
    // Raw HTML block (no HTML rendering path): lines opening with a tag
    // become one preserved block with verbatim raw.
    if (/^[ \t]*<\/?[a-zA-Z!][^>]*>[ \t]*$/.test(line) && pendingParagraph === null) {
      const refused = flushPending();
      if (refused !== null) return refused;
      listStack.length = 0;
      let htmlEnd = index + 1;
      while (
        htmlEnd < lines.length &&
        /^[ \t]*<[^\n]*>[ \t]*$/.test(lines[htmlEnd] as string)
      ) {
        htmlEnd += 1;
      }
      const htmlId = makeBlockId(allocateId);
      const raw = lines.slice(index, htmlEnd).join("\n");
      blocks.push({
        paragraphId: htmlId,
        kind: "preserved",
        raw,
        preservedKind: "rawHtml",
      });
      seeds.set(htmlId, raw);
      blankSinceItem = false;
      index = htmlEnd;
      continue;
    }
    // Ordinary paragraph line: accumulate; a blank line or a special block
    // ends it. A paragraph breaks any open list run.
    if (pendingParagraph === null) {
      listStack.length = 0;
      const base = currentListContext(0);
      pendingParagraph = {
        context: { ...base, listItemId: base.listItemId },
        blockKind: "paragraph",
        lines: [line],
        paragraphId: makeBlockId(allocateId),
        runSource: false,
        source: line,
      };
    } else {
      pendingParagraph.lines.push(line);
      pendingParagraph.source += `\n${line}`;
    }
    blankSinceItem = false;
    index += 1;
  }

  const tail = flushPending();
  if (tail !== null) return tail;
  return {
    document: { format: "ds.markdown.full@1", blocks },
    refusedKinds: [],
    seeds,
  };
}

/** Parse inner quote lines at a fixed blockquote depth into the block list. */
function parseBlocksWithDepth(
  inner: string[],
  depth: number,
  allocateId: () => string,
  blocks: RichTextBlock[],
): FullParseResult | null {
  const sub = parseFullMarkdown(inner.join("\n"), allocateId);
  if (sub.document === null) {
    return { document: null, refusedKinds: sub.refusedKinds, seeds: sub.seeds };
  }
  for (const block of sub.document.blocks) {
    if (block.kind === "preserved") {
      blocks.push(block);
      continue;
    }
    if (block.kind === "horizontalRule") {
      blocks.push({
        paragraphId: block.paragraphId,
        kind: "horizontalRule",
        hrMetadata: {
          listKind: "none",
          listDepth: 0,
          blockquoteDepth: depth,
          containerOrder: depth > 0 ? ["quote"] : [],
        },
      });
      continue;
    }
    const metadata = block.metadata ?? canonicalPlainMetadata();
    const order: ("quote" | "list")[] = [...metadata.containerOrder];
    if (!order.includes("quote")) order.unshift("quote");
    blocks.push({
      paragraphId: block.paragraphId,
      kind: "paragraph",
      metadata: { ...metadata, blockquoteDepth: depth, containerOrder: order },
      segments: block.segments ?? [],
    });
  }
  return null;
}

/** Longest backtick run inside text, for safe inline-code fences. */
function longestBacktickRun(text: string): number {
  let longest = 0;
  let run = 0;
  for (const char of text) {
    if (char === "`") {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return longest;
}

/** Serialize inline segments with canonical delimiters (§2.9). */
function serializeInline(
  segments: readonly FullInlineSegment[],
  codeBlock: boolean,
): string {
  if (codeBlock) {
    // Inside code: literal LF per R-FULL-CODE-1, no mark syntax.
    return segments
      .map((segment) => (segment.type === "hardBreak" ? "\n" : segment.text))
      .join("");
  }
  let output = "";
  // Track open marks to nest them deterministically: link outermost, then
  // bold/italic/strike/underline/code innermost.
  const openState = { bold: false, italic: false, strike: false, underline: false, code: false };
  let openCodeFence = "`";
  let openLink: string | null = null;
  let openTitle: string | undefined = undefined;
  const closeMarks = (next: RichTextInlineMarks): void => {
    if (openState.code) {
      output += openCodeFence;
      openState.code = false;
      openCodeFence = "`";
    }
    if (openState.underline) {
      output += "</u>";
      openState.underline = false;
    }
    if (openState.strike) {
      output += "~~";
      openState.strike = false;
    }
    if (openState.italic) {
      output += "*";
      openState.italic = false;
    }
    if (openState.bold) {
      output += "**";
      openState.bold = false;
    }
    if (openLink !== null) {
      const title = openTitle !== undefined
        ? ` "${openTitle.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
        : "";
      output += `](${openLink}${title})`;
      openLink = null;
      openTitle = undefined;
    }
    void next;
  };
  const openMarks = (marks: RichTextInlineMarks): void => {
    if (marks.link !== undefined && marks.link !== openLink) {
      output += "[";
      openLink = marks.link;
      openTitle = marks.linkTitle;
    }
    if (marks.bold === true && !openState.bold) {
      output += "**";
      openState.bold = true;
    }
    if (marks.italic === true && !openState.italic) {
      output += "*";
      openState.italic = true;
    }
    if (marks.strike === true && !openState.strike) {
      output += "~~";
      openState.strike = true;
    }
    if (marks.underline === true && !openState.underline) {
      output += "<u>";
      openState.underline = true;
    }
    if (marks.code === true && !openState.code) {
      output += openCodeFence;
      openState.code = true;
    }
  };
  const fenceForRun = (text: string): string => {
    const longest = longestBacktickRun(text);
    const fence = "`".repeat(Math.max(1, longest + 1));
    const pad = text.startsWith(" ") || text.startsWith("`") || text.endsWith(" ") || text.endsWith("`") ? " " : "";
    return `${fence}${pad}`;
  };
  const fenceCloseForRun = (text: string): string => {
    const longest = longestBacktickRun(text);
    const fence = "`".repeat(Math.max(1, longest + 1));
    const pad = text.startsWith(" ") || text.startsWith("`") || text.endsWith(" ") || text.endsWith("`") ? " " : "";
    return `${pad}${fence}`;
  };
  const closeCode = (): void => {
    if (openState.code) {
      output += openCodeFence;
      openState.code = false;
      openCodeFence = "`";
    }
  };
  for (const segment of segments) {
    if (segment.type === "hardBreak") {
      // Nonterminal prose breaks use backslash + LF; terminal runs are
      // elided by the block serializer (F16-M).
      closeCode();
      output += "\\\n";
      continue;
    }
    const marks = segment.marks;
    if (marks.code === true && !openState.code) {
      openCodeFence = fenceForRun(segment.text);
    }
    if (marks.link !== openLink) {
      closeMarks(marks);
      openLink = null;
      openTitle = undefined;
      openMarks(marks);
      if (marks.code === true && openState.code) {
        openCodeFence = fenceCloseForRun(segment.text);
      }
    } else {
      // Close marks no longer present, open new ones.
      if (!marks.bold && openState.bold) {
        // Close inner marks first back to bold.
        closeCode();
        if (openState.underline) {
          output += "</u>";
          openState.underline = false;
        }
        if (openState.strike) {
          output += "~~";
          openState.strike = false;
        }
        if (openState.italic) {
          output += "*";
          openState.italic = false;
        }
        output += "**";
        openState.bold = false;
      }
      if (!marks.italic && openState.italic) {
        closeCode();
        if (openState.underline) {
          output += "</u>";
          openState.underline = false;
        }
        if (openState.strike) {
          output += "~~";
          openState.strike = false;
        }
        output += "*";
        openState.italic = false;
      }
      if (!marks.strike && openState.strike) {
        closeCode();
        if (openState.underline) {
          output += "</u>";
          openState.underline = false;
        }
        output += "~~";
        openState.strike = false;
      }
      if (!marks.underline && openState.underline) {
        closeCode();
        output += "</u>";
        openState.underline = false;
      }
      if (!marks.code && openState.code) {
        closeCode();
      }
      openMarks(marks);
      if (marks.code === true && openState.code) {
        openCodeFence = fenceCloseForRun(segment.text);
      }
    }
    // No escaping inside inline code: the fence already protects content.
    output += marks.code === true ? segment.text : emitLiteralText(segment.text, "");
    void bracketOpensLink;
    void angleOpensMarkup;
  }
  closeMarks({});
  return output;
}

/** Fence marker longer than any internal backtick run (code blocks). */
function codeFenceFor(text: string): string {
  let longest = 0;
  let run = 0;
  for (const char of text) {
    if (char === "`") {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return "`".repeat(Math.max(3, longest + 1));
}

/** Options for full serialization: untouched blocks re-emit their
    conversion seeds byte-identical (W1 neighbor stability). */
export interface FullSerializeOptions {
  seeds?: ReadonlyMap<string, string>;
  touched?: ReadonlySet<string>;
}

/** Escape a canonical inline line whose start would otherwise reparse as a
    block structure (ATX heading, quote, list, fence, rule or tag-shaped
    line): a backslash before the first structural character keeps the
    paragraph literal, and the inline escape round-trips it back. Digit
    delimiters escape on the delimiter (`1\\.`), since a backslash cannot
    precede the digit itself. */
export function escapeBlockStart(line: string): string {
  if (/^( {0,3})#{1,6}[ \t]+/.test(line)) {
    return line.replace(/^( {0,3})#/, "$1\\#");
  }
  if (/^( {0,3})>/.test(line)) {
    return line.replace(/^( {0,3})>/, "$1\\>");
  }
  if (/^([ \t]*)([-*+])[ \t]+/.test(line)) {
    return line.replace(/^([ \t]*)([-*+])/, "$1\\$2");
  }
  if (/^([ \t]*\d+)([.)])[ \t]+/.test(line)) {
    return line.replace(/^([ \t]*\d+)([.)])/, "$1\\$2");
  }
  if (/^( {0,3})(`{3,}|~{3,})/.test(line)) {
    return line.replace(/^( {0,3})([`~])/, "$1\\$2");
  }
  if (/^ {0,3}((-[ \t]*){3,}|(\*[ \t]*){3,}|(_[ \t]*){3,})[ \t]*$/.test(line)) {
    return line.replace(/^([ \t]*)([-*_])/, "$1\\$2");
  }
  if (/^[ \t]*<\/?[a-zA-Z!][^>]*>[ \t]*$/.test(line)) {
    return line.replace(/</, "\\<");
  }
  return line;
}

/** Unescape a link title parsed with backslash-escaped quotes, mirroring
    the inline escape set so titles carrying `"` round-trip losslessly. */
export function unescapeLinkTitle(title: string): string {
  // Like the inline escape set plus the double quote: `\"` inside a
  // double-quoted title reads back as `"`.
  return title.replace(/\\([\\`*_{}[\]()#+\-.!"<>~])/g, "$1");
}

/** Serialize a full document to its canonical Markdown wire (§2.9). */
export function serializeFullDocument(
  document: RichTextDocument,
  options?: FullSerializeOptions,
): string {
  const lines: string[] = [];
  // Ordered-run counters: listRunId -> next number (starts at opener start).
  const runCounters = new Map<string, number>();
  // Last emitted marker width per run, for continuation alignment (F05).
  const lastMarkerWidths = new Map<string, number>();
  // Content column per list depth (item 7): set when an item marker emits,
  // read when a nested marker or rule indents under it.
  const listColumns: number[] = [];

  /** Marker width (and ordered number) of a seeded item opener's source
      slice, tolerating quote prefixes: seeded blocks re-emit verbatim but
      must still advance the run counters and content columns so a later
      canonical neighbor in the same run numbers and indents correctly. */
  const markerOfSeed = (
    seed: string,
    listKind: "bullet" | "ordered",
  ): { width: number; number?: number } | null => {
    const firstLine = (seed.split("\n")[0] ?? "").replace(/^(>\s*)+/, "");
    if (listKind === "bullet") {
      return /^\s*[-*+] /.test(firstLine) ? { width: 2 } : null;
    }
    const marker = /^\s*(\d+)([.)]) /.exec(firstLine);
    if (marker === null) return null;
    return {
      width: (marker[1] as string).length + 2,
      number: parseInt(marker[1] as string, 10),
    };
  };

  /** Advance run counters, marker widths and content columns for a seeded
      (verbatim) list item opener. Continuations and rules carry no tracking
      state of their own. */
  const trackSeededBlock = (block: RichTextBlock, seed: string): void => {
    const metadata = block.metadata;
    if (block.kind !== "paragraph" || metadata === undefined) return;
    if (metadata.listKind === "none") return;
    if (block.paragraphId !== (metadata.listItemId ?? block.paragraphId)) return;
    const marker = markerOfSeed(seed, metadata.listKind);
    const width = marker?.width ?? (metadata.listKind === "bullet" ? 2 : 3);
    const runId = metadata.listRunId ?? block.paragraphId;
    if (marker?.number !== undefined) runCounters.set(runId, marker.number + 1);
    lastMarkerWidths.set(runId, width);
    const column = metadata.listDepth === 0 ? 0 : (listColumns[metadata.listDepth - 1] ?? metadata.listDepth * 2);
    listColumns[metadata.listDepth] = column + width;
  };

  // Run values survive opener deletion through the retained map
  // (R-FULL-META-2): a member never carries start/type/tight, so the wire
  // consults the retained source record before falling back to defaults.
  const retainedStartOf = (metadata: FullBlockMetadata | undefined): number => {
    if (metadata?.orderedStart !== undefined) return metadata.orderedStart;
    const runId = metadata?.listRunId;
    if (runId !== undefined) {
      const retained = document.retainedRunMetadata?.[runId]?.orderedStart;
      if (typeof retained === "number") return retained;
    }
    return 1;
  };
  const retainedTightOf = (metadata: FullBlockMetadata | undefined): boolean => {
    if (metadata?.listTight !== undefined) return metadata.listTight;
    const runId = metadata?.listRunId;
    if (runId !== undefined) {
      const retained = document.retainedRunMetadata?.[runId]?.listTight;
      if (typeof retained === "boolean") return retained;
    }
    return true;
  };

  const emitBlock = (block: RichTextBlock): void => {
    if (block.kind === "preserved") {
      lines.push(block.raw ?? "");
      return;
    }
    if (block.kind === "horizontalRule") {
      const metadata = block.hrMetadata;
      const quotePrefix = metadata !== undefined && metadata.blockquoteDepth > 0
        ? "> ".repeat(metadata.blockquoteDepth)
        : "";
      const listDepth = metadata?.listDepth ?? 0;
      const indent = metadata !== undefined && metadata.listKind !== "none"
        ? " ".repeat(listDepth === 0 ? 0 : (listColumns[listDepth - 1] ?? listDepth * 2))
        : "";
      lines.push(`${quotePrefix}${indent}---`);
      return;
    }
    const metadata = block.metadata ?? canonicalPlainMetadata();
    const blockKind = metadata.blockKind ?? "paragraph";
    const quotePrefix = metadata.blockquoteDepth > 0 ? "> ".repeat(metadata.blockquoteDepth) : "";
    const isCode = blockKind === "codeBlock";
    const segments = block.segments ?? [];
    if (isCode) {
      const language = metadata.blockKind === "codeBlock"
        ? ((metadata as { codeLanguage?: string | null }).codeLanguage ?? "")
        : "";
      const codeText = serializeInline(segments, true);
      const fence = codeFenceFor(codeText);
      // F10-M: closing fence immediately after an existing trailing LF;
      // empty code has no blank body line.
      if (codeText === "") {
        lines.push(`${quotePrefix}\`\`\`${language}`.replace("```", fence));
        lines.push(`${quotePrefix}${fence}`);
      } else if (codeText.endsWith("\n")) {
        lines.push(`${quotePrefix}${fence}${language}`);
        for (const codeLine of codeText.slice(0, -1).split("\n")) {
          lines.push(`${quotePrefix}${codeLine}`);
        }
        lines.push(`${quotePrefix}${fence}`);
      } else {
        lines.push(`${quotePrefix}${fence}${language}`);
        for (const codeLine of codeText.split("\n")) lines.push(`${quotePrefix}${codeLine}`);
        lines.push(`${quotePrefix}${fence}`);
      }
      return;
    }
    let inline = serializeInline(segments, false);
    // Nested list indentation (R-FULL-META-2 item 7): every depth resolves
    // to its parent item's content column, never to two-space levels, so an
    // independent CommonMark parser recovers the same nesting.
    const parentColumn = (depth: number): number =>
      depth === 0 ? 0 : (listColumns[depth - 1] ?? depth * 2);
    // F16-M: elide the final consecutive hard-break run of a prose block.
    inline = inline.replace(/(\\\n)+$/, "");
    const headingLevel = metadata.blockKind === "heading"
      ? ((metadata as { headingLevel?: number }).headingLevel ?? 1)
      : null;
    const headingPrefix = headingLevel !== null ? `${"#".repeat(headingLevel)} ` : "";
    if (metadata.listKind !== "none") {
      const isContinuation = block.paragraphId !== (metadata.listItemId ?? block.paragraphId);
      const column = parentColumn(metadata.listDepth);
      const indent = " ".repeat(column);
      if (isContinuation) {
        // Multi-paragraph item: continuation lines carry no marker and align
        // under the item content column (F05).
        const width = lastMarkerWidths.get(metadata.listRunId ?? "") ?? (metadata.listKind === "bullet" ? 2 : 3);
        const contIndent = `${indent}${" ".repeat(width)}`;
        if (inline === "") {
          lines.push(`${quotePrefix}${contIndent.trimEnd()}`);
          return;
        }
        for (const inlineLine of inline.split("\n")) {
          lines.push(`${quotePrefix}${contIndent}${escapeBlockStart(inlineLine)}`);
        }
        return;
      }
      let marker: string;
      if (metadata.listKind === "bullet") {
        marker = "- ";
      } else {
        const runId = metadata.listRunId ?? block.paragraphId;
        let next = runCounters.get(runId);
        if (next === undefined) {
          next = retainedStartOf(metadata);
        }
        marker = `${next}. `;
        runCounters.set(runId, next + 1);
      }
      lastMarkerWidths.set(metadata.listRunId ?? block.paragraphId, marker.length);
      listColumns[metadata.listDepth] = column + marker.length;
      // Every inline line escapes a block-start shape: the first line would
      // otherwise reparse as a structure, and hard-break lines after it are
      // re-scanned for structures too.
      const escapedInline = inline.split("\n").map(escapeBlockStart).join("\n");
      lines.push(`${quotePrefix}${indent}${marker}${headingPrefix}${escapedInline}`);
      return;
    }
    if (inline === "") {
      // Empty block: a blank line (retained as an identified block).
      if (quotePrefix !== "") lines.push(quotePrefix.trimEnd());
      else lines.push("");
      return;
    }
    // Multi-line inline (interior hard breaks) stays inside the block; every
    // line escapes a block-start shape so a paragraph starting with `#`
    // (or a hard-break line starting with one) reparses as a paragraph.
    const inlineLines = inline.split("\n").map(escapeBlockStart);
    inlineLines.forEach((inlineLine, inlineIndex) => {
      if (inlineIndex === 0) lines.push(`${quotePrefix}${headingPrefix}${inlineLine}`);
      else lines.push(`${quotePrefix}${inlineLine}`);
    });
  };

  const needsBlank = (block: RichTextBlock, blockIndex: number): boolean => {
    // Blank-line separation: one blank line between blocks, except inside a
    // list structure where consecutive lines stay adjacent. A blank appears
    // between two list items only when leaving a run (different run id at
    // the same depth, or a non-list block) or when either side of the same
    // run is loose; nested items at a different depth stay attached, as do
    // continuation paragraphs of the same item.
    if (blockIndex === 0) return false;
    const previous = document.blocks[blockIndex - 1] as RichTextBlock;
    const prevList = previous.kind === "paragraph" && previous.metadata?.listKind !== "none";
    const currList = block.kind === "paragraph" && block.metadata?.listKind !== "none";
    let adjacent = false;
    if (prevList && currList) {
      const prevMeta = previous.metadata as NonNullable<RichTextBlock["metadata"]>;
      const currMeta = block.metadata as NonNullable<RichTextBlock["metadata"]>;
      const sameQuote = prevMeta.blockquoteDepth === currMeta.blockquoteDepth;
      const sameItem = (prevMeta.listItemId ?? previous.paragraphId) === (currMeta.listItemId ?? block.paragraphId);
      const sameRun = prevMeta.listRunId === currMeta.listRunId;
      const sameDepth = prevMeta.listDepth === currMeta.listDepth;
      if (sameQuote && (sameItem || !sameDepth)) {
        adjacent = true;
      } else if (sameQuote && sameRun && sameDepth) {
        adjacent = retainedTightOf(prevMeta) && retainedTightOf(currMeta);
      }
    }
    return !adjacent;
  };

  document.blocks.forEach((block, blockIndex) => {
    const seed = options?.seeds?.get(block.paragraphId);
    if (
      seed !== undefined &&
      !(options?.touched?.has(block.paragraphId) ?? false)
    ) {
      if (needsBlank(block, blockIndex)) lines.push("");
      for (const seedLine of seed.split("\n")) lines.push(seedLine);
      // Verbatim reuse still advances run tracking for later neighbors.
      trackSeededBlock(block, seed);
      return;
    }
    if (needsBlank(block, blockIndex)) lines.push("");
    emitBlock(block);
  });
  return lines.join("\n");
}

