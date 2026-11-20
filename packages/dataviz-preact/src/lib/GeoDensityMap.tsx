import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
import { densityLayer, mapClass } from './geoMapLayers.js';

export type GeoDensityMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  value?: string;
  cellSize?: number;
  width?: number;
  height?: number;
  label: string;
  className?: MaybeSignal<string>;
};

export function GeoDensityMap({
  store,
  viewId,
  latitude,
  longitude,
  value,
  cellSize,
  width = 520,
  height = 320,
  label,
  className,
}: GeoDensityMapProps) {
  const state = useDashboard(store);
  void state;
  void cellSize;
  const resolvedClassName = useValue(className);
  const layer = densityLayer(store, viewId, { latitude, longitude, value, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoDensityMap', resolvedClassName)}
    />
  );
}
