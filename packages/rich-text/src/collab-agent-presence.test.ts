/**
 * CL-4b Task 7 — witnesses 3 and 1: awareness through the shipped plugin,
 * read-before-patch, and multi-actor convergence (spec §5.1.1, §5.5, §5.6
 * B5 read half). Every adapter/awareness/read body runs parameterised on
 * both sources with the provider label asserted, the bridge headless.
 *
 * The plugin DOM half runs in jsdom on the in-memory source only
 * (register AMB-B6): it mounts two bound fields of one document over one
 * session awareness through the shipped `createBoundRichTextEditor` and
 * the `collab-cursor.ts` decoration plugin, unmodified. The adapter,
 * `readAwareness` and read halves run on both sources headless; the
 * report shows the two coverages separately.
 *
 * RED on the CL-4a base: `readAwareness`, `publishAgentCursor` and
 * `admitAgentActor` do not exist on the bridge double, so every awareness
 * assertion below fails at setup.
 */
import { describe, expect, it, afterEach } from "vitest";
import * as Y from "yjs";
import { TextSelection } from "@tiptap/pm/state";
import type { RichTextEditor } from "./editor.js";
import { createBoundRichTextEditor } from "./editor-bound.js";
import {
  captureDocumentFromField,
  fieldTextName,
  seedFieldFromDocument,
} from "./collab-codec.js";
import type { FieldBindingIdentity, RelativeAnchor } from "./collaboration.js";
import type { RichTextDocument } from "./model.js";
import { AgentBridgeReadRefusal } from "./collab-agent-bridge.test-support.js";
import {
  agentPatchFromRead,
  authDocOf,
  capturedTexts,
  makeAgentReplica,
  openAgentDriver,
  p0Doc,
  p0Para,
  replicaTexts,
  setupAgentBridge,
  syncAgentReplicas,
  type AgentBridgeSetup,
  type AgentWitnessDriver,
} from "./collab-agent-witness.test-support.js";

const DOCUMENT_ID = "canvas:cl4b-presence";
const SESSION_ID = "session:cl4b-presence";
const BODY = "description";
const NOTES = "notes";
const AGENT_A = "actor:agent-a";
const AGENT_B = "actor:agent-b";
const AGENT_SILENT = "actor:agent-silent";
const HUMAN = "actor:human-1";
const EPOCH = "epoch:presence-1";
const P0 = "focus.markdown.p0@1";

const MESSAGES = {
  editorLabel: "SENTINEL-EDITOR-LABEL",
  placeholder: "SENTINEL-PLACEHOLDER",
  preservedBlockLabel: "SENTINEL-PRESERVED-{kind}",
  externalConflictLabel: "SENTINEL-CONFLICT",
};

async function withDriver(
  kind: "in-memory-double" | "hocuspocus",
  fields: readonly string[],
  run: (driver: AgentWitnessDriver) => Promise<void>,
): Promise<void> {
  const driver = await openAgentDriver(kind, DOCUMENT_ID, SESSION_ID, fields);
  expect(driver.label).toBe(kind);
  try {
    await run(driver);
  } finally {
    await driver.close();
  }
}

function seedField(driver: AgentWitnessDriver, fieldKey: string, document: RichTextDocument): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey });
  seedFieldFromDocument(binding.text, binding.fieldMeta, fieldKey, document);
}

function paragraphDoc(id: string, text: string): RichTextDocument {
  return { format: P0, blocks: [{ paragraphId: id, kind: "paragraph", text }] } as RichTextDocument;
}

