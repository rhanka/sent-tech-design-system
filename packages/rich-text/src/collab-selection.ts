// Selection map between ProseMirror positions and linear Y.Text offsets,
// with Y.RelativePosition JSON publication (spec §4.3.1 item 3, §5.1.1,
// §5.2 R-ANCH-2). No numeric offsets on the wire: publication carries only
// `Y.relativePositionToJSON` objects (module function — the pinned
// `RelativePosition` class exposes no instance `.toJSON()`).

import * as Y from "yjs";
import {
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
  createRelativePositionFromTypeIndex,
  relativePositionToJSON,
} from "yjs";
import type { RelativeAnchor } from "./collaboration.js";

/** One text block of the bidirectional map. */
export interface SelectionMapBlock {
  paragraphId: string;
  /** Linear index of the opening separator embed. */
  separatorIndex: number;
  /** Linear range of the block content (after the separator, before the
      next separator or the field end). Counts text UTF-16 units plus one
      per hard-break embed. */
  contentStart: number;
  contentEnd: number;
  /** ProseMirror inline range of the same content. Counts text UTF-16 units
      plus one per hard-break node (code LF counts one as well). */
  pmInlineStart: number;
  pmInlineEnd: number;
}

/** Bidirectional map for one field projection. */
export interface SelectionMap {
  blocks: SelectionMapBlock[];
  /** Linear length of the whole field (separators + content). */
  linearLength: number;
  /** ProseMirror document size of the projected document. */
  pmSize: number;
}

/**
 * Mint an opaque anchor string at a linear index (spec R-ANCH-2). Interior
 * positions use `assoc >= 0` (associated to the item after the position);
 * callers minting the end of the field pass `assoc < 0` so the anchor binds
 * to the previously last item and later appends land after it.
 */
export function mintAnchorAt(ytext: Y.Text, index: number, assoc = 0): RelativeAnchor {
  const rpos = createRelativePositionFromTypeIndex(ytext, index, assoc);
  return JSON.stringify(relativePositionToJSON(rpos)) as RelativeAnchor;
}

/** Mint the end-of-field anchor with `assoc < 0` (spec R-ANCH-2, F1). */
export function mintEndOfFieldAnchor(ytext: Y.Text, endIndex: number): RelativeAnchor {
  return mintAnchorAt(ytext, endIndex, -1);
}

/** Parse an anchor string back to a relative position (throws when malformed). */
function parseAnchor(anchor: RelativeAnchor): ReturnType<typeof createRelativePositionFromJSON> {
  const json = JSON.parse(anchor) as Parameters<typeof createRelativePositionFromJSON>[0];
  return createRelativePositionFromJSON(json);
}

/**
 * Resolve an anchor to a linear index, or null when the target is gone
 * (spec R-ANCH-5: resolution returns null only then; callers render no
 * caret for that actor).
 */
export function tryResolveAnchorToLinear(ytext: Y.Text, anchor: RelativeAnchor): number | null {
  let rpos: ReturnType<typeof createRelativePositionFromJSON>;
  try {
    rpos = parseAnchor(anchor);
  } catch {
    return null;
  }
  const doc = ytext.doc;
  if (doc === null) return null;
  const absolute = createAbsolutePositionFromRelativePosition(rpos, doc);
  if (absolute === null || absolute === undefined) return null;
  if (absolute.type !== ytext) return null;
  return absolute.index;
}

/** Resolve an anchor, throwing when the target is gone. */
export function resolveAnchorToLinear(ytext: Y.Text, anchor: RelativeAnchor): number {
  const resolved = tryResolveAnchorToLinear(ytext, anchor);
  if (resolved === null) {
    throw new Error("rich-text.anchor-gone: relative anchor does not resolve (R-ANCH-5)");
  }
  return resolved;
}

/** Insert text at the position an anchor resolves to (association kept). */
export function insertThroughAnchor(ytext: Y.Text, anchor: RelativeAnchor, text: string): number {
  const index = resolveAnchorToLinear(ytext, anchor);
  ytext.doc?.transact(() => {
    ytext.insert(index, text);
  });
  return index;
}

