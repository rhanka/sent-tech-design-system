<!--
  RED nested-controlled-update fixture: the host holds its document in
  `$state` and mutates `value.blocks[0].text` in place, without replacing
  the document reference (spec §5.6 imposes no immutable-replacement rule).
-->
<script lang="ts">
  import RichTextEditor from "./RichTextEditor.svelte";
  import type { RichTextDocument } from "@sentropic/design-system-rich-text";
  import type { RichTextEditorProps } from "./RichTextEditor.svelte";

  type FixtureProps = Omit<RichTextEditorProps, "value" | "messages"> & {
    initial: RichTextDocument;
    messages: RichTextEditorProps["messages"];
  };

  let { initial, messages, ...rest }: FixtureProps = $props();

  let value: RichTextDocument = $state(initial);

  export function updateNestedText(text: string): void {
    const first = value.blocks[0];
    if (first !== undefined && first.kind === "paragraph") {
      first.text = text;
    }
  }

  export function currentValue(): RichTextDocument {
    return value;
  }
</script>

<RichTextEditor {value} {messages} {...rest} />
