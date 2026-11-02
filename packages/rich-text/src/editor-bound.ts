/**
 * Bound editor entry (CL-3a): the collaboration runtime lives here, behind
 * the `"./editor/collaboration"` subpath of `package.json#exports`. It is
 * imported by the caller (host adapter or test) and injected into
 * `createRichTextEditor` through `collaborationRuntime`; the `"./editor"`
 * entry accepts the factory and never imports it, so no module of the
 * `"."` / `"./editor"` graphs — static or dynamic — reaches this file and
 * no bundler can emit the Yjs runtime as a chunk of a controlled artefact
 * (spec §4.9, §6.3, CL-3 witness 7; observed as the browser harness
 * provider-free failure on eb36556c, CL-3a fix 3).
 *
 * CL-3b1 (§4.5): this entry also mints the local actor origin (register
 * entry AMB-1), creates the field `UndoManager` scoped to it, and passes
 * both through `BoundImpl`. The `"./editor"` entry only ever sees the
 * type-erased handle.
 */
import type { FieldBindingIdentity } from "./collaboration.js";
import type { FormattingIntentDraft } from "./editor-collaboration.js";
import {
  boundLocalOriginFor,
  boundMarkOriginFor,
  createBoundUndoManager,
} from "./editor-collaboration.js";
import type {
  LiveSessionBindingSource,
  SessionMarkUndoPerformer,
  SessionProvenanceSink,
} from "./editor-collaboration.js";

/** Per-field mark history beside the field `UndoManager` (CL-4e §3.3).
    Private to the bound runtime: never exported, passed type-erased through
    `BoundImpl` (the `"./editor"` graph only ever sees the erased handle).
    `steps` holds one entry per mark-bearing human transaction; `gestures`
    links every local gesture (character-only, mark-only or mixed) to its
    `UndoManager` entry and, for mark-bearing gestures, to its step. */
interface BoundMarkGroup {
  mark: string;
  intentIds: string[];
}

interface BoundMarkStep {
  transactionId: string;
  fieldKey: string;
  marks: BoundMarkGroup[];
  transitionId: string | null;
  undone: boolean;
}

interface BoundGesture {
  kind: "char" | "mark" | "mixed";
  transactionId: string | null;
  charUndone: boolean;
  /** The gesture's stack item was consumed without effect (CL-4f): its
      character half can never apply again, so redo must not select it
      for a character half. The mark half stays independently addressable. */
  charRedoVoid: boolean;
  /** Undo-completion order (CL-4f): the counter value when this gesture's
      undo completed (character half, or mark outcome for mark-bearing
      halves). Redo selects the largest value first. Zero means never. */
  undoCompletedSeq: number;
}

interface BoundMarkHistory {
  steps: BoundMarkStep[];
  gestures: BoundGesture[];
  /** Monotonic undo-completion counter (CL-4f) stamping `undoCompletedSeq`. */
  undoCompletionCounter: number;
  pending:
    | {
        readonly requestId: string;
        readonly commandTransactionId: string;
        readonly expectedTransitionId: string | null;
        readonly stepTransactionId: string;
        readonly direction: "undo" | "redo";
        readonly fieldKey: string;
      }
    | null;
  readonly sessionId: string;
  readonly fieldKey: string;
}
import type { RichTextEditor, RichTextEditorOptions } from "./editor.js";
import type { RichTextProfile } from "./profile.js";
import { buildEditor } from "./editor.js";

