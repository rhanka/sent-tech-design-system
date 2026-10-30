/**
 * Composition, capture and external updates (finding 3, spec §5.6).
 * Environment: J.
 *
 * The editor hooks `compositionstart`/`compositionend` explicitly, through
 * the view's `composing` state plus DOM events on the mount element:
 * - `readiness()` turns false at start;
 * - no `type` event fires mid-composition;
 * - exactly one `composition-commit` fires after the commit;
 * - a deferred external update is re-evaluated first, then pending captures
 *   resolve with the committed document.
 *
 * The jsdom tests below simulate composition through view-level composition
 * events dispatched on the live ProseMirror view DOM, with the committed
 * text applied as a real ProseMirror transaction between them. A real IME
 * (CDP `Input.imeSetComposition`, accented and emoji sequences) is not
 * covered here: that witness stays in RT-1
 * (`not covered (RT-1 browser witness)`).
 *
 * Tiptap entry: `createRichTextEditor` from `./editor.js`. No case is
 * skipped.
 */
import { describe, it, expect } from "vitest";
import { createRichTextEditor } from "./editor.js";
import type { RichTextEditor } from "./editor.js";
import type {
  RichTextBlock,
  RichTextChangeEvent,
  RichTextDocument,
  RichTextExternalConflictEvent,
  RichTextReadiness,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

function paragraph(id: string, text: string): RichTextBlock {
  return { paragraphId: id, kind: "paragraph", text };
}

function setup() {
  const changes: RichTextChangeEvent[] = [];
  const conflicts: RichTextExternalConflictEvent[] = [];
  const readinessLog: RichTextReadiness[] = [];
  const element = document.createElement("div");
  document.body.appendChild(element);
  const editor: RichTextEditor = createRichTextEditor({
    document: {
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "Alpha")],
    },
    messages: MESSAGES,
    allocateId: (() => {
      let n = 0;
      return () => `paragraph:composition-${++n}`;
    })(),
    element,
    onChange: (event) => {
      changes.push(event);
    },
    onExternalConflict: (event) => {
      conflicts.push(event);
    },
    onReadinessChange: (event) => {
      readinessLog.push({ ...event });
    },
  });
  const viewDom =
    (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
  const teardown = (): void => {
    editor.destroy();
    element.remove();
  };
  return { editor, changes, conflicts, readinessLog, viewDom, teardown };
}

function beginComposition(viewDom: HTMLElement): void {
  viewDom.dispatchEvent(
    new CompositionEvent("compositionstart", { bubbles: true }),
  );
}

function endComposition(viewDom: HTMLElement): void {
  viewDom.dispatchEvent(
    new CompositionEvent("compositionend", { bubbles: true }),
  );
}

describe("composition start", () => {
  it("readiness turns false at start", () => {
    const { editor, readinessLog, viewDom, teardown } = setup();
    expect(editor.readiness()).toEqual({ composing: false, ready: true });
    beginComposition(viewDom);
    expect(editor.readiness()).toEqual({ composing: true, ready: false });
    expect(readinessLog).toEqual([{ composing: true, ready: false }]);
    endComposition(viewDom);
    teardown();
  });
});

describe("mid-composition behaviour", () => {
  it("no type event fires mid-composition", () => {
    const { editor, changes, viewDom, teardown } = setup();
    beginComposition(viewDom);
    editor.typeText("paragraph:1", " mid");
    editor.typeText("paragraph:1", " plus");
    expect(changes).toHaveLength(0);
    expect(editor.readiness().ready).toBe(false);
    endComposition(viewDom);
    teardown();
  });

  it("a capture created mid-composition stays pending until the commit", async () => {
    const { editor, viewDom, teardown } = setup();
    beginComposition(viewDom);
    editor.typeText("paragraph:1", " composed");
    let settled: RichTextDocument | null = null;
    const pending = editor.captureDocument().then((result) => {
      settled = result.document;
    });
    // Let the microtask queue flush: a mid-composition capture must still be
    // pending (never resolved with the pre-composition document).
    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(null);
    endComposition(viewDom);
    await pending;
    expect(settled?.blocks[0]?.text).toBe("Alpha composed");
    teardown();
  });
});

describe("composition end flushes the pending DOM mutation first (R2)", () => {
  it("a pending DOM mutation commits once, then the external update is re-evaluated, then captures resolve", async () => {
    const order: string[] = [];
    const changes: RichTextChangeEvent[] = [];
    const conflicts: RichTextExternalConflictEvent[] = [];
    const element = document.createElement("div");
    document.body.appendChild(element);
    let n = 0;
    const editor = createRichTextEditor({
      document: {
        format: "focus.markdown.p0@1",
        blocks: [paragraph("paragraph:1", "Alpha")],
      },
      messages: MESSAGES,
      allocateId: () => `paragraph:r2-${++n}`,
      element,
      onChange: (event) => {
        order.push("change");
        changes.push(event);
      },
      onExternalConflict: (event) => {
        order.push("conflict");
        conflicts.push(event);
      },
    });
    const viewDom =
      (element.querySelector(".ProseMirror") as HTMLElement | null) ?? element;
    const teardown = (): void => {
      editor.destroy();
      element.remove();
    };
    beginComposition(viewDom);
    // Pending DOM mutation: the composed text sits in the DOM, ProseMirror
    // has not flushed its observer yet (no transaction dispatched).
    const domParagraph = viewDom.querySelector("p");
    const textNode = domParagraph?.firstChild;
    expect(textNode?.nodeType).toBe(3);
    if (textNode) textNode.nodeValue = "Alphaé";
    // A deferred external update while composing: neither applied nor
    // signalled yet.
    editor.applyExternalUpdate({
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "Remote")],
    });
    expect(conflicts).toHaveLength(0);
    let settled: RichTextDocument | null = null;
    const pending = editor.captureDocument().then((result) => {
      settled = result.document;
    });
    await Promise.resolve();
    expect(settled).toBe(null);
    // End of composition before any flush: the handler flushes the DOM
    // observer itself, so the commit carries the composed text.
    endComposition(viewDom);
    await pending;
    // Exactly one `composition-commit` with the composed text — never a
    // stale `Alpha` capture and never a trailing `type`.
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("composition-commit");
    expect(changes[0]?.document.blocks[0]?.text).toBe("Alphaé");
    // §5.6 order: the commit first, then the external re-evaluation (the
    // committed work conflicts with the remote update), then the captures
    // resolve with the committed document.
    expect(order).toEqual(["change", "conflict"]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.local.blocks[0]?.text).toBe("Alphaé");
    expect(settled).toEqual(changes[0]?.document);
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(changes).toHaveLength(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("Alphaé");
    teardown();
  });
});

