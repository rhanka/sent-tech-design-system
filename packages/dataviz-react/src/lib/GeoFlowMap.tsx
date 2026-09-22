import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-react';
import { useDashboard } from '../adapter.js';
import { flowLayer, mapClass } from './geoMapLayers.js';

export type GeoFlowMapProps = {
  store: DashboardStore;
  viewId: string;
  sourceLatitude: string;
  sourceLongitude: string;
  targetLatitude: string;
  targetLongitude: string;
  value?: string;
  width?: number;
  height?: number;
  label: string;
  className?: string;
};

export function GeoFlowMap({
  store,
  viewId,
  sourceLatitude,
  sourceLongitude,
  targetLatitude,
  targetLongitude,
  value,
  width = 520,
  height = 320,
  label,
  className,
}: GeoFlowMapProps) {
  const state = useDashboard(store);
  void state;
  const layer = flowLayer(store, viewId, {
    sourceLatitude,
    sourceLongitude,
    targetLatitude,
    targetLongitude,
    value,
    labelText: label,
  });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoFlowMap', className)}
    />
  );
}
