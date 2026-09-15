import { describe, it, expect } from 'vitest';
import {
  parseHex,
  toHex,
  mix,
  sampleScale,
  buildSequentialScale,
  buildDivergingScale,
  buildCategoricalScale,
  colorAt,
  makeColorScale,
} from './color.js';

describe('parseHex / toHex', () => {
  it('parses #rrggbb and #rgb (with or without #)', () => {
    expect(parseHex('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
    expect(parseHex('ff8800')).toEqual({ r: 255, g: 136, b: 0 });
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('returns null for invalid input', () => {
    expect(parseHex('')).toBeNull();
    expect(parseHex('#xyz')).toBeNull();
    expect(parseHex('#ff88')).toBeNull();
    expect(parseHex('rgb(1,2,3)')).toBeNull();
  });

  it('formats and clamps to #rrggbb', () => {
    expect(toHex({ r: 255, g: 136, b: 0 })).toBe('#ff8800');
    expect(toHex({ r: -5, g: 300, b: 17 })).toBe('#00ff11');
  });

  it('round-trips parse → format', () => {
    expect(toHex(parseHex('#1a2b3c')!)).toBe('#1a2b3c');
  });
});

describe('mix (OKLab)', () => {
  it('returns the endpoints exactly at t=0 and t=1', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('clamps t outside [0, 1]', () => {
    expect(mix('#000000', '#ffffff', -3)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 5)).toBe('#ffffff');
  });

  it('produces a neutral interior midpoint between the endpoints', () => {
    const mid = parseHex(mix('#000000', '#ffffff', 0.5))!;
    // OKLab midpoint of black/white is a perceptual mid-grey (≈ sRGB 99) —
    // darker than a naive sRGB 0.5 (#808080), which is the whole point.
    expect(mid.r).toBe(mid.g);
    expect(mid.g).toBe(mid.b);
    expect(mid.r).toBeGreaterThan(0);
    expect(mid.r).toBeLessThan(255);
  });

  it('falls back to the valid color when one input is invalid', () => {
    expect(mix('not-a-color', '#123456', 0.5)).toBe('#123456');
    expect(mix('#123456', 'nope', 0.5)).toBe('#123456');
    // 'zzz'/'qqq' are non-hex (note: 'bad'/'fed' would be *valid* 3-digit hex!)
    expect(mix('zzz', 'qqq', 0.5)).toBe('#000000');
  });
});

describe('sampleScale', () => {
  it('handles empty and single-stop scales', () => {
    expect(sampleScale([], 0.5)).toBe('#000000');
    expect(sampleScale(['#abcdef'], 0.5)).toBe('#abcdef');
  });

  it('returns the first/last stop at the extremes', () => {
    const stops = ['#ff0000', '#00ff00', '#0000ff'];
    expect(sampleScale(stops, 0)).toBe('#ff0000');
    expect(sampleScale(stops, 1)).toBe('#0000ff');
  });

  it('lands on an interior stop and clamps t', () => {
    const stops = ['#ff0000', '#00ff00', '#0000ff'];
    expect(sampleScale(stops, 0.5)).toBe('#00ff00');
    expect(sampleScale(stops, 2)).toBe('#0000ff');
    expect(sampleScale(stops, -1)).toBe('#ff0000');
  });
});

describe('buildSequentialScale', () => {
  it('respects the count and anchors the endpoints', () => {
    const ramp = buildSequentialScale(['#ffffff', '#000000'], 5);
    expect(ramp).toHaveLength(5);
    expect(ramp[0]).toBe('#ffffff');
    expect(ramp[4]).toBe('#000000');
  });

  it('handles count 0 and 1', () => {
    expect(buildSequentialScale(['#fff', '#000'], 0)).toEqual([]);
    expect(buildSequentialScale(['#ffffff', '#000000'], 1)).toEqual(['#ffffff']);
  });
});

describe('buildDivergingScale', () => {
  it('passes through the midpoint and anchors both ends', () => {
    const ramp = buildDivergingScale('#2166ac', '#f7f7f7', '#b2182b', 5);
    expect(ramp).toHaveLength(5);
    expect(ramp[0]).toBe('#2166ac');
    expect(ramp[2]).toBe('#f7f7f7');
    expect(ramp[4]).toBe('#b2182b');
  });
});

describe('buildCategoricalScale', () => {
  it('cycles the palette to fill the requested count', () => {
    expect(buildCategoricalScale(['#a', '#b'], 0)).toEqual([]);
    expect(buildCategoricalScale(['#111', '#222', '#333'], 5)).toEqual([
      '#111',
      '#222',
      '#333',
      '#111',
      '#222',
    ]);
  });

  it('returns [] for an empty palette', () => {
    expect(buildCategoricalScale([], 4)).toEqual([]);
  });
});

describe('colorAt / makeColorScale', () => {
  const stops = ['#000000', '#ffffff'];

  it('maps the domain endpoints to the scale endpoints', () => {
    expect(colorAt(0, 0, 100, stops)).toBe('#000000');
    expect(colorAt(100, 0, 100, stops)).toBe('#ffffff');
  });

  it('clamps out-of-domain values to the endpoints', () => {
    expect(colorAt(-50, 0, 100, stops)).toBe('#000000');
    expect(colorAt(999, 0, 100, stops)).toBe('#ffffff');
  });

  it('interpolates an interior value', () => {
    const mid = parseHex(colorAt(50, 0, 100, stops))!;
    expect(mid.r).toBe(mid.g);
    expect(mid.r).toBeGreaterThan(0);
    expect(mid.r).toBeLessThan(255);
  });

  it('returns the first stop for a degenerate domain or non-finite input', () => {
    expect(colorAt(5, 10, 10, stops)).toBe('#000000');
    expect(colorAt(Number.NaN, 0, 100, stops)).toBe('#000000');
    expect(colorAt(5, Number.POSITIVE_INFINITY, 100, stops)).toBe('#000000');
  });

  it('makeColorScale builds a reusable mapper', () => {
    const scale = makeColorScale(0, 10, ['#2166ac', '#f7f7f7', '#b2182b']);
    expect(scale(0)).toBe('#2166ac');
    expect(scale(5)).toBe('#f7f7f7');
    expect(scale(10)).toBe('#b2182b');
  });
});
