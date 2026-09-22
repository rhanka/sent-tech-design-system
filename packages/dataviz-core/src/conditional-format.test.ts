import { describe, it, expect } from 'vitest';
import {
  type ConditionalComparator,
  type ConditionalIntent,
  type ConditionalCondition,
  type ConditionalRule,
  type ConditionalFormat,
  type ConditionalDecoration,
  isConditionalRule,
  isConditionalFormat,
  evaluateConditionalFormat,
  applyConditionalFormat,
  rule,
  rankRule,
} from './index.js';

// ---------------------------------------------------------------------------
// Comparator evaluation — each comparator
// ---------------------------------------------------------------------------

describe('evaluateConditionalFormat — comparator rules', () => {
  function mkRule(
    comparator: ConditionalComparator,
    value: number,
    intent: ConditionalIntent = 'positive',
    value2?: number,
  ): ConditionalFormat {
    const condition: ConditionalCondition =
      value2 !== undefined ? { comparator, value, value2 } : { comparator, value };
    return [{ condition, intent }];
  }

  it('gt: matches when value strictly greater', () => {
    expect(evaluateConditionalFormat(101, mkRule('gt', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(100, mkRule('gt', 100))).toBeNull();
    expect(evaluateConditionalFormat(99, mkRule('gt', 100))).toBeNull();
  });

  it('gte: matches when value greater or equal', () => {
    expect(evaluateConditionalFormat(100, mkRule('gte', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(101, mkRule('gte', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(99, mkRule('gte', 100))).toBeNull();
  });

  it('lt: matches when value strictly less', () => {
    expect(evaluateConditionalFormat(99, mkRule('lt', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(100, mkRule('lt', 100))).toBeNull();
    expect(evaluateConditionalFormat(101, mkRule('lt', 100))).toBeNull();
  });

  it('lte: matches when value less or equal', () => {
    expect(evaluateConditionalFormat(100, mkRule('lte', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(99, mkRule('lte', 100))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(101, mkRule('lte', 100))).toBeNull();
  });

  it('eq: matches exact equality', () => {
    expect(evaluateConditionalFormat(42, mkRule('eq', 42))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(43, mkRule('eq', 42))).toBeNull();
  });

  it('ne: matches when value differs', () => {
    expect(evaluateConditionalFormat(43, mkRule('ne', 42))).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(42, mkRule('ne', 42))).toBeNull();
  });

  it('between: matches inclusive range [lo, hi]', () => {
    expect(evaluateConditionalFormat(5, mkRule('between', 1, 'positive', 10))).toEqual({
      intent: 'positive',
    });
    expect(evaluateConditionalFormat(1, mkRule('between', 1, 'positive', 10))).toEqual({
      intent: 'positive',
    });
    expect(evaluateConditionalFormat(10, mkRule('between', 1, 'positive', 10))).toEqual({
      intent: 'positive',
    });
    expect(evaluateConditionalFormat(0, mkRule('between', 1, 'positive', 10))).toBeNull();
    expect(evaluateConditionalFormat(11, mkRule('between', 1, 'positive', 10))).toBeNull();
  });

  it('between without value2 never matches', () => {
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'between', value: 1 }, intent: 'warning' },
    ];
    expect(evaluateConditionalFormat(5, fmt)).toBeNull();
  });

  it('includes icon in decoration when rule has one', () => {
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'gt', value: 0 }, intent: 'positive', icon: 'arrow-up' },
    ];
    expect(evaluateConditionalFormat(1, fmt)).toEqual({ intent: 'positive', icon: 'arrow-up' });
  });

  it('omits icon key when rule has no icon', () => {
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'gt', value: 0 }, intent: 'negative' },
    ];
    const result = evaluateConditionalFormat(1, fmt);
    expect(result).toEqual({ intent: 'negative' });
    expect(result && 'icon' in result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// NaN / Infinity → null
// ---------------------------------------------------------------------------

describe('evaluateConditionalFormat — non-finite values', () => {
  const fmt: ConditionalFormat = [{ condition: { comparator: 'gte', value: 0 }, intent: 'info' }];

  it('returns null for NaN', () => {
    expect(evaluateConditionalFormat(NaN, fmt)).toBeNull();
  });

  it('returns null for +Infinity', () => {
    expect(evaluateConditionalFormat(Infinity, fmt)).toBeNull();
  });

  it('returns null for -Infinity', () => {
    expect(evaluateConditionalFormat(-Infinity, fmt)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// First-match precedence
// ---------------------------------------------------------------------------

describe('evaluateConditionalFormat — first-match precedence', () => {
  it('returns the first matching rule and ignores subsequent ones', () => {
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'gt', value: 50 }, intent: 'positive' },
      { condition: { comparator: 'gt', value: 20 }, intent: 'warning' },
      { condition: { comparator: 'gte', value: 0 }, intent: 'neutral' },
    ];
    expect(evaluateConditionalFormat(100, fmt)).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(30, fmt)).toEqual({ intent: 'warning' });
    expect(evaluateConditionalFormat(5, fmt)).toEqual({ intent: 'neutral' });
    expect(evaluateConditionalFormat(-1, fmt)).toBeNull();
  });

  it('returns null when no rule matches', () => {
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'gt', value: 100 }, intent: 'positive' },
    ];
    expect(evaluateConditionalFormat(50, fmt)).toBeNull();
  });

  it('returns null for empty rule list', () => {
    expect(evaluateConditionalFormat(42, [])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Top / bottom rank conditions
// ---------------------------------------------------------------------------

describe('evaluateConditionalFormat — top/bottom rank conditions', () => {
  const values = [10, 20, 30, 40, 50];

  it('top-2 matches the 2 highest values', () => {
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 2 }, intent: 'positive' }];
    expect(evaluateConditionalFormat(50, fmt, { values })).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(40, fmt, { values })).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(30, fmt, { values })).toBeNull();
  });

  it('bottom-2 matches the 2 lowest values', () => {
    const fmt: ConditionalFormat = [{ condition: { kind: 'bottom', n: 2 }, intent: 'negative' }];
    expect(evaluateConditionalFormat(10, fmt, { values })).toEqual({ intent: 'negative' });
    expect(evaluateConditionalFormat(20, fmt, { values })).toEqual({ intent: 'negative' });
    expect(evaluateConditionalFormat(30, fmt, { values })).toBeNull();
  });

  it('top-1 with ties: all values equal to the max match', () => {
    const tied = [5, 5, 5];
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 1 }, intent: 'positive' }];
    expect(evaluateConditionalFormat(5, fmt, { values: tied })).toEqual({ intent: 'positive' });
  });

  it('top-n capped at dataset size: n > length matches all finite values', () => {
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 99 }, intent: 'info' }];
    expect(evaluateConditionalFormat(10, fmt, { values })).toEqual({ intent: 'info' });
    expect(evaluateConditionalFormat(50, fmt, { values })).toEqual({ intent: 'info' });
  });

  it('rank ignores non-finite values in context', () => {
    const dirty = [10, NaN, 30, Infinity, 50];
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 1 }, intent: 'positive' }];
    // Only finite: [10, 30, 50]; top-1 → 50
    expect(evaluateConditionalFormat(50, fmt, { values: dirty })).toEqual({ intent: 'positive' });
    expect(evaluateConditionalFormat(30, fmt, { values: dirty })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Missing context for top/bottom → skip, not throw
// ---------------------------------------------------------------------------

describe('evaluateConditionalFormat — missing context for rank rules', () => {
  it('skips top rule when context.values is absent', () => {
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 1 }, intent: 'positive' }];
    expect(evaluateConditionalFormat(100, fmt)).toBeNull(); // no context
    expect(evaluateConditionalFormat(100, fmt, {})).toBeNull(); // context but no values
  });

  it('skips bottom rule when context.values is absent, falls through to next rule', () => {
    const fmt: ConditionalFormat = [
      { condition: { kind: 'bottom', n: 1 }, intent: 'negative' },
      { condition: { comparator: 'gte', value: 0 }, intent: 'neutral' },
    ];
    // rank rule skipped → fallthrough to comparator rule
    expect(evaluateConditionalFormat(5, fmt)).toEqual({ intent: 'neutral' });
  });
});

