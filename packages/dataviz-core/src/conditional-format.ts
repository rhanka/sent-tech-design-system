/**
 * Conditional formatting rule engine.
 *
 * A {@link ConditionalFormat} is a serialisable, presentation-free list of
 * rules that maps a numeric value to a semantic {@link ConditionalDecoration}
 * ({@link ConditionalIntent} + optional icon). No colours, no rendering, no
 * framework concerns: the design-system renderer consumes the decoration and
 * resolves intent → design token / icon glyph at display time.
 *
 * Rules are evaluated in order; the first matching rule wins. Two kinds of
 * conditions are supported:
 *
 * - **Comparator conditions** (`gt`, `gte`, `lt`, `lte`, `eq`, `ne`,
 *   `between`) — direct numeric comparison against `value` (and `value2` for
 *   `between`).
 * - **Rank conditions** (`top` / `bottom`) — select the top-N or bottom-N
 *   values in a column; require the full column via `context.values`. If
 *   `context.values` is absent the rule is silently skipped.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Comparator used in a threshold rule. */
export type ConditionalComparator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'between';

/**
 * Semantic intent for a decorated cell.
 *
 * Intentionally has no visual meaning here — the DS renderer resolves
 * `intent` → design token / colour at display time.
 */
export type ConditionalIntent = 'positive' | 'negative' | 'warning' | 'info' | 'neutral';

/** A threshold-based condition comparing a value to one (or two) numbers. */
export interface ComparatorCondition {
  comparator: ConditionalComparator;
  value: number;
  /** Required (and only meaningful) when `comparator === 'between'`. */
  value2?: number;
}

/** A rank-based condition selecting the top-N or bottom-N values in a column. */
export interface RankCondition {
  kind: 'top' | 'bottom';
  n: number;
}

/** A condition in a conditional formatting rule. */
export type ConditionalCondition = ComparatorCondition | RankCondition;

/** A single conditional formatting rule. */
export interface ConditionalRule {
  condition: ConditionalCondition;
  intent: ConditionalIntent;
  /** Optional icon key passed through to the DS renderer verbatim. */
  icon?: string;
}

/**
 * An ordered list of {@link ConditionalRule}s.
 *
 * Rules are evaluated left-to-right; the first match wins.
 */
export type ConditionalFormat = ConditionalRule[];

/**
 * The semantic decoration produced when a rule matches.
 *
 * Contains no colours — the DS renderer resolves `intent` → design token.
 */
