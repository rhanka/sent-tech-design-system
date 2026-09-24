import { describe, it, expect } from 'vitest';
import {
  estimatePriorityLabelBox,
  placePriorityLabels,
  priorityQuadrant,
  type PriorityMatrixBox,
  type PriorityMatrixFrame,
  type PriorityMatrixPoint,
} from './priorityMatrix.js';

const FRAME: PriorityMatrixFrame = {
  width: 640,
  height: 400,
  marginLeft: 48,
  marginTop: 14,
  plotWidth: 640 - 48 - 18,
  plotHeight: 400 - 14 - 36,
};

const REF: PriorityMatrixPoint[] = [
  { x: 18, y: 82, label: 'Auth SSO' },
  { x: 20, y: 80, label: 'SSO SAML' },
  { x: 22, y: 79, label: 'MFA' },
  { x: 68, y: 72, label: 'Exports CSV' },
  { x: 70, y: 70, label: 'Export PDF' },
  { x: 71, y: 69, label: 'API webhooks' },
  { x: 30, y: 30, label: 'Thème sombre' },
  { x: 32, y: 28, label: 'Mode offline' },
  { x: 85, y: 15, label: 'Chat temps réel' },
  { x: 15, y: 25, label: 'Audit logs' },
  { x: 55, y: 55, label: 'SSO SCIM' },
  { x: 90, y: 85, label: 'IA résumés' },
  { x: 50, y: 50, label: 'SSO rôles' },
];

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function pointCovered(px: number, py: number, b: { x: number; y: number; w: number; h: number }, pad = 4): boolean {
  return px > b.x - pad && px < b.x + b.w + pad && py > b.y - pad && py < b.y + b.h + pad;
}

function countCrossings(
  placed: Array<{ x: number; y: number; w: number; h: number }>,
  tx: number,
  ty: number,
): number {
  return placed.filter((p) => (tx > p.x && tx < p.x + p.w) || (ty > p.y && ty < p.y + p.h)).length;
}

// Component geometry (640x400, margins 48/26): the shared golden input for all
// five copies of the algorithm (dataviz-core + four DS internal modules).
const GOLDEN_FRAME: PriorityMatrixFrame = {
  width: 640,
  height: 400,
  marginLeft: 48,
  marginTop: 26,
  plotWidth: 574,
  plotHeight: 338,
};

function roundPlacement(p: {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  anchorX: number;
  anchorY: number;
  leaderX1: number;
  leaderY1: number;
  leaderX2: number;
  leaderY2: number;
  quadrant: string;
}): unknown {
  const r2 = (v: number): number => Math.round(v * 100) / 100;
  return {
    index: p.index,
    x: r2(p.x),
    y: r2(p.y),
    w: p.w,
    h: p.h,
    anchorX: r2(p.anchorX),
    anchorY: r2(p.anchorY),
    leaderX1: r2(p.leaderX1),
    leaderY1: r2(p.leaderY1),
    leaderX2: r2(p.leaderX2),
    leaderY2: r2(p.leaderY2),
    quadrant: p.quadrant,
  };
}

// Golden placements for REF + estimatePriorityLabelBox + GOLDEN_FRAME at seed
// 42. Regenerate from the reference implementation only; every copy must match.
const GOLDEN: unknown[] = [
  { index: 0, x: 115.69, y: 62.02, w: 68, h: 20, anchorX: 151.32, anchorY: 86.84, leaderX1: 151.32, leaderY1: 82.02, leaderX2: 151.32, leaderY2: 86.84, quadrant: 'quick-wins' },
  { index: 1, x: 100.92, y: 99.05, w: 68, h: 20, anchorX: 162.8, anchorY: 93.6, leaderX1: 162.8, leaderY1: 99.05, leaderX2: 162.8, leaderY2: 93.6, quadrant: 'quick-wins' },
  { index: 2, x: 209.84, y: 99.8, w: 33, h: 20, anchorX: 174.28, anchorY: 96.98, leaderX1: 209.84, leaderY1: 99.8, leaderX2: 174.28, leaderY2: 96.98, quadrant: 'quick-wins' },
  { index: 3, x: 385.8, y: 95.76, w: 89, h: 20, anchorX: 438.32, anchorY: 120.64, leaderX1: 438.32, leaderY1: 115.76, leaderX2: 438.32, leaderY2: 120.64, quadrant: 'major-projects' },
  { index: 4, x: 392.99, y: 195.47, w: 82, h: 20, anchorX: 449.8, anchorY: 127.4, leaderX1: 449.8, leaderY1: 195.47, leaderX2: 449.8, leaderY2: 127.4, quadrant: 'major-projects' },
  { index: 5, x: 393.76, y: 69.88, w: 96, h: 20, anchorX: 455.54, anchorY: 130.78, leaderX1: 455.54, leaderY1: 89.88, leaderX2: 455.54, leaderY2: 130.78, quadrant: 'major-projects' },
  { index: 6, x: 124.43, y: 237.87, w: 96, h: 20, anchorX: 220.2, anchorY: 262.6, leaderX1: 220.2, leaderY1: 257.87, leaderX2: 220.2, leaderY2: 262.6, quadrant: 'wait' },
  { index: 7, x: 232.2, y: 338.2, w: 96, h: 20, anchorX: 231.68, anchorY: 269.36, leaderX1: 232.2, leaderY1: 338.2, leaderX2: 231.68, leaderY2: 269.36, quadrant: 'wait' },
  { index: 8, x: 541.28, y: 298.59, w: 68, h: 34, anchorX: 535.9, anchorY: 313.3, leaderX1: 541.28, leaderY1: 313.3, leaderX2: 535.9, leaderY2: 313.3, quadrant: 'drop' },
  { index: 9, x: 100.57, y: 322.57, w: 82, h: 20, anchorX: 134.1, anchorY: 279.5, leaderX1: 134.1, leaderY1: 322.57, leaderX2: 134.1, leaderY2: 279.5, quadrant: 'wait' },
  { index: 10, x: 274.72, y: 120.99, w: 68, h: 20, anchorX: 363.7, anchorY: 178.1, leaderX1: 342.72, leaderY1: 140.99, leaderX2: 363.7, leaderY2: 178.1, quadrant: 'major-projects' },
  { index: 11, x: 522.95, y: 50.61, w: 82, h: 20, anchorX: 564.6, anchorY: 76.7, leaderX1: 564.6, leaderY1: 70.61, leaderX2: 564.6, leaderY2: 76.7, quadrant: 'major-projects' },
  { index: 12, x: 279.32, y: 207.6, w: 75, h: 20, anchorX: 335, anchorY: 195, leaderX1: 335, leaderY1: 207.6, leaderX2: 335, leaderY2: 195, quadrant: 'major-projects' },
];