/** Map a linear index to the containing block (affinity: separators belong
    to the block they open, except index 0 which is the first separator). */
export function linearToBlock(map: SelectionMap, index: number): SelectionMapBlock | null {
  const clamped = Math.max(0, Math.min(index, map.linearLength));
  for (const block of map.blocks) {
    if (clamped === block.separatorIndex) return block;
    if (clamped >= block.contentStart && clamped <= block.contentEnd) return block;
  }
  return map.blocks[map.blocks.length - 1] ?? null;
}

/** Linear index → ProseMirror inline position through the map. */
export function linearToPmPosition(map: SelectionMap, index: number): number {
  const block = linearToBlock(map, index);
  if (block === null) return 0;
  if (index <= block.separatorIndex) return block.pmInlineStart;
  const intra = Math.max(0, Math.min(index - block.contentStart, block.contentEnd - block.contentStart));
  return block.pmInlineStart + intra;
}

/** ProseMirror inline position → linear index through the map. */
export function pmPositionToLinear(map: SelectionMap, pmPos: number): number {
  for (const block of map.blocks) {
    if (pmPos <= block.pmInlineStart) return block.contentStart;
    if (pmPos >= block.pmInlineEnd) {
      const next = map.blocks[map.blocks.indexOf(block) + 1];
      if (next !== undefined && pmPos < next.pmInlineStart) return block.contentEnd;
      if (next === undefined) return block.contentEnd;
      continue;
    }
    return block.contentStart + (pmPos - block.pmInlineStart);
  }
  const last = map.blocks[map.blocks.length - 1];
  return last !== undefined ? last.contentEnd : 0;
}

/** Wire cursor shape published on awareness (spec §5.1.1: JSON objects). */
export interface PublishedCursor {
  fieldKey: string;
  anchor: ReturnType<typeof relativePositionToJSON>;
  head: ReturnType<typeof relativePositionToJSON>;
}

/**
 * Publish a local ProseMirror selection as relative-position JSON
 * (spec §5.1.1 publisher): the end-of-field position uses `assoc < 0`.
 */
export function selectionToCursorJson(
  ytext: Y.Text,
  fieldKey: string,
  map: SelectionMap,
  pmAnchor: number,
  pmHead: number,
): PublishedCursor {
  const linearAnchor = pmPositionToLinear(map, pmAnchor);
  const linearHead = pmPositionToLinear(map, pmHead);
  const assocFor = (linear: number): number => (linear >= map.linearLength ? -1 : 0);
  const anchor = relativePositionToJSON(
    createRelativePositionFromTypeIndex(ytext, linearAnchor, assocFor(linearAnchor)),
  );
  const head = relativePositionToJSON(
    createRelativePositionFromTypeIndex(ytext, linearHead, assocFor(linearHead)),
  );
  return { fieldKey, anchor, head };
}

/**
 * Resolve a published cursor back to ProseMirror positions (spec §5.1.1
 * renderer): null when either end is gone (R-ANCH-5); otherwise clamped to
 * the nearest valid inline position when the exact item was deleted.
 */
export function cursorJsonToSelection(
  ytext: Y.Text,
  map: SelectionMap,
  cursor: PublishedCursor,
): { anchor: number; head: number } | null {
  const doc = ytext.doc;
  if (doc === null) return null;
  const resolveEnd = (end: PublishedCursor["anchor"]): number | null => {
    const rpos = createRelativePositionFromJSON(end as never);
    const absolute = createAbsolutePositionFromRelativePosition(rpos, doc);
    if (absolute === null || absolute === undefined) return null;
    if (absolute.type !== ytext) return null;
    const clamped = Math.max(0, Math.min(absolute.index, map.linearLength));
    return linearToPmPosition(map, clamped);
  };
  const anchor = resolveEnd(cursor.anchor);
  const head = resolveEnd(cursor.head);
  if (anchor === null || head === null) return null;
  return { anchor, head };
}
