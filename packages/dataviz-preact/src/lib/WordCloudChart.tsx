import {
  WordCloudChart as DsWordCloudChart,
  type WordCloudChartWord,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildWordCloudData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type WordCloudChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the word text. */
  word_field: string;
  /** Field id whose numeric value becomes the word's weight/size. */
  weight: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function WordCloudChart({
  store,
  viewId,
  word_field,
  weight,
  width,
  height,
  label,
  className,
}: WordCloudChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildWordCloudData(store.model, store.applyCrossfilter(viewId), {
    word: word_field,
    weight,
  });

  return (
    <DsWordCloudChart
      data={data as WordCloudChartWord[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
