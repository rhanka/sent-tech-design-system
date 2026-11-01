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
import type {
  FieldBindingIdentity,
  LiveSessionAdmissionRequest,
  LiveSessionOpenRefusal,
  SchemaEpochAcknowledgement,
} from "./collaboration.js";
import { decideLiveSessionAdmission } from "./collaboration.js";
import type { RichTextFormat } from "./model.js";
import type { RichTextDocument } from "./model.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";

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
  /**
   * Admitted-actor registry (spec §5.1, register entry AMB-5): the host
   * maintains the `actorId` ↔ awareness-client pair established at
   * admission; the DS cursor renderer consumes it through the binding
   * source and renders a caret only for an admitted actor on its own
   * registered client (§13 F2). Optional so test sources without a
   * registry keep failing closed (unregistered ⇒ no caret).
   */
  registerActor?(
    actor: { actorId: string; displayLabel: string; color: string },
    awarenessClientId?: number,
  ): void;
  revokeActor?(actorId: string): void;
  admittedActorOf?(
    actorId: string,
  ): { displayLabel: string; color: string; awarenessClientId?: number } | null;
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
  /** Admitted actors of this session (§5.1 registry, AMB-5): the
      `actorId` ↔ awareness-client pair, established at admission. */
  actors: Map<string, { displayLabel: string; color: string; awarenessClientId?: number }>;
}

