// The BPMN fixture selection (§2.8): criteria C1–C4 and the tie-break.
import type { BpmnCounts } from "./xml-count.js";

export interface BpmnCandidate {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly counts: BpmnCounts;
  readonly criteria: { readonly c1: boolean; readonly c2: boolean; readonly c3: boolean; readonly c4: boolean };
}

export function criteriaOf(counts: BpmnCounts): BpmnCandidate["criteria"] {
  return {
    c1: counts.pools >= 2,
    c2: counts.messageFlows >= 1,
    c3: counts.subProcesses >= 1,
    c4: counts.diagrams >= 2,
  };
}

function pathBytesAscending(a: string, b: string): number {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  const n = Math.min(ab.length, bb.length);
  for (let i = 0; i < n; i += 1) {
    if (ab[i] !== bb[i]) return (ab[i] as number) - (bb[i] as number);
  }
  return ab.length - bb.length;
}

/**
 * Select the fixture: all of C1–C4 required; tie-break by most flow nodes,
 * then most BPMNDiagram, then path bytes ascending. No eligible file gives
 * `selected: null` with `gap: "no-file-meets-all-criteria"` — never an
 * approximation.
 */
export function selectBpmnFixture(
  candidates: readonly BpmnCandidate[],
): { readonly selected: BpmnCandidate | null; readonly gap?: "no-file-meets-all-criteria" } {
  const eligible = candidates.filter((c) => c.criteria.c1 && c.criteria.c2 && c.criteria.c3 && c.criteria.c4);
  if (eligible.length === 0) return { selected: null, gap: "no-file-meets-all-criteria" };
  const sorted = [...eligible].sort((a, b) => {
    if (a.counts.flowNodes !== b.counts.flowNodes) return b.counts.flowNodes - a.counts.flowNodes;
    if (a.counts.diagrams !== b.counts.diagrams) return b.counts.diagrams - a.counts.diagrams;
    return pathBytesAscending(a.path, b.path);
  });
  return { selected: sorted[0] as BpmnCandidate };
}
