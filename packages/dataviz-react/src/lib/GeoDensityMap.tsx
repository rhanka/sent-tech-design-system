import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
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
  className?: string;
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
  const layer = densityLayer(store, viewId, { latitude, longitude, value, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoDensityMap', className)}
    />
  );
}