/** Publish through the bridge and return the stored wire cursor. */
function wireCursorOf(driver: AgentWitnessDriver, clientId: number): unknown {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY });
  return binding.awareness.getStates().get(clientId);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 witness 3 — bridge awareness adapter (%s)",
  (kind) => {
    it("publishes opaque strings in and stores JSON objects, refusing flat strings untouched", async () => {
      await withDriver(kind, [BODY, NOTES], async (driver) => {
        seedField(driver, BODY, paragraphDoc("p:1", "abcdef"));
        const setup = bridgeFor(driver);
        const clientA = setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        });
        const paragraph = read.fields[0]?.paragraphs[0];
        if (paragraph === undefined) throw new Error("presence witness: no paragraph read");
        // Collapsed caret: anchor equals head in value.
        setup.bridge.publishAgentCursor({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
          actorId: AGENT_A,
          selection: { anchor: paragraph.startAnchor, head: paragraph.startAnchor },
        });
        const stored = wireCursorOf(driver, clientA) as {
          actorId?: unknown;
          user?: unknown;
          cursor?: { fieldKey?: unknown; anchor?: unknown; head?: unknown };
        };
        expect(stored.actorId).toBe(AGENT_A);
        expect(stored.user).toEqual({ name: "Agent A", color: "#112233" });
        expect(stored.cursor?.fieldKey).toBe(BODY);
        expect(typeof stored.cursor?.anchor, "wire anchor is a JSON object").toBe("object");
        expect(typeof stored.cursor?.head, "wire head is a JSON object").toBe("object");
        // A flat-string publication attempt refuses with no state touched.
        let refusal: unknown = null;
        try {
          setup.bridge.publishAgentCursor({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
            actorId: AGENT_A,
            selection: { anchor: "flat-anchor" as RelativeAnchor, head: "flat-head" as RelativeAnchor },
          });
        } catch (error) {
          refusal = error;
        }
        expect(refusal).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((refusal as AgentBridgeReadRefusal).reason).toBe("target-gone");
        expect(wireCursorOf(driver, clientA)).toBe(stored);
        // An out-of-scope field refuses with no state touched.
        let foreignRefusal: unknown = null;
        try {
          setup.bridge.publishAgentCursor({
            binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: "field:elsewhere" },
            actorId: AGENT_A,
            selection: { anchor: paragraph.startAnchor, head: paragraph.startAnchor },
          });
        } catch (error) {
          foreignRefusal = error;
        }
        expect(foreignRefusal).toBeInstanceOf(AgentBridgeReadRefusal);
        expect((foreignRefusal as AgentBridgeReadRefusal).reason).toBe("scope-denied");
        expect(wireCursorOf(driver, clientA)).toBe(stored);
      });
    });

    it("reads presence with cursors where published and presence without a caret otherwise", async () => {
      await withDriver(kind, [BODY, NOTES], async (driver) => {
        seedField(driver, BODY, paragraphDoc("p:1", "abcdef"));
        const setup = bridgeFor(driver);
        setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
        setup.bridge.admitAgentActor({ actorId: AGENT_SILENT, displayLabel: "Agent Silent", color: "#445566" });
        driver.source.registerActor?.({ actorId: HUMAN, displayLabel: "Human One", color: "#00aa00" });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        });
        const paragraph = read.fields[0]?.paragraphs[0];
        if (paragraph === undefined) throw new Error("presence witness: no paragraph read");
        setup.bridge.publishAgentCursor({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
          actorId: AGENT_A,
          selection: { anchor: paragraph.startAnchor, head: paragraph.endAnchor },
        });
        const snapshot = setup.bridge.readAwareness({
          documentId: DOCUMENT_ID,
          sessionId: SESSION_ID,
          fieldKey: BODY,
        });
        expect(snapshot.scopeRef).toBe(DOCUMENT_ID);
        const byId = new Map(snapshot.actors.map((actor) => [actor.actorId, actor]));
        expect(byId.get(AGENT_A)?.kind).toBe("agent");
        expect(byId.get(AGENT_A)?.cursor?.fieldKey).toBe(BODY);
        expect(byId.get(AGENT_A)?.cursor?.paragraphId).toBe("p:1");
        expect(byId.get(HUMAN)?.kind).toBe("human");
        expect(byId.get(AGENT_SILENT)?.kind).toBe("agent");
        expect(byId.get(AGENT_SILENT)?.cursor, "never-published agent reads present without a caret").toBeUndefined();
        expect(snapshot.total).toBe(snapshot.actors.length);
        // Clearing the agent cursor removes the caret; presence remains.
        setup.bridge.publishAgentCursor({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
          actorId: AGENT_A,
          selection: null,
        });
        const cleared = setup.bridge.readAwareness({
          documentId: DOCUMENT_ID,
          sessionId: SESSION_ID,
          fieldKey: BODY,
        });
        const clearedById = new Map(cleared.actors.map((actor) => [actor.actorId, actor]));
        expect(clearedById.get(AGENT_A)?.cursor).toBeUndefined();
        expect(clearedById.has(AGENT_A), "presence remains after clear").toBe(true);
        const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY });
        const states = [...binding.awareness.getStates().values()] as Array<{ actorId?: unknown; user?: unknown }>;
        const agentState = states.find((state) => state.actorId === AGENT_A);
        expect(agentState?.user, "awareness user field keeps presence").toEqual({ name: "Agent A", color: "#112233" });
        // An unregistered awareness state contributes no actor entry.
        (binding.awareness.getStates() as Map<number, unknown>).set(999971, {
          actorId: "actor:stranger",
          user: { name: "Stranger", color: "#999999" },
          cursor: {
            fieldKey: BODY,
            anchor: JSON.parse(paragraph.startAnchor as string),
            head: JSON.parse(paragraph.startAnchor as string),
          },
        });
        const strangers = setup.bridge.readAwareness({
          documentId: DOCUMENT_ID,
          sessionId: SESSION_ID,
          fieldKey: BODY,
        });
        expect(strangers.actors.some((actor) => actor.actorId === "actor:stranger")).toBe(false);
      });
    });
  },
);

