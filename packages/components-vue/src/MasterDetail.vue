<script setup lang="ts">
import { classNames } from './classNames.js';

export type MasterDetailNavItem = { label: string; href: string; active?: boolean };
export type MasterDetailItem = {
  id: string;
  primary: string;
  secondary?: string;
  statusLabel?: string;
  active?: boolean;
};
export type MasterDetailField = { key: string; value: string };

export type MasterDetailProps = {
  listTitle: string;
  searchPlaceholder?: string;
  listItems?: MasterDetailItem[];
  detailTitle: string;
  detailStatus?: { label: string; tone?: string };
  detailActions?: string[];
  detailFields?: MasterDetailField[];
  class?: string;
};

defineOptions({ name: 'MasterDetail', inheritAttrs: false });
const props = withDefaults(defineProps<MasterDetailProps>(), {
  searchPlaceholder: 'Search…', listItems: () => [], detailStatus: undefined, detailActions: () => [],
  detailFields: () => [], class: undefined,
});
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-md', props.class)">
    <div class="st-md__split">
      <aside class="st-md__list">
        <div class="st-md__list-header">
          <h2 class="st-md__list-title">{{ props.listTitle }}</h2>
          <input type="search" class="st-md__search" :placeholder="props.searchPlaceholder ?? 'Search…'" />
        </div>
        <ul class="st-md__list-items">
          <li v-for="item in props.listItems ?? []" :key="item.id" :class="classNames('st-md__list-item', item.active ? 'st-md__list-item--active' : undefined)">
            <span class="st-md__item-primary">{{ item.primary }}</span>
            <span v-if="item.secondary" class="st-md__item-secondary">{{ item.secondary }}</span>
            <span v-if="item.statusLabel" class="st-md__item-status">{{ item.statusLabel }}</span>
          </li>
        </ul>
      </aside>
      <main class="st-md__detail">
        <div class="st-md__detail-header">
          <h1 class="st-md__detail-title">{{ props.detailTitle }}</h1>
          <span v-if="props.detailStatus" :class="classNames('st-badge', props.detailStatus.tone ? `st-badge--${props.detailStatus.tone}` : undefined)">{{ props.detailStatus.label }}</span>
          <div v-if="(props.detailActions ?? []).length > 0" class="st-md__detail-actions">
            <button v-for="(action, i) in props.detailActions ?? []" :key="i" type="button" class="st-button st-button--secondary">{{ action }}</button>
          </div>
        </div>
        <dl v-if="(props.detailFields ?? []).length > 0" class="st-md__detail-fields">
          <template v-for="f in props.detailFields ?? []" :key="`dt-${f.key}`">
            <dt>{{ f.key }}</dt>
            <dd>{{ f.value }}</dd>
          </template>
        </dl>
        <div v-if="$slots.default" class="st-md__detail-content"><slot /></div>
      </main>
    </div>
  </div>
</template>
