// DOM anchor capture and re-render-resilient resolution (SPEC-r6 §2, §3).
// Never mutates the artifact DOM and never writes back to the store.

import { AnchorValidationError, MAX_QUOTE_CONTEXT_LENGTH } from "./anchor-codec.js";
import type {
  AnchorPayload,
  ElementAnchorPayload,
  RegionAnchorPayload,
  RegionRect,
  TextAnchorPayload,
  TextQuoteSelector,
} from "./types.js";

export type AnchorResolutionStrategy =
  | "aid"
  | "text-quote"
  | "selector"
  | "fuzzy-quote"
  | "region";

export interface ResolveAnchorOptions {
  /** Current rendered artifact version; mismatches set `versionChanged` and NEVER orphan. */
  artifactVersion?: string;
}

export interface ResolvedTextAnchor {
  status: "resolved";
  kind: "text";
  strategy: "aid" | "text-quote" | "selector" | "fuzzy-quote";
  element: Element;
  range: Range | null;
  versionChanged: boolean;
}

export interface ResolvedElementAnchor {
  status: "resolved";
  kind: "element";
  strategy: "aid" | "selector";
  element: Element;
  range: null;
  versionChanged: boolean;
}

export interface ResolvedRegionAnchor {
  status: "resolved";
  kind: "region";
  strategy: "region";
  element: Element;
  rect: RegionRect;
  range: null;
  versionChanged: boolean;
}

export interface OrphanedAnchor {
  status: "orphan";
  kind: AnchorPayload["t"];
  reason: "not-found";
  element: null;
  range: null;
}

export type ResolveAnchorResult =
  | ResolvedTextAnchor
  | ResolvedElementAnchor
  | ResolvedRegionAnchor
  | OrphanedAnchor;

const DATA_ANCHOR_ID_ATTR = "data-anchor-id";
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const SHOW_TEXT_FILTER = 4; // NodeFilter.SHOW_TEXT

interface TextSegment {
  node: Text;
  start: number;
  end: number;
}

interface TextIndex {
  fullText: string;
  segments: TextSegment[];
}

function collectTextIndex(container: Element): TextIndex {
  const doc = container.ownerDocument;
  const walker = doc.createTreeWalker(container, SHOW_TEXT_FILTER);
  const segments: TextSegment[] = [];
  const parts: string[] = [];
  let offset = 0;

  let current = walker.nextNode();
  while (current !== null) {
    if (current.nodeType === TEXT_NODE) {
      const textNode = current as Text;
      const text = textNode.data;
      if (text.length > 0) {
        segments.push({ node: textNode, start: offset, end: offset + text.length });
        parts.push(text);
        offset += text.length;
      }
    }
    current = walker.nextNode();
  }

  return { fullText: parts.join(""), segments };
}

function offsetsToRange(
  doc: Document,
  segments: readonly TextSegment[],
  startOffset: number,
  endOffset: number,
): Range | null {
  if (segments.length === 0 || endOffset <= startOffset) {
    return null;
  }

  let startNode: Text | null = null;
  let startLocal = 0;
  let endNode: Text | null = null;
  let endLocal = 0;

  for (const seg of segments) {
    if (startNode === null && startOffset >= seg.start && startOffset < seg.end) {
      startNode = seg.node;
      startLocal = startOffset - seg.start;
    }
    if (endOffset > seg.start && endOffset <= seg.end) {
      endNode = seg.node;
      endLocal = endOffset - seg.start;
      break;
    }
  }

  if (startNode === null || endNode === null) {
    return null;
  }

  const range = doc.createRange();
  range.setStart(startNode, startLocal);
  range.setEnd(endNode, endLocal);
  return range;
}

function closestElementInRoot(node: Node, root: Element): Element {
  let cur: Node | null = node;
  while (cur !== null) {
    if (cur.nodeType === ELEMENT_NODE && root.contains(cur)) {
      return cur as Element;
    }
    cur = cur.parentNode;
  }
  return root;
}

