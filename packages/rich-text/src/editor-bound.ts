/**
 * Bound editor entry (CL-3a): the collaboration runtime lives here, never in
 * the controlled graph (`./editor.js` throws for bound mounts). The browser
 * harness builds the controlled component only, so no served harness asset
 * contains the Yjs runtime; bound callers import this entry directly.
 */
import type { FieldBindingIdentity } from "./collaboration.js";
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
  const [codec, projection] = await Promise.all([
    import("./collab-codec.js"),
    import("./collab-projection.js"),
  ]);
  if (resolved.text.length === 0 && (resolved.fieldMeta as unknown as { size?: number }).size === 0) {
    codec.seedFieldFromDocument(
      resolved.text as never,
      resolved.fieldMeta as never,
      bindingIdentity.fieldKey,
      options.document,
    );
  }
  const initial = codec.captureDocumentFromField(
    resolved.text as never,
    resolved.fieldMeta as never,
    options.document.format,
  );
  return buildEditor(options, {
    ytext: resolved.text as never,
    fieldMeta: resolved.fieldMeta as never,
    binding: resolved as never,
    codec: codec as never,
    projection: projection as never,
    initialDocument: initial.document,
  });
}
