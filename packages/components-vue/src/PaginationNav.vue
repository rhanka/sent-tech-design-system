<script setup lang="ts">
import { computed } from 'vue';
import { classNames } from './classNames.js';

// `pageCount` (Svelte-canonical) is accepted as an alias of `totalPages`.
export type PaginationNavProps = {
  page?: number;
  pageCount?: number;
  totalPages?: number;
  siblings?: number;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  previousHref?: string;
  nextHref?: string;
  class?: string;
};

// Mirrors the Svelte reference: first/last anchors, sibling window around the
// current page, and two collapse points (ellipses) once the total exceeds
// `siblings * 2 + 5`.
type PaginationSlot = number | 'ellipsis-start' | 'ellipsis-end';
function paginationSlots(page: number, pageCount: number, siblings: number): PaginationSlot[] {
  const total = Math.max(0, Math.floor(pageCount));
  if (total <= 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const sib = Math.max(0, Math.floor(siblings));
  const minSlots = sib * 2 + 5;
  if (total <= minSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const leftSibling = Math.max(current - sib, 1);
  const rightSibling = Math.min(current + sib, total);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;
  const result: PaginationSlot[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + sib * 2;
    for (let i = 1; i <= leftItemCount; i += 1) result.push(i);
    result.push('ellipsis-end');
    result.push(total);
  } else if (showLeftEllipsis && !showRightEllipsis) {
    result.push(1);
    result.push('ellipsis-start');
    const rightItemCount = 3 + sib * 2;
    for (let i = total - rightItemCount + 1; i <= total; i += 1) result.push(i);
  } else if (showLeftEllipsis && showRightEllipsis) {
    result.push(1);
    result.push('ellipsis-start');
    for (let i = leftSibling; i <= rightSibling; i += 1) result.push(i);
    result.push('ellipsis-end');
    result.push(total);
  } else {
    for (let i = 1; i <= total; i += 1) result.push(i);
  }
  return result;
}

defineOptions({ name: 'PaginationNav', inheritAttrs: false });
const props = withDefaults(defineProps<PaginationNavProps>(), {
  page: 1, pageCount: undefined, totalPages: undefined, siblings: 1, label: 'Pagination',
  previousLabel: 'Previous page', nextLabel: 'Next page', previousHref: undefined, nextHref: undefined,
  class: undefined,
});
const emit = defineEmits<{ 'page-change': [page: number] }>();

const page = computed(() => props.page ?? 1);
const pages = computed(() => props.pageCount ?? props.totalPages ?? 1);
const slots = computed(() => paginationSlots(page.value, pages.value, props.siblings ?? 1));

function go(target: number) {
  if (target < 1 || target > pages.value || target === page.value) return;
  emit('page-change', target);
}
</script>

<template>
  <nav v-bind="$attrs" :class="classNames('st-paginationNav', props.class)" :aria-label="props.label">
    <ul class="st-paginationNav__list">
      <li>
        <a v-if="props.previousHref" :href="props.previousHref" class="st-paginationNav__nav" :aria-label="props.previousLabel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </a>
        <button
          v-else
          type="button"
          class="st-paginationNav__nav"
          :aria-label="props.previousLabel"
          :disabled="page <= 1 || pages <= 0"
          @click="go(page - 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </li>
      <li v-for="(slot, index) in slots" :key="typeof slot === 'number' ? `p-${slot}` : `${slot}-${index}`">
        <span v-if="slot === 'ellipsis-start' || slot === 'ellipsis-end'" class="st-paginationNav__ellipsis" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-icon lucide-ellipsis" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
        </span>
        <button
          v-else
          type="button"
          :class="classNames('st-paginationNav__page', slot === page && 'st-paginationNav__page--active')"
          :aria-label="`Page ${slot}`"
          :aria-current="slot === page ? 'page' : undefined"
          @click="go(slot)"
        >{{ String(slot) }}</button>
      </li>
      <li>
        <a v-if="props.nextHref" :href="props.nextHref" class="st-paginationNav__nav" :aria-label="props.nextLabel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </a>
        <button
          v-else
          type="button"
          class="st-paginationNav__nav"
          :aria-label="props.nextLabel"
          :disabled="page >= pages || pages <= 0"
          @click="go(page + 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </li>
    </ul>
  </nav>
</template>