function findClosestAnchorId(node: Element, root: Element): string | undefined {
  let cur: Element | null = node;
  while (cur !== null && root.contains(cur)) {
    if (cur === root) break;
    const aid = cur.getAttribute(DATA_ANCHOR_ID_ATTR);
    if (typeof aid === "string" && aid.length > 0) {
      return aid;
    }
    cur = cur.parentElement;
  }
  return undefined;
}

function escapeTagName(localName: string): string {
  // Standard HTML/SVG tag names are ASCII identifiers; escape any unusual characters.
  return localName.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

/** Computes a compact CSS `nth-of-type` path from `root` down to `element`. */
function buildCssPath(root: Element, element: Element): string {
  if (element === root) {
    return ":scope";
  }

  const segments: string[] = [];
  let cur: Element | null = element;
  while (cur !== null && cur !== root) {
    const parent: Element | null = cur.parentElement;
    if (parent === null) break;
    const tag = cur.localName.toLowerCase();
    let index = 1;
    let sibling = cur.previousElementSibling;
    while (sibling !== null) {
      if (sibling.localName.toLowerCase() === tag) {
        index += 1;
      }
      sibling = sibling.previousElementSibling;
    }
    segments.push(`${escapeTagName(tag)}:nth-of-type(${index})`);
    cur = parent;
  }

  segments.reverse();
  return segments.join(" > ");
}

function findByAnchorId(root: Element, aid: string): Element | null {
  if (root.getAttribute(DATA_ANCHOR_ID_ATTR) === aid) {
    return root;
  }
  const candidates = root.querySelectorAll(`[${DATA_ANCHOR_ID_ATTR}]`);
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i]!;
    if (el.getAttribute(DATA_ANCHOR_ID_ATTR) === aid) {
      return el;
    }
  }
  return null;
}

function queryRelativeSelector(root: Element, selector: string): Element | null {
  if (selector === ":scope") {
    return root;
  }
  try {
    const scoped = root.querySelector(`:scope > ${selector}`);
    if (scoped !== null) return scoped;
  } catch {
    // Some selectors or environments may reject `:scope > ...`; fall back below.
  }
  try {
    return root.querySelector(selector);
  } catch {
    return null;
  }
}

function isSelectionLike(value: unknown): value is Selection {
  return (
    value !== null &&
    typeof value === "object" &&
    "rangeCount" in value &&
    typeof (value as Selection).getRangeAt === "function"
  );
}

function isRangeLike(value: unknown): value is Range {
  return (
    value !== null &&
    typeof value === "object" &&
    "startContainer" in value &&
    "endContainer" in value &&
    "collapsed" in value
  );
}

function isElementLike(value: unknown): value is Element {
  return (
    value !== null &&
    typeof value === "object" &&
    "nodeType" in value &&
    (value as Node).nodeType === ELEMENT_NODE
  );
}

function isRegionRectLike(value: unknown): value is RegionRect {
  if (value === null || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r["x"] === "number" &&
    typeof r["y"] === "number" &&
    typeof r["width"] === "number" &&
    typeof r["height"] === "number"
  );
}

function sliceTailCodePoints(text: string, maxLen: number): string {
  const cps = Array.from(text);
  if (cps.length <= maxLen) return text;
  return cps.slice(-maxLen).join("");
}

function sliceHeadCodePoints(text: string, maxLen: number): string {
  const cps = Array.from(text);
  if (cps.length <= maxLen) return text;
  return cps.slice(0, maxLen).join("");
}

/**
 * Captures a `TextAnchorPayload` (W3C TextQuoteSelector + offsets + CSS path + `aid` + `v`)
 * from a DOM `Selection` or `Range` inside `root`. Returns `null` when collapsed or outside `root`.
 */
