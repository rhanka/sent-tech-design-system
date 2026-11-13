<script setup lang="ts">
import { classNames } from './classNames.js';

export type ObjectPageBreadcrumbItem = { label: string; href?: string };
export type ObjectPageKpi = { label: string; value: string; delta?: string };
export type ObjectPageField = { key: string; value: string };
export type ObjectPageColumn = { key: string; label: string };
export type ObjectPageRow = { id: string; [key: string]: unknown };

export type ObjectPageProps = {
  breadcrumb?: ObjectPageBreadcrumbItem[];
  entityTitle: string;
  entityStatus?: { label: string; tone?: string };
  primaryAction?: string;
  secondaryAction?: string;
  kpis?: ObjectPageKpi[];
  fieldsTitle?: string;
  fields?: ObjectPageField[];
  relatedTitle?: string;
  relatedColumns?: ObjectPageColumn[];
  relatedRows?: ObjectPageRow[];
  class?: string;
};

defineOptions({ name: 'ObjectPage', inheritAttrs: false });
const props = withDefaults(defineProps<ObjectPageProps>(), {
  breadcrumb: () => [], entityStatus: undefined, primaryAction: undefined, secondaryAction: undefined,
  kpis: () => [], fieldsTitle: undefined, fields: () => [], relatedTitle: undefined,
  relatedColumns: () => [], relatedRows: () => [], class: undefined,
});
</script>

<template>
  <div v-bind="{ ...($attrs), class: (classNames('st-op', props.class)) }" >
    <header class="st-op__header">
      <nav v-if="(props.breadcrumb ?? []).length > 0" class="st-breadcrumb">
        <template v-for="(item, i) in props.breadcrumb" :key="i">
          <a v-if="item.href" :href="item.href" class="st-breadcrumb__item">{{ item.label }}</a>
          <span v-else class="st-breadcrumb__item">{{ item.label }}</span>
        </template>
      </nav>
      <div class="st-op__title-row">
        <h1 class="st-op__title">{{ props.entityTitle }}</h1>
        <span
          v-if="props.entityStatus"
          :class="classNames('st-badge', props.entityStatus.tone ? `st-badge--${props.entityStatus.tone}` : undefined)"
        >{{ props.entityStatus.label }}</span>
      </div>
      <div class="st-op__header-actions">
        <button v-if="props.secondaryAction" type="button" class="st-button st-button--secondary">{{ props.secondaryAction }}</button>
        <button v-if="props.primaryAction" type="button" class="st-button st-button--primary">{{ props.primaryAction }}</button>
      </div>
    </header>
    <div v-if="(props.kpis ?? []).length > 0" class="st-op__kpi-row">
      <div v-for="(kpi, i) in props.kpis" :key="i" class="st-kpi-card">
        <span class="st-kpi-card__label">{{ kpi.label }}</span>
        <span class="st-kpi-card__value">{{ kpi.value }}</span>
        <span v-if="kpi.delta" class="st-kpi-card__delta">{{ kpi.delta }}</span>
      </div>
    </div>
    <section v-if="(props.fields ?? []).length > 0" class="st-op__fields">
      <h2 v-if="props.fieldsTitle" class="st-op__section-title">{{ props.fieldsTitle }}</h2>
      <dl class="st-op__field-list">
        <template v-for="f in props.fields" :key="`dt-${f.key}`">
          <dt>{{ f.key }}</dt>
          <dd>{{ f.value }}</dd>
        </template>
      </dl>
    </section>
    <section v-if="(props.relatedRows ?? []).length > 0" class="st-op__related">
      <h2 v-if="props.relatedTitle" class="st-op__section-title">{{ props.relatedTitle }}</h2>
      <table class="st-table">
        <thead>
          <tr>
            <th v-for="col in props.relatedColumns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in props.relatedRows" :key="row.id">
            <td v-for="col in props.relatedColumns" :key="col.key">{{ String(row[col.key] ?? '') }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
