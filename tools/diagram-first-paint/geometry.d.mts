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
