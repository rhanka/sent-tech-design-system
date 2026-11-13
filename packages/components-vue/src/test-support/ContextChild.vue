<script setup lang="ts" vapor>
import { inject, useId, getCurrentInstance, type Ref } from 'vue';
const state = inject<Ref<string>>('v0c-state')!;
const id = useId();
const legacy = getCurrentInstance();
const emit = defineEmits<{ change: [value: string] }>();
defineSlots<{ label?: (scope: {id: string}) => unknown; "default"?: () => unknown }>();
</script>

<template>
  <article :data-legacy-null="legacy === null">
    <slot name="label" :id="id" />
    <input :id="id" :value="state" />
    <slot />
    <button @click="emit('change', state + '!')">Change</button>
  </article>
</template>
