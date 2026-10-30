/**
 * CL-1M — collaboration model RED witnesses: presence accounting, patch
 * shape/size/bounds, read-request bounds, purity (injected clock, source
 * scan) and colour fallback. Spec §8 lot CL-1M, §§5.1–5.7, 4.3.2, 6.2.1,
 * 6.4. Environment: Node. No editor import: every assertion here runs
 * against the pure entry only.
 *
 * Observable assertions: (1) `PresenceSnapshot.total` counts the current
 * actor while `actors` excludes it; (2) the patch validator refuses a 51st
 * operation and a 20 001-unit aggregate, admits the largest valid 50-
 * operation patch, refuses a `javascript:` href and admits a `null` link
 * removal, with numeric-offset and short-key shapes rejected at the type
 * level below; (3) the read validator refuses an over-cap single page and
 * an anchor-per-offset request; (4) expiry and badge derivation take an
 * injected clock and the helper source contains no clock read; (5) a
 * colour outside `#RRGGBB` falls back.
 *
 * RED note: this file imports `./collaboration.js`, created by CL-1M. On
 * the parent commit the module does not exist, so every suite below
 * fails there at import time.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeEffectiveEditable,
  createPresenceSnapshot,
  derivePresenceBadgeState,
  isAllowedHref,
  isLockExpired,
  validateAgentPatch,
  validateAgentReadRequest,
  validateCollaborationColor,
  validateFullBlockMetadata,
} from "./collaboration.js";
import type {
  AgentEditOperation,
  AgentPatch,
  AgentPatchKey,
  CollaborationActor,
  CollaborationCapabilities,
  FieldBindingIdentity,
  LockSnapshot,
  PresenceSnapshot,
  RelativeAnchor,
} from "./collaboration.js";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

const BINDING: FieldBindingIdentity = {
  documentId: "canvas:artifact-1",
  sessionId: "session:1",
  fieldKey: "field:description",
};

function anchor(index: number): RelativeAnchor {
  return `anchor:${index}` as RelativeAnchor;
}

function basePatch(
  operations: readonly AgentEditOperation[],
): AgentPatch {
  return {
    patchId: "patch:1",
    binding: BINDING,
    actorId: "actor:agent-1",
    sessionEpoch: "epoch:1",
    baseRevision: {
      documentId: BINDING.documentId,
      stateVector: "state-vector-1",
      schemaEpoch: "epoch:schema-1",
    },
    operations,
  };
}

function insertOperation(
  index: number,
  units: number,
): AgentEditOperation {
  return {
    type: "insert",
    fieldKey: BINDING.fieldKey,
    paragraphId: `paragraph:${index}`,
    at: anchor(index),
    text: "x".repeat(units),
  };
}

function actor(
  actorId: string,
  color = "#112233",
): CollaborationActor {
  return { actorId, kind: "human", displayLabel: actorId, color };
}

const CAPABILITIES: CollaborationCapabilities = {
  currentActorId: "actor:self",
  canAcquire: false,
  canRequestUnlock: true,
  canForceUnlock: false,
};

function lockSnapshot(
  holderId: string | null,
  expiresAt: string | null,
): LockSnapshot {
  return {
    unit: { scopeRef: "scope:canvas-1" },
    holder: holderId === null ? null : actor(holderId, "#445566"),
    expiresAt,
    unlockRequestedBy: null,
  };
}

describe("presence accounting (B2 §5.1)", () => {
  it("counts the current actor in total while actors excludes it", () => {
    const self = actor("actor:self");
    const others = [actor("actor:a"), actor("actor:b")];
    const snapshot = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [self, ...others],
      currentActorId: self.actorId,
    });
    expect(snapshot.total).toBe(3);
    expect(snapshot.actors.map((entry) => entry.actorId)).toEqual([
      "actor:a",
      "actor:b",
    ]);
  });

  it("reports a lone current actor as total 1 with no co-viewers", () => {
    const snapshot: PresenceSnapshot = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [actor("actor:self")],
      currentActorId: "actor:self",
    });
    expect(snapshot.total).toBe(1);
    expect(snapshot.actors).toEqual([]);
  });
});

describe("patch shape/size/bounds validator (§5.3.1)", () => {
  it("refuses a 51st operation as too-large", () => {
    const operations = Array.from({ length: 51 }, (_, index) =>
      insertOperation(index, 1),
    );
    expect(validateAgentPatch(basePatch(operations))).toEqual({
      ok: false,
      reason: "too-large",
      detail: expect.any(String),
    });
  });

  it("refuses a 20 001-unit aggregate as too-large", () => {
    const operations = [
      ...Array.from({ length: 49 }, (_, index) =>
        insertOperation(index, 400),
      ),
      insertOperation(49, 401),
    ];
    expect(validateAgentPatch(basePatch(operations))).toMatchObject({
      ok: false,
      reason: "too-large",
    });
  });

  it("admits the largest valid 50-operation patch", () => {
    const operations = Array.from({ length: 50 }, (_, index) =>
      insertOperation(index, 400),
    );
    expect(validateAgentPatch(basePatch(operations))).toEqual({ ok: true });
  });

  it("refuses a per-operation insert above 2 000 units", () => {
    expect(
      validateAgentPatch(basePatch([insertOperation(0, 2001)])),
    ).toMatchObject({ ok: false, reason: "too-large", operationIndex: 0 });
  });

  it("refuses raw LF in insert text", () => {
    const operation: AgentEditOperation = {
      type: "insert",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      at: anchor(1),
      text: "a\nb",
    };
    expect(validateAgentPatch(basePatch([operation]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
      operationIndex: 0,
    });
  });

  it("refuses an operation addressed outside the patch binding field", () => {
    const operation: AgentEditOperation = {
      type: "insert",
      fieldKey: "field:notes",
      paragraphId: "paragraph:1",
      at: anchor(1),
      text: "x",
    };
    expect(validateAgentPatch(basePatch([operation]))).toMatchObject({
      ok: false,
      reason: "scope-denied",
      operationIndex: 0,
    });
  });

  it("refuses a full-profile operation under the p0 profile", () => {
    const operation: AgentEditOperation = {
      type: "insertHorizontalRule",
      fieldKey: BINDING.fieldKey,
      at: anchor(1),
      newParagraphId: "paragraph:hr-1",
    };
    expect(validateAgentPatch(basePatch([operation]), "p0")).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
      operationIndex: 0,
    });
  });
});

describe("link href allowlist (R-FULL-URL-1)", () => {
  function linkOperation(href: string | null): AgentEditOperation {
    return {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href,
    };
  }

  it("refuses a disallowed href scheme", () => {
    expect(
      validateAgentPatch(basePatch([linkOperation("javascript:alert(1)")])),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
  });

  it("refuses data:, file: and ftp: schemes", () => {
    for (const href of [
      "data:text/html,<p>x</p>",
      "file:///etc/passwd",
      "ftp://host/file",
      "vbscript:run()",
    ]) {
      expect(isAllowedHref(href)).toBe(false);
    }
  });

  it("admits allowlisted schemes and relative references", () => {
    for (const href of [
      "https://example.com/page",
      "HTTP://EXAMPLE.COM/UPPER",
      "mailto:someone@example.com",
      "/absolute/path",
      "//network/path",
      "relative/path",
      "?query=1",
      "#fragment",
    ]) {
      expect(isAllowedHref(href)).toBe(true);
    }
  });

  it("admits a null link removal", () => {
    expect(
      validateAgentPatch(basePatch([linkOperation(null)])),
    ).toEqual({ ok: true });
  });

  it("refuses an over-long title as too-large", () => {
    const operation: AgentEditOperation = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href: "https://example.com",
      title: "t".repeat(1025),
    };
    expect(validateAgentPatch(basePatch([operation]))).toMatchObject({
      ok: false,
      reason: "too-large",
    });
  });
});

describe("read-request bounds validator (R-READ-1)", () => {
  it("refuses an over-cap single page", () => {
    expect(
      validateAgentReadRequest({ binding: BINDING, maxParagraphs: 101 }),
    ).toEqual({
      ok: false,
      reason: "too-large",
      detail: expect.any(String),
    });
  });

  it("refuses an anchor-per-offset request beyond 256 entries", () => {
    const anchorRequests = Array.from({ length: 300 }, (_, offset) => ({
      paragraphId: `paragraph:${offset}`,
      paragraphOffset: offset,
    }));
    expect(
      validateAgentReadRequest({ binding: BINDING, anchorRequests }),
    ).toMatchObject({ ok: false, reason: "too-large" });
  });

  it("admits a lowered paragraph cap with a small anchor set", () => {
    expect(
      validateAgentReadRequest({
        binding: BINDING,
        maxParagraphs: 50,
        anchorRequests: [
          { paragraphId: "paragraph:1", paragraphOffset: 0 },
          { paragraphId: "paragraph:1", paragraphOffset: 3 },
        ],
      }),
    ).toEqual({ ok: true });
  });

  it("refuses a read addressed outside the binding field", () => {
    expect(
      validateAgentReadRequest({
        binding: BINDING,
        fieldKey: "field:notes",
      }),
    ).toMatchObject({ ok: false, reason: "scope-denied" });
  });
});

describe("expiry and badge derivation purity", () => {
  const NOW = "2026-10-29T12:00:00.000Z";

  it("evaluates expiry against the injected clock", () => {
    expect(isLockExpired({ expiresAt: null }, NOW)).toBe(false);
    expect(isLockExpired({ expiresAt: "2026-10-29T11:59:59.000Z" }, NOW)).toBe(
      true,
    );
    expect(isLockExpired({ expiresAt: NOW }, NOW)).toBe(true);
    expect(isLockExpired({ expiresAt: "2026-10-29T12:00:01.000Z" }, NOW)).toBe(
      false,
    );
  });

  it("derives badge state as pure data", () => {
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [actor("actor:self"), actor("actor:other")],
      currentActorId: "actor:self",
    });
    const input = {
      presence,
      lock: lockSnapshot("actor:other", "2026-10-29T13:00:00.000Z"),
      capabilities: CAPABILITIES,
      currentActorId: "actor:self",
      nowIso: NOW,
    };
    const first = derivePresenceBadgeState(input);
    const second = derivePresenceBadgeState(input);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      total: 2,
      lockActive: true,
      role: "viewer",
      canRequestUnlock: true,
    });
    expect(first.actors.map((entry) => entry.actorId)).toEqual([
      "actor:other",
    ]);
  });

  it("renders an expired lock as no lock", () => {
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [actor("actor:self")],
      currentActorId: "actor:self",
    });
    const state = derivePresenceBadgeState({
      presence,
      lock: lockSnapshot("actor:other", "2026-10-29T11:00:00.000Z"),
      capabilities: CAPABILITIES,
      currentActorId: "actor:self",
      nowIso: NOW,
    });
    expect(state.lockActive).toBe(false);
    expect(state.canRequestUnlock).toBe(false);
  });

  it("names the holder, requester and admin roles", () => {
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [actor("actor:self"), actor("actor:other")],
      currentActorId: "actor:self",
    });
    const heldBySelf = derivePresenceBadgeState({
      presence,
      lock: lockSnapshot("actor:self", "2026-10-29T13:00:00.000Z"),
      capabilities: CAPABILITIES,
      currentActorId: "actor:self",
      nowIso: NOW,
    });
    expect(heldBySelf.role).toBe("holder");
    expect(heldBySelf.canRequestUnlock).toBe(false);

    const requested = derivePresenceBadgeState({
      presence,
      lock: {
        ...lockSnapshot("actor:other", "2026-10-29T13:00:00.000Z"),
        unlockRequestedBy: actor("actor:self"),
      },
      capabilities: CAPABILITIES,
      currentActorId: "actor:self",
      nowIso: NOW,
    });
    expect(requested.role).toBe("requester");

    const admin = derivePresenceBadgeState({
      presence,
      lock: null,
      capabilities: { ...CAPABILITIES, canForceUnlock: true },
      currentActorId: "actor:self",
      nowIso: NOW,
    });
    expect(admin.role).toBe("admin");
    expect(admin.lockActive).toBe(false);
  });

  it("reads no clock in the helpers (source scan)", () => {
    const helpers = readFileSync(join(SRC_DIR, "collaboration.ts"), "utf8");
    expect(helpers.includes("Date.now(")).toBe(false);
    expect(helpers.includes("new Date(")).toBe(false);
  });
});

describe("colour validation (#RRGGBB, fallback otherwise)", () => {
  it("keeps a valid colour byte-identical", () => {
    expect(validateCollaborationColor("#A1B2C3")).toBe("#A1B2C3");
    expect(validateCollaborationColor("#a1b2c3")).toBe("#a1b2c3");
  });

  it("falls back outside #RRGGBB", () => {
    for (const color of ["#ABC", "red", "#GGGGGG", "", "#1234567", "112233"]) {
      expect(validateCollaborationColor(color)).toBe("transparent");
    }
  });
});

describe("type-level fixtures (checked by the package type-check)", () => {
  it("rejects a numeric-offset operation shape at compile time", () => {
    const operation = {
      type: "insert",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      // @ts-expect-error — operations are anchor-addressed; no numeric offset exists.
      offset: 2,
      text: "x",
    } satisfies AgentEditOperation;
    expect(operation.type).toBe("insert");
  });

  it("rejects a short-key patch lookup at compile time", () => {
    // @ts-expect-error — lookup takes the full AgentPatchKey only (R-REV-1).
    const key: AgentPatchKey = { documentId: "doc:1", patchId: "patch:1" };
    expect(key.patchId).toBe("patch:1");
  });

  it("rejects a short-key revert input at compile time", () => {
    function revert(input: { key: AgentPatchKey; requestedBy: string }): string {
      return input.requestedBy;
    }
    expect(
      revert({
        // @ts-expect-error — revert takes the full AgentPatchKey only (R-REV-1).
        key: { documentId: "doc:1", patchId: "patch:1" },
        requestedBy: "actor:agent-1",
      }),
    ).toBe("actor:agent-1");
  });
});

describe("CL-1M review pass 1 (href syntax and whitespace, R-FULL-URL-1)", () => {
  it("refuses empty-host and bracket-invalid http hrefs", () => {
    expect(isAllowedHref("https://")).toBe(false);
    expect(isAllowedHref("https://[invalid")).toBe(false);
    expect(isAllowedHref("//[invalid")).toBe(false);
  });

  it("refuses network-path references with an empty host (they resolve against the http(s) page scheme)", () => {
    expect(isAllowedHref("//")).toBe(false);
    expect(isAllowedHref("///path")).toBe(false);
    expect(isAllowedHref("//?query")).toBe(false);
    expect(isAllowedHref("//host/path")).toBe(true);
  });

  it("rejects leading Unicode whitespace before scheme detection", () => {
    expect(isAllowedHref(" javascript:x")).toBe(false);
    expect(isAllowedHref(" https://example.com")).toBe(false);
    expect(isAllowedHref("https://example.com ")).toBe(false);
  });

  it("keeps valid network references, relative paths and mailto", () => {
    expect(isAllowedHref("//host/path")).toBe(true);
    expect(isAllowedHref("/absolute/path")).toBe(true);
    expect(isAllowedHref("relative/path")).toBe(true);
    expect(isAllowedHref("mailto:someone@example.com")).toBe(true);
  });
});

describe("CL-1M review pass 1 (full metadata completeness, R-FULL-META-1)", () => {
  function baseMetadata(record: Record<string, unknown>): Record<string, unknown> {
    return {
      listKind: "none",
      listDepth: 0,
      blockquoteDepth: 0,
      containerOrder: [],
      ...record,
    };
  }

  it("requires headingLevel on headings and codeLanguage on code blocks", () => {
    expect(
      validateFullBlockMetadata(baseMetadata({ blockKind: "heading" })),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
    expect(
      validateFullBlockMetadata(baseMetadata({ blockKind: "codeBlock" })),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
  });

  it("refuses container counts inconsistent with depths", () => {
    expect(
      validateFullBlockMetadata(
        baseMetadata({ blockKind: "paragraph", containerOrder: ["quote"] }),
      ),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
  });

  it("rejects C1 controls in codeLanguage", () => {
    expect(
      validateFullBlockMetadata(
        baseMetadata({ blockKind: "codeBlock", codeLanguage: "xy" }),
      ),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
  });
});

describe("CL-1M review pass 1 (size budgets refuse too-large)", () => {
  function metadataRecord(record: Record<string, unknown>): Record<string, unknown> {
    return {
      listKind: "none",
      listDepth: 0,
      blockquoteDepth: 0,
      containerOrder: [],
      ...record,
    };
  }

  function linkPatch(href: string): AgentPatch {
    return basePatch([
      {
        type: "mark",
        fieldKey: BINDING.fieldKey,
        paragraphId: "paragraph:1",
        range: { start: anchor(1), end: anchor(2) },
        mark: "link",
        href,
      },
    ]);
  }

  it("refuses over-budget language, ids, href and depths as too-large", () => {
    expect(
      validateFullBlockMetadata(
        metadataRecord({ blockKind: "codeBlock", codeLanguage: "x".repeat(129) }),
      ),
    ).toMatchObject({ ok: false, reason: "too-large" });
    expect(
      validateAgentPatch(
        basePatch([
          {
            type: "splitParagraph",
            fieldKey: BINDING.fieldKey,
            paragraphId: "paragraph:1",
            at: anchor(1),
            newParagraphId: "p".repeat(257),
          },
        ]),
      ),
    ).toMatchObject({ ok: false, reason: "too-large" });
    expect(
      validateFullBlockMetadata(
        metadataRecord({
          blockKind: "paragraph",
          listKind: "none",
          listItemId: "i".repeat(257),
        }),
      ),
    ).toMatchObject({ ok: false, reason: "too-large" });
    expect(
      validateAgentPatch(linkPatch(`https://example.com/${"x".repeat(2029)}`)),
    ).toMatchObject({ ok: false, reason: "too-large" });
    expect(
      validateFullBlockMetadata(
        metadataRecord({ blockKind: "paragraph", listDepth: 2000 }),
      ),
    ).toMatchObject({ ok: false, reason: "too-large" });
  });

  it("keeps malformed values as incompatible-schema", () => {
    expect(
      validateAgentPatch(linkPatch("javascript:alert(1)")),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
    expect(
      validateFullBlockMetadata(
        metadataRecord({ blockKind: "heading", headingLevel: 7 }),
      ),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });
  });
});

describe("CL-1M review pass 1 (expiry compares instants)", () => {
  it("treats offset spellings of the same instant as expired at equality", () => {
    expect(
      isLockExpired(
        { expiresAt: "2026-10-29T12:00:00Z" },
        "2026-10-29T12:00:00.000Z",
      ),
    ).toBe(true);
    expect(
      isLockExpired(
        { expiresAt: "2026-10-29T13:00:00+01:00" },
        "2026-10-29T12:00:00.000Z",
      ),
    ).toBe(true);
  });

  it("treats an unreadable clock or expiry as not expired", () => {
    expect(isLockExpired({ expiresAt: "not-a-time" }, "2026-10-29T12:00:00.000Z")).toBe(
      false,
    );
    expect(
      isLockExpired({ expiresAt: "2026-10-29T12:00:00.000Z" }, "not-a-time"),
    ).toBe(false);
  });
});

describe("CL-1M review pass 1 (active lock requires a holder)", () => {
  it("reports holder null with no expiry as no active lock", () => {
    const presence = createPresenceSnapshot({
      scopeRef: "scope:canvas-1",
      actors: [actor("actor:self")],
      currentActorId: "actor:self",
    });
    const state = derivePresenceBadgeState({
      presence,
      lock: {
        unit: { scopeRef: "scope:canvas-1" },
        holder: null,
        expiresAt: null,
        unlockRequestedBy: null,
      },
      capabilities: CAPABILITIES,
      currentActorId: "actor:self",
      nowIso: "2026-10-29T12:00:00.000Z",
    });
    expect(state.lockActive).toBe(false);
    expect(state.role).toBe("viewer");
    expect(state.canRequestUnlock).toBe(false);
  });
});

describe("CL-1M review pass 2 (authority syntax, R-FULL-URL-1)", () => {
  it("refuses malformed authorities while keeping valid references", () => {
    for (const href of [
      "https://[invalid]",
      "https://host:abc/path",
      "https://user@",
      "//host:abc/path",
    ]) {
      expect(isAllowedHref(href)).toBe(false);
    }
    for (const href of [
      "https://u@[::1]/p",
      "https://host:8080/p",
      "//host/path",
      "relative/path",
      "mailto:someone@example.com",
    ]) {
      expect(isAllowedHref(href)).toBe(true);
    }
  });

  it("refuses malformed authorities at patch level", () => {
    const bad: AgentEditOperation = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href: "https://host:abc/path",
    };
    expect(validateAgentPatch(basePatch([bad]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });
  });
});

describe("CL-1M review pass 2 (closed operation keys, spec 723)", () => {
  function metadataOperation(
    extra: Record<string, unknown>,
  ): AgentEditOperation {
    return {
      type: "setBlockMetadata",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      metadata: {
        blockKind: "paragraph",
        listKind: "none",
        listDepth: 0,
        blockquoteDepth: 0,
        containerOrder: [],
      },
      ...extra,
    } as unknown as AgentEditOperation;
  }

  it("refuses extra keys on link, metadata and HR operations", () => {
    const linkWithUnexpected = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href: "https://example.com",
      unexpected: true,
    } as unknown as AgentEditOperation;
    expect(
      validateAgentPatch(basePatch([linkWithUnexpected])),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });

    expect(
      validateAgentPatch(basePatch([metadataOperation({ unexpected: true })])),
    ).toMatchObject({ ok: false, reason: "incompatible-schema" });

    const hrWithUnexpected = {
      type: "insertHorizontalRule",
      fieldKey: BINDING.fieldKey,
      at: anchor(1),
      newParagraphId: "paragraph:hr-1",
      unexpected: true,
    } as unknown as AgentEditOperation;
    expect(validateAgentPatch(basePatch([hrWithUnexpected]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });
  });

  it("refuses presentation-only target on a link operation", () => {
    const linkWithTarget = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href: "https://example.com",
      target: "_blank",
    } as unknown as AgentEditOperation;
    expect(validateAgentPatch(basePatch([linkWithTarget]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });
  });

  it("refuses applied on a link mark and href on a boolean mark", () => {
    const linkWithApplied = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "link",
      href: "https://example.com",
      applied: true,
    } as unknown as AgentEditOperation;
    expect(validateAgentPatch(basePatch([linkWithApplied]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });

    const boldWithHref = {
      type: "mark",
      fieldKey: BINDING.fieldKey,
      paragraphId: "paragraph:1",
      range: { start: anchor(1), end: anchor(2) },
      mark: "bold",
      applied: true,
      href: "https://example.com",
    } as unknown as AgentEditOperation;
    expect(validateAgentPatch(basePatch([boldWithHref]))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });
  });
});

describe("CL-1M review pass 2 (full fractional-second comparison)", () => {
  it("keeps the lock active when fractions differ beyond nine digits", () => {
    expect(
      isLockExpired(
        { expiresAt: "2026-10-29T12:00:00.0000000009Z" },
        "2026-10-29T12:00:00.0000000001Z",
      ),
    ).toBe(false);
  });
});

describe("CL-1M review pass 3 (RFC 3986 URI-reference grammar, R-FULL-URL-1)", () => {
  function linkPatch(href: string): AgentPatch {
    return basePatch([
      {
        type: "mark",
        fieldKey: BINDING.fieldKey,
        paragraphId: "paragraph:1",
        range: { start: anchor(1), end: anchor(2) },
        mark: "link",
        href,
      },
    ]);
  }

  it("refuses malformed references at the validator level", () => {
    for (const href of [
      "https://[::ffff:192.168.001.1]/p",
      "https://[1:2:3:4:5:6::192.0.2.1]/p",
      "https:/",
      "relative/%zz",
      "1:bad",
    ]) {
      expect(isAllowedHref(href)).toBe(false);
    }
  });

  it("refuses malformed references at the link-patch level", () => {
    for (const href of [
      "https://[::ffff:192.168.001.1]/p",
      "https://[1:2:3:4:5:6::192.0.2.1]/p",
      "https:/",
      "relative/%zz",
      "1:bad",
    ]) {
      expect(validateAgentPatch(linkPatch(href))).toMatchObject({
        ok: false,
        reason: "incompatible-schema",
      });
    }
  });

  it("refuses entity-encoded schemes at the validator and link-patch level (review 2 blocking 2)", () => {
    // The single validator decodes entities itself: no caller-side decode
    // is needed for the encoded form to refuse.
    for (const href of [
      "javascript&colon;alert(1)",
      "data&colon;text/html,x",
      "vbscript&colon;x",
      "jav&#x61;script:alert(1)",
      "jav&#x3A;script:alert(1)",
      "&#106;avascript:alert(1)",
    ]) {
      expect(isAllowedHref(href)).toBe(false);
      expect(validateAgentPatch(linkPatch(href))).toMatchObject({
        ok: false,
        reason: "incompatible-schema",
      });
    }
  });

  it("requires raw and decoded hrefs to pass with the same scheme (review 3 blocking 2)", () => {
    // RED on 825a15d1: `isAllowedHref` validated only the decoded token, so
    // an over-cap entity-padded href and `https&colon;//x` both passed.
    const overCapEntityPadded = `https://example.com/${"&#48;".repeat(500)}`;
    expect(overCapEntityPadded.length).toBeGreaterThan(2048);
    expect(isAllowedHref(overCapEntityPadded)).toBe(false);
    expect(isAllowedHref("https&colon;//x")).toBe(false);
    expect(isAllowedHref("https&amp;colon;//x")).toBe(false);
    // Valid query ampersands and `&amp;` in already-valid URLs still pass.
    expect(isAllowedHref("https://e.com/?a=1&b=2")).toBe(true);
    expect(isAllowedHref("https://e.com/?a=1&amp;b=2")).toBe(true);
    expect(isAllowedHref("?a=1&amp;b=2")).toBe(true);
    expect(validateAgentPatch(linkPatch(overCapEntityPadded))).toMatchObject({
      ok: false,
    });
    expect(validateAgentPatch(linkPatch("https&colon;//x"))).toMatchObject({
      ok: false,
      reason: "incompatible-schema",
    });
  });

  it("keeps valid network references, relative paths, mailto and literals", () => {
    for (const href of [
      "https://u@[::1]/p",
      "https://host:8080/p",
      "//host/path",
      "relative/path",
      "/absolute/path",
      "?query=1",
      "#fragment",
      "mailto:someone@example.com",
      "mailto:",
      "https://[::ffff:192.168.1.1]/p",
      "https://[v1.fe]/p",
      "https://[vF.a:b_c]/p",
    ]) {
      expect(isAllowedHref(href)).toBe(true);
    }
    expect(
      validateAgentPatch(linkPatch("https://[::ffff:192.168.1.1]/p")),
    ).toEqual({ ok: true });
  });

  it("matches Node net.isIP on every IPv6/IPv4 literal in the table", () => {
    const literals = [
      // All nine RFC 3986 IPv6address forms, ls32 as h16 pair and IPv4 tail.
      "1:2:3:4:5:6:7:8",
      "1:2:3:4:5:6:1.2.3.4",
      "::1:2:3:4:5:6:7",
      "::1:2:3:4:5:1.2.3.4",
      "1::2:3:4:5:6:7",
      "::2:3:4:5:6:7",
      "1::2:3:4:5:1.2.3.4",
      "1:2::3:4:5:6:7",
      "1:2::3:4:5:1.2.3.4",
      "1:2:3::4:5:6:7",
      "1:2:3::4:5:1.2.3.4",
      "1:2:3:4::5:6:7",
      "1:2:3:4::5:1.2.3.4",
      "1:2:3:4:5::6:7",
      "1:2:3:4:5::1.2.3.4",
      "::ffff:192.168.1.1",
      "::1.2.3.4",
      "64:ff9b::1.2.3.4",
      "::ffff:0.0.0.0",
      "0:0:0:0:0:0:0:0",
      "0:0:0:0:0:0:13.1.68.3",
      "1:2:3:4:5:6::7",
      "::1",
      "1:2:3:4:5:6:7::",
      "1::",
      "1::2",
      "fe80::",
      "::",
      "0000:0000:0000:0000:0000:0000:0000:0001",
      "ABCD::",
      // Compression and group-count violations, with and without an IPv4 tail.
      "1:2:3:4:5:6:7",
      "1:2:3:4:5:6:7:8:9",
      "1:2:3:4:5:1.2.3.4",
      "1:2:3:4:5:6::1.2.3.4",
      "1:2:3:4:5:6::192.0.2.1",
      "1:2:3:4:5:6:7:8::",
      "1::2::3",
      "12345::",
      ":",
      "1:2:3:4:5:6:7:8:",
      "::ffff:1.2.3.256",
      // Leading-zero IPv4 octets are not dec-octets.
      "::ffff:192.168.001.1",
      "::ffff:01.02.03.04",
    ];
    expect(literals.length).toBeGreaterThan(0);
    let accepted = 0;
    let refused = 0;
    for (const literal of literals) {
      const expected = isIP(literal) !== 0;
      if (expected) {
        accepted += 1;
      } else {
        refused += 1;
      }
      expect(isAllowedHref(`https://[${literal}]/p`)).toBe(expected);
    }
    expect(accepted).toBeGreaterThan(0);
    expect(refused).toBeGreaterThan(0);
  });
});

describe("computeEffectiveEditable (CL-2 R-API-2, RED)", () => {
  const BINDING_2 = {
    documentId: "canvas:doc-1",
    sessionId: "session:1",
    fieldKey: "field:body",
  };
  const SELF = "actor:self";
  const OTHER = "actor:other";
  const heldByOther: LockSnapshot = {
    unit: { scopeRef: "scope:1" },
    holder: actor(OTHER, "#112233"),
    expiresAt: null,
  };
  const heldBySelf: LockSnapshot = {
    unit: { scopeRef: "scope:1" },
    holder: actor(SELF, "#112233"),
    expiresAt: null,
  };
  const unheld: LockSnapshot = {
    unit: { scopeRef: "scope:1" },
    holder: null,
    expiresAt: null,
  };

  it("keeps admitted editors editable under a locked-by-other snapshot when bound", () => {
    expect(
      computeEffectiveEditable({ binding: BINDING_2, editable: true, lock: heldByOther, actorId: SELF }),
    ).toBe(true);
  });

  it("renders the same snapshot read-only without a binding", () => {
    expect(
      computeEffectiveEditable({ binding: null, editable: true, lock: heldByOther, actorId: SELF }),
    ).toBe(false);
  });

  it("keeps holder and unheld surfaces editable without a binding", () => {
    expect(
      computeEffectiveEditable({ binding: null, editable: true, lock: heldBySelf, actorId: SELF }),
    ).toBe(true);
    expect(
      computeEffectiveEditable({ binding: null, editable: true, lock: unheld, actorId: SELF }),
    ).toBe(true);
  });

  it("lets disabled win over every mode", () => {
    expect(
      computeEffectiveEditable({ binding: BINDING_2, editable: true, lock: null, actorId: SELF, disabled: true }),
    ).toBe(false);
    expect(
      computeEffectiveEditable({ binding: null, editable: true, lock: unheld, actorId: SELF, disabled: true }),
    ).toBe(false);
  });

  it("treats an expired held-by-other lock as no lock against the injected clock", () => {
    const expired: LockSnapshot = {
      ...heldByOther,
      expiresAt: "2026-10-29T11:00:00.000Z",
    };
    expect(
      computeEffectiveEditable({
        binding: null,
        editable: true,
        lock: expired,
        actorId: SELF,
        nowIso: "2026-10-29T12:00:00.000Z",
      }),
    ).toBe(true);
  });
});