export function createAnchorFromSelection(
  root: Element,
  selectionOrRange: Selection | Range,
  artifactVersion: string,
): TextAnchorPayload | null {
  if (typeof artifactVersion !== "string" || artifactVersion.length === 0) {
    throw new AnchorValidationError("artifactVersion must be a non-empty string.");
  }

  let range: Range;
  if (isSelectionLike(selectionOrRange)) {
    if (selectionOrRange.rangeCount === 0) return null;
    range = selectionOrRange.getRangeAt(0);
  } else {
    range = selectionOrRange;
  }

  if (range.collapsed || !root.contains(range.commonAncestorContainer)) {
    return null;
  }

  const exact = range.toString();
  if (exact.length === 0) {
    return null;
  }

  const doc = root.ownerDocument;
  const { fullText } = collectTextIndex(root);
  const preRange = doc.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  const end = start + exact.length;

  const prefix = sliceTailCodePoints(fullText.slice(0, start), MAX_QUOTE_CONTEXT_LENGTH);
  const suffix = sliceHeadCodePoints(fullText.slice(end), MAX_QUOTE_CONTEXT_LENGTH);

  const q: TextQuoteSelector = { exact };
  if (prefix.length > 0) q.prefix = prefix;
  if (suffix.length > 0) q.suffix = suffix;

  const enclosing = closestElementInRoot(range.commonAncestorContainer, root);
  const sel = enclosing !== root ? buildCssPath(root, enclosing) : undefined;
  const aid = findClosestAnchorId(enclosing, root);

  const payload: TextAnchorPayload = {
    t: "text",
    q,
    pos: { start, end },
    v: artifactVersion,
  };
  if (sel !== undefined && sel.length > 0) {
    payload.sel = sel;
  }
  if (aid !== undefined) {
    payload.aid = aid;
  }
  return payload;
}

/**
 * Captures an `ElementAnchorPayload` (`sel`, optional `aid` on the element itself, `v`)
 * for an element inside `root`. Returns `null` when `element` is outside `root`.
 */
export function createAnchorFromElement(
  root: Element,
  element: Element,
  artifactVersion: string,
): ElementAnchorPayload | null {
  if (typeof artifactVersion !== "string" || artifactVersion.length === 0) {
    throw new AnchorValidationError("artifactVersion must be a non-empty string.");
  }
  if (!root.contains(element)) {
    return null;
  }

  const sel = buildCssPath(root, element);
  const aid = element.getAttribute(DATA_ANCHOR_ID_ATTR);
  const payload: ElementAnchorPayload = {
    t: "element",
    sel,
    v: artifactVersion,
  };
  if (typeof aid === "string" && aid.length > 0) {
    payload.aid = aid;
  }
  return payload;
}

/** Captures a host-created `RegionAnchorPayload` with normalized `[0..1]` rect coordinates. */
export function createAnchorFromRegion(
  rect: RegionRect,
  artifactVersion: string,
): RegionAnchorPayload {
  if (typeof artifactVersion !== "string" || artifactVersion.length === 0) {
    throw new AnchorValidationError("artifactVersion must be a non-empty string.");
  }
  const { x, y, width, height } = rect;
  const eps = 1e-9;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    x < 0 ||
    y < 0 ||
    x > 1 ||
    y > 1 ||
    width <= 0 ||
    height <= 0 ||
    x + width > 1 + eps ||
    y + height > 1 + eps
  ) {
    throw new AnchorValidationError(
      "Region rect coordinates must be finite numbers in [0, 1] with positive width and height.",
    );
  }
  return {
    t: "region",
    rect: { x, y, width, height },
    v: artifactVersion,
  };
}

