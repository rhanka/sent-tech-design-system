import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { clusterLayer, mapClass } from './geoMapLayers.js';

export type GeoClusterMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  value?: string;
  radius?: number;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function GeoClusterMap({
  store,
  viewId,
  latitude,
  longitude,
  id,
  value,
  radius,
  width = 520,
  height = 320,
  label,
  className,
}: GeoClusterMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = clusterLayer(store, viewId, { latitude, longitude, id, value, radius, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoClusterMap', className)}
    />
  );
}