describe("composition commit", () => {
  it("exactly one composition-commit fires after the commit", () => {
    const { editor, changes, readinessLog, viewDom, teardown } = setup();
    beginComposition(viewDom);
    editor.typeText("paragraph:1", " composed");
    expect(changes).toHaveLength(0);
    endComposition(viewDom);
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("composition-commit");
    expect(changes[0]?.document.blocks).toEqual([
      paragraph("paragraph:1", "Alpha composed"),
    ]);
    expect(editor.getDocument()).toEqual(changes[0]?.document);
    expect(readinessLog).toEqual([
      { composing: true, ready: false },
      { composing: false, ready: true },
    ]);
    teardown();
  });

  it("an external update is re-evaluated first, then captures resolve with the commit", async () => {
    const { editor, changes, conflicts, viewDom, teardown } = setup();
    beginComposition(viewDom);
    editor.typeText("paragraph:1", " composed");
    const remote: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:1", "Remote")],
    };
    // Local divergence plus composition: the update defers with no signal.
    editor.applyExternalUpdate(remote);
    expect(conflicts).toHaveLength(0);
    expect(changes).toHaveLength(0);
    let settled: RichTextDocument | null = null;
    const pending = editor.captureDocument().then((result) => {
      settled = result.document;
    });
    await Promise.resolve();
    expect(settled).toBe(null);
    endComposition(viewDom);
    await pending;
    // Re-evaluation first: the committed local work conflicts with the
    // remote update, so exactly one conflict fires and the local draft is
    // untouched. Captures resolve after, with the committed document —
    // equal to the commit `onChange` document, exactly once.
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.local.blocks[0]?.text).toBe("Alpha composed");
    expect(changes).toHaveLength(1);
    expect(changes[0]?.gesture.kind).toBe("composition-commit");
    expect(settled).toEqual(changes[0]?.document);
    expect(settled?.blocks[0]?.text).toBe("Alpha composed");
    teardown();
  });
});

describe("revocation mid-composition discards (IME-LOCK-1 clauses 2/3/5, CL-2)", () => {
  it("setEditable(false) applies at once without remount, then the end discards with no emission", () => {
    const { editor, changes, viewDom, teardown } = setup();
    const viewBefore = editor.view;
    beginComposition(viewDom);
    expect(editor.readiness()).toEqual({ composing: true, ready: false });
    editor.typeText("paragraph:1", " uncommitted");
    expect(changes).toHaveLength(0);
    // Clause 2: revocation is immediate, without remount, mid-composition.
    editor.setEditable(false);
    expect(editor.view).toBe(viewBefore);
    editor.typeText("paragraph:1", " blocked");
    expect(changes).toHaveLength(0);
    // Clauses 3/5: the end discards the uncommitted text — no commit, no
    // event — and the display reverts to the last committed revision.
    endComposition(viewDom);
    expect(changes).toHaveLength(0);
    expect(editor.getDocument().blocks[0]).toEqual(paragraph("paragraph:1", "Alpha"));
    // Recovery: re-enabling edits through the same instance.
    editor.setEditable(true);
    expect(editor.view).toBe(viewBefore);
    editor.typeText("paragraph:1", " after");
    expect(changes).toHaveLength(1);
    expect(editor.getDocument().blocks[0]?.text).toBe("Alpha after");
    teardown();
  });

  it("a deferred external arrival is still re-evaluated once after the discard", async () => {
    const { editor, changes, conflicts, viewDom, teardown } = setup();
    beginComposition(viewDom);
    editor.typeText("paragraph:1", " local");
    const remote: RichTextDocument = {
      format: "focus.markdown.p0@1",
      blocks: [paragraph("paragraph:9", "Remote")],
    };
    editor.applyExternalUpdate(remote);
    expect(conflicts).toHaveLength(0);
    editor.setEditable(false);
    endComposition(viewDom);
    // The discard emits nothing, then the deferred arrival applies cleanly
    // against the reverted revision: the uncommitted text is gone, the
    // remote document stands, and no conflict fired.
    expect(changes).toHaveLength(0);
    expect(conflicts).toHaveLength(0);
    expect(editor.getDocument()).toEqual(remote);
    teardown();
  });
});
