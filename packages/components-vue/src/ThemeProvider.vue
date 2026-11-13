<script setup lang="ts">
import { useSlots } from 'vue';
import { computed, onBeforeUnmount, watchEffect } from 'vue';
import {
  compileTheme,
  sentTechTheme,
  type TenantTheme,
} from '@sentropic/design-system-themes';
export type ThemeProviderProps = {
  theme?: TenantTheme;
  namespace?: string;
};
defineOptions({ name: 'ThemeProvider' });
const props = withDefaults(defineProps<ThemeProviderProps>(), {
  theme: () => sentTechTheme,
  namespace: 'st',
});
defineSlots<{ default?: () => unknown }>();
const css = computed(() =>
  compileTheme(props.theme, {
    selector: `[data-st-theme="${props.theme.id}"]`,
    namespace: props.namespace,
  }),
);
let styleEl: HTMLStyleElement | null = null;
watchEffect(() => {
  const theme = props.theme;
  const selector = `style[data-st-theme-provider="${theme.id}"]`;
  const existing = document.head.querySelector<HTMLStyleElement>(selector);
  if (!existing) {
    styleEl = document.createElement('style');
    styleEl.dataset.stThemeProvider = theme.id;
    document.head.appendChild(styleEl);
  } else {
    styleEl = existing;
  }
  styleEl.textContent = css.value;
});
onBeforeUnmount(() => {
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
});
</script>

<template>
  <div :data-st-theme="props.theme.id"><slot /></div>
</template>
