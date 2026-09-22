/**
 * Chart annotation model.
 *
 * A {@link ChartAnnotation} is a serialisable, presentation-free description of
 * an overlay to draw on a chart, expressed entirely in *data* coordinates (the
 * same units the chart's axes use). It carries no pixels, colours or framework
 * concerns: the design-system renderer consumes a list of these (via a chart
 * prop) and decides how to paint them.
 *
 * `x` may be a category key (string) or a numeric position; `y` is always
 * numeric. The shape is a discriminated union on `kind` so callers can switch
 * exhaustively.
 */

/** A position along the category/numeric (`x`) axis. */
export type AnnotationCoordinate = number | string;

/**
 * Optional marker glyph for a point annotation. Matches the design-system
 * renderer's supported set exactly (it is the rendering authority for this prop).
 */
export type AnnotationMarker = 'circle' | 'square' | 'diamond';

/** Text anchoring for a label annotation. */
export type AnnotationAnchor = 'start' | 'middle' | 'end';

/** Which axis a line/region annotation is bound to. */
export type AnnotationAxis = 'x' | 'y';

/** A single vertex of a shape annotation, in data coordinates. */
export interface AnnotationPoint {
  x: AnnotationCoordinate;
  y: number;
}

/** A marked point in data space, optionally labelled. */
export interface PointAnnotation {
  kind: 'point';
  x: AnnotationCoordinate;
  y: number;
  label?: string;
  marker?: AnnotationMarker;
}

/** A free-standing text label anchored at a data point. */
export interface LabelAnnotation {
  kind: 'label';
  x: AnnotationCoordinate;
  y: number;
  text: string;
  anchor?: AnnotationAnchor;
}

/**
 * A reference line at a fixed value on one axis. `value` is numeric: the DS
 * renderer draws guide lines on a continuous scale (categorical guide lines are
 * not yet supported by the renderer).
 */
export interface LineAnnotation {
  kind: 'line';
  axis: AnnotationAxis;
  value: number;
  label?: string;
}

/** A shaded band spanning `[from, to]` (numeric) on one axis. */
export interface RegionAnnotation {
  kind: 'region';
  axis: AnnotationAxis;
  from: number;
  to: number;
  label?: string;
}

/** A free polygon/polyline through data points. */
export interface ShapeAnnotation {
  kind: 'shape';
  points: AnnotationPoint[];
  label?: string;
}

/** Serialisable, presentation-free chart annotation in data coordinates. */
export type ChartAnnotation =
  | PointAnnotation
  | LabelAnnotation
  | LineAnnotation
  | RegionAnnotation
  | ShapeAnnotation;

