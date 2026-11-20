import type { DashboardStore } from '@sentropic/dataviz-core';
import { GeoChart } from '@sentropic/design-system-preact';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';
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
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);
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
      className={mapClass('st-geoPointMap', resolvedClassName)}
    />
  );
}
