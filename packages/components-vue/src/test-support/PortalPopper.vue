<script setup lang="ts" vapor>
import { ref } from 'vue';
import { Portal, Popper } from '../../dist/vapor/index.js';
defineProps<{ anchor: HTMLElement; target: string | HTMLElement }>();
const disabled = ref(false);
const open = ref(true);
defineExpose({ inline: () => { disabled.value = true; }, close: () => { open.value = false; } });
</script>

<template>
  <section>
    <Portal :target="target" :disabled="disabled"><button>Portal action</button></Portal>
    <Popper :anchor="anchor" :open="open" :flip="false" :shift="false" arrow><button>Popper action</button></Popper>
  </section>
</template>
