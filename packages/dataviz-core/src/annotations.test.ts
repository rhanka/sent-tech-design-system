import { describe, it, expect } from 'vitest';
import {
  type ChartAnnotation,
  isChartAnnotation,
  serializeAnnotations,
  deserializeAnnotations,
  pointAnnotation,
  labelAnnotation,
  lineAnnotation,
  regionAnnotation,
  shapeAnnotation,
  annotation,
} from './index.js';

describe('isChartAnnotation', () => {
  it('accepts a point annotation (numeric and category x)', () => {
    expect(isChartAnnotation({ kind: 'point', x: 1, y: 2 })).toBe(true);
    expect(isChartAnnotation({ kind: 'point', x: 'Q1', y: 2 })).toBe(true);
    expect(
      isChartAnnotation({ kind: 'point', x: 1, y: 2, label: 'peak', marker: 'square' }),
    ).toBe(true);
  });

  it('accepts a label annotation', () => {
    expect(isChartAnnotation({ kind: 'label', x: 1, y: 2, text: 'hi' })).toBe(true);
    expect(
      isChartAnnotation({ kind: 'label', x: 'cat', y: 0, text: 'hi', anchor: 'end' }),
    ).toBe(true);
  });

  it('accepts a numeric line annotation on either axis', () => {
    expect(isChartAnnotation({ kind: 'line', axis: 'x', value: 5 })).toBe(true);
    expect(isChartAnnotation({ kind: 'line', axis: 'y', value: 42, label: 'target' })).toBe(true);
  });

  it('rejects a categorical (string) line value — DS renders numeric guides only', () => {
    expect(isChartAnnotation({ kind: 'line', axis: 'y', value: 'A' })).toBe(false);
  });

  it('accepts a numeric region annotation', () => {
    expect(isChartAnnotation({ kind: 'region', axis: 'x', from: 1, to: 5 })).toBe(true);
    expect(
      isChartAnnotation({ kind: 'region', axis: 'y', from: 10, to: 20, label: 'band' }),
    ).toBe(true);
  });

  it('rejects a categorical (string) region bound', () => {
    expect(isChartAnnotation({ kind: 'region', axis: 'y', from: 'a', to: 'z' })).toBe(false);
  });

  it('accepts a shape annotation', () => {
    expect(
      isChartAnnotation({
        kind: 'shape',
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 'c', y: 2 },
        ],
      }),
    ).toBe(true);
  });

  it('rejects null / non-object / unknown kind', () => {
    expect(isChartAnnotation(null)).toBe(false);
    expect(isChartAnnotation('point')).toBe(false);
    expect(isChartAnnotation({ kind: 'nope' })).toBe(false);
    expect(isChartAnnotation({})).toBe(false);
  });

  it('rejects malformed point annotations', () => {
    expect(isChartAnnotation({ kind: 'point', x: 1 })).toBe(false); // missing y
    expect(isChartAnnotation({ kind: 'point', x: true, y: 2 })).toBe(false); // bad x type
    expect(isChartAnnotation({ kind: 'point', x: 1, y: 'a' })).toBe(false); // y not number
    expect(isChartAnnotation({ kind: 'point', x: 1, y: Number.NaN })).toBe(false);
    expect(isChartAnnotation({ kind: 'point', x: 1, y: 2, marker: 'star' })).toBe(false);
    expect(isChartAnnotation({ kind: 'point', x: 1, y: 2, label: 3 })).toBe(false);
  });

  it('rejects malformed label annotations', () => {
    expect(isChartAnnotation({ kind: 'label', x: 1, y: 2 })).toBe(false); // missing text
    expect(isChartAnnotation({ kind: 'label', x: 1, y: 2, text: 7 })).toBe(false);
    expect(isChartAnnotation({ kind: 'label', x: 1, y: 2, text: 'a', anchor: 'top' })).toBe(false);
  });

  it('rejects malformed line annotations', () => {
    expect(isChartAnnotation({ kind: 'line', axis: 'z', value: 1 })).toBe(false);
    expect(isChartAnnotation({ kind: 'line', axis: 'x' })).toBe(false); // missing value
    expect(isChartAnnotation({ kind: 'line', axis: 'x', value: true })).toBe(false);
    expect(isChartAnnotation({ kind: 'line', axis: 'x', value: Number.NaN })).toBe(false);
  });

  it('rejects malformed region annotations', () => {
    expect(isChartAnnotation({ kind: 'region', axis: 'x', from: 1 })).toBe(false); // missing to
    expect(isChartAnnotation({ kind: 'region', axis: 'q', from: 1, to: 2 })).toBe(false);
    expect(isChartAnnotation({ kind: 'region', axis: 'x', from: true, to: 2 })).toBe(false);
  });

  it('rejects malformed shape annotations', () => {
    expect(isChartAnnotation({ kind: 'shape', points: [] })).toBe(false); // empty
    expect(isChartAnnotation({ kind: 'shape' })).toBe(false);
    expect(isChartAnnotation({ kind: 'shape', points: [{ x: 1 }] })).toBe(false);
    expect(isChartAnnotation({ kind: 'shape', points: [{ x: 1, y: 'a' }] })).toBe(false);
    expect(isChartAnnotation({ kind: 'shape', points: [{ x: true, y: 1 }] })).toBe(false);
  });
});