describe('priorityQuadrant', () => {
  it('maps the four quadrants around 50/50', () => {
    expect(priorityQuadrant(20, 80)).toBe('quick-wins');
    expect(priorityQuadrant(70, 70)).toBe('major-projects');
    expect(priorityQuadrant(20, 20)).toBe('wait');
    expect(priorityQuadrant(80, 20)).toBe('drop');
  });
});

describe('placePriorityLabels', () => {
  it('places the 13-point reference set with no overlaps, no covered points, and in-frame boxes', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const placed = placePriorityLabels(REF, boxes, FRAME);
    expect(placed).toHaveLength(REF.length);
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(overlaps(placed[i]!, placed[j]!)).toBe(false);
      }
    }
    // Point cover (B2): label boxes are opaque and painted over the points, so
    // no anchor — including a label's own — may sit inside any box (pad 4).
    for (const p of placed) {
      for (const b of placed) {
        expect(pointCovered(p.anchorX, p.anchorY, b)).toBe(false);
      }
    }
    for (const p of placed) {
      expect(p.x).toBeGreaterThanOrEqual(FRAME.marginLeft - 0.5);
      expect(p.y).toBeGreaterThanOrEqual(FRAME.marginTop - 0.5);
      expect(p.x + p.w).toBeLessThanOrEqual(FRAME.marginLeft + FRAME.plotWidth + 0.5);
      expect(p.y + p.h).toBeLessThanOrEqual(FRAME.marginTop + FRAME.plotHeight + 0.5);
    }
  });

  it('matches the shared golden vector (seed 42) pinned across all five copies', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const placed = placePriorityLabels(REF, boxes, GOLDEN_FRAME, { seed: 42 });
    expect(placed.map(roundPlacement)).toEqual(GOLDEN);
  });

  it('treats threshold bands as soft obstacles and ignores degenerate ones', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const tx = GOLDEN_FRAME.marginLeft + 0.5 * GOLDEN_FRAME.plotWidth;
    const ty = GOLDEN_FRAME.marginTop + 0.5 * GOLDEN_FRAME.plotHeight;
    const bands = [
      { x: tx - 3, y: GOLDEN_FRAME.marginTop, w: 6, h: GOLDEN_FRAME.plotHeight },
      { x: GOLDEN_FRAME.marginLeft, y: ty - 3, w: GOLDEN_FRAME.plotWidth, h: 6 },
    ];
    const free = placePriorityLabels(REF, boxes, GOLDEN_FRAME, { seed: 42 });
    const guided = placePriorityLabels(REF, boxes, GOLDEN_FRAME, { seed: 42, obstacles: bands });
    expect(countCrossings(guided, tx, ty)).toBeLessThan(countCrossings(free, tx, ty));
    expect(countCrossings(guided, tx, ty)).toBe(0);
    const degenerate = placePriorityLabels(REF, boxes, GOLDEN_FRAME, {
      seed: 42,
      obstacles: [
        { x: 0, y: 0, w: 0, h: 5 },
        { x: NaN, y: 0, w: 5, h: 5 },
        { x: 1, y: 1, w: -2, h: 3 },
      ],
    });
    expect(degenerate).toEqual(free);
  });

  it('is deterministic across runs', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const a = placePriorityLabels(REF, boxes, FRAME);
    const b = placePriorityLabels(REF, boxes, FRAME);
    expect(a).toEqual(b);
  });

  it('handles coincident points without throwing', () => {
    const pts: PriorityMatrixPoint[] = Array.from({ length: 6 }, (_, i) => ({ x: 50, y: 50, label: `Item ${i}` }));
    const boxes: PriorityMatrixBox[] = pts.map((p) => estimatePriorityLabelBox(p.label));
    const placed = placePriorityLabels(pts, boxes, FRAME);
    expect(placed).toHaveLength(6);
    for (const p of placed) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });

  it('handles a tiny frame and an oversized label without throwing', () => {
    const tiny: PriorityMatrixFrame = { width: 120, height: 90, marginLeft: 8, marginTop: 8, plotWidth: 96, plotHeight: 60 };
    const pts: PriorityMatrixPoint[] = [{ x: 10, y: 90, label: 'A very long label that exceeds the frame width entirely' }];
    const boxes: PriorityMatrixBox[] = [{ w: 400, h: 40 }];
    const placed = placePriorityLabels(pts, boxes, tiny);
    expect(placed).toHaveLength(1);
    expect(Number.isFinite(placed[0]!.x)).toBe(true);
    expect(placed[0]!.x).toBe(tiny.marginLeft);
  });

  it('returns [] for empty input', () => {
    expect(placePriorityLabels([], [], FRAME)).toEqual([]);
  });
});
