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
import {
  boundLocalOriginFor,
  boundMarkOriginFor,
  createBoundUndoManager,
} from "./editor-collaboration.js";
import type { LiveSessionBindingSource } from "./editor-collaboration.js";
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
  const [codec, projection, selection] = await Promise.all([
    import("./collab-codec.js"),
    import("./collab-projection.js"),
    import("./collab-selection.js"),
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
    initialDocument: initial.document,
  });
}