/** Unified anchor factory dispatching Selection/Range, Element, or RegionRect targets. */
export function createAnchor(
  root: Element,
  target: Selection | Range,
  artifactVersion: string,
): TextAnchorPayload | null;
export function createAnchor(
  root: Element,
  target: Element,
  artifactVersion: string,
): ElementAnchorPayload | null;
export function createAnchor(
  root: Element,
  target: RegionRect,
  artifactVersion: string,
): RegionAnchorPayload;
export function createAnchor(
  root: Element,
  target: Selection | Range | Element | RegionRect,
  artifactVersion: string,
): AnchorPayload | null;
export function createAnchor(
  root: Element,
  target: Selection | Range | Element | RegionRect,
  artifactVersion: string,
): AnchorPayload | null {
  if (isElementLike(target)) {
    return createAnchorFromElement(root, target, artifactVersion);
  }
  if (isSelectionLike(target) || isRangeLike(target)) {
    return createAnchorFromSelection(root, target, artifactVersion);
  }
  if (isRegionRectLike(target)) {
    return createAnchorFromRegion(target, artifactVersion);
  }
  return null;
}

// ── Text matching & fuzzy normalization ──

function matchingSuffixChars(haystackBefore: string, prefix: string): number {
  const max = Math.min(haystackBefore.length, prefix.length);
  let matched = 0;
  for (let i = 1; i <= max; i++) {
    if (haystackBefore.charCodeAt(haystackBefore.length - i) !== prefix.charCodeAt(prefix.length - i)) {
      break;
    }
    matched += 1;
  }
  return matched;
}

function matchingPrefixChars(haystackAfter: string, suffix: string): number {
  const max = Math.min(haystackAfter.length, suffix.length);
  let matched = 0;
  for (let i = 0; i < max; i++) {
    if (haystackAfter.charCodeAt(i) !== suffix.charCodeAt(i)) {
      break;
    }
    matched += 1;
  }
  return matched;
}

interface TextMatch {
  range: Range;
  element: Element;
}

function computeContainerOffsetInRoot(root: Element, container: Element): number {
  if (container === root) return 0;
  const doc = root.ownerDocument;
  const pre = doc.createRange();
  pre.selectNodeContents(root);
  pre.setEndBefore(container);
  return pre.toString().length;
}

function findExactQuoteIn(
  root: Element,
  container: Element,
  anchor: TextAnchorPayload,
): TextMatch | null {
  const { fullText, segments } = collectTextIndex(container);
  const needle = anchor.q.exact;
  if (needle.length === 0 || fullText.length === 0) {
    return null;
  }

  const occurrences: number[] = [];
  let cursor = 0;
  while (cursor <= fullText.length - needle.length) {
    const idx = fullText.indexOf(needle, cursor);
    if (idx === -1) break;
    occurrences.push(idx);
    cursor = idx + 1;
  }

  if (occurrences.length === 0) {
    return null;
  }

  const prefix = anchor.q.prefix ?? "";
  const suffix = anchor.q.suffix ?? "";
  const containerOffset = computeContainerOffsetInRoot(root, container);
  const targetPos = anchor.pos?.start;

  let bestIdx = occurrences[0]!;
  let bestScore = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const idx of occurrences) {
    let score = 0;
    if (prefix.length > 0) {
      score += matchingSuffixChars(fullText.slice(0, idx), prefix);
    }
    if (suffix.length > 0) {
      score += matchingPrefixChars(fullText.slice(idx + needle.length), suffix);
    }
    const distance =
      targetPos !== undefined ? Math.abs(containerOffset + idx - targetPos) : idx;

    if (score > bestScore || (score === bestScore && distance < bestDistance)) {
      bestScore = score;
      bestDistance = distance;
      bestIdx = idx;
    }
  }

  const range = offsetsToRange(
    container.ownerDocument,
    segments,
    bestIdx,
    bestIdx + needle.length,
  );
  if (range === null) return null;

  return {
    range,
    element: closestElementInRoot(range.commonAncestorContainer, root),
  };
}

interface NormalizedTextMap {
  normalized: string;
  rawStarts: number[];
  rawEnds: number[];
}