export interface ConditionalDecoration {
  intent: ConditionalIntent;
  icon?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

const COMPARATORS: readonly ConditionalComparator[] = [
  'gt',
  'gte',
  'lt',
  'lte',
  'eq',
  'ne',
  'between',
];

const INTENTS: readonly ConditionalIntent[] = [
  'positive',
  'negative',
  'warning',
  'info',
  'neutral',
];

const RANK_KINDS = ['top', 'bottom'] as const;

function isComparatorCondition(v: unknown): v is ComparatorCondition {
  if (!isRecord(v)) return false;
  if (!COMPARATORS.includes(v.comparator as ConditionalComparator)) return false;
  if (!isFiniteNumber(v.value)) return false;
  if (v.comparator === 'between') {
    if (!isFiniteNumber(v.value2)) return false;
  }
  return true;
}

function isRankCondition(v: unknown): v is RankCondition {
  if (!isRecord(v)) return false;
  if (!RANK_KINDS.includes(v.kind as 'top' | 'bottom')) return false;
  if (typeof v.n !== 'number' || !Number.isInteger(v.n) || v.n < 1) return false;
  return true;
}

function isConditionalCondition(v: unknown): v is ConditionalCondition {
  return isComparatorCondition(v) || isRankCondition(v);
}

// ---------------------------------------------------------------------------
// Runtime validation
// ---------------------------------------------------------------------------

/** Runtime type guard for {@link ConditionalRule}. */
export function isConditionalRule(v: unknown): v is ConditionalRule {
  if (!isRecord(v)) return false;
  if (!isConditionalCondition(v.condition)) return false;
  if (!INTENTS.includes(v.intent as ConditionalIntent)) return false;
  if (v.icon !== undefined && typeof v.icon !== 'string') return false;
  return true;
}

/** Runtime type guard for {@link ConditionalFormat} (an array of valid rules). */
export function isConditionalFormat(v: unknown): v is ConditionalFormat {
  return Array.isArray(v) && v.every(isConditionalRule);
}

// ---------------------------------------------------------------------------
// Condition evaluation
// ---------------------------------------------------------------------------

function evaluateComparator(
  value: number,
  condition: ComparatorCondition,
): boolean {
  const { comparator, value: threshold, value2 } = condition;
  switch (comparator) {
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'eq':
      return value === threshold;
    case 'ne':
      return value !== threshold;
    case 'between':
      if (value2 === undefined) return false;
      return value >= threshold && value <= value2;
    default:
      return false;
  }
}

function evaluateRank(
  value: number,
  condition: RankCondition,
  contextValues: number[],
): boolean {
  // Only finite values participate in ranking.
  const finite = contextValues.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return false;

  const n = Math.min(condition.n, finite.length);

  if (condition.kind === 'top') {
    // Sort descending; the top-n threshold is the n-th largest value.
    const sorted = [...finite].sort((a, b) => b - a);
    return value >= sorted[n - 1];
  } else {
    // Sort ascending; the bottom-n threshold is the n-th smallest value.
    const sorted = [...finite].sort((a, b) => a - b);
    return value <= sorted[n - 1];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate a list of conditional formatting rules against a single `value`.
 *
 * Returns the {@link ConditionalDecoration} of the **first** matching rule, or
 * `null` if no rule matches.
 *
 * - Comparator rules are evaluated directly against `value`.
 * - `top`/`bottom` rules require `context.values` (the full column); if
 *   absent those rules are silently skipped — no error is thrown.
 * - `NaN` or non-finite `value` → always returns `null`.
 */
export function evaluateConditionalFormat(
  value: number,
  rules: ConditionalFormat,
  context?: { values?: number[] },
): ConditionalDecoration | null {
  if (!Number.isFinite(value)) return null;

  for (const rule of rules) {
    const { condition, intent, icon } = rule;
    let matched = false;

    if (isRankCondition(condition)) {
      if (!context?.values) continue; // skip — no context
      matched = evaluateRank(value, condition, context.values);
    } else {
      matched = evaluateComparator(value, condition as ComparatorCondition);
    }

    if (matched) {
      const decoration: ConditionalDecoration = { intent };
      if (icon !== undefined) decoration.icon = icon;
      return decoration;
    }
  }

  return null;
}

/**
 * Apply a list of conditional formatting rules to every value in an array.
 *
 * The full array is automatically passed as context so `top`/`bottom` rules
 * resolve correctly. Returns a parallel array of {@link ConditionalDecoration}
 * (or `null` for unmatched / non-finite values).
 */
export function applyConditionalFormat(
  values: number[],
  rules: ConditionalFormat,
): (ConditionalDecoration | null)[] {
  const ctx = { values };
  return values.map((v) => evaluateConditionalFormat(v, rules, ctx));
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Ergonomic builder for a single {@link ConditionalRule}.
 *
 * ```ts
 * rule('gt', 100, 'positive', { icon: 'arrow-up' })
 * rule('between', 50, 'warning', { value2: 80 })
 * ```
 */
export function rule(
  comparator: ConditionalComparator,
  value: number,
  intent: ConditionalIntent,
  opts?: { icon?: string; value2?: number },
): ConditionalRule {
  const condition: ComparatorCondition = { comparator, value };
  if (comparator === 'between' && opts?.value2 !== undefined) {
    condition.value2 = opts.value2;
  }
  const r: ConditionalRule = { condition, intent };
  if (opts?.icon !== undefined) r.icon = opts.icon;
  return r;
}

/**
 * Ergonomic builder for a rank-based {@link ConditionalRule}.
 *
 * ```ts
 * rankRule('top', 3, 'positive', { icon: 'star' })
 * rankRule('bottom', 2, 'negative')
 * ```
 */
export function rankRule(
  kind: 'top' | 'bottom',
  n: number,
  intent: ConditionalIntent,
  opts?: { icon?: string },
): ConditionalRule {
  const condition: RankCondition = { kind, n };
  const r: ConditionalRule = { condition, intent };
  if (opts?.icon !== undefined) r.icon = opts.icon;
  return r;
}
