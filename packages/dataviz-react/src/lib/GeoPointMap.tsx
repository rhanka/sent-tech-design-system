import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { mapClass, pointsLayer } from './geoMapLayers.js';

export type GeoPointMapProps = {
  store: DashboardStore;
  viewId: string;
  latitude: string;
  longitude: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function GeoPointMap({
  store,
  viewId,
  latitude,
  longitude,
  id,
  labelField,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoPointMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = pointsLayer(store, viewId, {
    latitude,
    longitude,
    id,
    label: labelField,
    value,
    labelText: label,
  });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoPointMap', className)}
    />
  );
}
