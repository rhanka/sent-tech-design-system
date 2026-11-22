<script setup lang="ts">
import { computed } from 'vue';
import Icon from './Icon.vue';
defineOptions({ name: 'DiagramControlGlyph' });
const props = defineProps<{
    plus?: boolean;
    kind?: 'minus' | 'plus' | 'view-all' | 'fullscreen' | 'exit-fullscreen';
    size?: string;
}>();
const resolved = computed(() => props.kind ?? (props.plus ? 'plus' : 'minus'));
const svgClass = computed(() => {
    switch (resolved.value) {
        case 'plus': return 'lucide-icon lucide lucide-plus';
        case 'view-all': return 'lucide-icon lucide lucide-scan';
        case 'fullscreen': return 'lucide-icon lucide lucide-maximize-2';
        case 'exit-fullscreen': return 'lucide-icon lucide lucide-minimize-2';
        default: return 'lucide-icon lucide lucide-minus';
    }
});
</script>

<template>
  <Icon bare :size="size ?? 18" :stroke-width="2" :svg-class="svgClass" aria-hidden="true">
    <template v-if="resolved === 'view-all'">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </template>
    <template v-else-if="resolved === 'fullscreen'">
      <path d="M15 3h6v6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
      <path d="M9 21H3v-6" />
    </template>
    <template v-else-if="resolved === 'exit-fullscreen'">
      <path d="m14 10 7-7" />
      <path d="M20 10h-6V4" />
      <path d="m3 21 7-7" />
      <path d="M4 14h6v6" />
    </template>
    <template v-else>
      <path d="M5 12h14" />
      <path v-if="resolved === 'plus'" d="M12 5v14" />
    </template>
  </Icon>
</template>
