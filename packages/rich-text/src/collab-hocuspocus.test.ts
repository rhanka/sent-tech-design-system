/**
 * CL-3c witness 8(i), DS half — provider conformance (spec §8 CL-3 (8),
 * §5.7 R-BIND-1/2/3, §7.3–§7.4).
 *
 * The identical assertions run against (a) the existing in-memory double
 * (`createInMemoryTestDoubleProvider`) and (b) a test-only Hocuspocus-backed
 * binding source (`./collab-hocuspocus-source.test-support.ts`, in-process
 * `@hocuspocus/server` 4.7.1 reached through `openDirectConnection`,
 * mirroring the host H3 offline harness). The shipped binding under test is
 * the merged CL-3a/b code (`createBoundRichTextEditor`), unmodified.
 *
 * RED on the CL-3c base: the Hocuspocus-backed source does not exist, so run
 * (b) fails at setup/import (`Cannot find module
 * './collab-hocuspocus-source.test-support.js'`) while run (a) already
 * passes.
 */
import { describe, expect, it, afterEach, beforeAll } from "vitest";
import * as Y from "yjs";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  createInMemoryTestDoubleProvider,
  type LiveSessionBindingSource,
} from "./editor-collaboration.js";
import {
  captureDocumentFromField,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { RichTextFormat } from "./model.js";
import type { RichTextDocument } from "./model.js";
import type { RichTextEditor } from "./editor.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";
import {
  hocuspocusServerVersion,
  openHocuspocusTestSession,
  type HocuspocusTestDriver,
} from "./collab-hocuspocus-source.test-support.js";

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

const FULL: RichTextFormat = "ds.markdown.full@1";

const DOCUMENT_ID = "canvas:cl3c-8i";
const SESSION_ID = "session:cl3c-8i";

function fullPara(paragraphId: string, text: string): Record<string, unknown> {
  return {
    paragraphId,
    kind: "paragraph",
    segments: [{ type: "text", text, marks: {} }],
  };
}

function descriptionDoc(): RichTextDocument {
  return { format: FULL, blocks: [fullPara("paragraph:desc-1", "desc")] as never };
}

function notesDoc(): RichTextDocument {
  return { format: FULL, blocks: [fullPara("paragraph:note-1", "note")] as never };
}

/** Concatenated text of a full-profile block. */
function blockText(block: RichTextDocument["blocks"][number]): string {
  const segments = (block as { segments?: Array<{ type: string; text?: string }> }).segments;
  if (segments === undefined) return "";
  return segments.map((segment) => (segment.type === "text" ? (segment.text ?? "") : "")).join("");
}

/** Identical driver surface for both provider runs. */
interface ProviderDriver {
  readonly label: "in-memory-double" | "hocuspocus";
  readonly source: LiveSessionBindingSource;
  /** Apply a remote edit as a Yjs transaction on the server-side document. */
  remoteTransact(
    fieldKey: string,
    fn: (text: Y.Text, fieldMeta: Y.Map<unknown>) => void,
  ): Promise<void>;
  /** Force the persistence hook, then report stored checkpoint bytes. */
  storedBytes(): Promise<number>;
  close(): Promise<void>;
}

function seedBoth(source: LiveSessionBindingSource): void {
  const description = source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "description",
  });
  seedFieldFromDocument(description.text, description.fieldMeta, "description", descriptionDoc());
  const notes = source.resolveBinding({
    documentId: DOCUMENT_ID,
    sessionId: SESSION_ID,
    fieldKey: "notes",
  });
  seedFieldFromDocument(notes.text, notes.fieldMeta, "notes", notesDoc());
}

function pmTextOf(editor: RichTextEditor): string {
  return editor.view.state.doc.textBetween(0, editor.view.state.doc.content.size, "\n\n", "\n");
}

async function mountField(
  source: LiveSessionBindingSource,
  fieldKey: string,
  allocateTag: string,
  mounted: RichTextEditor[],
): Promise<RichTextEditor> {
  const editor = await createBoundRichTextEditor({
    document: fieldKey === "description" ? descriptionDoc() : notesDoc(),
    profile: "full",
    messages: { ...MESSAGES },
    allocateId: () => allocateTag,
    collaborationBinding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey },
    collaborationSource: source,
    element: globalThis.document.createElement("div"),
  });
  mounted.push(editor);
  return editor;
}

/**
 * The identical assertion body for both provider runs: two fields of one
 * document mounted over one session converge independently, resolution fails
 * closed, server-side remote edits project with identities intact, and
 * unmounting one field leaves the other live (R-BIND-3).
 */
