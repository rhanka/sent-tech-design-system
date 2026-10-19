/**
 * Pure document logic: equality, the §5.6 external-update decision table and
 * capture/readiness state. Spec §5.6, §12 (new `document.test.ts` on ".").
 * Environment: J. No editor import: every assertion here runs against the
 * pure entry only.
 *
 * Observable assertions: value equality over the §5.6 significant fields
 * (never a diff); the decision function returns exactly one of echo / defer
 * / conflict / apply in rule order; the capture tracker resolves immediately
 * when ready, defers during composition and settles once, and rejects pending
 * captures once on destroy with the neutral capture error.
 */
import { describe, it, expect } from "vitest";
import {
  copyRichTextCaptureResult,
  copyRichTextDocument,
  createCaptureTracker,
  decideExternalUpdate,
  isRepresentableWire,
  richTextDocumentsEqual,
} from "./document.js";
import {
  RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE,
  RICH_TEXT_CAPTURE_UNAVAILABLE_NAME,
} from "./model.js";
import type {
  RichTextBlock,
  RichTextCaptureResult,
  RichTextDocument,
} from "./model.js";

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function preserved(id: string, raw: string, kind: string): RichTextBlock {
  return { paragraphId: id, kind: "preserved", raw, preservedKind: kind };
}

function documentOf(blocks: RichTextBlock[]): RichTextDocument {
  return { format: "focus.markdown.p0@1", blocks };
}

const BASE = documentOf([
  paragraph("paragraph:a", "Alpha"),
  preserved("paragraph:k", "| a |\n| - |\n| 1 |", "table"),
]);

describe("document equality (§5.6 significant fields)", () => {
  it("an identical value copy is equal", () => {
    expect(richTextDocumentsEqual(BASE, copyRichTextDocument(BASE))).toBe(true);
  });

  it("a format difference alone is a real difference, never an echo", () => {
    const other: RichTextDocument = {
      format: "text/plain",
      blocks: BASE.blocks,
    };
    expect(richTextDocumentsEqual(BASE, other)).toBe(false);
  });

  it("a kind difference alone is a real difference", () => {
    const other = documentOf([
      { paragraphId: "paragraph:a", kind: "preserved", raw: "Alpha", preservedKind: "table" },
      preserved("paragraph:k", "| a |\n| - |\n| 1 |", "table"),
    ]);
    expect(richTextDocumentsEqual(BASE, other)).toBe(false);
  });

  it("a raw difference in one preserved block alone is a real difference", () => {
    const other = documentOf([
      paragraph("paragraph:a", "Alpha"),
      preserved("paragraph:k", "| a |\n| - |\n| 2 |", "table"),
    ]);
    expect(richTextDocumentsEqual(BASE, other)).toBe(false);
  });

  it("a preservedKind difference alone is a real difference", () => {
    const other = documentOf([
      paragraph("paragraph:a", "Alpha"),
      preserved("paragraph:k", "| a |\n| - |\n| 1 |", "list"),
    ]);
    expect(richTextDocumentsEqual(BASE, other)).toBe(false);
  });

  it("block order and length matter", () => {
    const reordered = documentOf([...BASE.blocks].reverse());
    expect(richTextDocumentsEqual(BASE, reordered)).toBe(false);
    const shorter = documentOf([paragraph("paragraph:a", "Alpha")]);
    expect(richTextDocumentsEqual(BASE, shorter)).toBe(false);
  });

  it("absent equals absent, but absent never equals a present value", () => {
    const withoutText = documentOf([
      { paragraphId: "paragraph:a", kind: "paragraph" },
    ]);
    const alsoWithout = documentOf([
      { paragraphId: "paragraph:a", kind: "paragraph" },
    ]);
    expect(richTextDocumentsEqual(withoutText, alsoWithout)).toBe(true);
    const withEmpty = documentOf([paragraph("paragraph:a", "")]);
    expect(richTextDocumentsEqual(withoutText, withEmpty)).toBe(false);
  });
});

