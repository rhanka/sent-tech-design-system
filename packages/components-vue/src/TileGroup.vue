<script setup lang="ts">
import { useId } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';


export interface TileGroupItem {
  value: string;
  /** Libellé du tile (canonique Svelte). */
  label?: unknown;
  /** @deprecated Alias de `label` (compat). Utilisez `label`. */
  title?: unknown;
  description?: unknown;
  disabled?: boolean;
}


export type TileGroupProps = {
  legend?: unknown;
  legendHidden?: boolean;
  items: TileGroupItem[];
  value?: string;
  name?: string;
  disabled?: boolean;
  class?: string;
};
defineOptions({ name: 'TileGroup', inheritAttrs: false });
const props = withDefaults(defineProps<TileGroupProps>(), { legend: undefined, legendHidden: false, value: undefined, name: undefined, disabled: false, class: undefined });
defineSlots<{ legend?: () => unknown; 'item-label'?: (scope: { item: TileGroupItem; index: number }) => unknown; 'item-description'?: (scope: { item: TileGroupItem; index: number }) => unknown }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; change: [event: Event] }>();
const uid = useId();
const groupName = () => props.name ?? `st-tileGroup-${uid}`;
function change(event: Event) { emit('update:modelValue', (event.target as HTMLInputElement).value); emit('change', event); }
</script>

<template>
  <fieldset v-bind="$attrs" :class="classNames('st-tileGroup', props.disabled && 'st-tileGroup--disabled', props.class)">
    <legend v-if="props.legend || $slots.legend" :class="classNames('st-tileGroup__legend', props.legendHidden && 'st-tileGroup__legend--hidden')"><slot v-if="$slots['legend']" name="legend" /><template v-else>{{ scalarContent(props.legend) }}</template></legend>
    <div class="st-tileGroup__items">
      <label v-for="(item, index) in props.items" :key="item.value" :class="classNames('st-tileGroup__tile', item.value === props.value && 'st-tileGroup__tile--checked', item.disabled && 'st-tileGroup__tile--disabled')">
        <input class="st-tileGroup__input" type="radio" :name="groupName()" :value="item.value" :checked="item.value === props.value" :disabled="props.disabled || item.disabled" @change="change" />
        <span class="st-tileGroup__content"><span class="st-tileGroup__label"><slot v-if="$slots['item-label']" name="item-label" :item="item" :index="index" /><template v-else>{{ scalarContent(item.label ?? item.title) }}</template></span><span v-if="item.description || $slots['item-description']" class="st-tileGroup__description"><slot v-if="$slots['item-description']" name="item-description" :item="item" :index="index" /><template v-else>{{ scalarContent(item.description) }}</template></span></span>
      </label>
    </div>
  </fieldset>
</template>