async function witnessProviderConformance(driver: ProviderDriver): Promise<void> {
  expect(driver.label === "in-memory-double" || driver.label === "hocuspocus").toBe(true);
  const { source } = driver;
  const mounted: RichTextEditor[] = [];
  try {
    seedBoth(source);
    const description = await mountField(source, "description", "test:8i:desc:1", mounted);
    const notes = await mountField(source, "notes", "test:8i:notes:1", mounted);

    // Local edit in one field syncs; the other field is untouched.
    description.view.dispatch(description.view.state.tr.insertText("ZZ", 2));
    expect(pmTextOf(description)).toContain("dZZesc");
    const descCapture = captureDocumentFromField(
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" }).text,
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" }).fieldMeta,
      FULL,
    );
    expect(blockText(descCapture.document.blocks[0] as never)).toContain("dZZesc");
    expect(pmTextOf(notes)).toBe("note");

    // R-BIND-1: resolution fails closed on a missing coordinate and on a
    // different field, document or session.
    expect(() =>
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "" }),
    ).toThrow("rich-text.binding-identity");
    expect(() =>
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "other" }),
    ).toThrow("rich-text.binding-identity");
    expect(() =>
      source.resolveBinding({ documentId: "canvas:elsewhere", sessionId: SESSION_ID, fieldKey: "description" }),
    ).toThrow("rich-text.binding-identity");
    expect(() =>
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: "session:elsewhere", fieldKey: "description" }),
    ).toThrow("rich-text.binding-identity");

    // A remote text insert, a split and a metadata write applied at the
    // server are projected by the bound editor with identities intact.
    await driver.remoteTransact("description", (text, fieldMeta) => {
      text.insert(text.length, "-REMOTE");
      // Split inside the tail: the new separator opens the remote tail block.
      text.insertEmbed(text.length - 3, {
        separator: { paragraphId: "paragraph:remote-split", kind: "paragraph" },
      });
      fieldMeta.set("paragraph:remote-split", {
        ...canonicalPlainMetadata(),
        blockKind: "heading",
        headingLevel: 2,
      });
    });
    const afterRemote = captureDocumentFromField(
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" }).text,
      source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" }).fieldMeta,
      FULL,
    );
    const ids = afterRemote.document.blocks.map((block) => block.paragraphId);
    expect(ids).toContain("paragraph:desc-1");
    expect(ids).toContain("paragraph:remote-split");
    // The split landed inside "-REMOTE": head keeps "dZZesc-REM", the new
    // tail block carries "OTE".
    expect(pmTextOf(description)).toContain("dZZesc-REM");
    expect(pmTextOf(description)).toContain("OTE");
    const headBlock = afterRemote.document.blocks.find(
      (block) => block.paragraphId === "paragraph:desc-1",
    ) as never;
    expect(blockText(headBlock)).toBe("dZZesc-REM");
    const remoteMeta = source.resolveBinding({
      documentId: DOCUMENT_ID,
      sessionId: SESSION_ID,
      fieldKey: "description",
    }).fieldMeta.get("paragraph:remote-split") as { headingLevel?: number } | undefined;
    expect(remoteMeta?.headingLevel).toBe(2);
    const remoteBlock = afterRemote.document.blocks.find(
      (block) => block.paragraphId === "paragraph:remote-split",
    ) as { metadata?: { headingLevel?: number } } | undefined;
    expect(remoteBlock?.metadata?.headingLevel).toBe(2);

    // R-BIND-3: unmounting `description` leaves `notes` live with no
    // session re-open.
    description.destroy();
    mounted.splice(mounted.indexOf(description), 1);
    source.releaseBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "description" });
    const notesAgain = source.resolveBinding({
      documentId: DOCUMENT_ID,
      sessionId: SESSION_ID,
      fieldKey: "notes",
    });
    expect(notesAgain.text).toBeDefined();
    await driver.remoteTransact("notes", (text) => {
      text.insert(text.length, "-STILL-LIVE");
    });
    expect(pmTextOf(notes)).toContain("-STILL-LIVE");
    notes.view.dispatch(notes.view.state.tr.insertText("!", 2));
    const notesShared = captureDocumentFromField(notesAgain.text, notesAgain.fieldMeta, FULL);
    expect(blockText(notesShared.document.blocks[0] as never)).toContain("n!ote-STILL-LIVE");
  } finally {
    for (const editor of mounted.splice(0)) editor.destroy();
  }
}

describe("CL-3c-8(i) provider conformance, DS half", () => {
  describe("run (a) in-memory double", () => {
    const mounted: RichTextEditor[] = [];
    afterEach(() => {
      for (const editor of mounted.splice(0)) editor.destroy();
    });

    it("same binding, double-backed source", async () => {
      const provider = createInMemoryTestDoubleProvider();
      const source = provider.openSession(DOCUMENT_ID, SESSION_ID, ["description", "notes"]);
      let closed = false;
      const driver: ProviderDriver = {
        label: "in-memory-double",
        source,
        remoteTransact: async (fieldKey, fn) => {
          const binding = source.resolveBinding({
            documentId: DOCUMENT_ID,
            sessionId: SESSION_ID,
            fieldKey,
          });
          binding.text.doc?.transact(() => {
            fn(binding.text, binding.fieldMeta);
          });
          source.releaseBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey });
        },
        storedBytes: async () => 0,
        close: async () => {
          closed = true;
        },
      };
      expect(driver.label).toBe("in-memory-double");
      await witnessProviderConformance(driver);
      await driver.close();
      expect(closed).toBe(true);
    });
  });

  describe("run (b) Hocuspocus-backed source", () => {
    let driver: HocuspocusTestDriver | null = null;

    beforeAll(async () => {
      driver = await openHocuspocusTestSession({
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fields: ["description", "notes"],
      });
    });

    afterEach(async () => {
      if (driver !== null) {
        await driver.close();
        driver = null;
      }
    });

    it("same binding, Hocuspocus-backed source", async () => {
      expect(driver).not.toBeNull();
      expect(driver?.label).toBe("hocuspocus");
      // Exact host pin conformance: the backing server is 4.7.1.
      expect(hocuspocusServerVersion()).toBe("4.7.1");
      const active = driver as HocuspocusTestDriver;
      await witnessProviderConformance(active);
      const bytes = await active.storedBytes();
      expect(bytes).toBeGreaterThan(0);
    });
  });
});
