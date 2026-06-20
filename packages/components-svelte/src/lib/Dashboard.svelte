<script lang="ts" module>
  import type { Snippet } from "svelte";
  import type { SideNavItem } from "./SideNav.svelte";

  export interface DashboardNavItem extends SideNavItem {}

  export interface DashboardKpi {
    label: string;
    value: string;
    unit?: string;
    trend?: "up" | "down" | "flat";
  }

  export type DashboardProps = {
    appTitle: string;
    navItems?: DashboardNavItem[];
    pageTitle: string;
    kpis?: DashboardKpi[];
    children?: Snippet;
  };
</script>

<script lang="ts">
  import SideNav from "./SideNav.svelte";

  let {
    appTitle,
    navItems = [],
    pageTitle,
    kpis = [],
    children,
  }: DashboardProps = $props();
</script>

<div class="st-dash">
  <header class="st-dash__header">
    <span class="st-dash__appTitle">{appTitle}</span>
  </header>
  <div class="st-dash__body">
    {#if navItems.length > 0}
      <aside class="st-dash__aside">
        <SideNav items={navItems} />
      </aside>
    {/if}
    <main class="st-dash__main">
      <h1 class="st-dash__pageTitle">{pageTitle}</h1>
      {#if kpis.length > 0}
        <div class="st-dash__kpi-row">
          {#each kpis as kpi}
            <div class="st-dash__kpi">
              <span class="st-dash__kpiLabel">{kpi.label}</span>
              <span class="st-dash__kpiValue">
                {kpi.value}{#if kpi.unit}<span class="st-dash__kpiUnit"> {kpi.unit}</span>{/if}
              </span>
              {#if kpi.trend}
                <span class="st-dash__kpiTrend st-dash__kpiTrend--{kpi.trend}" aria-label="Tendance {kpi.trend}">
                  {#if kpi.trend === "up"}↑{:else if kpi.trend === "down"}↓{:else}→{/if}
                </span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
      {#if children}
        <div class="st-dash__content">
          {@render children()}
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .st-dash {
    display: grid;
    grid-template-rows: auto 1fr;
    min-block-size: 100vh;
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
  }
  .st-dash__header {
    border-block-end: 1px solid var(--st-semantic-border-subtle);
    padding: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
    display: flex;
    align-items: center;
  }
  .st-dash__appTitle {
    font-weight: 700;
    font-size: 1rem;
  }
  .st-dash__body {
    display: grid;
    grid-template-columns: 220px 1fr;
    overflow: hidden;
  }
  .st-dash__aside {
    border-inline-end: 1px solid var(--st-semantic-border-subtle);
    background: var(--st-semantic-surface-raised);
    overflow-y: auto;
  }
  .st-dash__main {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
    padding: var(--st-spacing-6, 1.5rem);
    overflow-y: auto;
  }
  .st-dash__pageTitle {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }
  .st-dash__kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
    gap: var(--st-spacing-4, 1rem);
  }
  .st-dash__kpi {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-4, 1rem) var(--st-spacing-5, 1.25rem);
    background: var(--st-semantic-surface-raised);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
  }
  .st-dash__kpiLabel {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .st-dash__kpiValue {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1;
  }
  .st-dash__kpiUnit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--st-semantic-text-secondary);
  }
  .st-dash__kpiTrend {
    font-size: 0.875rem;
    font-weight: 600;
  }
  .st-dash__kpiTrend--up { color: var(--st-semantic-color-success, #16a34a); }
  .st-dash__kpiTrend--down { color: var(--st-semantic-color-error, #dc2626); }
  .st-dash__kpiTrend--flat { color: var(--st-semantic-text-secondary); }
  .st-dash__content {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-4, 1rem);
  }
</style>
