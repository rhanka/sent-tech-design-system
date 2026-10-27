<!--
  RED 6 fixture: the editor nested in a clickable card carrying a selection
  handler, mirroring the dossier option-card shape (spec §11 RED 6). Typing,
  clicking into text and selecting text inside the editor must not invoke the
  card handler; clicking the card outside the editor still invokes it once.
-->
<script lang="ts">
  import RichTextEditor from "./RichTextEditor.svelte";
  import type { RichTextEditorProps } from "./RichTextEditor.svelte";

  type FixtureProps = RichTextEditorProps & {
    onCardSelect: () => void;
  };

  let { onCardSelect, ...editorProps }: FixtureProps = $props();
</script>

<div class="option-card" data-testid="editor-card" onclick={onCardSelect}>
  <span data-testid="outside-card">Outside the editor</span>
  <RichTextEditor {...editorProps} />
</div>