describe("exact-key document copy", () => {
  it("copies carry only the significant keys and share no reference", () => {
    const copy = copyRichTextDocument(BASE);
    expect(copy).toEqual(BASE);
    expect(copy).not.toBe(BASE);
    expect(copy.blocks).not.toBe(BASE.blocks);
    expect(Object.keys(copy.blocks[0] as object).sort()).toEqual([
      "kind",
      "paragraphId",
      "text",
    ]);
    expect(Object.keys(copy.blocks[1] as object).sort()).toEqual([
      "kind",
      "paragraphId",
      "preservedKind",
      "raw",
    ]);
  });

  it("absent stays absent in the copy", () => {
    const source = documentOf([
      { paragraphId: "paragraph:a", kind: "paragraph" },
    ]);
    const copy = copyRichTextDocument(source);
    expect("text" in (copy.blocks[0] as object)).toBe(false);
    expect(richTextDocumentsEqual(source, copy)).toBe(true);
  });
});

describe("external-update decision table (§5.6 rule order)", () => {
  const displayed = documentOf([paragraph("paragraph:a", "Alpha plus local")]);
  const acknowledged = documentOf([paragraph("paragraph:a", "Alpha")]);

  it("rule 1 — an incoming document equal to the displayed one is an echo", () => {
    expect(
      decideExternalUpdate({
        displayed,
        lastAcknowledged: acknowledged,
        incoming: copyRichTextDocument(displayed),
        composing: false,
        hasUnacknowledgedLocalRevision: true,
      }),
    ).toBe("echo");
  });

  it("rule 1 wins even mid-composition", () => {
    expect(
      decideExternalUpdate({
        displayed,
        lastAcknowledged: acknowledged,
        incoming: copyRichTextDocument(displayed),
        composing: true,
        hasUnacknowledgedLocalRevision: true,
      }),
    ).toBe("echo");
  });

  it("rule 2 — a differing update mid-composition is deferred", () => {
    expect(
      decideExternalUpdate({
        displayed,
        lastAcknowledged: copyRichTextDocument(displayed),
        incoming: documentOf([paragraph("paragraph:a", "Remote")]),
        composing: true,
        hasUnacknowledgedLocalRevision: false,
      }),
    ).toBe("defer");
  });

  it("rule 3 — a differing update over locally divergent work is a conflict", () => {
    expect(
      decideExternalUpdate({
        displayed,
        lastAcknowledged: acknowledged,
        incoming: documentOf([paragraph("paragraph:a", "Remote")]),
        composing: false,
        hasUnacknowledgedLocalRevision: true,
      }),
    ).toBe("conflict");
  });

  it("rule 3 — the revision flag alone forces a conflict on a wire-identical draft", () => {
    // §5.6 serialisation-equal witness: displayed equals acknowledged wire
    // for wire purposes, yet the flag records the unacknowledged revision.
    const wireIdentical = copyRichTextDocument(acknowledged);
    expect(
      decideExternalUpdate({
        displayed: wireIdentical,
        lastAcknowledged: acknowledged,
        incoming: documentOf([paragraph("paragraph:a", "Remote")]),
        composing: false,
        hasUnacknowledgedLocalRevision: true,
      }),
    ).toBe("conflict");
  });

  it("rule 4 — a differing update with no local divergence applies", () => {
    expect(
      decideExternalUpdate({
        displayed: copyRichTextDocument(acknowledged),
        lastAcknowledged: acknowledged,
        incoming: documentOf([paragraph("paragraph:a", "Remote")]),
        composing: false,
        hasUnacknowledgedLocalRevision: false,
      }),
    ).toBe("apply");
  });

  it("a raw-only change in a preserved block is not an echo", () => {
    const withRaw = documentOf([
      paragraph("paragraph:a", "Alpha"),
      preserved("paragraph:k", "| a |\n| - |\n| 9 |", "table"),
    ]);
    expect(
      decideExternalUpdate({
        displayed: BASE,
        lastAcknowledged: BASE,
        incoming: withRaw,
        composing: false,
        hasUnacknowledgedLocalRevision: false,
      }),
    ).toBe("apply");
  });
});

