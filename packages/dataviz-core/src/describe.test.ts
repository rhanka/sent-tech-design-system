import { describe, it, expect } from 'vitest';
import { describeFilterSpec } from './index.js';

describe('describeFilterSpec', () => {
  it('joins include values with commas', () => {
    expect(describeFilterSpec({ kind: 'include', values: ['France', 'Italie'] })).toBe(
      'France, Italie',
    );
  });

  it('prefixes exclude values', () => {
    expect(describeFilterSpec({ kind: 'exclude', values: ['US', 'CA'] })).toBe('≠ US, CA');
  });

  it('formats a bounded range', () => {
    expect(describeFilterSpec({ kind: 'range', min: 10, max: 20 })).toBe('10 – 20');
  });

  it('formats open-ended ranges', () => {
    expect(describeFilterSpec({ kind: 'range', min: 5 })).toBe('≥ 5');
    expect(describeFilterSpec({ kind: 'range', max: 100 })).toBe('≤ 100');
  });

  it('describes an unbounded range', () => {
    expect(describeFilterSpec({ kind: 'range' })).toBe('tous');
  });
});
