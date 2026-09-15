import { describe, it, expect } from 'vitest';
import { formatValue, makeFormatter } from './index.js';

describe('formatValue — numbers', () => {
  it('formats a plain number (decimal default)', () => {
    expect(formatValue(1234.5, { locale: 'en-US' })).toBe('1,234.5');
  });

  it("maps style 'number' to 'decimal'", () => {
    expect(formatValue(1000, { style: 'number', locale: 'en-US' })).toBe(
      formatValue(1000, { style: 'decimal', locale: 'en-US' }),
    );
  });

  it('formats currency', () => {
    expect(formatValue(1234.5, { style: 'currency', currency: 'USD', locale: 'en-US' })).toBe(
      '$1,234.50',
    );
  });

  it('formats percent (value is a ratio)', () => {
    expect(formatValue(0.25, { style: 'percent', locale: 'en-US' })).toBe('25%');
  });

  it('honours fraction-digit options', () => {
    expect(
      formatValue(1, {
        style: 'decimal',
        locale: 'en-US',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe('1.00');
  });

  it('supports compact notation', () => {
    expect(formatValue(1_500_000, { notation: 'compact', locale: 'en-US' })).toBe('1.5M');
  });

  it('respects locale override (French grouping/decimal)', () => {
    // fr-FR uses a narrow no-break space for grouping and a comma decimal.
    const out = formatValue(1234.5, { locale: 'fr-FR' });
    expect(out).toContain('1');
    expect(out).toContain('234');
    expect(out).toContain(',');
    expect(out).not.toBe('1,234.5');
  });
});

describe('formatValue — dates', () => {
  const date = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));

  it('formats a Date using dateStyle', () => {
    const out = formatValue(date, { dateStyle: 'medium', locale: 'en-US', timeZone: 'UTC' });
    expect(out).toContain('2024');
    expect(out).toContain('15');
  });

  it('formats a Date by default (no options) without throwing', () => {
    expect(typeof formatValue(date)).toBe('string');
  });

  it("treats numeric values as dates when style is 'date'", () => {
    const out = formatValue(date.getTime(), {
      style: 'date',
      dateStyle: 'medium',
      locale: 'en-US',
      timeZone: 'UTC',
    });
    // A numeric timestamp must render as a date, not as the raw number.
    expect(out).toContain('2024');
    expect(out).toContain('15');
  });
});

describe('formatValue — guards', () => {
  it('returns the fallback for NaN / Infinity', () => {
    expect(formatValue(Number.NaN)).toBe('—');
    expect(formatValue(Number.POSITIVE_INFINITY)).toBe('—');
    expect(formatValue(Number.NEGATIVE_INFINITY)).toBe('—');
  });

  it('returns the fallback for an invalid Date', () => {
    expect(formatValue(new Date('not-a-date'))).toBe('—');
  });
});

describe('makeFormatter', () => {
  it('returns a curried function with the same output as formatValue', () => {
    const fmt = makeFormatter({ style: 'currency', currency: 'EUR', locale: 'fr-FR' });
    expect(typeof fmt).toBe('function');
    expect(fmt(1234.5)).toBe(formatValue(1234.5, { style: 'currency', currency: 'EUR', locale: 'fr-FR' }));
  });

  it('is stable across calls (reusable formatter)', () => {
    const fmt = makeFormatter({ locale: 'en-US' });
    expect(fmt(10)).toBe('10');
    expect(fmt(20)).toBe('20');
    expect(fmt(1000)).toBe('1,000');
  });

  it('applies NaN fallback through the curried form', () => {
    const fmt = makeFormatter({ locale: 'en-US' });
    expect(fmt(Number.NaN)).toBe('—');
  });
});