function bridgeFor(driver: AgentWitnessDriver): AgentBridgeSetup {
  return setupAgentBridge(driver.source, DOCUMENT_ID, SESSION_ID, [BODY, NOTES]);
}

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 witness 3 — read before patching, B5 read half (%s)",
  (kind) => {
    it("reads awareness and bounded state, then patches by anchors with convergence", async () => {
      await withDriver(kind, [BODY, NOTES], async (driver) => {
        seedField(driver, BODY, paragraphDoc("p:1", "abcdef"));
        const setup = bridgeFor(driver);
        setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
        setup.bridge.admitAgentActor({ actorId: AGENT_SILENT, displayLabel: "Agent Silent", color: "#445566" });
        driver.source.registerActor?.({ actorId: HUMAN, displayLabel: "Human One", color: "#00aa00" });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        });
        const paragraph = read.fields[0]?.paragraphs[0];
        if (paragraph === undefined) throw new Error("presence witness: no paragraph read");
        setup.bridge.publishAgentCursor({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
          actorId: AGENT_A,
          selection: { anchor: paragraph.startAnchor, head: paragraph.startAnchor },
        });
        const snapshot = setup.bridge.readAwareness({
          documentId: DOCUMENT_ID,
          sessionId: SESSION_ID,
          fieldKey: BODY,
        });
        const byId = new Map(snapshot.actors.map((actor) => [actor.actorId, actor]));
        expect(byId.get(AGENT_A)?.cursor?.paragraphId).toBe("p:1");
        expect(byId.get(HUMAN)?.cursor, "human without a caret reads present").toBeUndefined();
        expect(byId.get(AGENT_SILENT)?.cursor, "silent agent reads present without a caret").toBeUndefined();
        const patch = agentPatchFromRead(read, BODY, DOCUMENT_ID, SESSION_ID, AGENT_A, EPOCH, [
          { type: "insert", fieldKey: BODY, paragraphId: "p:1", at: paragraph.endAnchor, text: "Q" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["p:1"]);
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, BODY);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        for (const texts of replicaTexts(replicas, BODY)) expect(texts).toEqual(["abcdefQ"]);
      });
    });
  },
);

const mounted: RichTextEditor[] = [];
afterEach(() => {
  for (const editor of mounted.splice(0)) {
    try {
      editor.destroy();
    } catch {
      // Teardown never masks the witness result.
    }
  }
  globalThis.document.body.innerHTML = "";
});

async function mountField(
  driver: AgentWitnessDriver,
  fieldKey: string,
  actor: { actorId: string; kind: "human"; displayLabel: string; color: string },
  seedId: string,
  seedText: string,
): Promise<{ ed: RichTextEditor; element: HTMLElement }> {
  const element = globalThis.document.createElement("div");
  globalThis.document.body.appendChild(element);
  const ed = await createBoundRichTextEditor({
    document: paragraphDoc(seedId, seedText),
    messages: { ...MESSAGES },
    allocateId: (() => {
      let n = 0;
      return () => `fresh:presence:${fieldKey}:${(n += 1)}`;
    })(),
    collaborationBinding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey } as FieldBindingIdentity,
    collaborationSource: driver.source as never,
    collaborationActor: actor as never,
    element,
  });
  mounted.push(ed);
  return { ed, element };
}

function caretsOf(element: HTMLElement, actorId: string): Element[] {
  return [...element.querySelectorAll(`[data-remote-caret="${actorId}"]`)];
}

function selectionsOf(element: HTMLElement, actorId: string): Element[] {
  return [...element.querySelectorAll(`[data-remote-selection="${actorId}"]`)];
}

