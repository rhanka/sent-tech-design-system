/**
 * Lot CV-A (Option A) pinning witnesses — shipped-codec field validity
 * posture (spec §4.11 amendment, R-FULL-OP-1, R-LIN-7).
 *
 * The shipped `validateFieldState` tolerates two resulting states that the
 * test-only bridge double refuses as `setBlockMetadata` operations: a
 * metadata entry keyed by a live preserved block, and a wrapper-only record
 * (`blockKind` absent) stored on a text paragraph. These witnesses pin the
 * permissive posture with `seedFieldFromDocument`, direct `fieldMeta`
 * writes and `captureDocumentFromField`:
 *
 * 1. A well-formed entry keyed by a live preserved block: capture succeeds,
 *    the preserved block emits `raw` and `preservedKind` only, and the entry
 *    does not appear in the captured document.
 * 2. A wrapper-only record on a live text paragraph: capture succeeds and
 *    clones the record verbatim as that block's `metadata`.
 * 3. Reseed the capture of witness 2 into a fresh field: capture again
 *    succeeds and deep-equals the first capture.
 *
 * Each witness turns RED if the corresponding reverted CL-4e refusal is
 * reintroduced in `validateFieldState` (mutation check, not part of this
 * file). No shipped code is changed by this lot.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import {
  canonicalHrDefaults,
  canonicalPlainMetadata,
} from "./editor-full-markdown.js";
import type { FullBlockMetadata } from "./collaboration.js";
import type { RichTextDocument } from "./model.js";

const FIELD = "body";
const FULL = "ds.markdown.full@1" as const;
const RAW_TABLE = "<table>  spaced  </table>";

function fullPara(id: string, text: string): RichTextBlockSeed {
  return {
    paragraphId: id,
    kind: "paragraph",
    metadata: canonicalPlainMetadata(),
    segments: [{ type: "text", text, marks: {} }],
  };
}

interface RichTextBlockSeed {
  paragraphId: string;
  kind: "paragraph" | "preserved";
  metadata?: FullBlockMetadata;
  segments?: Array<{ type: "text"; text: string; marks: Record<string, never> }>;
  raw?: string;
  preservedKind?: string;
}

function freshField(): { ydoc: Y.Doc; ytext: Y.Text; meta: Y.Map<unknown> } {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText(fieldTextName(FIELD));
  const meta = ydoc.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
  return { ydoc, ytext, meta };
}

describe("CV-A shipped-codec validity posture pins", () => {
  it("preserved-keyed metadata entry is ignored at capture", () => {
    const { ydoc, ytext, meta } = freshField();
    seedFieldFromDocument(ytext, meta, FIELD, {
      format: FULL,
      blocks: [
        fullPara("p:1", "alpha"),
        {
          paragraphId: "k:table",
          kind: "preserved",
          raw: RAW_TABLE,
          preservedKind: "table",
        },
        fullPara("p:2", "beta"),
      ],
    } as unknown as RichTextDocument);
    // A well-formed record keyed by the live preserved block: a shape that
    // can only arrive through a live Y.Doc, never from persisted JSON.
    ydoc.transact(() => {
      meta.set("k:table", canonicalPlainMetadata());
    });

    const { document } = captureDocumentFromField(ytext, meta, FULL);

    expect(document.blocks).toHaveLength(3);
    const preserved = document.blocks[1] as unknown as Record<string, unknown>;
    expect(preserved["kind"]).toBe("preserved");
    expect(preserved["raw"]).toBe(RAW_TABLE);
    expect(preserved["preservedKind"]).toBe("table");
    expect("metadata" in preserved).toBe(false);
    expect("hrMetadata" in preserved).toBe(false);
  });

  it("wrapper-only paragraph record is cloned verbatim at capture", () => {
    const { ydoc, ytext, meta } = freshField();
    seedFieldFromDocument(ytext, meta, FIELD, {
      format: FULL,
      blocks: [fullPara("p:1", "alpha")],
    } as unknown as RichTextDocument);
    const wrapperOnly = canonicalHrDefaults();
    expect("blockKind" in wrapperOnly).toBe(false);
    ydoc.transact(() => {
      meta.set("p:1", structuredClone(wrapperOnly));
    });

    const { document } = captureDocumentFromField(ytext, meta, FULL);

    expect(document.blocks).toHaveLength(1);
    const metadata = (
      document.blocks[0] as unknown as { metadata: FullBlockMetadata }
    ).metadata;
    expect(metadata).toEqual(wrapperOnly);
    expect("blockKind" in (metadata as Record<string, unknown>)).toBe(false);
  });

  it("reseed round-trip of a wrapper-only paragraph capture is deep-equal", () => {
    const first = freshField();
    seedFieldFromDocument(first.ytext, first.meta, FIELD, {
      format: FULL,
      blocks: [fullPara("p:1", "alpha")],
    } as unknown as RichTextDocument);
    const wrapperOnly = canonicalHrDefaults();
    first.ydoc.transact(() => {
      first.meta.set("p:1", structuredClone(wrapperOnly));
    });
    const before = captureDocumentFromField(
      first.ytext,
      first.meta,
      FULL,
    ).document;

    const second = freshField();
    seedFieldFromDocument(second.ytext, second.meta, FIELD, before);
    const after = captureDocumentFromField(
      second.ytext,
      second.meta,
      FULL,
    ).document;

    expect(after).toEqual(before);
  });
});
