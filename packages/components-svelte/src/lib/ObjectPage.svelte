<script lang="ts" module>
  export interface ObjectPageBreadcrumbItem {
    label: string;
    href?: string;
  }

  export interface ObjectPageKpi {
    label: string;
    value: string;
    unit?: string;
  }

  export interface ObjectPageField {
    key: string;
    value: string;
  }

  export interface ObjectPageColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "start" | "center" | "end";
    width?: string;
  }

  export interface ObjectPageRow {
    id: string;
    [key: string]: unknown;
  }

  export type ObjectPageProps = {
    breadcrumb?: ObjectPageBreadcrumbItem[];
    entityTitle: string;
    entityStatus?: { label: string; tone: "neutral" | "info" | "success" | "warning" | "error" };
    primaryAction?: string;
    secondaryAction?: string;
    kpis?: ObjectPageKpi[];
    fieldsTitle?: string;
    fields?: ObjectPageField[];
    relatedTitle?: string;
    relatedColumns?: ObjectPageColumn[];
    relatedRows?: ObjectPageRow[];
    onprimaryaction?: () => void;
    onsecondaryaction?: () => void;
  };
</script>

<script lang="ts">
  import Badge from "./Badge.svelte";
  import Button from "./Button.svelte";
  import DataTable from "./DataTable.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";

  let {
    breadcrumb = [],
    entityTitle,
    entityStatus,
    primaryAction,
    secondaryAction,
    kpis = [],
    fieldsTitle,
    fields = [],
    relatedTitle,
    relatedColumns = [],
    relatedRows = [],
    onprimaryaction,
    onsecondaryaction,
  }: ObjectPageProps = $props();
</script>

<div class="st-op">
  {#if breadcrumb.length > 0}
    <Breadcrumb items={breadcrumb} />
  {/if}

  <div class="st-op__header">
    <div class="st-op__titleRow">
      <h1 class="st-op__title">{entityTitle}</h1>
      {#if entityStatus}
        <Badge tone={entityStatus.tone}>{entityStatus.label}</Badge>
      {/if}
    </div>
    <div class="st-op__actions">
      {#if secondaryAction}
        <Button variant="secondary" onclick={onsecondaryaction}>{secondaryAction}</Button>
      {/if}
      {#if primaryAction}
        <Button variant="primary" onclick={onprimaryaction}>{primaryAction}</Button>
      {/if}
    </div>
  </div>

  {#if kpis.length > 0}
    <div class="st-op__kpi-row">
      {#each kpis as kpi}
        <div class="st-op__kpi">
          <span class="st-op__kpiLabel">{kpi.label}</span>
          <span class="st-op__kpiValue">{kpi.value}{#if kpi.unit}<span class="st-op__kpiUnit"> {kpi.unit}</span>{/if}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if fields.length > 0}
    <div class="st-op__fields">
      {#if fieldsTitle}
        <h2 class="st-op__sectionTitle">{fieldsTitle}</h2>
      {/if}
      <dl class="st-op__dl">
        {#each fields as field}
          <div class="st-op__dlRow">
            <dt class="st-op__dt">{field.key}</dt>
            <dd class="st-op__dd">{field.value}</dd>
          </div>
        {/each}
      </dl>
    </div>
  {/if}

  {#if relatedColumns.length > 0}
    <div class="st-op__related">
      {#if relatedTitle}
        <h2 class="st-op__sectionTitle">{relatedTitle}</h2>
      {/if}
      <DataTable columns={relatedColumns} rows={relatedRows} />
    </div>
  {/if}
</div>

<style>
  .st-op {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
    padding: var(--st-spacing-6, 1.5rem);
    background: var(--st-semantic-surface-default);
    color: var(--st-semantic-text-primary);
    min-block-size: 100%;
  }
  .st-op__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--st-spacing-4, 1rem);
    flex-wrap: wrap;
  }
  .st-op__titleRow {
    display: flex;
    align-items: center;
    gap: var(--st-spacing-3, 0.75rem);
    flex-wrap: wrap;
  }
  .st-op__title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
  }
  .st-op__actions {
    display: flex;
    gap: var(--st-spacing-2, 0.5rem);
    flex-shrink: 0;
  }
  .st-op__kpi-row {
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    flex-wrap: wrap;
  }
  .st-op__kpi {
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-1, 0.25rem);
    padding: var(--st-spacing-4, 1rem);
    background: var(--st-semantic-surface-raised);
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: var(--st-radius-md, 0.5rem);
    min-inline-size: 10rem;
  }
  .st-op__kpiLabel {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
  }
  .st-op__kpiValue {
    font-size: 1.5rem;
    font-weight: 700;
  }
  .st-op__kpiUnit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--st-semantic-text-secondary);
  }
  .st-op__sectionTitle {
    font-size: 1rem;
    font-weight: 650;
    margin: 0 0 var(--st-spacing-3, 0.75rem);
  }
  .st-op__dl {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--st-spacing-3, 0.75rem) var(--st-spacing-6, 1.5rem);
  }
  .st-op__dlRow {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .st-op__dt {
    font-size: 0.75rem;
    color: var(--st-semantic-text-secondary);
    font-weight: 500;
  }
  .st-op__dd {
    margin: 0;
    font-size: 0.875rem;
    color: var(--st-semantic-text-primary);
  }
  .st-op__fields,
  .st-op__related {
    display: flex;
    flex-direction: column;
  }
</style>