// ---------------------------------------------------------------------------
// applyConditionalFormat
// ---------------------------------------------------------------------------

describe('applyConditionalFormat', () => {
  it('returns a parallel array with the same length', () => {
    const values = [10, 50, 90];
    const fmt: ConditionalFormat = [
      { condition: { comparator: 'gt', value: 70 }, intent: 'positive' },
      { condition: { comparator: 'lt', value: 30 }, intent: 'negative' },
    ];
    const result = applyConditionalFormat(values, fmt);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ intent: 'negative' });
    expect(result[1]).toBeNull();
    expect(result[2]).toEqual({ intent: 'positive' });
  });

  it('passes full array as context so top/bottom rules work', () => {
    const values = [1, 2, 3, 4, 5];
    const fmt: ConditionalFormat = [{ condition: { kind: 'top', n: 1 }, intent: 'positive' }];
    const result = applyConditionalFormat(values, fmt);
    // Only value 5 is top-1
    expect(result[4]).toEqual({ intent: 'positive' });
    expect(result.slice(0, 4).every((d) => d === null)).toBe(true);
  });

  it('handles empty values array', () => {
    expect(applyConditionalFormat([], [])).toEqual([]);
  });

  it('returns null for NaN entries', () => {
    const result = applyConditionalFormat([NaN, 1], [
      { condition: { comparator: 'gte', value: 0 }, intent: 'neutral' },
    ]);
    expect(result[0]).toBeNull();
    expect(result[1]).toEqual({ intent: 'neutral' });
  });
});

