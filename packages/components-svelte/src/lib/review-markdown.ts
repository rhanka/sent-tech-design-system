// Pure helpers for the Svelte review/comment kit (SPEC-r6 §2, §3, §4).
// Safe markdown-lite AST parser (zero raw HTML injection), Ref trailer chips,
// resolution record detection, anchor labels, actor color sanitization, and focus trap.

import {
  FALLBACK_ACTOR_COLOR,
  MAX_SECTION_KEY_LENGTH,
  ReviewAdapterError,
  type AnchorPayload,
} from "@sentropic/design-system-review-core";

export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "bold"; children: MarkdownInline[] }
  | { type: "italic"; children: MarkdownInline[] }
  | { type: "strike"; children: MarkdownInline[] }
  | { type: "code"; text: string }
  | { type: "link"; label: string; href: string; external: boolean }
  | { type: "break" };

export type MarkdownBlock =
  | { type: "paragraph"; inlines: MarkdownInline[] }
  | { type: "codeblock"; lang?: string; code: string }
  | { type: "blockquote"; inlines: MarkdownInline[] }
  | { type: "list"; ordered: boolean; items: MarkdownInline[][] };

export interface CommentRef {
  kind: "decision" | "track";
  id: string;
  raw: string;
}

export interface ResolutionRecord {
  version: string;
}

export interface ParsedCommentBody {
  blocks: MarkdownBlock[];
  refs: CommentRef[];
  resolution: ResolutionRecord | null;
}

const REF_LINE_RE = /^Ref:\s*(decision|track):([^\s]+)\s*$/i;
const RESOLUTION_LINE_RE = /^Resolved\s+in\s+([^\r\n]+?)\s*$/i;
const SAFE_HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_FUNC_COLOR_RE = /^(?:rgba?|hsla?|oklch|oklab)\([0-9.,%\s/+deg-]+\)$/i;
const SAFE_VAR_COLOR_RE = /^var\(--st-[a-zA-Z0-9-]+\)$/;

/** Sanitize an untrusted `CollaborationActor.color` value before CSS binding. */
export function sanitizeActorColor(color: string | undefined | null): string {
  if (typeof color !== "string") return FALLBACK_ACTOR_COLOR;
  const trimmed = color.trim();
  if (
    SAFE_HEX_COLOR_RE.test(trimmed) ||
    SAFE_FUNC_COLOR_RE.test(trimmed) ||
    SAFE_VAR_COLOR_RE.test(trimmed)
  ) {
    return trimmed;
  }
  return FALLBACK_ACTOR_COLOR;
}

/** Check whether a URL is safe to expose as an anchor href (never javascript:/data:/vbscript:). */
export function isSafeMarkdownHref(rawHref: string): { safe: boolean; external: boolean; href: string } {
  const trimmed = rawHref.trim();
  if (trimmed.length === 0) {
    return { safe: false, external: false, href: "" };
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return { safe: true, external: false, href: trimmed };
  }
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === "https:" || protocol === "http:" || protocol === "mailto:") {
      return { safe: true, external: protocol !== "mailto:", href: parsed.href };
    }
  } catch {
    return { safe: false, external: false, href: "" };
  }
  return { safe: false, external: false, href: "" };
}

/** Parse `Ref: decision:<id>` / `Ref: track:<id>` promotion trailers (SPEC-r6 §4). */
export function parseCommentRefs(body: string): CommentRef[] {
  const refs: CommentRef[] = [];
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  for (const line of lines) {
    const match = REF_LINE_RE.exec(line.trim());
    if (match) {
      const kind = match[1]!.toLowerCase() as "decision" | "track";
      const id = match[2]!;
      refs.push({ kind, id, raw: line.trim() });
    }
  }
  return refs;
}

/** Detect the `Resolved in <version|commit>` resolution reply convention (SPEC-r6 §2). */
export function isResolutionReply(body: string): ResolutionRecord | null {
  const firstNonEmpty = body
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstNonEmpty) return null;
  const match = RESOLUTION_LINE_RE.exec(firstNonEmpty);
  if (!match) return null;
  const version = match[1]!.trim();
  return version.length > 0 ? { version } : null;
}