/** Inject a raw remote awareness state (renderer-level only, CL-3b2 precedent). */
function injectRemoteState(driver: AgentWitnessDriver, clientId: number, state: unknown): void {
  const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY });
  binding.awareness.getStates().set(clientId, state as Record<string, unknown>);
  (
    binding.awareness as unknown as { emit: (name: string, args: unknown[]) => void }
  ).emit("change", [{ added: [clientId], updated: [], removed: [] }, "test"]);
}

describe("CL-4 witness 3 — agent carets through the shipped plugin (jsdom, in-memory only)", () => {
  it("renders each field's agent carets under registry labels, moving and clearing through the bridge", async () => {
    const driver = await openAgentDriver("in-memory-double", DOCUMENT_ID, SESSION_ID, [BODY, NOTES]);
    expect(driver.label).toBe("in-memory-double");
    try {
      seedField(driver, BODY, paragraphDoc("p:1", "abcdef"));
      seedField(driver, NOTES, paragraphDoc("n:1", "xy"));
      const setup = bridgeFor(driver);
      const clientA = setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
      const clientB = setup.bridge.admitAgentActor({ actorId: AGENT_B, displayLabel: "Agent B", color: "#445566" });
      expect(clientB, "one awareness client per agent actor").not.toBe(clientA);
      driver.source.registerActor?.({ actorId: HUMAN, displayLabel: "Human One", color: "#00aa00" });
      const edBody = await mountField(
        driver,
        BODY,
        { actorId: HUMAN, kind: "human", displayLabel: "Human One", color: "#00aa00" },
        "p:1",
        "abcdef",
      );
      const edNotes = await mountField(
        driver,
        NOTES,
        { actorId: "local-notes", kind: "human", displayLabel: "Notes Local", color: "#007700" },
        "n:1",
        "xy",
      );
      const bodyRead = setup.bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
      });
      const bodyPara = bodyRead.fields[0]?.paragraphs[0];
      if (bodyPara === undefined) throw new Error("presence witness: no body paragraph read");
      // Both agents publish collapsed/range carets in field one.
      setup.bridge.publishAgentCursor({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        actorId: AGENT_A,
        selection: { anchor: bodyPara.startAnchor, head: bodyPara.startAnchor },
      });
      setup.bridge.publishAgentCursor({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        actorId: AGENT_B,
        selection: { anchor: bodyPara.startAnchor, head: bodyPara.endAnchor },
      });
      // The human caret publishes through the local publisher by moving the
      // mounted editor's selection; it is wire-visible but never renders as
      // a remote caret (own awareness client is skipped by the renderer).
      edBody.ed.view.dispatch(edBody.ed.view.state.tr.setSelection(TextSelection.create(edBody.ed.view.state.doc, 3)));
      const binding = driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY });
      const local = binding.awareness.getLocalState() as unknown as {
        actorId?: unknown;
        user?: unknown;
        cursor?: { fieldKey?: unknown; anchor?: unknown; head?: unknown };
      };
      expect(local.actorId).toBe(HUMAN);
      expect(local.user).toEqual({ name: "Human One", color: "#00aa00" });
      expect(local.cursor?.fieldKey).toBe(BODY);
      expect(typeof local.cursor?.anchor, "human wire anchor is a JSON object").toBe("object");
      const bodyCaretsA = caretsOf(edBody.element, AGENT_A);
      expect(bodyCaretsA, "body renders the agent A collapsed caret").toHaveLength(1);
      expect(bodyCaretsA[0]?.textContent, "caret label asserted").toBe("Agent A");
      expect(
        bodyCaretsA[0]?.querySelector("[data-remote-caret-bar]")?.getAttribute("style"),
        "validated registry colour",
      ).toContain("17, 34, 51");
      expect(selectionsOf(edBody.element, AGENT_B), "body renders the agent B range").toHaveLength(1);
      expect(caretsOf(edBody.element, AGENT_B), "body renders the agent B range caret").toHaveLength(1);
      expect(caretsOf(edBody.element, HUMAN), "own caret never renders as remote").toHaveLength(0);
      expect(caretsOf(edNotes.element, AGENT_A), "notes render no body caret").toHaveLength(0);
      expect(caretsOf(edNotes.element, AGENT_B), "notes render no body caret").toHaveLength(0);
      // One agent caret moves to field two: the single cursor moves there.
      const notesRead = setup.bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: NOTES },
      });
      const notesPara = notesRead.fields[0]?.paragraphs[0];
      if (notesPara === undefined) throw new Error("presence witness: no notes paragraph read");
      setup.bridge.publishAgentCursor({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: NOTES },
        actorId: AGENT_A,
        selection: { anchor: notesPara.startAnchor, head: notesPara.startAnchor },
      });
      expect(caretsOf(edBody.element, AGENT_A), "moved caret leaves field one").toHaveLength(0);
      expect(caretsOf(edBody.element, AGENT_B), "field one keeps the other caret").toHaveLength(1);
      expect(caretsOf(edNotes.element, AGENT_A), "field two renders the moved caret").toHaveLength(1);
      // An unregistered actorId with an otherwise valid cursor renders nowhere.
      injectRemoteState(driver, 999981, {
        actorId: "actor:stranger",
        user: { name: "Stranger", color: "#999999" },
        cursor: {
          fieldKey: BODY,
          anchor: JSON.parse(bodyPara.startAnchor as string),
          head: JSON.parse(bodyPara.startAnchor as string),
        },
      });
      expect(caretsOf(edBody.element, "actor:stranger")).toHaveLength(0);
      expect(caretsOf(edNotes.element, "actor:stranger")).toHaveLength(0);
      // A client claiming another actor's id renders nothing under the
      // claimed identity (full pair mismatch).
      injectRemoteState(driver, 999982, {
        actorId: AGENT_A,
        user: { name: "Agent A", color: "#112233" },
        cursor: {
          fieldKey: BODY,
          anchor: JSON.parse(bodyPara.startAnchor as string),
          head: JSON.parse(bodyPara.startAnchor as string),
        },
      });
      expect(caretsOf(edBody.element, AGENT_A), "impersonated id renders nothing").toHaveLength(0);
      expect(caretsOf(edNotes.element, AGENT_A), "legit caret untouched").toHaveLength(1);
      // Clearing the agent cursor through the bridge removes the rendered
      // caret while presence remains.
      setup.bridge.publishAgentCursor({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: NOTES },
        actorId: AGENT_A,
        selection: null,
      });
      expect(caretsOf(edNotes.element, AGENT_A), "cleared caret removed").toHaveLength(0);
      const snapshot = setup.bridge.readAwareness({
        documentId: DOCUMENT_ID,
        sessionId: SESSION_ID,
        fieldKey: NOTES,
      });
      const byId = new Map(snapshot.actors.map((actor) => [actor.actorId, actor]));
      expect(byId.has(AGENT_A), "presence remains after clear").toBe(true);
      expect(byId.get(AGENT_A)?.cursor).toBeUndefined();
      expect(byId.get(AGENT_B)?.cursor?.paragraphId).toBe("p:1");
      expect(byId.get(HUMAN)?.cursor?.fieldKey).toBe(BODY);
      const states = [...binding.awareness.getStates().values()] as Array<{ actorId?: unknown; user?: unknown }>;
      expect(states.find((state) => state.actorId === AGENT_A)?.user, "awareness user field intact").toEqual({
        name: "Agent A",
        color: "#112233",
      });
    } finally {
      await driver.close();
    }
  });
});

