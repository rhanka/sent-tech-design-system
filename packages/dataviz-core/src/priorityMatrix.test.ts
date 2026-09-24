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

describe('priorityQuadrant', () => {
  it('maps the four quadrants around 50/50', () => {
    expect(priorityQuadrant(20, 80)).toBe('quick-wins');
    expect(priorityQuadrant(70, 70)).toBe('major-projects');
    expect(priorityQuadrant(20, 20)).toBe('wait');
    expect(priorityQuadrant(80, 20)).toBe('drop');
  });
});

describe('placePriorityLabels', () => {
  it('places the 13-point reference set without overlaps, point cover, or out-of-frame', () => {
    const boxes = REF.map((p) => estimatePriorityLabelBox(p.label));
    const placed = placePriorityLabels(REF, boxes, FRAME);
    expect(placed).toHaveLength(REF.length);
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        expect(overlaps(placed[i]!, placed[j]!)).toBe(false);
      }
    }
    for (const p of placed) {
      expect(p.x).toBeGreaterThanOrEqual(FRAME.marginLeft - 0.5);
      expect(p.y).toBeGreaterThanOrEqual(FRAME.marginTop - 0.5);
      expect(p.x + p.w).toBeLessThanOrEqual(FRAME.marginLeft + FRAME.plotWidth + 0.5);
      expect(p.y + p.h).toBeLessThanOrEqual(FRAME.marginTop + FRAME.plotHeight + 0.5);
    }
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
