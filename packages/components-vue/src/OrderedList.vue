<script setup lang="ts">
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';


// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type OrderedListItem = { content?: unknown; children?: OrderedListInput[] };

export type OrderedListInput = unknown;


export type OrderedListProps = {
  items: OrderedListInput[];
  nested?: boolean;
  /** Internal recursive slot address. */
  /** @internal Recursive item path. */
  path?: number[];
  class?: string;
};
defineOptions({ name: 'OrderedList', inheritAttrs: false });
const props = withDefaults(defineProps<OrderedListProps>(), { nested: false, class: undefined, path: () => [] });
defineSlots<{ item?: (scope: { item: OrderedListInput; index: number; path: number[] }) => unknown }>();

function isItem(item: unknown): item is OrderedListItem { return typeof item === 'object' && item !== null && 'content' in item; }
function children(item: unknown): OrderedListInput[] { return isItem(item) && Array.isArray(item.children) ? item.children : []; }
</script>

<template>
  <ol v-bind="{ ...($attrs), class: (classNames('st-orderedList', props.nested && 'st-orderedList--nested', props.class)) }" >
    <li v-for="(item, index) in props.items" :key="index" class="st-orderedList__item"><slot v-if="$slots['item']" name="item" :item="item" :index="index" :path="[...props.path, index]" /><template v-else>{{ scalarContent(isItem(item) ? item.content : item) }}</template><OrderedList v-if="children(item).length" :items="children(item)" nested :path="[...props.path, index]"><template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template></OrderedList></li>
  </ol>
</template>
