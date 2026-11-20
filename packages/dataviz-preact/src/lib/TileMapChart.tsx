import {
  TileMapChart as DsTileMapChart,
  type TileMapChartTile,
} from '@sentropic/design-system-preact';
import type { DashboardStore } from '@sentropic/dataviz-core';
import { buildTileMapData } from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type TileMapChartProps = {
  store: DashboardStore;
  viewId: string;
  /** Field id whose value becomes the tile label. */
  label_field: string;
  /** Field id whose numeric value becomes the column position. */
  col: string;
  /** Field id whose numeric value becomes the row position. */
  row: string;
  /** Field id whose numeric value encodes tile intensity. */
  value: string;
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function TileMapChart({
  store,
  viewId,
  label_field,
  col,
  row,
  value,
  width,
  height,
  label,
  className,
}: TileMapChartProps) {
  const state = useDashboard(store);
  void state;
  const resolvedClassName = useValue(className);

  const data = buildTileMapData(store.model, store.applyCrossfilter(viewId), {
    label: label_field,
    col,
    row,
    value,
  });

  return (
    <DsTileMapChart
      data={data as TileMapChartTile[]}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
