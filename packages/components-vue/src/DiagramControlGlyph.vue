<script setup lang="ts">
import Icon from './Icon.vue';
defineOptions({ name: 'DiagramControlGlyph' });
defineProps<{
    plus?: boolean;
    size?: string;
}>();
</script>

<template>
  <Icon bare :size="size ?? 18" :stroke-width="2" :svg-class="plus ? 'lucide-icon lucide lucide-plus' : 'lucide-icon lucide lucide-minus'" aria-hidden="true">
    <path d="M5 12h14" />
    <path v-if="plus" d="M12 5v14" />
  </Icon>
</template>
