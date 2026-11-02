/**
 * CL-4d1 witness 11 race half — `CL-4-11-link-href-race` (spec §8 CL-4 (11)).
 *
 * Two distinct agent actors submit independent link formats over the same
 * anchored range and key — href A versus href B — as two patches under
 * distinct full keys from one retained read revision. Both delivery orders of
 * the two committed format transactions (A-then-B and B-then-A arrival at an
 * offline replica) converge to one identical effective href on the
 * authoritative doc and every replica — the pinned Yjs deterministic outcome,
 * whatever value wins. Both intents are recorded in the log, unrelated marks
 * and text stay intact, and reverting either patch still plans through the
 * log (the loser restores nothing over items the winner owns).
 *
 * DS-half sense of the race: the double evaluates patches synchronously and
 * serialises them, so genuine concurrent formatting is not expressible
 * against it — delivery-order determinism is the DS-half property witnessed
 * here (production queue/socket interleaving stays host-side). Asserting that
 * a named href must win is non-conforming: the witness pins convergence and
 * order-independence, never a winner. A sequential A-to-B replacement alone
 * does not pass: reversed delivery, both intents and the kept-later revert
 * accounting are required.
 *
 * RED on the CL-4c base: `link` patches are refused whole at the shape step.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  agentPatchFromRead,
  authDocOf,
  captureFullDoc,
  FULL_FAMILIES,
  fullBlockById,
  fullDoc,
  fullPara,
  ftext,
  makeAgentReplica,
  openAgentDriver,
  recordHumanMark,
  replicaFullDocs,
  seedAgentField,
  setupAgentBridge,
  syncAgentReplicas,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";
import type {
  AgentParagraphState,
  FullBlockMetadata,
  RelativeAnchor,
} from "./collaboration.js";
import { canonicalPlainMetadata } from "./editor-full-markdown.js";

const DOCUMENT_ID = "canvas:cl4d1-full-race";
const SESSION_ID = "session:cl4d1-full-race";
const FIELD = "description";
const EPOCH = "epoch:1";
const HUMAN = "actor:human-1";
const ACTOR_A = "actor:race-a";
const ACTOR_B = "actor:race-b";

const LINKP = "q:linkp";
const HREF_A = "https://a.example/race";
const HREF_B = "https://b.example/race";

function plainMeta(): FullBlockMetadata {
  return canonicalPlainMetadata() as FullBlockMetadata;
}

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

function paraOf(read: { fields: Array<{ paragraphs: readonly AgentParagraphState[] }> }, id: string): AgentParagraphState {
  const found = read.fields[0]?.paragraphs.find((entry) => entry.paragraphId === id);
  if (found === undefined) throw new Error(`witness: no paragraph ${id} in read`);
  return found;
}

/**
 * Effective href of the raced range. Every format in this witness covers the
 * whole paragraph, so all text runs carry the same link value — capture may
 * merge them into one run. The witness pins the uniform value, never a run.
 */
function uniformHref(block: { kind: string; segments?: readonly unknown[] }): string | null {
  if (block.kind !== "paragraph") throw new Error("witness: link paragraph missing");
  const values = new Set<string | null>();
  let runs = 0;
  for (const segment of block.segments ?? []) {
    const run = segment as { type?: unknown; marks?: { link?: unknown } };
    if (run.type !== "text") continue;
    runs += 1;
    const href = run.marks?.link;
    values.add(typeof href === "string" ? href : null);
  }
  if (runs === 0) throw new Error("witness: raced range has no text run");
  if (values.size !== 1) throw new Error("witness: raced range carries mixed hrefs");
  return [...values][0] as string | null;
}

