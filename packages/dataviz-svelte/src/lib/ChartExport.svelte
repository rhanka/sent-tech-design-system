<script lang="ts" module>
  import type { DashboardStore, Row } from '@sentropic/dataviz-core';
  import type { ChartExportFormat } from './chart-export.js';

  export type ChartExportTarget = Element | string | (() => Element | null) | null;

  export type ChartExportProps = {
    /**
     * How to locate the chart's `<svg>`: the SVG (or a container around it), a
     * CSS selector, or a getter returning one of those. Required for PNG/SVG/print.
     */
    target?: ChartExportTarget;
    /** Base file name (without extension). */
    filename?: string;
    /** Which export buttons to show, in order. Defaults to png/svg/print, plus csv when a store is given. */
    formats?: ChartExportFormat[];
    /** Store whose cross-filtered rows feed the CSV export (enables the CSV button). */
    store?: DashboardStore;
    /** View whose cross-filtered rows are exported (omit for global filters). */
    viewId?: string;
    /** Field ids (and order) to export to CSV; defaults to all model fields. */
    fields?: string[];
    /** Paint a solid background behind PNG/SVG exports (charts are often transparent). */
    background?: string;
    /** Per-format button labels. */
    labels?: Partial<Record<ChartExportFormat, string>>;
    class?: string;
  };

  export const DEFAULT_EXPORT_LABELS: Record<ChartExportFormat, string> = {
    csv: 'CSV',
    png: 'PNG',
    svg: 'SVG',
    pdf: 'PDF',
    print: 'Print',
  };
</script>

<script lang="ts">
  import { Button, Inline } from '@sentropic/design-system-svelte';
  import { findMeasure } from '@sentropic/dataviz-core';
  import { rowsToCsv } from './ExportMenu.svelte';
  import { downloadBlob, downloadPng, downloadSvg, downloadPdf, printElement, resolveSvg } from './chart-export.js';

  let {
    target,
    filename = 'chart',
    formats,
    store,
    viewId,
    fields,
    background,
    labels,
    class: className,
  }: ChartExportProps = $props();

  const label = (f: ChartExportFormat) => labels?.[f] ?? DEFAULT_EXPORT_LABELS[f];

  const shownFormats = $derived(
    formats ?? [
      ...((['png', 'svg', 'pdf', 'print'] as ChartExportFormat[])),
      ...(store ? (['csv'] as ChartExportFormat[]) : []),
    ],
  );

  function locate(): Element | string | null {
    if (typeof target === 'function') return target();
    return (target as Element | string | null) ?? null;
  }

  function csvColumns() {
    if (!store) return [];
    const ids = fields ?? [
      ...store.model.dimensions.map((d) => d.id),
      ...store.model.measures.map((m) => m.id),
    ];
    return ids.map((id) => {
      const dim = store!.model.dimensions.find((d) => d.id === id);
      const meas = findMeasure(store!.model, id);
      return { key: id, label: dim?.label ?? meas?.label ?? id };
    });
  }

  function run(format: ChartExportFormat) {
    if (format === 'csv') {
      if (!store) return;
      const csv = rowsToCsv(store.applyCrossfilter(viewId) as readonly Row[], csvColumns());
      if (typeof Blob === 'undefined') return;
      downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
      return;
    }
    if (format === 'print') {
      printElement(locate());
      return;
    }
    const svg = resolveSvg(locate());
    if (!svg) return;
    if (format === 'pdf') void downloadPdf(svg, `${filename}.pdf`, { background });
    else if (format === 'svg') downloadSvg(svg, `${filename}.svg`, { background });
    else void downloadPng(svg, `${filename}.png`, { background });
  }
</script>

<Inline gap={2} class={className}>
  {#each shownFormats as format (format)}
    <Button variant="secondary" onclick={() => run(format)}>{label(format)}</Button>
  {/each}
</Inline>
