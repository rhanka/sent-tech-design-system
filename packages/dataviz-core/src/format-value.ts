/**
 * Intl-based value formatter.
 *
 * `formatValue` turns a number or {@link Date} into a display string using the
 * platform {@link Intl} API — number / currency / percent / compact for
 * numbers, and {@link Intl.DateTimeFormat} for dates. It is presentation-free:
 * it produces a plain string the design system passes to `dataLabels.format`.
 *
 * Non-finite numbers and invalid dates resolve to a single fallback glyph
 * (`'—'`) so charts never render `NaN` / `Infinity`.
 *
 * Note: this is *value* formatting and is intentionally separate from
 * `format.ts`, which configures *axes*.
 */

/** Number-formatting styles. `'number'` is an alias for `'decimal'`. */
export type FormatValueStyle = 'decimal' | 'number' | 'currency' | 'percent' | 'date';

/** Compact (`1.5M`) vs. standard notation. */
export type FormatValueNotation = 'standard' | 'compact';

/** Date / time length presets, forwarded to {@link Intl.DateTimeFormat}. */
export type FormatValueDateStyle = 'short' | 'medium' | 'long' | 'full';

/** Options for {@link formatValue} / {@link makeFormatter}. */
export interface FormatValueOptions {
  style?: FormatValueStyle;
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: FormatValueNotation;
  dateStyle?: FormatValueDateStyle;
  timeStyle?: FormatValueDateStyle;
  /** IANA time zone (e.g. `'UTC'`), forwarded to {@link Intl.DateTimeFormat}. */
  timeZone?: string;
}

/** Fallback rendered for non-finite numbers and invalid dates. */
export const FORMAT_VALUE_FALLBACK = '—';

function isDateStyleRequested(options: FormatValueOptions): boolean {
  return (
    options.style === 'date' || options.dateStyle !== undefined || options.timeStyle !== undefined
  );
}

function buildDateFormat(options: FormatValueOptions): Intl.DateTimeFormat {
  const intlOptions: Intl.DateTimeFormatOptions = {};
  if (options.dateStyle !== undefined) intlOptions.dateStyle = options.dateStyle;
  if (options.timeStyle !== undefined) intlOptions.timeStyle = options.timeStyle;
  if (options.timeZone !== undefined) intlOptions.timeZone = options.timeZone;
  // Default to a medium date when nothing specific is asked for.
  if (intlOptions.dateStyle === undefined && intlOptions.timeStyle === undefined) {
    intlOptions.dateStyle = 'medium';
  }
  return new Intl.DateTimeFormat(options.locale, intlOptions);
}

function buildNumberFormat(options: FormatValueOptions): Intl.NumberFormat {
  const style = options.style === 'number' || options.style === undefined ? 'decimal' : options.style;
  const intlOptions: Intl.NumberFormatOptions = {
    // `'date'` never reaches here; treat anything non-numeric as decimal.
    style: style === 'currency' || style === 'percent' ? style : 'decimal',
  };
  if (style === 'currency') {
    intlOptions.currency = options.currency ?? 'USD';
  }
  if (options.notation !== undefined) intlOptions.notation = options.notation;
  if (options.minimumFractionDigits !== undefined) {
    intlOptions.minimumFractionDigits = options.minimumFractionDigits;
  }
  if (options.maximumFractionDigits !== undefined) {
    intlOptions.maximumFractionDigits = options.maximumFractionDigits;
  }
  return new Intl.NumberFormat(options.locale, intlOptions);
}

/**
 * Format a single value to a display string.
 *
 * - `Date` inputs (or numeric inputs with a date-implying style) use
 *   {@link Intl.DateTimeFormat}; all other numbers use
 *   {@link Intl.NumberFormat}.
 * - Non-finite numbers and invalid dates return {@link FORMAT_VALUE_FALLBACK}.
 * - `locale` defaults to the runtime default when omitted.
 */
export function formatValue(value: number | Date, options: FormatValueOptions = {}): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return FORMAT_VALUE_FALLBACK;
    return buildDateFormat(options).format(value);
  }

  if (!Number.isFinite(value)) return FORMAT_VALUE_FALLBACK;

  if (isDateStyleRequested(options)) {
    return buildDateFormat(options).format(new Date(value));
  }

  return buildNumberFormat(options).format(value);
}

/**
 * Build a reusable formatter bound to `options`. This is the shape passed as
 * `dataLabels.format`. The underlying {@link Intl} formatter is created once and
 * reused across calls, so the returned function is stable and cheap to invoke.
 */
export function makeFormatter(
  options: FormatValueOptions = {},
): (value: number | Date) => string {
  const wantsDate = isDateStyleRequested(options);
  const dateFormat = wantsDate || options.style === 'date' ? buildDateFormat(options) : undefined;
  const numberFormat = wantsDate ? undefined : buildNumberFormat(options);

  return (value: number | Date): string => {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return FORMAT_VALUE_FALLBACK;
      return (dateFormat ?? buildDateFormat(options)).format(value);
    }
    if (!Number.isFinite(value)) return FORMAT_VALUE_FALLBACK;
    if (dateFormat) return dateFormat.format(new Date(value));
    return (numberFormat ?? buildNumberFormat(options)).format(value);
  };
}
