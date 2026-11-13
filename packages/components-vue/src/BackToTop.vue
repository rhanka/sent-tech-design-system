<script setup lang="ts">
import Icon from './Icon.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { classNames } from './classNames.js';

export type BackToTopProps = {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  class?: string;
};

defineOptions({ name: 'BackToTop', inheritAttrs: false });
const props = withDefaults(defineProps<BackToTopProps>(), {
  label: 'Retour en haut',
  disabled: false,
  targetId: 'top',
  threshold: 240,
  autoHide: true,
  smooth: true,
  class: undefined,
});

const visible = ref(!props.autoHide);

function updateVisibility() {
  visible.value = window.scrollY > props.threshold;
}

onMounted(() => {
  if (!props.autoHide || typeof window === 'undefined') {
    visible.value = true;
    return;
  }
  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateVisibility);
  }
});

const hidden = computed(() => props.autoHide && !visible.value);

function goTop() {
  const target = props.targetId ? `#${props.targetId.replace(/^#/, '')}` : '#top';
  const anchor = target.startsWith('#') ? target.slice(1) : target;
  const element = anchor ? document.getElementById(anchor) : null;
  if (element) {
    element.scrollIntoView({ behavior: props.smooth ? 'smooth' : 'auto', block: 'start' });
    return;
  }
  window.scrollTo({ top: 0, behavior: props.smooth ? 'smooth' : 'auto' });
}
</script>

<template>
  <button
    v-bind="{ ...($attrs), class: (classNames('st-backToTop', props.class)) }"
    type="button"

    :aria-label="props.label"
    :aria-hidden="hidden ? 'true' : undefined"
    :aria-live="hidden ? 'polite' : undefined"
    :tabindex="hidden ? -1 : undefined"
    :disabled="props.disabled"
    @click="goTop"
  >
    <span class="st-backToTop__icon" aria-hidden="true">
      <Icon name="arrow-up" :size="16" />
    </span>
    <span class="st-backToTop__label">{{ props.label }}</span>
  </button>
</template>
