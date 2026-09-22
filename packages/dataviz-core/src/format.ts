export type FormatAxisScale = 'linear' | 'log';
export type FormatMarkerShape = 'circle' | 'square' | 'diamond' | 'triangle';

export type FormatAxisConfig = {
  id: string;
  label: string;
  min?: number;
  max?: number;
  scale?: FormatAxisScale;
  inverted?: boolean;
};

export type FormatLegendConfig = {
  id: string;
  label: string;
  title?: string;
  visible?: boolean;
};

export type FormatMarkerConfig = {
  id: string;
  label: string;
  shape?: FormatMarkerShape;
  size?: number;
  color?: string;
};

export type FormatPanelConfig = {
  axes?: readonly FormatAxisConfig[];
  legends?: readonly FormatLegendConfig[];
  markers?: readonly FormatMarkerConfig[];
};

export type FormatAxis = {
  readonly id: string;
  readonly label: string;
  readonly min?: number;
  readonly max?: number;
  readonly scale: FormatAxisScale;
  readonly inverted: boolean;
};

export type FormatLegend = {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly visible: boolean;
};

export type FormatMarker = {
  readonly id: string;
  readonly label: string;
  readonly shape: FormatMarkerShape;
  readonly size: number;
  readonly color?: string;
};

export type FormatPanelState = {
  readonly axes: readonly FormatAxis[];
  readonly legends: readonly FormatLegend[];
  readonly markers: readonly FormatMarker[];
};

export type FormatAxisPatch = Partial<Pick<FormatAxis, 'label' | 'scale' | 'inverted'>> & {
  min?: number | null;
  max?: number | null;
};

export type FormatLegendPatch = Partial<Pick<FormatLegend, 'label' | 'title' | 'visible'>>;

export type FormatMarkerPatch = Partial<Pick<FormatMarker, 'label' | 'shape'>> & {
  color?: string | undefined;
  size?: number | null;
};

const AXIS_SCALES: readonly FormatAxisScale[] = ['linear', 'log'];
const MARKER_SHAPES: readonly FormatMarkerShape[] = ['circle', 'square', 'diamond', 'triangle'];

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function finiteOptional(value: number | null | undefined, field: string): number | undefined {
  if (value == null) return undefined;
  if (!Number.isFinite(value)) throw new Error(`${field} must be finite`);
  return value;
}

function positiveOptional(value: number | null | undefined, field: string): number | undefined {
  const next = finiteOptional(value, field);
  if (next === undefined) return undefined;
  if (next <= 0) throw new Error(`${field} must be positive`);
  return next;
}

function axisScale(value: FormatAxisScale | undefined): FormatAxisScale {
  if (value === undefined) return 'linear';
  if (AXIS_SCALES.includes(value)) return value;
  throw new Error(`Unsupported axis scale: ${String(value)}`);
}

function markerShape(value: FormatMarkerShape | undefined): FormatMarkerShape {
  if (value === undefined) return 'circle';
  if (MARKER_SHAPES.includes(value)) return value;
  throw new Error(`Unsupported marker shape: ${String(value)}`);
}

function freezeAxis(config: FormatAxisConfig): FormatAxis {
  const axis: {
    id: string;
    label: string;
    min?: number;
    max?: number;
    scale: FormatAxisScale;
    inverted: boolean;
  } = {
    id: config.id,
    label: config.label,
    scale: axisScale(config.scale),
    inverted: config.inverted ?? false,
  };
  const min = finiteOptional(config.min, `${config.id}.min`);
  const max = finiteOptional(config.max, `${config.id}.max`);
  if (min !== undefined) axis.min = min;
  if (max !== undefined) axis.max = max;
  return Object.freeze(axis);
}

function freezeLegend(config: FormatLegendConfig): FormatLegend {
  return Object.freeze({
    id: config.id,
    label: config.label,
    title: config.title ?? config.label,
    visible: config.visible ?? true,
  });
}

function freezeMarker(config: FormatMarkerConfig): FormatMarker {
  const marker: {
    id: string;
    label: string;
    shape: FormatMarkerShape;
    size: number;
    color?: string;
  } = {
    id: config.id,
    label: config.label,
    shape: markerShape(config.shape),
    size: positiveOptional(config.size, `${config.id}.size`) ?? 6,
  };
  if (config.color !== undefined) marker.color = config.color;
  return Object.freeze(marker);
}

function freezeState(state: {
  axes: readonly FormatAxisConfig[];
  legends: readonly FormatLegendConfig[];
  markers: readonly FormatMarkerConfig[];
}): FormatPanelState {
  return Object.freeze({
    axes: Object.freeze(state.axes.map(freezeAxis)),
    legends: Object.freeze(state.legends.map(freezeLegend)),
    markers: Object.freeze(state.markers.map(freezeMarker)),
  });
}

function assertUpdated(found: boolean, kind: string, id: string): void {
  if (!found) throw new Error(`Unknown ${kind}: ${id}`);
}

export function createFormatPanelState(config: FormatPanelConfig = {}): FormatPanelState {
  return freezeState({
    axes: config.axes ?? [],
    legends: config.legends ?? [],
    markers: config.markers ?? [],
  });
}

export function updateAxisFormat(state: FormatPanelState, id: string, patch: FormatAxisPatch): FormatPanelState {
  let found = false;
  const axes = state.axes.map((axis) => {
    if (axis.id !== id) return axis;
    found = true;
    return freezeAxis({
      id: axis.id,
      label: patch.label ?? axis.label,
      min: hasOwn(patch, 'min') ? finiteOptional(patch.min, `${id}.min`) : axis.min,
      max: hasOwn(patch, 'max') ? finiteOptional(patch.max, `${id}.max`) : axis.max,
      scale: patch.scale ?? axis.scale,
      inverted: patch.inverted ?? axis.inverted,
    });
  });
  assertUpdated(found, 'axis', id);
  return freezeState({ axes, legends: state.legends, markers: state.markers });
}

export function updateLegendFormat(state: FormatPanelState, id: string, patch: FormatLegendPatch): FormatPanelState {
  let found = false;
  const legends = state.legends.map((legend) => {
    if (legend.id !== id) return legend;
    found = true;
    return freezeLegend({
      id: legend.id,
      label: patch.label ?? legend.label,
      title: patch.title ?? legend.title,
      visible: patch.visible ?? legend.visible,
    });
  });
  assertUpdated(found, 'legend', id);
  return freezeState({ axes: state.axes, legends, markers: state.markers });
}

export function updateMarkerFormat(state: FormatPanelState, id: string, patch: FormatMarkerPatch): FormatPanelState {
  let found = false;
  const markers = state.markers.map((marker) => {
    if (marker.id !== id) return marker;
    found = true;
    return freezeMarker({
      id: marker.id,
      label: patch.label ?? marker.label,
      shape: patch.shape ?? marker.shape,
      size: hasOwn(patch, 'size') ? positiveOptional(patch.size, `${id}.size`) : marker.size,
      color: hasOwn(patch, 'color') ? patch.color : marker.color,
    });
  });
  assertUpdated(found, 'marker', id);
  return freezeState({ axes: state.axes, legends: state.legends, markers });
}
