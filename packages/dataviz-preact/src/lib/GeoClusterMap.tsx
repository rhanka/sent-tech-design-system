import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);
  const layer = clusterLayer(store, viewId, { latitude, longitude, id, value, radius, labelText: label });

  return (
    <GeoChart
      layers={[layer]}
      width={width}
      height={height}
      label={label}
      className={mapClass('st-geoClusterMap', resolvedClassName)}
    />
  );
}
