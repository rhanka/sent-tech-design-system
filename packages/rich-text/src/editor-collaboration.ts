// Live session binding over the linear Y.Text (spec §4.3.1, §5.7,
// §6.3 seam 3). The only Yjs-reachable entry besides its codec, projection
// and selection siblings: framework adapters never receive the `Y.Doc`.
//
// Bound history (spec §4.5, CL-3b1): when bound, the extension composition
// swaps history in exactly one place (UndoRedo removed; see
// `editor-extensions.ts` `removeHistoryExtension` and the factory `bound`
// branch in `editor.ts`). This module owns the Yjs `UndoManager` handle
// (`createBoundUndoManager`, scoped to the local actor origin), so exactly
// one history exists and nothing double-records.

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

/**
 * Bound history handle (CL-3b1, spec §4.5): the Yjs `UndoManager` over the
 * field `Y.Text` and its `fieldmeta:<fieldKey>` map, scoped by
 * `trackedOrigins` to the local actor origin. Exactly one history exists in
 * bound mode (ProseMirror history is removed); mark-only transactions never
 * enter these stacks (§4.5 boundary). The handle carries no `Y` type beyond
 * construction: `undo()`/`redo()` report whether a step applied.
 */
export interface BoundUndoManager {
  readonly available: true;
  /** Undo the local actor's latest tracked step; null when nothing applied. */
  undo(): unknown;
  /** Redo the local actor's latest undone step; null when nothing applied. */
  redo(): unknown;
  canUndo(): boolean;
  canRedo(): boolean;
  /** Close the current capture interval so the next gesture is a new step
      (spec leaves coalescing unpinned; the production default stays 500 ms,
      register entry AMB-8; witnesses call this between gestures). */
  stopCapturing(): void;
  destroy(): void;
}

/**
 * Local actor origin for the field binding (register entry AMB-1): the
 * browser actor form `actor:<actorId>` when the host supplied an actor,
 * else the binding-scoped origin
 * `actor:binding:<sessionId>:<fieldKey>` minted by the binding source, so
 * undo works before a host names actors. The bridge form `agent:<actorId>`
 * is host-minted and never produced here (§5.1).
 */
export function boundLocalOriginFor(
  identity: FieldBindingIdentity,
  actorId: string | null | undefined,
): string {
  if (typeof actorId === "string" && actorId !== "") {
    return `actor:${actorId}`;
  }
  return `actor:binding:${identity.sessionId}:${identity.fieldKey}`;
}

/**
 * Mark origin derived from the local origin (CL-3b1 §4.5 boundary): never a
 * member of the field manager's `trackedOrigins`, so mark-only transactions
 * transact without entering the undo stacks.
 */
export function boundMarkOriginFor(localOrigin: string): string {
  return `${localOrigin}:mark`;
}

/** Create the bound `UndoManager` handle (spec §4.5, §4.3.1 item 6). */
export function createBoundUndoManager(options: {
  text: Y.Text;
  fieldMeta: Y.Map<unknown>;
  trackedOrigin: string;
}): BoundUndoManager {
  const { text, fieldMeta, trackedOrigin } = options;
  if (typeof trackedOrigin !== "string" || trackedOrigin === "") {
    throw new Error("rich-text.bound-undo-unavailable: a local actor origin is required");
  }
  const ydoc = text.doc;
  if (ydoc === null || ydoc === undefined) {
    throw new Error("rich-text.bound-undo-unavailable: field Y.Text is not attached to a Y.Doc");
  }
  if (fieldMeta.doc !== ydoc) {
    throw new Error("rich-text.bound-undo-unavailable: field text and metadata share one Y.Doc");
  }
  const manager = new Y.UndoManager([text, fieldMeta], {
    trackedOrigins: new Set([trackedOrigin]),
  });
  return {
    available: true,
    undo: () => manager.undo(),
    redo: () => manager.redo(),
    canUndo: () => manager.canUndo(),
    canRedo: () => manager.canRedo(),
    stopCapturing: () => manager.stopCapturing(),
    destroy: () => manager.destroy(),
  };
}

interface SessionRecord {
  ydoc: Y.Doc;
  awareness: Awareness;
  fields: Set<string>;
  holders: Map<string, number>;
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
        record = { ydoc, awareness: new Awareness(ydoc), fields: new Set(fieldKeys), holders: new Map() };
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
          live.holders.set(identity.fieldKey, (live.holders.get(identity.fieldKey) ?? 0) + 1);
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
          if (!live.fields.has(identity.fieldKey)) {
            throw new Error("rich-text.binding-identity: different field fails closed (R-BIND-1)");
          }
          const holders = live.holders.get(identity.fieldKey) ?? 0;
          if (holders > 1) {
            live.holders.set(identity.fieldKey, holders - 1);
            return;
          }
          live.holders.delete(identity.fieldKey);
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
