<script>
  import RichTextEditor from "@sentropic/design-system-svelte/rich-text-editor";
  import "@sentropic/design-system-svelte/rich-text-editor.css";

  let value = $state({
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "smoke" }],
  });
  let messages = $state({
    editorLabel: "SMOKE-LABEL",
    placeholder: "SMOKE-PLACEHOLDER",
    preservedBlockLabel: "SMOKE-PRESERVED-{kind}",
    externalConflictLabel: "SMOKE-CONFLICT",
  });
</script>

<RichTextEditor {value} {messages} />
