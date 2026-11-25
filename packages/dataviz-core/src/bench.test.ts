import { describe, expect, it } from 'vitest';
import {
  buildAcceptanceRates,
  buildRankCurve,
  estimateBenchLabelBox,
  isoF1Curve,
  paretoFrontier,
  placePointLabels,
  type PointLabelBox,
  type PointLabelPlot,
} from './bench.js';

describe('isoF1Curve', () => {
  it('satisfies 2pr/(p+r) = f within 1e-9 and stays in the unit domain', () => {
    for (const f of [0.2, 0.4, 0.6, 0.8]) {
      const pts = isoF1Curve(f, { x: [0, 1], y: [0, 1] });
      expect(pts.length).toBeGreaterThanOrEqual(32);
      for (let i = 0; i < pts.length; i += 1) {
        const { x: r, y: p } = pts[i]!;
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(1);
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
        const f1 = (2 * p * r) / (p + r);
        expect(Math.abs(f1 - f)).toBeLessThan(1e-9);
        if (i > 0) {
          expect(r).toBeGreaterThan(pts[i - 1]!.x);
          expect(p).toBeLessThan(pts[i - 1]!.y);
        }
      }
      // Enters at y = 1 and exits at x = 1.
      expect(pts[0]!.y).toBeCloseTo(1, 12);
      expect(pts[pts.length - 1]!.x).toBeCloseTo(1, 12);
    }
  });

  it('clips to a tight sub-domain and omits curves outside the domain', () => {
    const pts = isoF1Curve(0.8, { x: [0.7, 0.9], y: [0.7, 0.9] }, 40);
    expect(pts.length).toBeGreaterThan(4);
    for (const { x: r, y: p } of pts) {
      expect(r).toBeGreaterThanOrEqual(0.7 - 1e-12);
      expect(r).toBeLessThanOrEqual(0.9 + 1e-12);
      expect(p).toBeGreaterThanOrEqual(0.7 - 1e-12);
      expect(p).toBeLessThanOrEqual(0.9 + 1e-12);
      expect(Math.abs((2 * p * r) / (p + r) - 0.8)).toBeLessThan(1e-9);
    }
    expect(pts[0]!.y).toBeCloseTo(0.9, 12);
    expect(pts[pts.length - 1]!.x).toBeCloseTo(0.9, 12);

    // F1 = 0.2 never reaches [0.5, 1] x [0.5, 1].
    expect(isoF1Curve(0.2, { x: [0.5, 1], y: [0.5, 1] })).toEqual([]);
  });

  it('samples both the steep recall branch and the flat precision branch', () => {
    const pts = isoF1Curve(0.8, { x: [0, 1], y: [0, 1] }, 64);
    const steep = pts.filter((pt) => pt.y > 0.85);
    const flat = pts.filter((pt) => pt.x > 0.85);
    expect(steep.length).toBeGreaterThanOrEqual(10);
    expect(flat.length).toBeGreaterThanOrEqual(10);
  });
});

