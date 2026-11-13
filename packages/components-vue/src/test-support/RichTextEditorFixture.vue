<script setup lang="ts">
import { computed } from "vue";
import RichTextEditor, { type RichTextEditorProps } from "../rich-text-editor/RichTextEditor.vue";

const props = withDefaults(defineProps<RichTextEditorProps & { onCardSelect: () => void }>(), {
  editable: true,
});
const editorProps = computed(() => {
  const { onCardSelect, ...rest } = props;
  return rest;
});
</script>

<template>
  <div class="option-card" data-testid="editor-card" @click="props.onCardSelect">
    <span data-testid="outside-card">Outside the editor</span>
    <RichTextEditor v-bind="editorProps" />
  </div>
</template>
