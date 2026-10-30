// Live session binding over the linear Y.Text (spec §4.3.1, §5.7,
// §6.3 seam 3). The only Yjs-reachable entry besides its codec, projection
// and selection siblings: framework adapters never receive the `Y.Doc`.
//
// History seam (spec §4.5, CL-3b): when bound, the extension composition
// swaps history in exactly one place (UndoRedo removed; see
// `editor-extensions.ts` `removeHistoryExtension` and the factory `bound`
// branch in `editor.ts`). The Yjs `UndoManager` itself is CL-3b: this module
// leaves the seam (`createBoundUndoManager` throws until CL-3b lands) and a
// failing-closed placeholder (`createBoundHistoryPlaceholder`) that never
// double-records.

import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { FieldBindingIdentity } from "./collaboration.js";
import type { RichTextFormat } from "./model.js";
import { captureDocumentFromField, fieldMetaName, fieldTextName } from "./collab-codec.js";

/** One field binding: the field's linear text plus its metadata map. */
export interface LiveSessionBinding {
  identity: FieldBindingIdentity;
  /** The field's single linear Y.Text (`field:` + fieldKey). */
  text: Y.Text;
  /** The field's block-metadata map (`fieldmeta:` + fieldKey, R-LIN-8). */
  fieldMeta: Y.Map<unknown>;
  /** The document session's awareness object. */
  awareness: Awareness;
}

/** Host side of the §5.7 binding: resolve/release by full identity. */
export interface LiveSessionBindingSource {
  resolveBinding(identity: FieldBindingIdentity): LiveSessionBinding;
  releaseBinding(identity: FieldBindingIdentity): void;
}

/** Failing-closed bound history placeholder (CL-3b seam, §4.5). */
export interface BoundHistoryPlaceholder {
  readonly kind: "bound-history-placeholder";
  readonly available: false;
  undo(): never;
  redo(): never;
}

export const BOUND_HISTORY_UNAVAILABLE_MESSAGE = "rich-text.bound-undo-unavailable" as const;

/** Bound undo/redo before CL-3b: fail closed, never double-record. */
export function createBoundHistoryPlaceholder(): BoundHistoryPlaceholder {
  const unavailable = (): never => {
    throw new Error(BOUND_HISTORY_UNAVAILABLE_MESSAGE);
  };
  return {
    kind: "bound-history-placeholder",
    available: false,
    undo: unavailable,
    redo: unavailable,
  };
}

/**
 * CL-3b seam: the Yjs `UndoManager` over the field text plus its metadata
 * map, scoped to the local actor origin (§4.5). Throws until CL-3b lands so
 * no caller can mistake the placeholder for history.
 */
export function createBoundUndoManager(_options: {
  text: Y.Text;
  fieldMeta: Y.Map<unknown>;
  trackedOrigin: string;
}): never {
  void _options;
  throw new Error("rich-text.bound-undo-unavailable: UndoManager wiring lands in CL-3b");
}

interface SessionRecord {
  ydoc: Y.Doc;
  awareness: Awareness;
  fields: Set<string>;
}

function requireCoordinate(value: string, name: string): void {
  if (typeof value !== "string" || value === "") {
    throw new Error(`rich-text.binding-identity: missing ${name} fails closed (R-BIND-1)`);
  }
}

function checkIdentity(identity: FieldBindingIdentity): void {
  requireCoordinate(identity.documentId, "documentId");
  requireCoordinate(identity.sessionId, "sessionId");
  requireCoordinate(identity.fieldKey, "fieldKey");
}

function sessionKey(documentId: string, sessionId: string): string {
  return `${documentId}\n${sessionId}`;
}

/**
 * In-memory test-double provider for the DS tests (spec §6.3: a double
 * resolving synchronously from an in-memory map). Resolves bindings by full
 * `handle.identity` (R-BIND-1) and fails closed on a missing coordinate or
 * a different field/document/session. Field bindings over one document share
 * the session by reference count (R-BIND-2).
 */
export function createInMemoryTestDoubleProvider(): {
  openSession(documentId: string, sessionId: string, fieldKeys: readonly string[]): LiveSessionBindingSource;
} {
  const sessions = new Map<string, SessionRecord>();
  return {
    openSession(documentId: string, sessionId: string, fieldKeys: readonly string[]): LiveSessionBindingSource {
      requireCoordinate(documentId, "documentId");
      requireCoordinate(sessionId, "sessionId");
      if (fieldKeys.length === 0) {
        throw new Error("rich-text.binding-identity: admitted field set is empty");
      }
      const key = sessionKey(documentId, sessionId);
      let record = sessions.get(key);
      if (record === undefined) {
        const ydoc = new Y.Doc();
        record = { ydoc, awareness: new Awareness(ydoc), fields: new Set(fieldKeys) };
        sessions.set(key, record);
      } else {
        for (const fieldKey of fieldKeys) record.fields.add(fieldKey);
      }
      const live: SessionRecord = record;
      return {
        resolveBinding(identity: FieldBindingIdentity): LiveSessionBinding {
          checkIdentity(identity);
          if (identity.documentId !== documentId || identity.sessionId !== sessionId) {
            throw new Error("rich-text.binding-identity: different document/session fails closed (R-BIND-1)");
          }
          if (!live.fields.has(identity.fieldKey)) {
            throw new Error("rich-text.binding-identity: different field fails closed (R-BIND-1)");
          }
          return {
            identity: { ...identity },
            text: live.ydoc.getText(fieldTextName(identity.fieldKey)),
            fieldMeta: live.ydoc.getMap(fieldMetaName(identity.fieldKey)) as Y.Map<unknown>,
            awareness: live.awareness,
          };
        },
        releaseBinding(identity: FieldBindingIdentity): void {
          checkIdentity(identity);
          if (identity.documentId !== documentId || identity.sessionId !== sessionId) {
            throw new Error("rich-text.binding-identity: different document/session fails closed (R-BIND-1)");
          }
          live.fields.delete(identity.fieldKey);
          if (live.fields.size === 0) sessions.delete(key);
        },
      };
    },
  };
}

/** Bound `captureDocument()` semantics: read `Y.Text` + `fieldmeta`. */
export function captureBoundDocument(
  binding: Pick<LiveSessionBinding, "text" | "fieldMeta">,
  format: RichTextFormat,
): ReturnType<typeof captureDocumentFromField> {
  return captureDocumentFromField(binding.text, binding.fieldMeta, format);
}
