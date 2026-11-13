<script setup lang="ts">
import { computed, onUnmounted, useAttrs, watch } from 'vue';
import { classNames } from './classNames.js';

export type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  class?: string;
  closeLabel?: string;
};

defineOptions({ name: 'Modal' });
const props = withDefaults(defineProps<ModalProps>(), {
  open: false, title: undefined, description: undefined, class: undefined, closeLabel: 'Close',
});
const emit = defineEmits<{ close: [] }>();

const attrs = useAttrs();
const sectionProps = computed(() => ({
  ...attrs,
  class: classNames('st-modal', props.class),
  role: 'dialog',
  'aria-modal': 'true' as const,
  'aria-label': props.title || 'Modal',
  tabindex: -1,
}));

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', onKeyDown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    }
  },
);

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div v-if="props.open" class="st-modal__backdrop">
    <section v-bind="sectionProps">
      <div class="st-modal__header">
        <h2 v-if="props.title" class="st-modal__title">{{ props.title }}</h2>
        <button type="button" class="st-modal__close" :aria-label="props.closeLabel" @click="emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </div>
      <p v-if="props.description" class="st-modal__description">{{ props.description }}</p>
      <div class="st-modal__body"><slot /></div>
      <div v-if="$slots.footer" class="st-modal__footer"><slot name="footer" /></div>
    </section>
  </div>
</template>