function effectiveHrefOf(driver: AgentWitnessDriver): string | null {
  const captured = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
  const block = fullBlockById(captured, LINKP);
  if (block === undefined) throw new Error("witness: link paragraph missing");
  return uniformHref(block);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4d1 witness CL-4-11-link-href-race (%s)",
  (kind) => {
    it("converges delivery orders to one effective href with both intents logged", async () => {
      await withDriver(kind, async (driver) => {
        seedAgentField(
          driver.source,
          DOCUMENT_ID,
          SESSION_ID,
          FIELD,
          fullDoc([fullPara(LINKP, [ftext("a"), ftext("bcd"), ftext("ef")], plainMeta())]),
        );
        const setup = setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [FIELD], FULL_FAMILIES, undefined, "full");
        const { bridge, store } = setup;
        // Unrelated overlapping bold assertion before the race (human intent).
        const prime = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        recordHumanMark(driver, store, DOCUMENT_ID, SESSION_ID, {
          fieldKey: FIELD,
          mark: "bold",
          value: true,
          startAnchor: paraOf(prime, LINKP).startAnchor,
          endAnchor: paraOf(prime, LINKP).endAnchor,
          actorId: HUMAN,
          transactionId: "txn:race-prime",
        });
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        const baseReplica = makeAgentReplica(authDoc);
        const liveReplica = makeAgentReplica(authDoc);

        const read = bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: FIELD },
        });
        const range = { start: paraOf(read, LINKP).startAnchor, end: paraOf(read, LINKP).endAnchor };
        const patchA = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_A, EPOCH, [
          { type: "mark", fieldKey: FIELD, paragraphId: LINKP, range, mark: "link", href: HREF_A },
        ]);
        const svBeforeA = Y.encodeStateVector(authDoc);
        expect((await bridge.applyPatch(patchA)).status).toBe("applied");
        const updateA = Y.encodeStateAsUpdate(authDoc, svBeforeA);
        const patchB = agentPatchFromRead(read, FIELD, DOCUMENT_ID, SESSION_ID, ACTOR_B, EPOCH, [
          { type: "mark", fieldKey: FIELD, paragraphId: LINKP, range, mark: "link", href: HREF_B },
        ]);
        const svBeforeB = Y.encodeStateVector(authDoc);
        expect((await bridge.applyPatch(patchB)).status).toBe("applied");
        const updateB = Y.encodeStateAsUpdate(authDoc, svBeforeB);

        // Live replica tracks the authoritative doc through both commits.
        syncAgentReplicas(authDoc, [liveReplica]);
        const forwardReplica = makeAgentReplica(baseReplica);
        Y.applyUpdate(forwardReplica, updateA);
        Y.applyUpdate(forwardReplica, updateB);
        const reversedReplica = makeAgentReplica(baseReplica);
        Y.applyUpdate(reversedReplica, updateB);
        Y.applyUpdate(reversedReplica, updateA);
        Y.applyUpdate(reversedReplica, Y.encodeStateAsUpdate(authDoc));
        Y.applyUpdate(authDoc, Y.encodeStateAsUpdate(reversedReplica));
        syncAgentReplicas(authDoc, [liveReplica, forwardReplica, reversedReplica]);

        const hrefAuth = effectiveHrefOf(driver);
        const hrefs = new Map<string, string | null>();
        hrefs.set("auth", hrefAuth);
        const replicas = [liveReplica, forwardReplica, reversedReplica];
        const replicaDocs = replicaFullDocs(replicas, FIELD);
        expect(replicaDocs).toHaveLength(3);
        for (const [index, replicaDoc] of replicaDocs.entries()) {
          const block = replicaDoc.blocks.find((entry) => entry.paragraphId === LINKP);
          if (block === undefined) throw new Error("witness: replica link paragraph missing");
          hrefs.set(`replica-${index}`, uniformHref(block));
        }
        // Convergence and order-independence: every replica, both delivery
        // orders, one identical effective href — no named winner asserted.
        for (const [name, href] of hrefs) {
          expect(href, `effective href converges on ${name}`).toBe(hrefAuth);
        }
        const authCapture = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        for (const replicaDoc of replicaDocs) {
          expect(replicaDoc).toEqual(authCapture);
        }
        // Both actors' intents are recorded with distinct sequences.
        const linkIntents = store.provenanceLog.filter(
          (entry) => entry.mark === "link" && (entry.actorId === ACTOR_A || entry.actorId === ACTOR_B),
        );
        expect(linkIntents).toHaveLength(2);
        expect(linkIntents[0]?.seq).not.toBe(linkIntents[1]?.seq);
        // Unrelated bold assertion and all text are intact everywhere.
        for (const replicaDoc of [authCapture, ...replicaDocs]) {
          const block = replicaDoc.blocks.find((entry) => entry.paragraphId === LINKP);
          if (block?.kind !== "paragraph") throw new Error("witness: link paragraph missing");
          const texts = (block.segments ?? [])
            .filter((segment) => segment.type === "text")
            .map((segment) => (segment as { text: string }).text)
            .join("");
          expect(texts).toBe("abcdef");
          for (const segment of block.segments ?? []) {
            if (segment.type === "text") {
              expect((segment.marks as { bold?: unknown }).bold).toBe(true);
            }
          }
        }

        // Reverting either patch still plans through the log: the loser
        // restores nothing over items the winner owns (kept-later accounting,
        // no named final href asserted beyond the convergence above).
        const hrefBeforeReverts = effectiveHrefOf(driver);
        const revertA = await bridge.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: ACTOR_A, sessionEpoch: EPOCH, patchId: patchA.patchId },
          requestedBy: HUMAN,
        });
        expect(revertA.status).toBe("applied");
        expect(revertA.detail ?? "").toMatch(/kept-later [1-9]/);
        expect(effectiveHrefOf(driver)).toBe(hrefBeforeReverts);
        const revertB = await bridge.revertPatch({
          key: { documentId: DOCUMENT_ID, actorId: ACTOR_B, sessionEpoch: EPOCH, patchId: patchB.patchId },
          requestedBy: HUMAN,
        });
        expect(revertB.status).toBe("applied");
        syncAgentReplicas(authDoc, [liveReplica, forwardReplica, reversedReplica]);
        const converged = replicaFullDocs([liveReplica, forwardReplica, reversedReplica], FIELD);
        const authAfter = captureFullDoc(driver.source, DOCUMENT_ID, SESSION_ID, FIELD);
        for (const replicaDoc of converged) {
          expect(replicaDoc).toEqual(authAfter);
        }
      });
    });
  },
);
