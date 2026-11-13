// @vitest-environment node
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { expect, it, vi } from "vitest";
import RichTextEditor, { type RichTextEditorProps } from "./RichTextEditor.vue";

it("should render collaboration facts on the server without invoking client snapshot callbacks", async () => {
  const onLockChange = vi.fn();
  const onPresenceChange = vi.fn();
  const props: RichTextEditorProps = {
    value: {
      format: "focus.markdown.p0@1",
      blocks: [{ paragraphId: "p:1", kind: "paragraph", text: "Draft" }],
    },
    messages: {
      editorLabel: "Editor",
      placeholder: "Write here",
      preservedBlockLabel: "Preserved {kind}",
      externalConflictLabel: "Conflict",
      lockLabel: "Held by {holder}",
      presenceLabel: "{count} viewers",
    },
    lock: {
      unit: { scopeRef: "scope:one" },
      holder: { actorId: "actor:other", kind: "human", displayLabel: "Sam" },
      expiresAt: null,
    },
    presence: { scopeRef: "scope:one", actors: [], total: 3 },
    onLockChange,
    onPresenceChange,
  };

  const html = await renderToString(createSSRApp(RichTextEditor, props));

  expect(html).toContain("Held by Sam");
  expect(html).toContain("3 viewers");
  expect(html).not.toContain("ProseMirror");
  // The Svelte reference uses client-only effects for these notifications.
  expect(onLockChange).not.toHaveBeenCalled();
  expect(onPresenceChange).not.toHaveBeenCalled();
});
