<script setup lang="ts" generic="T extends string = 'ready'">
export interface GenericProbeProps<T extends string = 'ready'> { value: T; items: T[] }
defineProps<GenericProbeProps<T>>();
defineEmits<{ select: [value: T] }>();
defineSlots<{ item: (scope: { value: T }) => unknown }>();
</script>
<template><slot name="item" :value="value" /></template>