function checkActorShape(actor: { actorId: string; displayLabel: string; color: string }): void {
  requireCoordinate(actor.actorId, "actorId");
  requireCoordinate(actor.displayLabel, "displayLabel");
  if (typeof actor.color !== "string") {
    throw new Error("rich-text.actor-registry: color must be a string (validated at render)");
  }
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
        record = { ydoc, awareness: new Awareness(ydoc), fields: new Set(fieldKeys), holders: new Map(), actors: new Map() };
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
        registerActor(
          actor: { actorId: string; displayLabel: string; color: string },
          awarenessClientId?: number,
        ): void {
          checkActorShape(actor);
          live.actors.set(actor.actorId, {
            displayLabel: actor.displayLabel,
            color: actor.color,
            ...(awarenessClientId === undefined ? {} : { awarenessClientId }),
          });
        },
        revokeActor(actorId: string): void {
          requireCoordinate(actorId, "actorId");
          live.actors.delete(actorId);
        },
        admittedActorOf(
          actorId: string,
        ): { displayLabel: string; color: string; awarenessClientId?: number } | null {
          return live.actors.get(actorId) ?? null;
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

/**
 * Admission journal event of the admission-capable test double (spec
 * §4.8.1 witness inspection). `application` entries appear only when a
 * client update is applied through `applyClientUpdate` after admission —
 * a refusal never records one and never touches the authoritative doc.
 */
export interface AdmissionJournalEvent {
  seq: number;
  kind:
    | "migration"
    | "draft-migration"
    | "acknowledgement"
    | "admission"
    | "refusal"
    | "application";
  documentId: string;
  target: "authoritative" | "draft" | "session";
  profileId?: string;
  fromEpoch?: string;
  toEpoch?: string;
  actorId?: string;
  sessionId?: string;
}

/**
 * Admission-capable in-memory test double (spec §4.8.1, register entry
 * AMB-3). The DS half of the witness: the admission authority, the `meta`
 * writer and the migration itself are host-side (R-MAP-5) and are
 * represented here by explicitly host-origin seams (`host*`), labelled as
 * such and never reachable from a binding (`resolveBinding` /
 * `releaseBinding` expose no migration, no acknowledgement, no journal).
 *
 * One authoritative `Y.Doc` per document carries the host-minted
 * `{ profileId, schemaEpoch }`. `openSessionAdmitted` compares before
 * resolving any binding: equal profile+epoch admits (forking a session doc
 * off the authority); any mismatch refuses the typed
 * `incompatible-schema` value with no binding and no client update applied.
 * Once a draft migration was journaled for that same actor at the
 * current epoch, admission at the new epoch additionally requires a
 * recorded acknowledgement for that actor — branch (b) — while a client
 * upgrade with no draft migration for that actor in history admits
 * without one — branch (a).
 */
export function createAdmissionCapableTestDoubleProvider(): {
  seedAuthority(
    documentId: string,
    fieldKey: string,
    document: RichTextDocument,
    profileId: string,
    schemaEpoch: string,
  ): void;
  /** HOST SEAM: mint a host migration — the authoritative epoch moves by
      exactly one, journaled. Never reachable from a binding. */
  hostMintMigration(documentId: string): { profileId: string; schemaEpoch: string };
  /** HOST SEAM: migrate the client's preserved draft only (stand-in for
      the host's defined epoch-step migration; the content transform is
      host-owned, CL-5). The authoritative doc is never touched here —
      asserted by its state vector and the journal. The migrated actor is
      recorded on the journal event with the target epoch, so the
      acknowledgement gate is per actor, never per document. Never reachable
      from a binding. */
  hostMigratePreservedDraft(
    documentId: string,
    actorId: string,
    draft: RichTextDocument,
  ): { draft: RichTextDocument; profileId: string; schemaEpoch: string };
  /** HOST SEAM: record the client's explicit acknowledgement of the
      current profile/epoch. Never reachable from a binding. */
  hostRecordAcknowledgement(acknowledgement: SchemaEpochAcknowledgement): void;
  openSessionAdmitted(input: {
    documentId: string;
    sessionId: string;
    fieldKeys: readonly string[];
    actorId: string;
    client: LiveSessionAdmissionRequest;
  }): { admitted: true; source: LiveSessionBindingSource } | { admitted: false; refusal: LiveSessionOpenRefusal };
  applyClientUpdate(documentId: string, sessionId: string, update: Uint8Array): void;
  authorityVectorHex(documentId: string): string;
  authorityCapture(
    documentId: string,
    fieldKey: string,
    format: RichTextFormat,
  ): ReturnType<typeof captureDocumentFromField>;
  journal(): readonly AdmissionJournalEvent[];
} {
  interface Authority {
    ydoc: Y.Doc;
    fieldKeys: Set<string>;
    profileId: string;
    schemaEpoch: string;
  }
  const authorities = new Map<string, Authority>();
  const sessions = new Map<string, SessionRecord>();
  const journal: AdmissionJournalEvent[] = [];
  let seq = 0;
  const record = (event: Omit<AdmissionJournalEvent, "seq">): void => {
    seq += 1;
    journal.push({ ...event, seq });
  };

  return {
    seedAuthority(documentId, fieldKey, document, profileId, schemaEpoch): void {
      requireCoordinate(documentId, "documentId");
      requireCoordinate(fieldKey, "fieldKey");
      requireCoordinate(profileId, "profileId");
      requireCoordinate(schemaEpoch, "schemaEpoch");
      if (authorities.has(documentId)) {
        throw new Error("rich-text.admission-seed: authority already seeded");
      }
      const ydoc = new Y.Doc();
      seedFieldFromDocument(
        ydoc.getText(fieldTextName(fieldKey)),
        ydoc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>,
        fieldKey,
        document,
      );
      authorities.set(documentId, {
        ydoc,
        fieldKeys: new Set([fieldKey]),
        profileId,
        schemaEpoch,
      });
    },

    hostMintMigration(documentId): { profileId: string; schemaEpoch: string } {
      const authority = authorities.get(documentId);
      if (authority === undefined) {
        throw new Error("rich-text.admission-migration: unknown document fails closed");
      }
      const current = Number.parseInt(authority.schemaEpoch, 10);
      if (!Number.isInteger(current)) {
        throw new Error("rich-text.admission-migration: non-numeric epoch has no +1 step");
      }
      const next = String(current + 1);
      record({
        kind: "migration",
        documentId,
        target: "authoritative",
        profileId: authority.profileId,
        fromEpoch: authority.schemaEpoch,
        toEpoch: next,
      });
      authority.schemaEpoch = next;
      return { profileId: authority.profileId, schemaEpoch: next };
    },

    hostMigratePreservedDraft(
      documentId: string,
      actorId: string,
      draft: RichTextDocument,
    ): { draft: RichTextDocument; profileId: string; schemaEpoch: string } {
      const authority = authorities.get(documentId);
      if (authority === undefined) {
        throw new Error("rich-text.admission-migration: unknown document fails closed");
      }
      requireCoordinate(actorId, "actorId");
      record({
        kind: "draft-migration",
        documentId,
        target: "draft",
        profileId: authority.profileId,
        toEpoch: authority.schemaEpoch,
        actorId,
      });
      return {
        draft: structuredClone(draft) as RichTextDocument,
        profileId: authority.profileId,
        schemaEpoch: authority.schemaEpoch,
      };
    },

    hostRecordAcknowledgement(acknowledgement): void {
      requireCoordinate(acknowledgement.documentId, "documentId");
      requireCoordinate(acknowledgement.actorId, "actorId");
      requireCoordinate(acknowledgement.profileId, "profileId");
      requireCoordinate(acknowledgement.schemaEpoch, "schemaEpoch");
      const authority = authorities.get(acknowledgement.documentId);
      if (
        authority === undefined ||
        authority.profileId !== acknowledgement.profileId ||
        authority.schemaEpoch !== acknowledgement.schemaEpoch
      ) {
        throw new Error("rich-text.admission-acknowledgement: unknown document/profile/epoch fails closed");
      }
      record({
        kind: "acknowledgement",
        documentId: acknowledgement.documentId,
        target: "authoritative",
        profileId: acknowledgement.profileId,
        toEpoch: acknowledgement.schemaEpoch,
        actorId: acknowledgement.actorId,
      });
    },

    openSessionAdmitted(input): { admitted: true; source: LiveSessionBindingSource } | { admitted: false; refusal: LiveSessionOpenRefusal } {
      requireCoordinate(input.documentId, "documentId");
      requireCoordinate(input.sessionId, "sessionId");
      requireCoordinate(input.actorId, "actorId");
      if (input.fieldKeys.length === 0) {
        throw new Error("rich-text.binding-identity: admitted field set is empty");
      }
      const authority = authorities.get(input.documentId);
      if (authority === undefined) {
        throw new Error("rich-text.binding-identity: unknown document fails closed");
      }
      const decision = decideLiveSessionAdmission({
        client: input.client,
        document: { profileId: authority.profileId, schemaEpoch: authority.schemaEpoch },
      });
      if (!decision.admitted) {
        record({
          kind: "refusal",
          documentId: input.documentId,
          target: "authoritative",
          profileId: authority.profileId,
          toEpoch: authority.schemaEpoch,
          actorId: input.actorId,
          sessionId: input.sessionId,
        });
        return { admitted: false as const, refusal: decision };
      }
      const draftMigrated = journal.some(
        (event) =>
          event.documentId === input.documentId &&
          event.kind === "draft-migration" &&
          event.actorId === input.actorId &&
          event.toEpoch === authority.schemaEpoch,
      );
      const acknowledged = journal.some(
        (event) =>
          event.documentId === input.documentId &&
          event.kind === "acknowledgement" &&
          event.actorId === input.actorId &&
          event.profileId === authority.profileId &&
          event.toEpoch === authority.schemaEpoch,
      );
      if (draftMigrated && !acknowledged) {
        record({
          kind: "refusal",
          documentId: input.documentId,
          target: "authoritative",
          profileId: authority.profileId,
          toEpoch: authority.schemaEpoch,
          actorId: input.actorId,
          sessionId: input.sessionId,
        });
        return {
          admitted: false as const,
          refusal: {
            admitted: false,
            reason: "incompatible-schema",
            profileId: authority.profileId,
            schemaEpoch: authority.schemaEpoch,
          },
        };
      }
      const key = sessionKey(input.documentId, input.sessionId);
      let recordEntry = sessions.get(key);
      if (recordEntry === undefined) {
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(authority.ydoc));
        recordEntry = {
          ydoc,
          awareness: new Awareness(ydoc),
          fields: new Set(input.fieldKeys),
          holders: new Map(),
          actors: new Map(),
        };
        sessions.set(key, recordEntry);
      } else {
        for (const fieldKey of input.fieldKeys) recordEntry.fields.add(fieldKey);
      }
      const live: SessionRecord = recordEntry;
      record({
        kind: "admission",
        documentId: input.documentId,
        target: "session",
        profileId: authority.profileId,
        toEpoch: authority.schemaEpoch,
        actorId: input.actorId,
        sessionId: input.sessionId,
      });
      return {
        admitted: true as const,
        source: {
          resolveBinding(identity: FieldBindingIdentity): LiveSessionBinding {
            checkIdentity(identity);
            if (identity.documentId !== input.documentId || identity.sessionId !== input.sessionId) {
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
            if (identity.documentId !== input.documentId || identity.sessionId !== input.sessionId) {
              throw new Error("rich-text.binding-identity: different document/session fails closed (R-BIND-1)");
            }
            const holders = live.holders.get(identity.fieldKey) ?? 0;
            if (holders > 1) {
              live.holders.set(identity.fieldKey, holders - 1);
              return;
            }
            live.holders.delete(identity.fieldKey);
          },
          registerActor(
            actor: { actorId: string; displayLabel: string; color: string },
            awarenessClientId?: number,
          ): void {
            checkActorShape(actor);
            live.actors.set(actor.actorId, {
              displayLabel: actor.displayLabel,
              color: actor.color,
              ...(awarenessClientId === undefined ? {} : { awarenessClientId }),
            });
          },
          revokeActor(actorId: string): void {
            requireCoordinate(actorId, "actorId");
            live.actors.delete(actorId);
          },
          admittedActorOf(
            actorId: string,
          ): { displayLabel: string; color: string; awarenessClientId?: number } | null {
            return live.actors.get(actorId) ?? null;
          },
        },
      };
    },

    applyClientUpdate(documentId, sessionId, update): void {
      const live = sessions.get(sessionKey(documentId, sessionId));
      if (live === undefined) {
        throw new Error("rich-text.admission-application: unknown session fails closed");
      }
      Y.applyUpdate(live.ydoc, update);
      record({ kind: "application", documentId, target: "session", sessionId });
    },

    authorityVectorHex(documentId): string {
      const authority = authorities.get(documentId);
      if (authority === undefined) {
        throw new Error("rich-text.admission-inspect: unknown document fails closed");
      }
      return Buffer.from(Y.encodeStateVector(authority.ydoc)).toString("hex");
    },

    authorityCapture(documentId, fieldKey, format): ReturnType<typeof captureDocumentFromField> {
      const authority = authorities.get(documentId);
      if (authority === undefined) {
        throw new Error("rich-text.admission-inspect: unknown document fails closed");
      }
      requireCoordinate(fieldKey, "fieldKey");
      return captureDocumentFromField(
        authority.ydoc.getText(fieldTextName(fieldKey)),
        authority.ydoc.getMap(fieldMetaName(fieldKey)) as Y.Map<unknown>,
        format,
      );
    },

    journal(): readonly AdmissionJournalEvent[] {
      return [...journal];
    },
  };
}