function normalizeFuzzyWithMap(raw: string): NormalizedTextMap {
  const chars: string[] = [];
  const rawStarts: number[] = [];
  const rawEnds: number[] = [];

  let i = 0;
  let pendingSpaceStart = -1;
  let pendingSpaceEnd = -1;

  while (i < raw.length) {
    const ch = raw[i]!;
    if (/\s/.test(ch)) {
      if (chars.length > 0) {
        if (pendingSpaceStart === -1) pendingSpaceStart = i;
        pendingSpaceEnd = i + 1;
      }
      i += 1;
      continue;
    }

    if (pendingSpaceStart !== -1) {
      chars.push(" ");
      rawStarts.push(pendingSpaceStart);
      rawEnds.push(pendingSpaceEnd);
      pendingSpaceStart = -1;
      pendingSpaceEnd = -1;
    }

    const lowered = ch.toLowerCase();
    for (let k = 0; k < lowered.length; k++) {
      chars.push(lowered[k]!);
      rawStarts.push(i);
      rawEnds.push(i + 1);
    }
    i += 1;
  }

  return {
    normalized: chars.join(""),
    rawStarts,
    rawEnds,
  };
}

function normalizeFuzzySimple(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function findFuzzyQuoteIn(
  root: Element,
  container: Element,
  anchor: TextAnchorPayload,
): TextMatch | null {
  const normNeedle = normalizeFuzzySimple(anchor.q.exact);
  if (normNeedle.length === 0) return null;

  const { fullText, segments } = collectTextIndex(container);
  if (fullText.length === 0) return null;

  const mapped = normalizeFuzzyWithMap(fullText);
  if (mapped.normalized.length < normNeedle.length) return null;

  const occurrences: number[] = [];
  let cursor = 0;
  while (cursor <= mapped.normalized.length - normNeedle.length) {
    const idx = mapped.normalized.indexOf(normNeedle, cursor);
    if (idx === -1) break;
    occurrences.push(idx);
    cursor = idx + 1;
  }

  if (occurrences.length === 0) return null;

  const normPrefix = anchor.q.prefix ? normalizeFuzzySimple(anchor.q.prefix) : "";
  const normSuffix = anchor.q.suffix ? normalizeFuzzySimple(anchor.q.suffix) : "";
  const containerOffset = computeContainerOffsetInRoot(root, container);
  const targetPos = anchor.pos?.start;

  let bestNormIdx = occurrences[0]!;
  let bestScore = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const normIdx of occurrences) {
    let score = 0;
    if (normPrefix.length > 0) {
      score += matchingSuffixChars(mapped.normalized.slice(0, normIdx).trimEnd(), normPrefix);
    }
    if (normSuffix.length > 0) {
      score += matchingPrefixChars(
        mapped.normalized.slice(normIdx + normNeedle.length).trimStart(),
        normSuffix,
      );
    }
    const rawStart = mapped.rawStarts[normIdx]!;
    const distance =
      targetPos !== undefined ? Math.abs(containerOffset + rawStart - targetPos) : rawStart;

    if (score > bestScore || (score === bestScore && distance < bestDistance)) {
      bestScore = score;
      bestDistance = distance;
      bestNormIdx = normIdx;
    }
  }

  const rawStart = mapped.rawStarts[bestNormIdx]!;
  const rawEnd = mapped.rawEnds[bestNormIdx + normNeedle.length - 1]!;
  const range = offsetsToRange(container.ownerDocument, segments, rawStart, rawEnd);
  if (range === null) return null;

  return {
    range,
    element: closestElementInRoot(range.commonAncestorContainer, root),
  };
}

/**
 * Re-attaches an `AnchorPayload` to the rendered artifact DOM under `root`
 * (SPEC-r6 §2):
 * 1. `aid` (`data-anchor-id`)
 * 2. `exact` + `prefix`/`suffix`, tie-broken by nearest `pos.start`
 * 3. `sel` (CSS `nth-of-type` path)
 * 4. whitespace/case-folded fuzzy `exact`
 * No match -> `{ status: "orphan" }`.
 * A version change alone never orphans, and the DOM is never mutated.
 */
