<script setup lang="ts">
import Icon from './Icon.vue';
defineOptions({ name: 'DiagramControlGlyph' });
defineProps<{
    plus?: boolean;
    size?: string;
}>();
</script>

<template>
  <Icon :size="size ?? 18" :class="plus ? 'lucide-plus' : 'lucide-minus'">
    <path d="M5 12h14" />
    <path v-if="plus" d="M12 5v14" />
  </Icon>
</template>