describe.each([["in-memory-double"], ["hocuspocus"]] as const)(
  "CL-4 witness 1 — multi-actor convergence (%s)",
  (kind) => {
    async function runOrder(driver: AgentWitnessDriver, first: "r1" | "r2"): Promise<string[]> {
      seedField(driver, BODY, p0Doc([p0Para("p:1", "abcdef"), p0Para("p:2", "tail")]));
      const setup = bridgeFor(driver);
      setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
      const read = setup.bridge.readState({
        binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
      });
      const paragraph = read.fields[0]?.paragraphs[0];
      if (paragraph === undefined) throw new Error("presence witness: no paragraph read");
      // Two humans transact on distinct replicas without observing each
      // other; the agent patch applies headless in between.
      const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, BODY);
      const r1 = makeAgentReplica(authDoc);
      const r2 = makeAgentReplica(authDoc);
      // Fixed replica identities so both runs transact the identical
      // update set: only the delivery order varies, never the merge.
      r1.clientID = 4101;
      r2.clientID = 4202;
      r1.getText(fieldTextName(BODY)).insert(2, "H1-");
      r2.getText(fieldTextName(BODY)).insert(2, "H2-");
      const u1 = Y.encodeStateAsUpdate(r1);
      const u2 = Y.encodeStateAsUpdate(r2);
      const patch = agentPatchFromRead(read, BODY, DOCUMENT_ID, SESSION_ID, AGENT_A, EPOCH, [
        { type: "insert", fieldKey: BODY, paragraphId: "p:1", at: paragraph.endAnchor, text: "AG-" },
      ]);
      const receipt = await setup.bridge.applyPatch(patch);
      expect(receipt.status, "no structural-conflict in this run").toBe("applied");
      expect(receipt.operationResults?.[0]?.resultParagraphIds).toEqual(["p:1"]);
      if (first === "r1") {
        Y.applyUpdate(authDoc, u1);
        Y.applyUpdate(authDoc, u2);
      } else {
        Y.applyUpdate(authDoc, u2);
        Y.applyUpdate(authDoc, u1);
      }
      const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
      syncAgentReplicas(authDoc, replicas);
      const converged = replicaTexts(replicas, BODY);
      expect(converged[0]).toEqual(converged[1]);
      return converged[0] as string[];
    }

    function expectAllPresent(texts: string[]): void {
      // No whole-block replacement, no silent loss, no created paragraph:
      // the identified block holds every insertion with all pre-existing
      // characters surviving in order, and the guard paragraph is intact.
      expect(texts).toHaveLength(2);
      const line = texts[0] as string;
      expect(texts[1]).toBe("tail");
      for (const needed of ["AG-", "H1-", "H2-"]) {
        expect(line).toContain(needed);
      }
      let cursor = 0;
      for (const char of "abcdef") {
        const found = line.indexOf(char, cursor);
        expect(found, `pre-existing character survives: ${char}`).toBeGreaterThanOrEqual(0);
        cursor = found + 1;
      }
    }

    it("converges with no silent loss in both delivery orders", async () => {
      await withDriver(kind, [BODY, NOTES], async (driver) => {
        const orderA = await runOrder(driver, "r1");
        expectAllPresent(orderA);
        const orderB = await runOrder(driver, "r2");
        expectAllPresent(orderB);
        expect(orderB, "delivery order does not change the merge").toEqual(orderA);
        const captured = captureDocumentFromField(
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY }).text,
          driver.source.resolveBinding({ documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY }).fieldMeta,
          P0,
        );
        expect(captured.document.blocks.map((block) => block.paragraphId)).toEqual(["p:1", "p:2"]);
      });
    });

    it("converges when the bridge patch interleaves the human transactions", async () => {
      await withDriver(kind, [BODY, NOTES], async (driver) => {
        seedField(driver, BODY, p0Doc([p0Para("p:1", "abcdef"), p0Para("p:2", "tail")]));
        const setup = bridgeFor(driver);
        setup.bridge.admitAgentActor({ actorId: AGENT_A, displayLabel: "Agent A", color: "#112233" });
        const read = setup.bridge.readState({
          binding: { documentId: DOCUMENT_ID, sessionId: SESSION_ID, fieldKey: BODY },
        });
        const paragraph = read.fields[0]?.paragraphs[0];
        if (paragraph === undefined) throw new Error("presence witness: no paragraph read");
        const authDoc = authDocOf(driver.source, DOCUMENT_ID, SESSION_ID, BODY);
        const r1 = makeAgentReplica(authDoc);
        const r2 = makeAgentReplica(authDoc);
        r1.getText(fieldTextName(BODY)).insert(2, "H1-");
        r2.getText(fieldTextName(BODY)).insert(2, "H2-");
        const u1 = Y.encodeStateAsUpdate(r1);
        const u2 = Y.encodeStateAsUpdate(r2);
        Y.applyUpdate(authDoc, u1);
        const patch = agentPatchFromRead(read, BODY, DOCUMENT_ID, SESSION_ID, AGENT_A, EPOCH, [
          { type: "insert", fieldKey: BODY, paragraphId: "p:1", at: paragraph.endAnchor, text: "AG-" },
        ]);
        const receipt = await setup.bridge.applyPatch(patch);
        expect(receipt.status).toBe("applied");
        Y.applyUpdate(authDoc, u2);
        const replicas = [makeAgentReplica(authDoc), makeAgentReplica(authDoc)];
        syncAgentReplicas(authDoc, replicas);
        const converged = replicaTexts(replicas, BODY);
        expect(converged[0]).toEqual(converged[1]);
        expectAllPresent(converged[0] as string[]);
      });
    });
  },
);