function parseInlineSegment(text: string): MarkdownInline[] {
  const tokens: MarkdownInline[] = [];
  let cursor = 0;

  const pushText = (chunk: string) => {
    if (chunk.length === 0) return;
    const prev = tokens[tokens.length - 1];
    if (prev && prev.type === "text") {
      prev.text += chunk;
    } else {
      tokens.push({ type: "text", text: chunk });
    }
  };

  while (cursor < text.length) {
    const ch = text[cursor]!;

    // Inline code: `...`
    if (ch === "`") {
      const end = text.indexOf("`", cursor + 1);
      if (end > cursor + 1) {
        tokens.push({ type: "code", text: text.slice(cursor + 1, end) });
        cursor = end + 1;
        continue;
      }
    }

    // Link: [label](url)
    if (ch === "[") {
      const closeBracket = text.indexOf("]", cursor + 1);
      if (closeBracket > cursor + 1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen > closeBracket + 2) {
          const label = text.slice(cursor + 1, closeBracket);
          const rawUrl = text.slice(closeBracket + 2, closeParen);
          const checked = isSafeMarkdownHref(rawUrl);
          if (checked.safe) {
            tokens.push({
              type: "link",
              label,
              href: checked.href,
              external: checked.external,
            });
          } else {
            pushText(label);
          }
          cursor = closeParen + 1;
          continue;
        }
      }
    }

    // Bold: **...**
    if (ch === "*" && text[cursor + 1] === "*") {
      const end = text.indexOf("**", cursor + 2);
      if (end > cursor + 2) {
        tokens.push({
          type: "bold",
          children: parseInlineSegment(text.slice(cursor + 2, end)),
        });
        cursor = end + 2;
        continue;
      }
    }

    // Strikethrough: ~~...~~
    if (ch === "~" && text[cursor + 1] === "~") {
      const end = text.indexOf("~~", cursor + 2);
      if (end > cursor + 2) {
        tokens.push({
          type: "strike",
          children: parseInlineSegment(text.slice(cursor + 2, end)),
        });
        cursor = end + 2;
        continue;
      }
    }

    // Italic: *...* or _..._ (word-boundary guarded for underscores)
    if (ch === "*" || ch === "_") {
      const prevChar = cursor > 0 ? text[cursor - 1]! : "";
      const allowOpen = ch === "*" || prevChar === "" || /\s|[([{]/.test(prevChar);
      if (allowOpen && text[cursor + 1] !== ch && text[cursor + 1] !== " ") {
        const end = text.indexOf(ch, cursor + 1);
        const afterEnd = end >= 0 && end + 1 < text.length ? text[end + 1]! : "";
        const allowClose = ch === "*" || afterEnd === "" || /\s|[)\]}.,!?;:]/.test(afterEnd);
        if (end > cursor + 1 && text[end - 1] !== " " && allowClose) {
          tokens.push({
            type: "italic",
            children: parseInlineSegment(text.slice(cursor + 1, end)),
          });
          cursor = end + 1;
          continue;
        }
      }
    }

    pushText(ch);
    cursor += 1;
  }

  return tokens;
}

function parseLinesWithBreaks(lines: readonly string[]): MarkdownInline[] {
  const out: MarkdownInline[] = [];
  lines.forEach((line, index) => {
    if (index > 0) {
      out.push({ type: "break" });
    }
    out.push(...parseInlineSegment(line));
  });
  return out;
}

/**
 * Parses comment markdown-lite into a safe AST (rendered purely via Svelte text nodes,
 * never `{@html}`), extracting `Ref: decision:<id>` / `Ref: track:<id>` chips and
 * detecting `Resolved in <version|commit>` records.
 */
