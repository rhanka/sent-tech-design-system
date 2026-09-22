import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { geojsonLayer, mapClass } from './geoMapLayers.js';

export type GeoJsonMapProps = {
  store: DashboardStore;
  viewId: string;
  geometry: string;
  id?: string;
  labelField?: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function GeoJsonMap({
  store,
  viewId,
  geometry,
  id,
  labelField,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoJsonMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = geojsonLayer(store, viewId, {
    geometry,
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
      className={mapClass('st-geoJsonMap', className)}
    />
  );
}