describe('paretoFrontier', () => {
  it('returns frontier ids ordered by cost and precomputed axis-aligned step points', () => {
    const points = [
      { id: 'd', cost: 40, score: 0.9 },
      { id: 'b', cost: 10, score: 0.7 },
      { id: 'c', cost: 20, score: 0.6 }, // dominated by b
      { id: 'a', cost: 5, score: 0.5 },
      { id: 'e', cost: 30, score: 0.8 },
    ];
    const result = paretoFrontier(points, { minimize: 'cost', maximize: 'score' });
    expect(result.ids).toEqual(['a', 'b', 'e', 'd']);
    expect(result.steps).toEqual([
      { x: 5, y: 0.5 },
      { x: 10, y: 0.5 },
      { x: 10, y: 0.7 },
      { x: 30, y: 0.7 },
      { x: 30, y: 0.8 },
      { x: 40, y: 0.8 },
      { x: 40, y: 0.9 },
    ]);
    // Every consecutive step segment is axis-aligned.
    for (let i = 1; i < result.steps.length; i += 1) {
      const prev = result.steps[i - 1]!;
      const curr = result.steps[i]!;
      expect(curr.x === prev.x || curr.y === prev.y).toBe(true);
    }
  });

  it('handles cost ties, score ties, and exact duplicates deterministically', () => {
    const points = [
      { id: 'dup2', cost: 10, score: 0.8 },
      { id: 'dup1', cost: 10, score: 0.8 },
      { id: 'same-cost-worse', cost: 10, score: 0.75 },
      { id: 'same-score-costlier', cost: 20, score: 0.8 },
      { id: 'better', cost: 30, score: 0.92 },
    ];
    const result = paretoFrontier(points, { minimize: 'cost', maximize: 'score' });
    expect(result.ids).toEqual(['dup1', 'dup2', 'better']);
    expect(result.steps).toEqual([
      { x: 10, y: 0.8 },
      { x: 30, y: 0.8 },
      { x: 30, y: 0.92 },
    ]);
  });

  it('handles single-point and empty inputs', () => {
    expect(paretoFrontier([], { minimize: 'cost', maximize: 'score' })).toEqual({ ids: [], steps: [] });
    expect(paretoFrontier([{ id: 'only', cost: 2, score: 0.4 }], { minimize: 'cost', maximize: 'score' })).toEqual({
      ids: ['only'],
      steps: [{ x: 2, y: 0.4 }],
    });
  });
});

describe('buildRankCurve', () => {
  it('sorts descending stably on ties and computes exact quantiles', () => {
    // Hand-computed vector: [0.1, 0.9, 0.5, 0.0, 0.5]
    // Sorted ascending: [0.0, 0.1, 0.5, 0.5, 0.9] (n = 5)
    // mean = 2.0 / 5 = 0.4
    // pos(0.1) = 0.4 -> 0.0*0.6 + 0.1*0.4 = 0.04
    // pos(0.5) = 2.0 -> 0.5
    // pos(0.9) = 3.6 -> 0.5*0.4 + 0.9*0.6 = 0.74
    const model = buildRankCurve([0.1, 0.9, 0.5, 0.0, 0.5], { axis: 'rank' });
    expect(model.points).toEqual([
      { x: 1, y: 0.9, rank: 1, sourceIndex: 1 },
      { x: 2, y: 0.5, rank: 2, sourceIndex: 2 },
      { x: 3, y: 0.5, rank: 3, sourceIndex: 4 },
      { x: 4, y: 0.1, rank: 4, sourceIndex: 0 },
      { x: 5, y: 0.0, rank: 5, sourceIndex: 3 },
    ]);
    expect(model.summary.n).toBe(5);
    expect(model.summary.mean).toBeCloseTo(0.4, 12);
    expect(model.summary.min).toBe(0);
    expect(model.summary.p10).toBeCloseTo(0.04, 12);
    expect(model.summary.median).toBeCloseTo(0.5, 12);
    expect(model.summary.p90).toBeCloseTo(0.74, 12);
    expect(model.summary.max).toBe(0.9);
    expect(model.summary.zeroCount).toBe(1);
    expect(model.zeroBand).toEqual({ from: 5, to: 5, count: 1 });
  });

  it('supports percent axis and reports null zeroBand when there are no zeros', () => {
    const model = buildRankCurve([0.2, 0.8], { axis: 'percent' });
    expect(model.points).toEqual([
      { x: 0.5, y: 0.8, rank: 1, sourceIndex: 1 },
      { x: 1, y: 0.2, rank: 2, sourceIndex: 0 },
    ]);
    expect(model.summary.p10).toBeCloseTo(0.26, 12);
    expect(model.summary.median).toBeCloseTo(0.5, 12);
    expect(model.summary.p90).toBeCloseTo(0.74, 12);
    expect(model.zeroBand).toBeNull();
  });
});

