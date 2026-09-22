import { defineComponent, h, type PropType } from 'vue';
import { Button, Inline } from '@sentropic/design-system-vue';
import { findMeasure, type DashboardStore, type Row } from '@sentropic/dataviz-core';
import { rowsToCsv } from './ExportMenu.js';
import {
  downloadBlob,
  downloadPng,
  downloadSvg,
  downloadPdf,
  printElement,
  resolveSvg,
  type ChartExportFormat,
} from './chart-export.js';

export type ChartExportTarget = Element | string | (() => Element | null) | null;

export type ChartExportProps = {
  /**
   * How to locate the chart's `<svg>`: the SVG (or a container around it), a CSS
   * selector, or a getter returning one of those. Required for PNG/SVG/print.
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

/**
 * A row of design-system Buttons that export the referenced chart's `<svg>` as
 * PNG or SVG, print it (PDF via the browser), and — when a store is supplied —
 * download the cross-filtered rows as CSV. All download/raster work is delegated
 * to the SSR/jsdom-safe `chart-export` helpers; presentation is 100% DS.
 */
export const ChartExport = defineComponent({
  name: 'ChartExport',
  props: {
    target: {
      type: [Object, String, Function] as unknown as PropType<ChartExportTarget>,
      default: undefined,
    },
    filename: { type: String, default: 'chart' },
    formats: { type: Array as PropType<ChartExportFormat[]>, default: undefined },
    store: { type: Object as PropType<DashboardStore>, default: undefined },
    viewId: { type: String, default: undefined },
    fields: { type: Array as PropType<string[]>, default: undefined },
    background: { type: String, default: undefined },
    labels: {
      type: Object as PropType<Partial<Record<ChartExportFormat, string>>>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const label = (f: ChartExportFormat) => props.labels?.[f] ?? DEFAULT_EXPORT_LABELS[f];

    const locate = (): Element | string | null =>
      typeof props.target === 'function'
        ? props.target()
        : ((props.target as Element | string | null) ?? null);

    const csvColumns = () => {
      const store = props.store;
      if (!store) return [];
      const ids = props.fields ?? [
        ...store.model.dimensions.map((d) => d.id),
        ...store.model.measures.map((m) => m.id),
      ];
      return ids.map((id) => {
        const dim = store.model.dimensions.find((d) => d.id === id);
        const meas = findMeasure(store.model, id);
        return { key: id, label: dim?.label ?? meas?.label ?? id };
      });
    };

    const run = (format: ChartExportFormat) => {
      if (format === 'csv') {
        const store = props.store;
        if (!store) return;
        const csv = rowsToCsv(store.applyCrossfilter(props.viewId) as readonly Row[], csvColumns());
        if (typeof Blob === 'undefined') return;
        downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${props.filename}.csv`);
        return;
      }
      if (format === 'print') {
        printElement(locate());
        return;
      }
      const svg = resolveSvg(locate());
      if (!svg) return;
      if (format === 'pdf') void downloadPdf(svg, `${props.filename}.pdf`, { background: props.background });
      else if (format === 'svg') downloadSvg(svg, `${props.filename}.svg`, { background: props.background });
      else void downloadPng(svg, `${props.filename}.png`, { background: props.background });
    };

    return () => {
      const shownFormats: ChartExportFormat[] =
        props.formats ?? [
          ...(['png', 'svg', 'pdf', 'print'] as ChartExportFormat[]),
          ...(props.store ? (['csv'] as ChartExportFormat[]) : []),
        ];
      return h(
        Inline,
        { gap: 2, class: props.class },
        {
          default: () =>
            shownFormats.map((format) =>
              h(
                Button,
                { key: format, variant: 'secondary', onClick: () => run(format) },
                { default: () => label(format) },
              ),
            ),
        },
      );
    };
  },
});
