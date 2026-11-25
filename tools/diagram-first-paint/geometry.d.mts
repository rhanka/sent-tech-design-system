export interface PaintBox { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number }
export interface PaintDisk { readonly x: number; readonly y: number; readonly radius: number }
export interface PaintPoint { readonly x: number; readonly y: number }
export function segmentInterval(box: PaintBox | PaintDisk, a: PaintPoint, b: PaintPoint): [number, number] | undefined;
export function exposedSegments(a: PaintPoint, b: PaintPoint, occluders: readonly (PaintBox | PaintDisk)[], stroke: number): [PaintPoint, PaintPoint][];
export function borderDistance(point: PaintPoint, box: PaintBox): number;
export function connectorFindings(input: {
  readonly paths: readonly { readonly id: string; readonly stroke: number; readonly points: readonly PaintPoint[] }[];
  readonly labels: readonly string[];
  readonly nodes: readonly (PaintBox & { readonly id: string })[];
  readonly occluders: readonly (PaintBox | PaintDisk)[];
  readonly relations?: readonly { readonly occurrence: string; readonly ends: readonly [string, string] }[] | undefined;
  readonly tolerance: number;
}): string[];
export function roundedElbowFindings(input: {
  readonly paths: readonly { readonly id: string; readonly d: string | null }[];
  readonly maxRadius?: number;
  readonly tolerance?: number;
}): string[];
export function linkStrokeWidthFindings(input: {
  readonly paths: readonly {
    readonly id: string;
    readonly strokeWidthCss: number;
    readonly emphasis?: string;
    readonly arrowhead?: string;
    readonly flow?: boolean;
    readonly erd?: boolean;
  }[];
  readonly defaultWidth?: number;
  readonly relatedWidth?: number;
  readonly emphasisWidth?: number;
  readonly tolerance?: number;
}): string[];
export function legendFindings(input: {
  readonly legend: (PaintBox & { readonly id: string; readonly anchor: string | null; readonly styles: readonly string[] }) | null;
  readonly nodes: readonly (PaintBox & { readonly id: string })[];
  readonly expectedAnchor?: string;
  readonly expectedStyles?: readonly string[];
  readonly tolerance?: number;
}): string[];
export function combinedLegendFindings(input: {
  readonly legend: (PaintBox & { readonly id: string; readonly anchor: string | null; readonly styles: readonly string[] }) | null;
  readonly authoredLegends?: readonly (PaintBox & { readonly id: string })[];
  readonly nodes?: readonly (PaintBox & { readonly id: string; readonly kind?: string | null })[];
  readonly labels?: readonly (PaintBox & { readonly id: string; readonly isEdgeLabel?: boolean })[];
  readonly paths?: readonly { readonly id: string; readonly points: readonly PaintPoint[] }[];
  readonly tolerance?: number;
}): string[];