describe('buildAcceptanceRates', () => {
  it('computes rate, printed percentage, and Wilson 95% interval at 0/n, n/n, 1/1, 3/4, 300/400', () => {
    const rows = buildAcceptanceRates([
      { id: 'zero', label: 'Zero', accepted: 0, total: 10 },
      { id: 'all', label: 'All', accepted: 10, total: 10 },
      { id: 'one', label: 'One', accepted: 1, total: 1 },
      { id: 'small', label: 'Small', accepted: 3, total: 4 },
      { id: 'large', label: 'Large', accepted: 330, total: 400 },
    ]);
    expect(rows.map((r) => r.id)).toEqual(['zero', 'all', 'one', 'small', 'large']);

    // 0/10
    expect(rows[0]!.rate).toBe(0);
    expect(rows[0]!.interval[0]).toBe(0);
    expect(rows[0]!.interval[1]).toBeCloseTo(0.2775328, 6);
    expect(rows[0]!.valueText).toBe('0.0 % (0/10)');

    // 10/10
    expect(rows[1]!.rate).toBe(1);
    expect(rows[1]!.interval[0]).toBeCloseTo(0.7224672, 6);
    expect(rows[1]!.interval[1]).toBe(1);

    // 1/1
    expect(rows[2]!.rate).toBe(1);
    expect(rows[2]!.interval[0]).toBeCloseTo(0.2065493, 6);
    expect(rows[2]!.interval[1]).toBe(1);

    // 3/4 vs 330/400
    expect(rows[3]!.interval[1] - rows[3]!.interval[0]).toBeGreaterThan(0.5);
    expect(rows[4]!.valueText).toBe('82.5 % (330/400)');
    expect(rows[4]!.interval[1] - rows[4]!.interval[0]).toBeLessThan(0.1);
  });

  it('orders by rate descending stably when order is "rate"', () => {
    const rows = buildAcceptanceRates(
      [
        { id: 'a', label: 'A', accepted: 2, total: 4 },
        { id: 'b', label: 'B', accepted: 9, total: 10 },
        { id: 'c', label: 'C', accepted: 50, total: 100 },
      ],
      { order: 'rate' },
    );
    expect(rows.map((r) => r.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('placePointLabels', () => {
  const plot: PointLabelPlot = { x: 0, y: 0, width: 300, height: 300, gap: 6, padding: 2 };

  it('places non-overlapping labels in fixed candidate order', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 100, y: 80 }, // falls inside point 0's "top" box, forcing point 0 to "right"
    ];
    const boxes: PointLabelBox[] = [
      { w: 40, h: 14 },
      { w: 40, h: 14 },
    ];
    const placed = placePointLabels(points, boxes, plot);
    expect(placed).toEqual(['right', 'top']);

    // Independent point picks the first candidate ("top").
    expect(placePointLabels([{ x: 150, y: 150 }], [{ w: 40, h: 14 }], plot)).toEqual(['top']);
  });

  it('returns null as soon as one point cannot be placed inside plot without collision', () => {
    // Cluster of points in a tiny corner where no candidate box fits without overlap.
    const points = [
      { x: 10, y: 10, r: 4 },
      { x: 14, y: 10, r: 4 },
      { x: 10, y: 14, r: 4 },
      { x: 14, y: 14, r: 4 },
    ];
    const boxes: PointLabelBox[] = points.map(() => ({ w: 50, h: 14 }));
    expect(placePointLabels(points, boxes, plot)).toBeNull();
  });

  it('estimates deterministic boxes using a fixed character width table', () => {
    const narrow = estimateBenchLabelBox('iiii');
    const wide = estimateBenchLabelBox('WWWW');
    expect(wide.w).toBeGreaterThan(narrow.w);
    expect(estimateBenchLabelBox('System A')).toEqual(estimateBenchLabelBox('System A'));
  });
});
