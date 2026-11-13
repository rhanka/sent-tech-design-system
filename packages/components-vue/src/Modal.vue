<script setup lang="ts">
import Icon from './Icon.vue';
import { computed, onUnmounted, watch } from 'vue';
import { classNames } from './classNames.js';

export type ModalProps = {
  open?: boolean;
  title?: string;
  description?: string;
  class?: string;
  closeLabel?: string;
};

defineOptions({ name: 'Modal', inheritAttrs: false });
const props = withDefaults(defineProps<ModalProps>(), {
  open: false, title: undefined, description: undefined, class: undefined, closeLabel: 'Close',
});
const emit = defineEmits<{ close: [] }>();


const sectionProps = computed(() => ({

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
defineSlots<{ "default"?: () => unknown; "footer"?: () => unknown }>();
</script>

<template>
  <div v-if="props.open" class="st-modal__backdrop">
    <section v-bind="{ ...$attrs, ...sectionProps }">
      <div class="st-modal__header">
        <h2 v-if="props.title" class="st-modal__title">{{ props.title }}</h2>
        <button type="button" class="st-modal__close" :aria-label="props.closeLabel" @click="emit('close')">
          <Icon name="x" :size="18" />
        </button>
      </div>
      <p v-if="props.description" class="st-modal__description">{{ props.description }}</p>
      <div class="st-modal__body"><slot /></div>
      <div v-if="$slots.footer" class="st-modal__footer"><slot name="footer" /></div>
    </section>
  </div>
</template>
