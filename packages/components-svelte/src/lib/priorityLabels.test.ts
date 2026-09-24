import { describe, expect, it } from 'vitest';
import {
  estimatePriorityLabelBox,
  placePriorityLabels,
  type PriorityMatrixFrame,
  type PriorityMatrixPoint,
} from './priorityLabels.js';

// Shared golden vector (B1 anti-divergence guard): seed 42, the 13-point
// reference set, component frame geometry. Pinned BYTE-IDENTICALLY in
// dataviz-core (priorityMatrix.test.ts) and in the four DS internal copies —
// any drift between the twins fails here.
const FRAME: PriorityMatrixFrame = {
  width: 640,
  height: 400,
  marginLeft: 48,
  marginTop: 26,
  plotWidth: 574,
  plotHeight: 338,
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

describe('priorityLabels golden vector (shared across the five copies)', () => {
  it('places the reference set at the pinned pixel boxes', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const placed = placePriorityLabels(REF, boxes, FRAME, { seed: 42 });
    const r2 = (v: number): number => Math.round(v * 100) / 100;
    expect(
      placed.map((p) => ({
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
      })),
    ).toEqual(GOLDEN);
  });
});
