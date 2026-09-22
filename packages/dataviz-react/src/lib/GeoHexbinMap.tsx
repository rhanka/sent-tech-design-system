import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { hexbinLayer, mapClass } from './geoMapLayers.js';

export type GeoHexbinMapProps = {
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

export function GeoHexbinMap({
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
}: GeoHexbinMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = hexbinLayer(store, viewId, { latitude, longitude, value, cellSize, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoHexbinMap', className)}
    />
  );
}
