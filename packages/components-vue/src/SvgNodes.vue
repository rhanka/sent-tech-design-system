<script setup lang="ts">
import type { IconNode } from './icon-data.js';
defineOptions({ name: 'SvgNodes' });
const props = defineProps<{ nodes: IconNode }>();
</script>
<template>
  <template v-for="([tag, attributes], index) in props.nodes" :key="index">
    <path v-if="tag === 'path'" v-bind="attributes" />
    <circle v-else-if="tag === 'circle'" v-bind="attributes" />
    <line v-else-if="tag === 'line'" v-bind="attributes" />
    <polyline v-else-if="tag === 'polyline'" v-bind="attributes" />
    <polygon v-else-if="tag === 'polygon'" v-bind="attributes" />
    <rect v-else-if="tag === 'rect'" v-bind="attributes" />
    <ellipse v-else-if="tag === 'ellipse'" v-bind="attributes" />
  </template>
</template>
