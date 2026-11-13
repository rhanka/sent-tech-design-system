<script setup lang="ts" generic="T extends string">
export interface GenericUnknownProps<T extends string> { value: T }
defineProps<GenericUnknownProps<T>>();
defineSlots<{ item: (scope: { value: T }) => unknown }>();
</script>
<template><slot name="item" :value="value" /></template>
