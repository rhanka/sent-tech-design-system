<script setup lang="ts">
import { scalarContent } from './slotContent.js';
import { computed, ref, useId } from 'vue';
import { classNames } from './classNames.js';

export type TabItem = {
  id?: string;
  value?: string;
  label: unknown;
  content?: unknown;
  disabled?: boolean;
};
export type TabsProps = {
  items: TabItem[];
  activeValue?: string;
  activeId?: string;
  label?: string;
  onchange?: (value: string) => void;
  class?: string;
};
defineOptions({ name: 'Tabs', inheritAttrs: false });
const props = withDefaults(defineProps<TabsProps>(), {
  activeValue: undefined, activeId: undefined, label: 'Tabs', onchange: undefined, class: undefined,
});
const emit = defineEmits<{ change: [value: string] }>();
defineSlots<{
  'tab-label'?: (scope: { item: TabItem; index: number }) => unknown;
  panel?: (scope: { item: TabItem | undefined }) => unknown;
}>();

function idFrom(item: TabItem, index: number, prefix: string): string {
  return item.id ?? item.value ?? `${prefix}-${index}`;
}
function moveIndex(index: number, max: number, delta: number): number {
  if (max <= 0) return -1;
  return (index + delta + max) % max;
}
const uid = `st-tabs-${useId()}`;
const first = () => props.items.find(item => !item.disabled) ?? props.items[0];
const getInitialValue = () => {
  const f = first();
  return props.activeValue ?? props.activeId ?? (f ? idFrom(f, props.items.indexOf(f), 'tab') : 'tab-0');
};
const localCurrent = ref(getInitialValue());
const ids = computed(() => props.items.map((item, index) => idFrom(item, index, 'tab')));
const current = computed(() => props.activeValue ?? props.activeId ?? localCurrent.value);
const activeIndex = computed(() => Math.max(0, ids.value.indexOf(current.value)));
const active = computed(() => props.items[activeIndex.value] ?? first());
const tabRefs = ref<Array<HTMLElement | null>>([]);
function setTabRef(el: unknown, index: number) { tabRefs.value[index] = el as HTMLElement | null; }
function setCurrent(value: string) {
  if (props.activeValue === undefined && props.activeId === undefined) localCurrent.value = value;
  emit('change', value);
  props.onchange?.(value);
}
function activateIndex(index: number) {
  const item = props.items[index];
  if (!item || item.disabled) return;
  setCurrent(ids.value[index]);
  tabRefs.value[index]?.focus();
}
function moveTab(index: number, delta: number) {
  const enabled = props.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled);
  const enabledIndex = enabled.findIndex(({ itemIndex }) => itemIndex === index);
  const next = enabled[moveIndex(enabledIndex, enabled.length, delta)];
  if (next) activateIndex(next.itemIndex);
}
function keydown(event: KeyboardEvent, index: number) {
  if (event.key === 'ArrowRight') {
    event.preventDefault(); moveTab(index, 1);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault(); moveTab(index, -1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    const firstEnabled = props.items.findIndex(item => !item.disabled);
    activateIndex(firstEnabled >= 0 ? firstEnabled : 0);
  } else if (event.key === 'End') {
    event.preventDefault();
    const lastEnabled = props.items.map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !item.disabled).at(-1)?.itemIndex ?? props.items.length - 1;
    activateIndex(lastEnabled);
  }
}
</script>

<template>
  <section v-bind="{ ...($attrs), class: (classNames('st-tabs', props.class)) }" >
    <div class="st-tabs__list" role="tablist" :aria-label="props.label">
      <button v-for="(item, index) in props.items" :key="ids[index]" :ref="el => setTabRef(el, index)"
        :id="`${uid}-tab-${ids[index]}`" type="button" role="tab"
        :class="classNames('st-tabs__tab', ids[index] === current && 'st-tabs__tab--active')"
        :aria-selected="ids[index] === current" :aria-controls="`${uid}-panel-${ids[index]}`"
        :tabindex="ids[index] === current ? 0 : -1" :disabled="item.disabled"
        @click="activateIndex(index)" @keydown="keydown($event, index)">
        <template v-if="$slots['tab-label']"><slot name="tab-label" :item="item" :index="index" /></template>
        <template v-else>{{ scalarContent(item.label) }}</template>
      </button>
    </div>
    <div :id="`${uid}-panel-${ids[activeIndex]}`" class="st-tabs__panel" role="tabpanel" :aria-labelledby="`${uid}-tab-${ids[activeIndex]}`">
      <template v-if="$slots.panel"><slot name="panel" :item="active" /></template>
      <template v-else>{{ scalarContent(active?.content) }}</template>
    </div>
  </section>
</template>