export function resolveAnchor(
  root: Element,
  anchor: AnchorPayload,
  options?: ResolveAnchorOptions,
): ResolveAnchorResult {
  const versionChanged =
    options?.artifactVersion !== undefined && options.artifactVersion !== anchor.v;

  if (anchor.t === "region") {
    return {
      status: "resolved",
      kind: "region",
      strategy: "region",
      element: root,
      rect: { ...anchor.rect },
      range: null,
      versionChanged,
    };
  }

  if (anchor.t === "element") {
    if (anchor.aid !== undefined) {
      const aidEl = findByAnchorId(root, anchor.aid);
      if (aidEl !== null) {
        return {
          status: "resolved",
          kind: "element",
          strategy: "aid",
          element: aidEl,
          range: null,
          versionChanged,
        };
      }
    }

    const selEl = queryRelativeSelector(root, anchor.sel);
    if (selEl !== null) {
      return {
        status: "resolved",
        kind: "element",
        strategy: "selector",
        element: selEl,
        range: null,
        versionChanged,
      };
    }

    return {
      status: "orphan",
      kind: "element",
      reason: "not-found",
      element: null,
      range: null,
    };
  }

  // Text anchor resolution: 1) aid -> 2) exact quote -> 3) sel -> 4) fuzzy quote -> orphan
  let aidElement: Element | null = null;
  if (anchor.aid !== undefined) {
    aidElement = findByAnchorId(root, anchor.aid);
    if (aidElement !== null) {
      const exactInAid = findExactQuoteIn(root, aidElement, anchor);
      if (exactInAid !== null) {
        return {
          status: "resolved",
          kind: "text",
          strategy: "aid",
          element: exactInAid.element,
          range: exactInAid.range,
          versionChanged,
        };
      }
      const fuzzyInAid = findFuzzyQuoteIn(root, aidElement, anchor);
      if (fuzzyInAid !== null) {
        return {
          status: "resolved",
          kind: "text",
          strategy: "aid",
          element: fuzzyInAid.element,
          range: fuzzyInAid.range,
          versionChanged,
        };
      }
    }
  }

  // Step 2: exact quote + prefix/suffix, tie-break nearest pos.start
  const exactGlobal = findExactQuoteIn(root, root, anchor);
  if (exactGlobal !== null) {
    return {
      status: "resolved",
      kind: "text",
      strategy: "text-quote",
      element: exactGlobal.element,
      range: exactGlobal.range,
      versionChanged,
    };
  }

  // Step 3: CSS path `sel` (scoped fuzzy match prevents mis-attaching a deleted paragraph onto a shifted sibling)
  if (anchor.sel !== undefined) {
    const selEl = queryRelativeSelector(root, anchor.sel);
    if (selEl !== null) {
      const fuzzyInSel = findFuzzyQuoteIn(root, selEl, anchor);
      if (fuzzyInSel !== null) {
        return {
          status: "resolved",
          kind: "text",
          strategy: "selector",
          element: fuzzyInSel.element,
          range: fuzzyInSel.range,
          versionChanged,
        };
      }
    }
  }

  // Step 4: whitespace/case-folded fuzzy quote across root
  const fuzzyGlobal = findFuzzyQuoteIn(root, root, anchor);
  if (fuzzyGlobal !== null) {
    return {
      status: "resolved",
      kind: "text",
      strategy: "fuzzy-quote",
      element: fuzzyGlobal.element,
      range: fuzzyGlobal.range,
      versionChanged,
    };
  }

  // After Steps 1-4 fail to find the quote anywhere in root: if an explicit descendant
  // `data-anchor-id` block still exists (never `root` itself), keep it attached to that block.
  if (aidElement !== null && aidElement !== root) {
    return {
      status: "resolved",
      kind: "text",
      strategy: "aid",
      element: aidElement,
      range: null,
      versionChanged,
    };
  }

  return {
    status: "orphan",
    kind: "text",
    reason: "not-found",
    element: null,
    range: null,
  };
}