// ---------------------------------------------------------------------------
// Runtime validation — isConditionalRule
// ---------------------------------------------------------------------------

describe('isConditionalRule', () => {
  it('accepts valid comparator rules', () => {
    expect(isConditionalRule({ condition: { comparator: 'gt', value: 10 }, intent: 'positive' })).toBe(true);
    expect(
      isConditionalRule({
        condition: { comparator: 'between', value: 0, value2: 100 },
        intent: 'warning',
        icon: 'alert',
      }),
    ).toBe(true);
  });

  it('accepts valid rank rules', () => {
    expect(isConditionalRule({ condition: { kind: 'top', n: 3 }, intent: 'positive' })).toBe(true);
    expect(
      isConditionalRule({ condition: { kind: 'bottom', n: 1 }, intent: 'negative', icon: 'down' }),
    ).toBe(true);
  });

  it('rejects missing or bad intent', () => {
    expect(isConditionalRule({ condition: { comparator: 'gt', value: 1 }, intent: 'rainbow' })).toBe(false);
    expect(isConditionalRule({ condition: { comparator: 'gt', value: 1 } })).toBe(false);
  });

  it('rejects bad comparator', () => {
    expect(isConditionalRule({ condition: { comparator: 'notAComparator', value: 1 }, intent: 'info' })).toBe(false);
  });

  it('rejects non-finite value in comparator condition', () => {
    expect(isConditionalRule({ condition: { comparator: 'gt', value: NaN }, intent: 'info' })).toBe(false);
    expect(isConditionalRule({ condition: { comparator: 'gt', value: Infinity }, intent: 'info' })).toBe(false);
  });

  it('rejects between with non-finite value2', () => {
    expect(
      isConditionalRule({
        condition: { comparator: 'between', value: 0, value2: NaN },
        intent: 'warning',
      }),
    ).toBe(false);
  });

  it('rejects rank condition with n < 1 or non-integer n', () => {
    expect(isConditionalRule({ condition: { kind: 'top', n: 0 }, intent: 'positive' })).toBe(false);
    expect(isConditionalRule({ condition: { kind: 'top', n: -1 }, intent: 'positive' })).toBe(false);
    expect(isConditionalRule({ condition: { kind: 'top', n: 1.5 }, intent: 'positive' })).toBe(false);
  });

  it('rejects bad rank kind', () => {
    expect(isConditionalRule({ condition: { kind: 'middle', n: 1 }, intent: 'info' })).toBe(false);
  });

  it('rejects non-string icon', () => {
    expect(
      isConditionalRule({ condition: { comparator: 'gt', value: 0 }, intent: 'info', icon: 42 }),
    ).toBe(false);
  });

  it('rejects null / non-object', () => {
    expect(isConditionalRule(null)).toBe(false);
    expect(isConditionalRule('rule')).toBe(false);
    expect(isConditionalRule(42)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Runtime validation — isConditionalFormat
// ---------------------------------------------------------------------------

describe('isConditionalFormat', () => {
  it('accepts an array of valid rules', () => {
    expect(
      isConditionalFormat([
        { condition: { comparator: 'gt', value: 0 }, intent: 'positive' },
        { condition: { kind: 'bottom', n: 2 }, intent: 'negative' },
      ]),
    ).toBe(true);
  });

  it('accepts empty array', () => {
    expect(isConditionalFormat([])).toBe(true);
  });

  it('rejects non-array', () => {
    expect(isConditionalFormat(null)).toBe(false);
    expect(isConditionalFormat({})).toBe(false);
    expect(isConditionalFormat('[]')).toBe(false);
  });

  it('rejects array containing malformed rule', () => {
    expect(
      isConditionalFormat([
        { condition: { comparator: 'gt', value: 0 }, intent: 'positive' },
        { condition: { comparator: 'gt', value: 0 }, intent: 'rainbow' }, // bad intent
      ]),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Builders — rule() and rankRule()
// ---------------------------------------------------------------------------

describe('rule() builder', () => {
  it('builds a basic threshold rule', () => {
    const r = rule('gt', 100, 'positive');
    expect(r).toEqual({ condition: { comparator: 'gt', value: 100 }, intent: 'positive' });
    expect(isConditionalRule(r)).toBe(true);
  });

  it('includes icon when provided', () => {
    const r = rule('lt', 0, 'negative', { icon: 'arrow-down' });
    expect(r.icon).toBe('arrow-down');
  });

  it('includes value2 for between', () => {
    const r = rule('between', 10, 'warning', { value2: 50 });
    expect(r.condition).toEqual({ comparator: 'between', value: 10, value2: 50 });
    expect(isConditionalRule(r)).toBe(true);
  });

  it('omits icon key when not provided', () => {
    const r = rule('eq', 0, 'neutral');
    expect('icon' in r).toBe(false);
  });
});

describe('rankRule() builder', () => {
  it('builds a top-N rank rule', () => {
    const r = rankRule('top', 3, 'positive', { icon: 'star' });
    expect(r).toEqual({ condition: { kind: 'top', n: 3 }, intent: 'positive', icon: 'star' });
    expect(isConditionalRule(r)).toBe(true);
  });

  it('builds a bottom-N rank rule without icon', () => {
    const r = rankRule('bottom', 2, 'negative');
    expect(r).toEqual({ condition: { kind: 'bottom', n: 2 }, intent: 'negative' });
    expect('icon' in r).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// All ConditionalIntent values are reachable
// ---------------------------------------------------------------------------

describe('all ConditionalIntent values', () => {
  const intents: ConditionalIntent[] = ['positive', 'negative', 'warning', 'info', 'neutral'];
  it('each intent is accepted by isConditionalRule', () => {
    for (const intent of intents) {
      expect(
        isConditionalRule({ condition: { comparator: 'eq', value: 0 }, intent }),
      ).toBe(true);
    }
  });
});
