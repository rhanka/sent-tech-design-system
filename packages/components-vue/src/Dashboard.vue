<script setup lang="ts">
import { classNames } from './classNames.js';

export type DashboardNavItem = { label: string; href: string; active?: boolean };
export type DashboardKpi = { label: string; value: string; delta?: string };

export type DashboardProps = {
  appTitle?: string;
  pageTitle: string;
  navItems?: DashboardNavItem[];
  kpis?: DashboardKpi[];
  class?: string;
};

defineOptions({ name: 'Dashboard', inheritAttrs: false });
const props = withDefaults(defineProps<DashboardProps>(), {
  appTitle: undefined,
  navItems: () => [],
  kpis: () => [],
  class: undefined,
});
defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-dashboard', props.class)">
    <div class="st-dashboard__layout">
      <aside class="st-dashboard__aside">
        <div v-if="props.appTitle" class="st-dashboard__app-title">{{ props.appTitle }}</div>
        <nav class="st-sidenav">
          <a v-for="item in props.navItems ?? []" :key="item.href" :href="item.href" :class="classNames('st-sidenav__item', item.active ? 'st-sidenav__item--active' : undefined)">{{ item.label }}</a>
        </nav>
      </aside>
      <main class="st-dashboard__main">
        <div class="st-dashboard__titlebar">
          <h1 class="st-dashboard__title">{{ props.pageTitle }}</h1>
        </div>
        <div v-if="(props.kpis ?? []).length > 0" class="st-dashboard__kpi-row">
          <div v-for="(kpi, i) in props.kpis ?? []" :key="i" class="st-kpi-card">
            <span class="st-kpi-card__label">{{ kpi.label }}</span>
            <span class="st-kpi-card__value">{{ kpi.value }}</span>
            <span v-if="kpi.delta" class="st-kpi-card__delta">{{ kpi.delta }}</span>
          </div>
        </div>
        <div class="st-dashboard__content"><slot /></div>
      </main>
    </div>
  </div>
</template>
