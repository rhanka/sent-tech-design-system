<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

export type PaginationProps = {
  page: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  pageCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  class?: string;
};

defineOptions({ name: 'Pagination', inheritAttrs: false });
const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 10, totalItems: undefined, totalPages: undefined, pageCount: undefined,
  previousLabel: 'Previous', nextLabel: 'Next', class: undefined,
});
const emit = defineEmits<{ pageChange: [page: number] }>();

const pages = computed(() =>
  props.pageCount ??
  props.totalPages ??
  (props.totalItems
    ? Math.max(1, Math.ceil(props.totalItems / (props.pageSize ?? 10)))
    : props.page),
);
const visiblePages = computed(() => Array.from({ length: pages.value }, (_, index) => index + 1));

function goToPrevious() { emit('pageChange', props.page - 1); }
function goToNext() { emit('pageChange', props.page + 1); }
function goToPage(pageNumber: number) { emit('pageChange', pageNumber); }
</script>

<template>
  <nav v-bind="$attrs" :class="classNames('st-pagination', props.class)" aria-label="Pagination">
    <button type="button" :disabled="props.page <= 1" @click="goToPrevious">{{ props.previousLabel }}</button>
    <button
      v-for="pageNumber in visiblePages"
      :key="pageNumber"
      type="button"
      :class="classNames('st-pagination__page', pageNumber === props.page && 'st-pagination__page--active')"
      :aria-label="`Page ${pageNumber}`"
      :aria-current="pageNumber === props.page ? 'page' : undefined"
      @click="goToPage(pageNumber)"
    >{{ pageNumber }}</button>
    <button type="button" :disabled="props.page >= pages" @click="goToNext">{{ props.nextLabel }}</button>
  </nav>
</template>
