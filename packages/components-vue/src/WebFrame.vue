<script setup lang="ts">
import { computed } from 'vue';
export type WebFrameLoading = 'eager' | 'lazy';

export type WebFrameReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export type WebFrameSandboxToken =
  | 'allow-downloads'
  | 'allow-forms'
  | 'allow-modals'
  | 'allow-orientation-lock'
  | 'allow-pointer-lock'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-presentation'
  | 'allow-same-origin'
  | 'allow-scripts'
  | 'allow-storage-access-by-user-activation'
  | 'allow-top-navigation'
  | 'allow-top-navigation-by-user-activation';

export interface WebFrameConfig {
  src: string;
  title?: string;
  sandbox?: readonly WebFrameSandboxToken[] | string;
  referrerPolicy?: WebFrameReferrerPolicy;
  loading?: WebFrameLoading;
  allow?: string;
}

export type WebFrameProps = {
  frame: WebFrameConfig;
  class?: string;
};

defineOptions({ name: 'WebFrame', inheritAttrs: false });
const props = defineProps<WebFrameProps>();
const frameAttrs = computed(() => {
  const frame = props.frame;
  return { src: frame.src, title: frame.title ?? 'Embedded page',
    sandbox: typeof frame.sandbox === 'string' ? frame.sandbox : frame.sandbox?.join(' '),
    referrerpolicy: frame.referrerPolicy ?? 'strict-origin-when-cross-origin',
    loading: frame.loading ?? 'lazy', allow: frame.allow,
    ...(props.class === undefined ? {} : { class: props.class }) };
});
</script>

<template>
  <iframe v-bind="{ ...$attrs, ...frameAttrs }"></iframe>
</template>
