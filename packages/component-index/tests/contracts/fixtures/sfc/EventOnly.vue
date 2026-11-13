<script setup lang="ts">
export interface EventOnlyProps {}
export interface Detail { id: string }
defineProps<EventOnlyProps>();
defineEmits<{ select: [detail: Detail] }>();
defineSlots<{ detail?: (detail: Detail) => unknown }>();
</script>
<template><slot name="detail" id="detail" /></template>
