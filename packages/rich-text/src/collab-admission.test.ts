/**
 * CL-3b2 witness 10 DS half — schema admission (spec §4.8.1, register entry
 * AMB-3).
 *
 * A document at epoch N; participant B offline on epoch N with queued
 * edits. The host seam migrates the authoritative doc to N+1. B reconnects:
 * admission is refused `incompatible-schema` with no binding resolved and no
 * application of B's queued updates, and B's draft capture
 * (`captureDocument()` semantics: complete document, identities,
 * representability flags) is byte-identical before and after the refusal.
 * Branch (a): after B upgrades, B is admitted at N+1. Branch (b): the host
 * migrates B's preserved draft only (the authoritative doc, already at N+1,
 * is not migrated a second time — asserted by its state vector and the
 * journal), B explicitly acknowledges N+1 through the recorded
 * acknowledgement, and only then is B admitted; the same draft presented
 * again without the acknowledgement is refused again. No partial
 * application is recorded in the journal in any run.
 *
 * DS/host split: the admission authority, the `meta` writer and the
 * migration itself are host-side (R-MAP-5) and appear here only as
 * explicitly host-origin seams (`host*`, never reachable from a binding).
 * The host-side run of this witness is CL-5 and is listed as remaining, not
 * done.
 *
 * RED on the CL-3b1 base: the base has no admission surface at all — the
 * admission-capable double, the typed refusal and the pure comparison do not
 * exist, and the base double admits any client with no epoch check.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createAdmissionCapableTestDoubleProvider } from "./editor-collaboration.js";
import {
  decideLiveSessionAdmission,
  type LiveSessionAdmissionRequest,
} from "./collaboration.js";
import {
  captureDocumentFromField,
  fieldMetaName,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { RichTextDocument } from "./model.js";

const FIELD = "body";
const DOC = "canvas:admission:1";
const P0 = "focus.markdown.p0@1";

function paragraphDoc(id: string, text: string): RichTextDocument {
  return {
    format: P0,
    blocks: [{ paragraphId: id, kind: "paragraph", text }],
  } as RichTextDocument;
}

function draftOf(text: Y.Text, meta: Y.Map<unknown>): string {
  return JSON.stringify(captureDocumentFromField(text, meta, P0));
}

describe("CL-3b2-10 admission comparison is a pure value", () => {
  it("equal profile and epoch admit; any mismatch refuses incompatible-schema", () => {
    const admitted = decideLiveSessionAdmission({
      client: { clientProfileId: P0, clientSchemaEpoch: "1" },
      document: { profileId: P0, schemaEpoch: "1" },
    });
    expect(admitted).toEqual({ admitted: true });
    const cases: Array<{
      label: string;
      client: LiveSessionAdmissionRequest;
      document: { profileId: string; schemaEpoch: string };
    }> = [
      {
        label: "older client epoch",
        client: { clientProfileId: P0, clientSchemaEpoch: "1" },
        document: { profileId: P0, schemaEpoch: "2" },
      },
      {
        label: "newer client epoch",
        client: { clientProfileId: P0, clientSchemaEpoch: "3" },
        document: { profileId: P0, schemaEpoch: "2" },
      },
      {
        label: "wrong profile",
        client: { clientProfileId: "other.profile@1", clientSchemaEpoch: "2" },
        document: { profileId: P0, schemaEpoch: "2" },
      },
    ];
    for (const { label, client, document } of cases) {
      const refused = decideLiveSessionAdmission({ client, document });
      expect(refused, label).toEqual({
        admitted: false,
        reason: "incompatible-schema",
        profileId: document.profileId,
        schemaEpoch: document.schemaEpoch,
      });
    }
  });
});

describe("CL-3b2-10 refused reconnect preserves the draft and applies nothing", () => {
  it("stale-epoch reconnect refuses with a byte-identical draft and an untouched authority", () => {
    const provider = createAdmissionCapableTestDoubleProvider();
    provider.seedAuthority(DOC, FIELD, paragraphDoc("p:1", "ab"), P0, "1");

    // B works offline on epoch 1 with queued edits (ordinary transactions).
    const offline = new Y.Doc();
    seedFieldFromDocument(
      offline.getText(fieldTextName(FIELD)),
      offline.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      FIELD,
      paragraphDoc("p:1", "ab"),
    );
    offline.transact(() => {
      offline.getText(fieldTextName(FIELD)).insert(1, "QB");
    });
    const bText = offline.getText(fieldTextName(FIELD));
    const bMeta = offline.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>;
    const draftBefore = draftOf(bText, bMeta);
    expect(draftBefore).toContain("QB");

    // The host seam migrates the authoritative doc to epoch 2 (bumped by
    // exactly one, journaled).
    const migrated = provider.hostMintMigration(DOC);
    expect(migrated).toEqual({ profileId: P0, schemaEpoch: "2" });
    const vectorAfterMigration = provider.authorityVectorHex(DOC);

    // B reconnects on the stale epoch: typed refusal, no binding, no
    // application, draft byte-identical, authority untouched.
    const reconnect = provider.openSessionAdmitted({
      documentId: DOC,
      sessionId: "session:b",
      fieldKeys: [FIELD],
      actorId: "actor-b",
      client: { clientProfileId: P0, clientSchemaEpoch: "1" },
    });
    expect(reconnect.admitted).toBe(false);
    if (reconnect.admitted) throw new Error("stale epoch must refuse");
    expect(reconnect.refusal).toEqual({
      admitted: false,
      reason: "incompatible-schema",
      profileId: P0,
      schemaEpoch: "2",
    });
    const draftAfter = draftOf(bText, bMeta);
    expect(draftAfter, "draft byte-identical across the refusal").toBe(draftBefore);
    expect(provider.authorityVectorHex(DOC), "authority untouched by the refusal").toBe(
      vectorAfterMigration,
    );
    const authorityCapture = JSON.stringify(provider.authorityCapture(DOC, FIELD, P0).document);
    expect(authorityCapture, "queued edits nowhere in the authority").not.toContain("QB");
    const journal = provider.journal();
    expect(journal.filter((event) => event.kind === "migration")).toHaveLength(1);
    expect(journal.filter((event) => event.kind === "refusal")).toHaveLength(1);
    expect(
      journal.filter((event) => event.kind === "application"),
      "no partial application recorded",
    ).toHaveLength(0);
  });
});

describe("CL-3b2-10 branch (a) client upgrade admits", () => {
  it("B reopens at N+1 after upgrade and its queued update applies once", () => {
    const provider = createAdmissionCapableTestDoubleProvider();
    provider.seedAuthority(DOC, FIELD, paragraphDoc("p:1", "ab"), P0, "1");
    provider.hostMintMigration(DOC);

    const open = provider.openSessionAdmitted({
      documentId: DOC,
      sessionId: "session:b",
      fieldKeys: [FIELD],
      actorId: "actor-b",
      client: { clientProfileId: P0, clientSchemaEpoch: "2" },
    });
    expect(open.admitted).toBe(true);
    if (!open.admitted) throw new Error("upgraded client must be admitted");
    const binding = open.source.resolveBinding({
      documentId: DOC,
      sessionId: "session:b",
      fieldKey: FIELD,
    });
    expect(binding.identity.fieldKey).toBe(FIELD);

    // B's queued offline update applies through the double, journaled once.
    const queued = new Y.Doc();
    Y.applyUpdate(queued, Y.encodeStateAsUpdate(binding.text.doc as Y.Doc));
    queued.transact(() => {
      queued.getText(`field:${FIELD}`).insert(1, "QB");
    });
    provider.applyClientUpdate(DOC, "session:b", Y.encodeStateAsUpdate(queued));
    const sessionCapture = JSON.stringify(
      captureDocumentFromField(binding.text, binding.fieldMeta, P0).document,
    );
    expect(sessionCapture).toContain("QB");
    const journal = provider.journal();
    expect(journal.filter((event) => event.kind === "admission")).toHaveLength(1);
    expect(journal.filter((event) => event.kind === "application")).toHaveLength(1);
  });
});

describe("CL-3b2-10 branch (b) preserved-draft migration plus explicit acknowledgement", () => {
  it("migrates the draft only, refuses without acknowledgement, admits with it", () => {
    const provider = createAdmissionCapableTestDoubleProvider();
    provider.seedAuthority(DOC, FIELD, paragraphDoc("p:1", "ab"), P0, "1");
    provider.hostMintMigration(DOC);
    const vectorAfterMigration = provider.authorityVectorHex(DOC);

    // C works offline on epoch 1 with a queued edit (seeded from the
    // pre-migration content, then edited while disconnected).
    const offline = new Y.Doc();
    seedFieldFromDocument(
      offline.getText(fieldTextName(FIELD)),
      offline.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      FIELD,
      paragraphDoc("p:1", "ab"),
    );
    offline.transact(() => {
      offline.getText(fieldTextName(FIELD)).insert(1, "QC");
    });
    const draftCapture = captureDocumentFromField(
      offline.getText(fieldTextName(FIELD)),
      offline.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
      P0,
    );
    expect(JSON.stringify(draftCapture.document)).toContain("QC");

    // C reconnects on the stale epoch: refused, draft byte-identical.
    const draftBefore = JSON.stringify(draftCapture);
    const stale = provider.openSessionAdmitted({
      documentId: DOC,
      sessionId: "session:c",
      fieldKeys: [FIELD],
      actorId: "actor-c",
      client: { clientProfileId: P0, clientSchemaEpoch: "1" },
    });
    expect(stale.admitted).toBe(false);
    if (stale.admitted) throw new Error("stale epoch must refuse");
    expect(stale.refusal.reason).toBe("incompatible-schema");
    const draftReread = JSON.stringify(
      captureDocumentFromField(
        offline.getText(fieldTextName(FIELD)),
        offline.getMap(fieldMetaName(FIELD)) as Y.Map<unknown>,
        P0,
      ),
    );
    expect(draftReread, "draft byte-identical across the refusal").toBe(draftBefore);

    // The host seam migrates C's preserved draft only.
    const migratedDraft = provider.hostMigratePreservedDraft(DOC, draftCapture.document);
    expect(migratedDraft.profileId).toBe(P0);
    expect(migratedDraft.schemaEpoch).toBe("2");
    expect(
      JSON.stringify(migratedDraft.draft),
      "migrated draft carries the preserved content",
    ).toBe(JSON.stringify(draftCapture.document));
    expect(provider.authorityVectorHex(DOC), "authority not migrated a second time").toBe(
      vectorAfterMigration,
    );
    expect(
      provider.journal().filter((event) => event.kind === "migration"),
      "exactly one authoritative migration",
    ).toHaveLength(1);

    // The same draft presented again at N+1 without the acknowledgement is
    // refused again.
    const withoutAck = provider.openSessionAdmitted({
      documentId: DOC,
      sessionId: "session:c",
      fieldKeys: [FIELD],
      actorId: "actor-c",
      client: { clientProfileId: P0, clientSchemaEpoch: "2" },
    });
    expect(withoutAck.admitted, "no acknowledgement, no admission").toBe(false);

    // B... C explicitly acknowledges N+1 through the recorded
    // acknowledgement — only then admitted.
    provider.hostRecordAcknowledgement({ actorId: "actor-c", profileId: P0, schemaEpoch: "2" });
    const withAck = provider.openSessionAdmitted({
      documentId: DOC,
      sessionId: "session:c",
      fieldKeys: [FIELD],
      actorId: "actor-c",
      client: { clientProfileId: P0, clientSchemaEpoch: "2" },
    });
    expect(withAck.admitted, "acknowledged client admitted").toBe(true);
    if (!withAck.admitted) throw new Error("acknowledged client must be admitted");
    const admittedBinding = withAck.source.resolveBinding({
      documentId: DOC,
      sessionId: "session:c",
      fieldKey: FIELD,
    });
    expect(admittedBinding.identity.fieldKey).toBe(FIELD);
    void draftBefore;
    const journal = provider.journal();
    expect(
      journal.filter((event) => event.kind === "application"),
      "no partial application recorded",
    ).toHaveLength(0);
    expect(
      journal
        .filter((event) => event.kind === "acknowledgement")
        .map((event) => [event.actorId, event.toEpoch]),
    ).toEqual([["actor-c", "2"]]);
  });
});
