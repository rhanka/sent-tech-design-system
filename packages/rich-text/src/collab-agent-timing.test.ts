/**
 * CL-4d2 §8.5 agent-patch timing through the double (register AMB-D9; both
 * sources, headless). DS-side evidence only: "visible" means
 * replica-observable (receipt `applied` plus capture equality on synced
 * replicas), never a mounted client. No budget number is asserted here and
 * no budget is edited in this sub-lot; the comparison against the §8.5 row
 * (p50/p95/max, p95 ≤ 250 ms) lives in the report, never in a test
 * assertion that machine load could flip.
 *
 * Method per repetition: reseed a 200-character paragraph, open a fresh
 * double (fresh token bucket and receipt store, so the measurement never
 * records `rate-limited` time as apply time), retain one read, construct
 * exactly 20 mixed operations addressed through sequential anchor
 * resolution (rotating retained anchors, never 20 copies of one stale
 * anchor: 12 inserts + 4 bold marks over rotating ranges + 4 splits with
 * unique new ids), present the patch, and measure the interval from
 * `applyPatch` presentation to the applied effects being observable on
 * synced replicas. Warm-up repetitions are excluded by a stated count
 * (5 per source). At least 30 measured repetitions per source.
 *
 * The record travels with the report (pasted stdout summary below, method
 * and hardware included); this harness writes no committed artefact.
 *
 * RED on the CL-4d1 base: this file does not exist, so the run fails at
 * setup with "No test files found".
 */
import { existsSync } from "node:fs";
import { cpus, arch, platform, release } from "node:os";
import { describe, expect, it } from "vitest";
import {
  agentPatchFromRead,
  authDocOf,
  authTexts,
  makeAgentReplica,
  openAgentDriver,
  p0Doc,
  p0Para,
  replicaTexts,
  setupAgentBridge,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import { seedFieldFromDocument } from "./collab-codec.js";
import type { AgentEditOperation, RelativeAnchor } from "./collaboration.js";

const DOCUMENT_ID = "canvas:cl4d2-timing";
const SESSION_ID = "session:cl4d2-timing";
const FIELD = "description";
const P1 = "paragraph:1";
const WARMUP = 5;
const REPS = 30;
const SEED_TEXT = "abcdefghij".repeat(20);
const HOLD_PATH = "/home/antoinefa/src/sent-tech-design-system/scratchpad/HOLD-HEAVY";

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, [FIELD]);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function seedTimingField(driver: AgentWitnessDriver): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD });
  seedFieldFromDocument(binding.text, binding.fieldMeta, FIELD, p0Doc([p0Para(P1, SEED_TEXT)]));
}

function timingAnchorRequests(): Array<{ paragraphId: string; paragraphOffset: number }> {
  return Array.from({ length: 20 }, (_, index) => ({ paragraphId: P1, paragraphOffset: index * 10 }));
}

/** Exactly 20 mixed operations over rotating retained anchors. */
function twentyOps(
  read: { fields: Array<{ paragraphs: Array<{ endAnchor: RelativeAnchor }>; requestedAnchors?: readonly RelativeAnchor[] }> },
  rep: number,
): AgentEditOperation[] {
  const requested = read.fields[0]?.requestedAnchors ?? [];
  const fallback = read.fields[0]?.paragraphs[0]?.endAnchor as RelativeAnchor;
  const anchors = requested.length > 0 ? [...requested] : [fallback];
  const at = (index: number): RelativeAnchor => anchors[index % anchors.length] as RelativeAnchor;
  const ops: AgentEditOperation[] = [];
  for (let index = 0; index < 12; index += 1) {
    ops.push({ type: "insert", fieldKey: FIELD, paragraphId: P1, at: at(rep + index), text: "x" });
  }
  for (let index = 0; index < 4; index += 1) {
    const first = (rep + index) % (anchors.length - 1);
    ops.push({
      type: "mark",
      fieldKey: FIELD,
      paragraphId: P1,
      range: { start: at(first), end: at(first + 1) },
      mark: "bold",
      applied: true,
    });
  }
  for (let index = 0; index < 4; index += 1) {
    ops.push({
      type: "splitParagraph",
      fieldKey: FIELD,
      paragraphId: P1,
      at: at(rep + index * 2),
      newParagraphId: `p:timing-${rep}-${index}`,
    });
  }
  expect(ops).toHaveLength(20);
  return ops;
}

function percentile(sorted: readonly number[], quantile: number): number {
  if (sorted.length === 0) throw new Error("timing witness: no samples");
  const rank = quantile * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  const lowValue = sorted[low] as number;
  const highValue = sorted[high] as number;
  return lowValue + (highValue - lowValue) * (rank - low);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "§8.5 agent-patch timing through the double, DS-side (%s)",
  (kind) => {
    it(
      "collects 30 applied headless repetitions with replica-observable effects",
      async () => {
        await withDriver(kind, async (driver) => {
          // Warm-up (excluded): exercises the same path once the session is live.
          for (let rep = 0; rep < WARMUP; rep += 1) {
            seedTimingField(driver);
            const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
            const actor = `actor:timing-warm-${kind}-${rep}`;
            bridge.admitAgentActor({ actorId: actor, displayLabel: "Timing", color: "#112233" });
            const read = bridge.readState({
              binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
              anchorRequests: timingAnchorRequests(),
            });
            const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, `epoch:warm-${rep}`, twentyOps(read, rep));
            expect((await bridge.applyPatch(patch)).status).toBe("applied");
          }
          const durations: number[] = [];
          for (let rep = 0; rep < REPS; rep += 1) {
            seedTimingField(driver);
            // Fresh double per repetition: the token bucket stays
            // non-limiting, so no repetition records `rate-limited` time.
            const { bridge } = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD]);
            const actor = `actor:timing-${kind}-${rep}`;
            bridge.admitAgentActor({ actorId: actor, displayLabel: "Timing", color: "#112233" });
            const read = bridge.readState({
              binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
              anchorRequests: timingAnchorRequests(),
            });
            const patch = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, actor, `epoch:timing-${rep}`, twentyOps(read, rep));
            const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
            const started = performance.now();
            const receipt = await bridge.applyPatch(patch);
            expect(receipt.status).toBe("applied");
            expect(receipt.operationResults).toHaveLength(20);
            const expected = authTexts(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
            const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
            syncAgentReplicas(authDoc, replicas);
            for (const replica of replicaTexts(replicas, FIELD)) {
              expect(replica).toEqual(expected);
            }
            durations.push(performance.now() - started);
          }
          expect(durations).toHaveLength(REPS);
          const sorted = [...durations].sort((left, right) => left - right);
          const summary = {
            source: kind,
            repetitions: REPS,
            warmupExcluded: WARMUP,
            construction: "20 ops (12 inserts + 4 bold marks + 4 splits), rotating retained anchors, fresh double per repetition",
            visibleDefinition: "receipt applied + capture equality on two synced replicas",
            p50Ms: percentile(sorted, 0.5),
            p95Ms: percentile(sorted, 0.95),
            maxMs: sorted[sorted.length - 1],
            hardware: {
              cpu: cpus()[0]?.model ?? "unknown",
              arch: arch(),
              platform: `${platform()} ${release()}`,
              node: process.version,
              holdHeavyPresent: existsSync(HOLD_PATH),
            },
            samplesMs: durations,
          };
          process.stdout.write(`CL-4d2 timing ${JSON.stringify(summary)}\n`);
        });
      },
      120000,
    );
  },
);
