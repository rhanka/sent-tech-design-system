<script setup lang="ts" vapor>
// API witness for Dropdown's conditional listbox + Teleport shape. Production
// Dropdown retains its VNode-valued labels until the V0b semantic mapping.
import { ref } from 'vue';
import type { DropdownProps } from '../Dropdown.vue';
const props = withDefaults(defineProps<DropdownProps>(), { open: undefined });
const emit = defineEmits<{ select: [value: string]; 'update:open': [value: boolean] }>();
const localOpen = ref(false);
const isOpen = () => props.open ?? localOpen.value;
function setOpen(value: boolean) { localOpen.value = value; emit('update:open', value); }
function select(value: string) { emit('select', value); setOpen(false); }
</script>

<template>
  <button aria-haspopup="listbox" :aria-expanded="isOpen()" @click="setOpen(!isOpen())">{{ label ?? 'Select' }}</button>
  <Teleport v-if="isOpen()" to="body">
    <div role="listbox" :aria-label="label ?? 'Select'">
      <button v-for="option in options" :key="option.value" role="option" :disabled="option.disabled" @click="select(option.value)">{{ option.label }}</button>
    </div>
  </Teleport>
</template>
