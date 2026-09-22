import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { choroplethLayer, mapClass } from './geoMapLayers.js';

export type ChoroplethMapProps = {
  store: DashboardStore;
  viewId: string;
  region: string;
  measure: string;
  geometry?: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function ChoroplethMap({ store, viewId, region, measure, geometry, width = 520, height = 260, label, className }: ChoroplethMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = choroplethLayer(store, viewId, { region, measure, geometry, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-choroplethMap', className)}
    />
  );
}
