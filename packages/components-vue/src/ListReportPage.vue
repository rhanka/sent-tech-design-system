<script setup lang="ts">
import { classNames } from './classNames.js';

export type ListReportPageNavItem = { label: string; href: string; active?: boolean };
export type ListReportPageColumn = { key: string; label: string };
export type ListReportPageRow = { id: string; [key: string]: unknown };
export type ListReportPageAction = { id: string; label: string };
export type ListReportPageFilter = { field: string; operator: string; value: string };

export type ListReportPageProps = {
  appTitle?: string;
  navItems?: ListReportPageNavItem[];
  pageTitle: string;
  primaryAction?: string;
  secondaryAction?: string;
  searchPlaceholder?: string;
  columns: ListReportPageColumn[];
  rows?: ListReportPageRow[];
  rowActions?: ListReportPageAction[];
  onprimaryaction?: () => void;
  onsearch?: (q: string) => void;
  class?: string;
};

defineOptions({ name: 'ListReportPage', inheritAttrs: false });
const props = withDefaults(defineProps<ListReportPageProps>(), {
  appTitle: undefined, navItems: () => [], primaryAction: undefined, secondaryAction: undefined,
  searchPlaceholder: 'Search…', rows: () => [], rowActions: () => [], onprimaryaction: undefined,
  onsearch: undefined, class: undefined,
});
function onSearch(event: Event) {
  props.onsearch?.((event.target as HTMLInputElement).value);
}
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-lrp', props.class)) }" >
    <div class="st-lrp__body">
      <aside class="st-lrp__aside">
        <div v-if="props.appTitle" class="st-lrp__app-title">{{ props.appTitle }}</div>
        <nav class="st-sidenav">
          <a v-for="item in props.navItems ?? []" :key="item.href" :href="item.href" :class="classNames('st-sidenav__item', item.active ? 'st-sidenav__item--active' : undefined)">{{ item.label }}</a>
        </nav>
      </aside>
      <main class="st-lrp__main">
        <div class="st-lrp__titlebar">
          <h1 class="st-lrp__title">{{ props.pageTitle }}</h1>
          <div class="st-lrp__actions">
            <button v-if="props.secondaryAction" type="button" class="st-button st-button--secondary">{{ props.secondaryAction }}</button>
            <button v-if="props.primaryAction" type="button" class="st-button st-button--primary" @click="props.onprimaryaction?.()">{{ props.primaryAction }}</button>
          </div>
        </div>
        <div class="st-lrp__toolbar">
          <input type="search" class="st-lrp__search" :placeholder="props.searchPlaceholder ?? 'Search…'" @input="onSearch" />
        </div>
        <table class="st-lrp__table">
          <thead>
            <tr>
              <th v-for="col in props.columns ?? []" :key="col.key" class="st-lrp__th">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in props.rows ?? []" :key="row.id">
              <td v-for="col in props.columns ?? []" :key="col.key" class="st-lrp__td">{{ String(row[col.key] ?? '') }}</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  </div>
</template>
