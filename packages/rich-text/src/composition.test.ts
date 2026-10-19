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
    const pending = editor.captureDocument().then((document) => {
      settled = document;
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
    const pending = editor.captureDocument().then((document) => {
      settled = document;
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
