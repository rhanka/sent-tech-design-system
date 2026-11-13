<script setup lang="ts">
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';


// Forme item alignée sur le canon Svelte : `content` (+ `label` en alias compat).
export type UnorderedListItem = {
  /** @slot item */
  content?: string | number; children?: UnorderedListInput[] };

export type UnorderedListInput = string | number | UnorderedListItem;


export type UnorderedListProps = {
  items: UnorderedListInput[];
  nested?: boolean;
  /** Internal recursive slot address. */
  /** @internal Recursive item path. */
  path?: number[];
  class?: string;
};
defineOptions({ name: 'UnorderedList', inheritAttrs: false });
const props = withDefaults(defineProps<UnorderedListProps>(), { nested: false, class: undefined, path: () => [] });
defineSlots<{ item?: (scope: { item: UnorderedListInput; index: number; path: number[] }) => unknown }>();

function isItem(item: unknown): item is UnorderedListItem { return typeof item === 'object' && item !== null && ('content' in item || 'children' in item); }
function children(item: unknown): UnorderedListInput[] { return isItem(item) && Array.isArray(item.children) ? item.children : []; }
</script>

<template>
  <ul v-bind="{ ...($attrs), class: (classNames('st-unorderedList', props.nested && 'st-unorderedList--nested', props.class)) }" >
    <li v-for="(item, index) in props.items" :key="index" class="st-unorderedList__item"><slot v-if="$slots['item']" name="item" :item="item" :index="index" :path="[...props.path, index]" /><template v-else>{{ scalarContent(isItem(item) ? item.content : item) }}</template><UnorderedList v-if="children(item).length" :items="children(item)" nested :path="[...props.path, index]"><template v-if="$slots.item" #item="scope"><slot name="item" v-bind="scope" /></template></UnorderedList></li>
  </ul>
</template>