describe("capture/readiness pure state", () => {
  const BASE_RESULT: RichTextCaptureResult = {
    document: BASE,
    representability: { nonRepresentableParagraphIds: [] },
  };
  const current = (): RichTextCaptureResult =>
    copyRichTextCaptureResult(BASE_RESULT);

  it("readiness is ready when idle", () => {
    const tracker = createCaptureTracker();
    expect(tracker.readiness()).toEqual({ composing: false, ready: true });
  });

  it("capture resolves immediately with a copy when ready", async () => {
    const tracker = createCaptureTracker();
    const settled = await tracker.capture(current);
    expect(settled).toEqual(BASE_RESULT);
    expect(settled).not.toBe(BASE_RESULT);
    expect(settled.document).not.toBe(BASE);
  });

  it("capture waits mid-composition and settles once with the commit", async () => {
    const seen: { composing: boolean; ready: boolean }[] = [];
    const tracker = createCaptureTracker({
      onReadinessChange: (readiness) => {
        seen.push({ ...readiness });
      },
    });
    tracker.setComposing(true, current);
    expect(tracker.readiness()).toEqual({ composing: true, ready: false });
    let settled: RichTextCaptureResult | null = null;
    const pending = tracker.capture(current).then((result) => {
      settled = result;
    });
    expect(tracker.pendingCount).toBe(1);
    expect(settled).toBe(null);
    const committed: RichTextCaptureResult = {
      document: documentOf([paragraph("paragraph:a", "Composed")]),
      representability: { nonRepresentableParagraphIds: [] },
    };
    tracker.setComposing(false, () => committed);
    await pending;
    expect(settled).toEqual(committed);
    expect(seen).toEqual([
      { composing: true, ready: false },
      { composing: false, ready: true },
    ]);
  });

  it("destroy rejects a pending capture once with the neutral error", async () => {
    const tracker = createCaptureTracker();
    tracker.setComposing(true, current);
    const pending = tracker.capture(current);
    const failure = pending.then(
      () => {
        throw new Error("a pending capture must never resolve at destroy");
      },
      (error: Error) => error,
    );
    tracker.destroy();
    const error = await failure;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(RICH_TEXT_CAPTURE_UNAVAILABLE_NAME);
    expect(error.message).toBe(RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE);
    expect(tracker.pendingCount).toBe(0);
    expect(tracker.readiness()).toEqual({ composing: false, ready: false });
  });

  it("capture after destroy rejects with the same neutral error, never throwing synchronously", async () => {
    const tracker = createCaptureTracker();
    tracker.destroy();
    const error = await tracker.capture(current).then(
      () => {
        throw new Error("capture after destroy must reject");
      },
      (rejection: Error) => rejection,
    );
    expect(error.name).toBe(RICH_TEXT_CAPTURE_UNAVAILABLE_NAME);
    expect(error.message).toBe(RICH_TEXT_CAPTURE_UNAVAILABLE_MESSAGE);
  });
});

describe("pinned single-segment criterion vectors (§6.6 condition 2)", () => {
  it("the local check matches every recorded pinned verdict with provenance", async () => {
    const { readFileSync } = await import("node:fs");
    const { dirname, join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const here = dirname(fileURLToPath(import.meta.url));
    const record = JSON.parse(
      readFileSync(
        join(here, "../tests/fixtures/representability-vectors.json"),
        "utf8",
      ),
    ) as {
      provenance: Record<string, unknown>;
      vectors: {
        id: string;
        text: string;
        plain: boolean;
        markdown: boolean;
      }[];
    };
    expect(record.provenance["h2aCommit"]).toBe("98060bd0a");
    expect(record.provenance["h2aSourcePath"]).toBe(
      "packages/focus/src/editing/codec.ts",
    );
    expect(record.provenance["codecSha256"]).toBe(
      "ac936183aa96935b23ca621c5c0fe2502db70fa05dd28c1560d16b00d7a483a5",
    );
    expect(record.vectors.length).toBeGreaterThan(20);
    for (const vector of record.vectors) {
      expect(
        isRepresentableWire(vector.text, "text/plain"),
        `plain vector ${vector.id}`,
      ).toBe(vector.plain);
      expect(
        isRepresentableWire(vector.text, "focus.markdown.p0@1"),
        `markdown vector ${vector.id}`,
      ).toBe(vector.markdown);
    }
  });
});
