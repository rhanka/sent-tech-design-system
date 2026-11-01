/**
 * Test-double publication authority for CL-3c witness 4, DS half (spec §8
 * CL-3 (4), §4.7).
 *
 * Pure test code: no Focus import, no lineage, no CAS, no publish side
 * effect. It retains a baseline (ordered blocks per field: `paragraphId`,
 * serialized text, representability), captured once from the seeded session
 * and never mutated by the session (deep-cloned at creation, deep-frozen,
 * returned by the same reference after every call).
 *
 * Refusal posture mirrors the host `captureBaselineDiff` gates, in host
 * order, before any diff: a capture that does not claim completeness is
 * refused `incomplete-capture`; a capture for a field with no baseline
 * mapping is refused `unmapped-capture`; a capture carrying an
 * unrepresentable or empty-identity block, or a duplicated `paragraphId`,
 * is refused `invalid-capture` (the host collapses the unrepresentable and
 * duplicate cases into `invalid-capture` too). The host manifest
 * identity-mismatch check (`capture-identity-mismatch`) has no DS
 * counterpart: the baseline manifest and its address mapping are host Focus
 * facts (§4.7 steps 1–2, §7.3–§7.4), so that gate stays host-side with the
 * real Focus diff, lineage and CAS publication (CL-5, register entry
 * AMB-C3). The multi-field `fields.length` half of the host completeness
 * check is likewise session-level and stays host-side; this double guards
 * the per-field completeness claim.
 *
 * Consumed only by `collab-freeze.test.ts`; never exported from any package
 * entry, never reachable from the shipped graphs.
 */
export interface FreezeTestBlock {
  paragraphId: string;
  serialized: string;
  representable: boolean;
}

export interface FreezeTestCandidate {
  complete: boolean;
  fieldKey: string;
  blocks: readonly FreezeTestBlock[];
}

export interface FreezeTestDelta {
  added: Array<{ paragraphId: string; text: string }>;
  removed: Array<{ paragraphId: string }>;
  changed: Array<{ paragraphId: string; before: string; after: string }>;
}

export type FreezeTestRefusal = "incomplete-capture" | "unmapped-capture" | "invalid-capture";

export interface FreezeTestVerdict {
  readonly refused: FreezeTestRefusal | null;
  readonly delta: FreezeTestDelta | null;
  readonly baseline: Readonly<Record<string, readonly FreezeTestBlock[]>>;
}

export interface TestPublicationAuthority {
  /** The retained baseline, by the same reference after every call. */
  readonly baseline: Readonly<Record<string, readonly FreezeTestBlock[]>>;
  /** How many candidates passed the refusal gates into the diff. */
  diffCallCount(): number;
  submitCandidate(candidate: FreezeTestCandidate): FreezeTestVerdict;
}

function deepFreeze(value: unknown): void {
  if (value === null || typeof value !== "object") return;
  if (Object.isFrozen(value)) return;
  Object.freeze(value);
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
}

/**
 * Build a candidate envelope from a `captureBoundDocument` result. The
 * envelope claims completeness exactly when the capture is the whole-field
 * read it is; representability follows the capture's own flags.
 */
export function toTestCandidate(
  fieldKey: string,
  capture: {
    document: {
      blocks: ReadonlyArray<{
        paragraphId: string;
        text?: string;
        segments?: ReadonlyArray<{ type: string; text?: string }>;
      }>;
    };
    representability: { nonRepresentableParagraphIds: ReadonlyArray<string> };
  },
): FreezeTestCandidate {
  const unrepresentable = new Set(capture.representability.nonRepresentableParagraphIds);
  return {
    complete: true,
    fieldKey,
    blocks: capture.document.blocks.map((block) => ({
      paragraphId: block.paragraphId,
      serialized:
        block.text ??
        (block.segments ?? [])
          .map((segment) => (segment.type === "text" ? (segment.text ?? "") : ""))
          .join(""),
      representable: !unrepresentable.has(block.paragraphId),
    })),
  };
}

export function createTestPublicationAuthority(sessionOpen: Record<string, readonly FreezeTestBlock[]>): TestPublicationAuthority {
  const retained: Record<string, FreezeTestBlock[]> = {};
  for (const [fieldKey, blocks] of Object.entries(sessionOpen)) {
    retained[fieldKey] = blocks.map((block) => ({ ...block }));
  }
  deepFreeze(retained);
  let diffCalls = 0;
  return {
    baseline: retained,
    diffCallCount: () => diffCalls,
    submitCandidate(candidate) {
      if (candidate.complete !== true) {
        return { refused: "incomplete-capture", delta: null, baseline: retained };
      }
      const prior = retained[candidate.fieldKey];
      if (prior === undefined) {
        return { refused: "unmapped-capture", delta: null, baseline: retained };
      }
      const seen = new Set<string>();
      for (const block of candidate.blocks) {
        if (!block.representable || !block.paragraphId || seen.has(block.paragraphId)) {
          return { refused: "invalid-capture", delta: null, baseline: retained };
        }
        seen.add(block.paragraphId);
      }
      diffCalls += 1;
      const priorById = new Map(prior.map((block) => [block.paragraphId, block.serialized] as const));
      const candidateById = new Map(candidate.blocks.map((block) => [block.paragraphId, block.serialized] as const));
      const delta: FreezeTestDelta = { added: [], removed: [], changed: [] };
      for (const block of candidate.blocks) {
        const before = priorById.get(block.paragraphId);
        if (before === undefined) {
          delta.added.push({ paragraphId: block.paragraphId, text: block.serialized });
        } else if (before !== block.serialized) {
          delta.changed.push({ paragraphId: block.paragraphId, before, after: block.serialized });
        }
      }
      for (const block of prior) {
        if (!candidateById.has(block.paragraphId)) {
          delta.removed.push({ paragraphId: block.paragraphId });
        }
      }
      return { refused: null, delta, baseline: retained };
    },
  };
}
