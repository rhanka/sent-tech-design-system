<script setup lang="ts">
defineOptions({ name: 'DiagramControlGlyph' });
defineProps<{
    plus?: boolean;
    size?: string;
}>();
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    :class="['lucide-icon lucide', plus ? 'lucide-plus' : 'lucide-minus']" aria-hidden="true">
    <path d="M5 12h14" />
    <path v-if="plus" d="M12 5v14" />
  </svg>
</template>