export function parseCommentBody(body: string): ParsedCommentBody {
  const normalized = body.replace(/\r\n?/g, "\n");
  const rawLines = normalized.split("\n");
  const refs: CommentRef[] = [];
  const contentLines: string[] = [];

  for (const line of rawLines) {
    const refMatch = REF_LINE_RE.exec(line.trim());
    if (refMatch) {
      refs.push({
        kind: refMatch[1]!.toLowerCase() as "decision" | "track",
        id: refMatch[2]!,
        raw: line.trim(),
      });
    } else {
      contentLines.push(line);
    }
  }

  const resolution = isResolutionReply(normalized);
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < contentLines.length) {
    const line = contentLines[i]!;
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < contentLines.length && !contentLines[i]!.trim().startsWith("```")) {
        codeLines.push(contentLines[i]!);
        i += 1;
      }
      if (i < contentLines.length) i += 1; // skip closing fence
      blocks.push({
        type: "codeblock",
        ...(lang.length > 0 ? { lang } : {}),
        code: codeLines.join("\n"),
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < contentLines.length && contentLines[i]!.trim().startsWith(">")) {
        quoteLines.push(contentLines[i]!.trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({
        type: "blockquote",
        inlines: parseLinesWithBreaks(quoteLines),
      });
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: MarkdownInline[][] = [];
      while (i < contentLines.length && /^[-*]\s+/.test(contentLines[i]!.trim())) {
        items.push(parseInlineSegment(contentLines[i]!.trim().replace(/^[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: MarkdownInline[][] = [];
      while (i < contentLines.length && /^\d+\.\s+/.test(contentLines[i]!.trim())) {
        items.push(parseInlineSegment(contentLines[i]!.trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < contentLines.length) {
      const candidate = contentLines[i]!;
      const cTrim = candidate.trim();
      if (
        cTrim.length === 0 ||
        cTrim.startsWith("```") ||
        cTrim.startsWith(">") ||
        /^[-*]\s+/.test(cTrim) ||
        /^\d+\.\s+/.test(cTrim)
      ) {
        break;
      }
      paraLines.push(candidate);
      i += 1;
    }
    blocks.push({
      type: "paragraph",
      inlines: parseLinesWithBreaks(paraLines),
    });
  }

  return { blocks, refs, resolution };
}

function clampString(value: string, maxLength: number): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  const cps = Array.from(collapsed);
  if (cps.length <= maxLength) return collapsed;
  if (maxLength <= 1) return "…";
  return `${cps.slice(0, maxLength - 1).join("")}…`;
}

/** Derives a <= 140-char quote or element label from a decoded `AnchorPayload` (SPEC-r6 §3). */
export function formatAnchorLabel(anchor: AnchorPayload | null, maxLength = 140): string {
  if (anchor === null) return "Unattached";
  if (anchor.t === "text") {
    return clampString(anchor.q.exact, maxLength);
  }
  if (anchor.t === "element") {
    const raw = anchor.aid ? `#${anchor.aid}` : anchor.sel;
    return clampString(raw, maxLength);
  }
  const xPct = Math.round(anchor.rect.x * 100);
  const yPct = Math.round(anchor.rect.y * 100);
  return clampString(`Region (${xPct}%, ${yPct}%)`, maxLength);
}

/**
 * Formats a pin's accessible name per SPEC-r6 §3:
 * `Thread 2, 3 comments, 1 unread, on '…'`
 */
export function formatPinAriaLabel(options: {
  index: number;
  count: number;
  unreadCount?: number;
  resolved?: boolean;
  excerpt?: string;
}): string {
  const { index, count, unreadCount = 0, resolved = false, excerpt } = options;
  const parts: string[] = [
    `Thread ${index}`,
    `${count} ${count === 1 ? "comment" : "comments"}`,
  ];
  if (unreadCount > 0) {
    parts.push(`${unreadCount} unread`);
  }
  if (resolved) {
    parts.push("resolved");
  }
  if (excerpt && excerpt.trim().length > 0) {
    parts.push(`on '${clampString(excerpt, 60)}'`);
  }
  return parts.join(", ");
}

/** Normalize adapter/composer errors, mapping server 400 cap errors to a consistent message. */
export function formatReviewError(error: unknown): string {
  if (error instanceof ReviewAdapterError) {
    if (error.code === "SECTION_KEY_TOO_LONG") {
      return `Selection anchor exceeds the ${MAX_SECTION_KEY_LENGTH}-character limit.`;
    }
    return error.message;
  }
  if (error instanceof Error) {
    if (
      /section_key_too_long|SECTION_KEY_TOO_LONG|ANCHOR_TOO_LONG/i.test(error.message) ||
      ((error as { code?: unknown }).code === "section_key_too_long")
    ) {
      return `Selection anchor exceeds the ${MAX_SECTION_KEY_LENGTH}-character limit.`;
    }
    return error.message;
  }
  return "Action failed. Please try again.";
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/** Collect visible/focusable elements within a focus-trap container. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

/** Handles Tab / Shift+Tab cycling within `container` for trapped layers. */
export function handleFocusTrapKeydown(event: KeyboardEvent, container: HTMLElement | undefined): void {
  if (event.key !== "Tab" || !container) return;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) return;

  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  const active = container.ownerDocument.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (!active || active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus();
    }
  } else if (!active || active === last || !container.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}