export async function createBoundRichTextEditor(
  options: RichTextEditorOptions,
): Promise<RichTextEditor> {
  const profile: RichTextProfile = options.profile ?? "p0";
  if (profile === "full") {
    const full = await import("./editor-full-extensions.js");
    full.ensureFullEditorExtensionsRegistered();
  }
  const bindingIdentity = options.collaborationBinding as FieldBindingIdentity | undefined;
  const bindingSource = options.collaborationSource as LiveSessionBindingSource | undefined;
  if (bindingIdentity === undefined || bindingIdentity === null || bindingSource === undefined || bindingSource === null) {
    throw new Error("rich-text.bound-entry: bound mounts require a binding and a source");
  }
  const resolved = bindingSource.resolveBinding(bindingIdentity);
  const [codec, projection, selection, composition, cursor] = await Promise.all([
    import("./collab-codec.js"),
    import("./collab-projection.js"),
    import("./collab-selection.js"),
    import("./collab-composition.js"),
    import("./collab-cursor.js"),
  ]);
  // R-MAP-3: seeding is a host operation performed once at field open; the
  // binding never reseeds. An empty field Y.Text means the host has not
  // seeded it yet, so the mount fails closed instead of inventing content.
  if (resolved.text.length === 0) {
    throw new Error(
      "rich-text.collab-unseeded-field: the host seeds the field Y.Text at session open (R-MAP-3); the binding never reseeds",
    );
  }
  const initial = codec.captureDocumentFromField(
    resolved.text as never,
    resolved.fieldMeta as never,
    options.document.format,
  );
  // AMB-1: the local origin is `actor:<actorId>` when the host supplied an
  // actor, else the binding-scoped origin minted here. The mark origin is
  // derived and never tracked. The manager covers the field text plus its
  // metadata map (R-LIN-8) under exactly the local origin.
  const actorId = options.collaborationActor?.actorId ?? null;
  const localOrigin = boundLocalOriginFor(bindingIdentity, actorId);
  const markOrigin = boundMarkOriginFor(localOrigin);
  const undoManager = createBoundUndoManager({
    text: resolved.text,
    fieldMeta: resolved.fieldMeta,
    trackedOrigin: localOrigin,
  });
  const provenanceSink: SessionProvenanceSink | null = bindingSource.provenanceSink ?? null;
  const provenanceUndo: SessionMarkUndoPerformer | null = bindingSource.provenanceUndo ?? null;
  const localActorId = actorId ?? `binding:${bindingIdentity.sessionId}:${bindingIdentity.fieldKey}`;
  // CL-4e fix 1: the history exists whenever the performer does, even
  // without a sink (a host capturing intents out-of-band still gets local
  // mark steps); the recording wrapper exists whenever either is present
  // and forwards to the sink only when one was supplied.
  const markUndo: BoundMarkHistory | null =
    provenanceUndo === null
      ? null
      : {
          steps: [],
          gestures: [],
          pending: null,
          sessionId: bindingIdentity.sessionId,
          fieldKey: bindingIdentity.fieldKey,
          undoCompletionCounter: 0,
        };
  const recordingSink: SessionProvenanceSink | null =
    provenanceSink === null && markUndo === null
      ? null
      : {
          recordFormattingIntent(intent: FormattingIntentDraft): void {
            if (markUndo !== null) {
              const source = intent.source as { kind: string; transactionId?: unknown };
              const transactionId =
                source.kind === "human-transaction" && typeof source.transactionId === "string"
                  ? source.transactionId
                  : null;
              if (transactionId !== null && intent.fieldKey === markUndo.fieldKey) {
                let step = markUndo.steps.find((entry) => entry.transactionId === transactionId);
                if (step === undefined) {
                  step = {
                    transactionId,
                    fieldKey: intent.fieldKey,
                    marks: [],
                    transitionId: null,
                    undone: false,
                  };
                  markUndo.steps.push(step);
                }
                const existing = step.marks.find((group) => group.mark === intent.mark);
                if (existing === undefined) {
                  step.marks.push({ mark: intent.mark as string, intentIds: [intent.intentId] });
                } else if (!existing.intentIds.includes(intent.intentId)) {
                  existing.intentIds.push(intent.intentId);
                }
              }
            }
            if (provenanceSink !== null) {
              provenanceSink.recordFormattingIntent(intent);
            }
          },
        };
  // CL-3b2 (§4.6.1): the private composition staging driver over this
  // binding, type-erased through `BoundImpl` like the other collaboration
  // pieces. The `"./editor"` entry only ever sees the handle. The recorder
  // (sink, actor) is threaded so the commit records staged marks inside the
  // commit transaction, once (R-REV-3); never mid-composition.
  const compositionDriver = composition.createBoundCompositionDriver({
    ytext: resolved.text,
    fieldKey: bindingIdentity.fieldKey,
    localOrigin,
    undoManager,
    provenanceSink: (recordingSink ?? provenanceSink) as never,
    provenanceActorId: localActorId,
  });
  // CL-3b2 (§5.1.1): the DS remote-cursor decoration plugin plus the local
  // selection publisher over this binding. The renderer resolves remote
  // actors through the binding source's admitted-actor registry (AMB-5); the
  // local actor arrives through the type-only `collaborationActor` input
  // (AMB-1/AMB-5), falling back to the binding-scoped identity when the
  // host names no actor (renders nowhere until admitted, like a revoked
  // actor). The `"./editor"` entry only ever sees the handle.
  const cursorPublisher = cursor.createCursorPublisher({
    ytext: resolved.text,
    fieldKey: bindingIdentity.fieldKey,
    awareness: resolved.awareness,
    actor: {
      actorId: localActorId,
      displayLabel: options.collaborationActor?.displayLabel ?? localActorId,
      color: options.collaborationActor?.color ?? "",
    },
  });
  const cursorPlugin = cursor.createRemoteCursorPlugin({
    ytext: resolved.text,
    fieldKey: bindingIdentity.fieldKey,
    awareness: resolved.awareness,
    resolveActor: (remoteId: string) => bindingSource.admittedActorOf?.(remoteId) ?? null,
    localClientId: resolved.awareness.clientID,
  });
  return buildEditor(options, {
    ytext: resolved.text as never,
    fieldMeta: resolved.fieldMeta as never,
    binding: resolved as never,
    codec: codec as never,
    projection: {
      ...(projection as unknown as Record<string, unknown>),
      linearToPmPosition: selection.linearToPmPosition,
      pmPositionToLinear: selection.pmPositionToLinear,
    } as never,
    localOrigin,
    markOrigin,
    undoManager: undoManager as never,
    provenanceSink: (recordingSink ?? provenanceSink) as never,
    provenanceUndo: (provenanceUndo as never) ?? null,
    markUndo: (markUndo as never) ?? null,
    composition: compositionDriver as never,
    cursors: {
      extension: cursor.wrapCursorPlugin(cursorPlugin),
      publishSelection: (doc, anchor, head) => {
        cursorPublisher.publish(doc, anchor, head);
      },
      clearSelection: () => {
        cursorPublisher.clear();
      },
      localStateBytes: () => cursorPublisher.localStateBytes(),
    },
    initialDocument: initial.document,
  });
}