const MARKERS: readonly AnnotationMarker[] = ['circle', 'square', 'diamond'];
const ANCHORS: readonly AnnotationAnchor[] = ['start', 'middle', 'end'];
const AXES: readonly AnnotationAxis[] = ['x', 'y'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** An `x`/value coordinate: a finite number or a category string. */
function isCoordinate(value: unknown): value is AnnotationCoordinate {
  if (typeof value === 'string') return true;
  return typeof value === 'number' && Number.isFinite(value);
}

/** A `y` value: always a finite number. */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  optional: boolean,
): boolean {
  if (value === undefined) return optional;
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

function isAnnotationPoint(value: unknown): value is AnnotationPoint {
  if (!isRecord(value)) return false;
  return isCoordinate(value.x) && isNumber(value.y);
}

/** Runtime validation that `value` is a well-formed {@link ChartAnnotation}. */
export function isChartAnnotation(value: unknown): value is ChartAnnotation {
  if (!isRecord(value)) return false;
  switch (value.kind) {
    case 'point':
      return (
        isCoordinate(value.x) &&
        isNumber(value.y) &&
        isOptionalString(value.label) &&
        isOneOf(value.marker, MARKERS, true)
      );
    case 'label':
      return (
        isCoordinate(value.x) &&
        isNumber(value.y) &&
        typeof value.text === 'string' &&
        isOneOf(value.anchor, ANCHORS, true)
      );
    case 'line':
      return (
        isOneOf(value.axis, AXES, false) &&
        isNumber(value.value) &&
        isOptionalString(value.label)
      );
    case 'region':
      return (
        isOneOf(value.axis, AXES, false) &&
        isNumber(value.from) &&
        isNumber(value.to) &&
        isOptionalString(value.label)
      );
    case 'shape':
      return (
        Array.isArray(value.points) &&
        value.points.length > 0 &&
        value.points.every(isAnnotationPoint) &&
        isOptionalString(value.label)
      );
    default:
      return false;
  }
}

// --- Builders -------------------------------------------------------------

/** Construct a {@link PointAnnotation}. */
export function pointAnnotation(
  x: AnnotationCoordinate,
  y: number,
  options: { label?: string; marker?: AnnotationMarker } = {},
): PointAnnotation {
  const a: PointAnnotation = { kind: 'point', x, y };
  if (options.label !== undefined) a.label = options.label;
  if (options.marker !== undefined) a.marker = options.marker;
  return a;
}

/** Construct a {@link LabelAnnotation}. */
export function labelAnnotation(
  x: AnnotationCoordinate,
  y: number,
  text: string,
  options: { anchor?: AnnotationAnchor } = {},
): LabelAnnotation {
  const a: LabelAnnotation = { kind: 'label', x, y, text };
  if (options.anchor !== undefined) a.anchor = options.anchor;
  return a;
}

/** Construct a {@link LineAnnotation}. */
export function lineAnnotation(
  axis: AnnotationAxis,
  value: number,
  options: { label?: string } = {},
): LineAnnotation {
  const a: LineAnnotation = { kind: 'line', axis, value };
  if (options.label !== undefined) a.label = options.label;
  return a;
}

/** Construct a {@link RegionAnnotation}. */
export function regionAnnotation(
  axis: AnnotationAxis,
  from: number,
  to: number,
  options: { label?: string } = {},
): RegionAnnotation {
  const a: RegionAnnotation = { kind: 'region', axis, from, to };
  if (options.label !== undefined) a.label = options.label;
  return a;
}

/** Construct a {@link ShapeAnnotation}. Points are copied defensively. */
export function shapeAnnotation(
  points: readonly AnnotationPoint[],
  options: { label?: string } = {},
): ShapeAnnotation {
  const a: ShapeAnnotation = {
    kind: 'shape',
    points: points.map((p) => ({ x: p.x, y: p.y })),
  };
  if (options.label !== undefined) a.label = options.label;
  return a;
}

/** Ergonomic builder namespace mirroring the standalone builder functions. */
export const annotation = {
  point: pointAnnotation,
  label: labelAnnotation,
  line: lineAnnotation,
  region: regionAnnotation,
  shape: shapeAnnotation,
} as const;

// --- Serialisation --------------------------------------------------------

/**
 * Serialise a list of annotations to a JSON string.
 *
 * Throws a {@link TypeError} if the input is not an array or contains any
 * malformed annotation — serialisation never silently emits invalid data.
 */
export function serializeAnnotations(annotations: ChartAnnotation[]): string {
  if (!Array.isArray(annotations)) {
    throw new TypeError('Cannot serialize annotations: expected an array');
  }
  annotations.forEach((a, index) => {
    if (!isChartAnnotation(a)) {
      throw new TypeError(`Cannot serialize malformed annotation at index ${index}`);
    }
  });
  return JSON.stringify(annotations);
}

/**
 * Parse a JSON string back into a list of annotations. Invalid entries are
 * dropped silently; malformed or non-array payloads yield `[]`. Never throws.
 */
export function deserializeAnnotations(serialized: string): ChartAnnotation[] {
  if (!serialized) return [];
  let raw: unknown;
  try {
    raw = JSON.parse(serialized);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];
  return raw.filter(isChartAnnotation);
}
