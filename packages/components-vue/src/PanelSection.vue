<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue';
import { classNames } from './classNames.js';
import { PANEL_STACK_KEY } from './panel-stack-context.js';
import Icon from './Icon.vue';


export type PanelSectionProps = {
  id: string;
  label: string;
  class?: string;
};
defineOptions({ name: 'PanelSection', inheritAttrs: false });
const props = withDefaults(defineProps<PanelSectionProps>(), { class: undefined });
defineSlots<{ default?: () => unknown; actions?: () => unknown }>();


    const stack = inject(PANEL_STACK_KEY, undefined);

    const rootEl = ref<HTMLElement | null>(null);

    const headerEl = ref<HTMLElement | null>(null);


    // Register with the parent stack (mount order) so it can fall back to
    // "the first section" whenever nothing else designates a scroll owner
    // (unset or stale `expanded`/`primary`) — see PanelStack.ts's `register`.
    // Same register-in-onMounted / return-the-unregister-callback idiom as
    // SelectableRow.
    let unregister: (() => void) | null = null;

    function doRegister() {
      unregister?.();
      unregister = null;
      if (stack && rootEl.value && headerEl.value) {
        unregister = stack.register(props.id, rootEl.value, headerEl.value);
      }
    }

    onMounted(() => doRegister());

    // Re-register under the new id if it ever changes while mounted.
    watch(() => props.id, () => doRegister());

    onBeforeUnmount(() => {
      unregister?.();
      unregister = null;
    });


    function onTriggerClick() {
      stack?.toggle(props.id);
    }
const triggerId = computed(() => `st-panelSection-trigger-${props.id}`);
const regionId = computed(() => `st-panelSection-region-${props.id}`);
const isPrimary = computed(() => stack?.isPrimary(props.id) ?? false);
const expanded = computed(() => stack?.isExpanded(props.id) ?? true);
const scrollOwner = computed(() => stack?.isScrollOwner(props.id) ?? true);
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-panelSection', scrollOwner && 'st-panelSection--scrollOwner', props.class)) }" ref="rootEl"  :data-panel-section-id="props.id">
    <div ref="headerEl" class="st-panelSection__header"><h3 class="st-panelSection__heading"><span v-if="isPrimary" class="st-panelSection__title st-panelSection__title--primary" :id="triggerId">{{ props.label }}</span><button v-else type="button" class="st-panelSection__trigger" :aria-expanded="expanded ? 'true' : 'false'" :aria-controls="regionId" :id="triggerId" @click="onTriggerClick"><span class="st-panelSection__title">{{ props.label }}</span><span :class="classNames('st-panelSection__icon', expanded && 'st-panelSection__icon--expanded')" aria-hidden="true"><Icon name="chevron-down" bare :size="18" :stroke-width="2.25" aria-hidden="true" /></span></button></h3><div v-if="$slots.actions" class="st-panelSection__actions"><slot name="actions" /></div></div>
    <div :class="classNames('st-panelSection__body', scrollOwner ? 'st-panelSection__body--scrollOwner' : !expanded ? 'st-panelSection__body--collapsed' : null)" role="region" :id="regionId" :aria-labelledby="triggerId"><slot /></div>
  </div>
</template>
