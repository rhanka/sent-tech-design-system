<script setup lang="ts">
import { computed, reactive } from "vue";
import type { RichTextDocument } from "@sentropic/design-system-rich-text";
import RichTextEditor, { type RichTextEditorProps } from "../rich-text-editor/RichTextEditor.vue";

const props = withDefaults(defineProps<Omit<RichTextEditorProps, "value"> & { initial: RichTextDocument }>(), {
  editable: true,
});
const value = reactive(props.initial);
const editorProps = computed(() => {
  const { initial, ...rest } = props;
  return rest;
});

function updateNestedText(text: string): void {
  const first = value.blocks[0];
  if (first?.kind === "paragraph") first.text = text;
}

function currentValue(): RichTextDocument {
  return value;
}

defineExpose({ updateNestedText, currentValue });
</script>

<template>
  <RichTextEditor v-bind="editorProps" :value="value" />
</template>
