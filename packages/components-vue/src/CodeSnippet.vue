<script setup lang="ts">
import { useAttrs } from 'vue';
import { classNames } from './classNames.js';
import CopyButton from './CopyButton.vue';
export type CodeSnippetProps = {
  code: string;
  language?: string;
  inline?: boolean;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  class?: string;
};
defineOptions({ name: 'CodeSnippet' });
const props = withDefaults(defineProps<CodeSnippetProps>(), {
  language: undefined,
  inline: false,
  copyable: true,
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
  class: undefined,
});
const attrs = useAttrs();
</script>

<template>
  <template v-if="props.inline"
    ><code
      v-bind="attrs"
      :class="classNames('st-codeSnippet--inline', props.class)"
      :data-language="props.language"
      >{{ props.code }}</code
    ></template
  ><template v-else
    ><div v-bind="attrs" :class="'st-codeSnippet__wrapper'">
      <pre
        :class="classNames('st-codeSnippet', props.class)"
        :data-language="props.language"
      ><code :class="'st-codeSnippet__code'">{{ props.code }}</code></pre>
      <template v-if="props.copyable"
        ><span :class="'st-codeSnippet__copy'"
          ><CopyButton
            :value="props.code"
            :size="'sm'"
            :label="props.copyLabel"
            :copiedLabel="props.copiedLabel"
          ></CopyButton></span></template
      ><template v-else></template></div
  ></template>
</template>