describe('annotation builders', () => {
  it('pointAnnotation builds a valid plain object', () => {
    const a = pointAnnotation(1, 2, { label: 'peak', marker: 'diamond' });
    expect(a).toEqual({ kind: 'point', x: 1, y: 2, label: 'peak', marker: 'diamond' });
    expect(isChartAnnotation(a)).toBe(true);
  });

  it('pointAnnotation omits optional fields when absent', () => {
    const a = pointAnnotation('Q1', 5);
    expect(a).toEqual({ kind: 'point', x: 'Q1', y: 5 });
    expect('label' in a).toBe(false);
    expect('marker' in a).toBe(false);
  });

  it('labelAnnotation builds a valid object', () => {
    const a = labelAnnotation(0, 0, 'note', { anchor: 'start' });
    expect(a).toEqual({ kind: 'label', x: 0, y: 0, text: 'note', anchor: 'start' });
    expect(isChartAnnotation(a)).toBe(true);
  });

  it('lineAnnotation builds a valid object', () => {
    expect(lineAnnotation('y', 100, { label: 'target' })).toEqual({
      kind: 'line',
      axis: 'y',
      value: 100,
      label: 'target',
    });
    expect(lineAnnotation('x', 5)).toEqual({ kind: 'line', axis: 'x', value: 5 });
  });

  it('regionAnnotation builds a valid object', () => {
    expect(regionAnnotation('x', 1, 5, { label: 'window' })).toEqual({
      kind: 'region',
      axis: 'x',
      from: 1,
      to: 5,
      label: 'window',
    });
  });

  it('shapeAnnotation builds a valid object and copies points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
    ];
    const a = shapeAnnotation(points, { label: 'area' });
    expect(a).toEqual({
      kind: 'shape',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
      ],
      label: 'area',
    });
    // Defensive copy: mutating input must not affect the annotation.
    points.push({ x: 9, y: 9 });
    expect(a.points).toHaveLength(2);
  });

  it('exposes a builder namespace', () => {
    expect(annotation.point(1, 2)).toEqual({ kind: 'point', x: 1, y: 2 });
    expect(annotation.label(1, 2, 't')).toEqual({ kind: 'label', x: 1, y: 2, text: 't' });
    expect(annotation.line('x', 3)).toEqual({ kind: 'line', axis: 'x', value: 3 });
    expect(annotation.region('y', 1, 2)).toEqual({ kind: 'region', axis: 'y', from: 1, to: 2 });
    expect(annotation.shape([{ x: 0, y: 0 }])).toEqual({
      kind: 'shape',
      points: [{ x: 0, y: 0 }],
    });
  });
});

describe('serialize / deserialize annotations', () => {
  const all: ChartAnnotation[] = [
    pointAnnotation(1, 2, { label: 'p', marker: 'diamond' }),
    labelAnnotation('Q2', 3, 'text', { anchor: 'middle' }),
    lineAnnotation('y', 50, { label: 'avg' }),
    regionAnnotation('x', 0, 10, { label: 'band' }),
    shapeAnnotation([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]),
  ];

  it('round-trips a full list of every kind', () => {
    const encoded = serializeAnnotations(all);
    expect(typeof encoded).toBe('string');
    expect(deserializeAnnotations(encoded)).toEqual(all);
  });

  it('round-trips an empty list', () => {
    expect(deserializeAnnotations(serializeAnnotations([]))).toEqual([]);
  });

  it('serialize throws on a malformed annotation', () => {
    expect(() => serializeAnnotations([{ kind: 'point', x: 1 } as unknown as ChartAnnotation])).toThrow();
    expect(() => serializeAnnotations('x' as unknown as ChartAnnotation[])).toThrow();
  });

  it('deserialize drops invalid entries without throwing', () => {
    const payload = JSON.stringify([
      { kind: 'point', x: 1, y: 2 },
      { kind: 'point', x: 1 }, // invalid
      { kind: 'bogus' }, // invalid
      { kind: 'line', axis: 'x', value: 3 },
    ]);
    expect(deserializeAnnotations(payload)).toEqual([
      { kind: 'point', x: 1, y: 2 },
      { kind: 'line', axis: 'x', value: 3 },
    ]);
  });

  it('deserialize returns [] on invalid / empty input (no throw)', () => {
    expect(deserializeAnnotations('')).toEqual([]);
    expect(deserializeAnnotations('not json')).toEqual([]);
    expect(deserializeAnnotations('{}')).toEqual([]);
    expect(deserializeAnnotations('null')).toEqual([]);
    expect(deserializeAnnotations('42')).toEqual([]);
  });
});
