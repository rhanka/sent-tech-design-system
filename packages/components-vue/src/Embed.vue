<script setup lang="ts">
import { classNames } from './classNames.js';

export type EmbedProps = {
  /** URL of the embedded document (required). */
  src: string;
  /**
   * Accessible name of the frame (required for a11y — every iframe must carry a
   * meaningful `title`).
   */
  title: string;
  /**
   * `sandbox` token list. Defaults to `""` for the strictest sandbox. Pass your
   * own token list to relax it deliberately.
   */
  sandbox?: string;
  /** Aspect ratio of the frame container (CSS `aspect-ratio`). Default `16/9`. */
  aspectRatio?: string;
  /** `allow` permissions policy (e.g. `"fullscreen; picture-in-picture"`). */
  allow?: string;
  /** Iframe loading strategy. Default `lazy`; use `eager` for above-the-fold embeds. */
  loading?: 'eager' | 'lazy';
  class?: string;
};

defineOptions({ name: 'Embed', inheritAttrs: false });
const props = withDefaults(defineProps<EmbedProps>(), {
  sandbox: '',
  aspectRatio: '16/9',
  allow: undefined,
  loading: 'lazy',
  class: undefined,
});
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-embed', props.class)">
    <div class="st-aspectRatio" :style="{ aspectRatio: props.aspectRatio }">
      <iframe class="st-embed__frame" :src="props.src" :title="props.title" :sandbox="props.sandbox" :allow="props.allow" :loading="props.loading"></iframe>
    </div>
  </div>
</template>
