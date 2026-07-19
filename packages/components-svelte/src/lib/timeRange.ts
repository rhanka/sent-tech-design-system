// TimeRangePicker — pure, framework-free helpers. Kept separate from the
// component so the value contract (token grammar, resolution, formatting) is
// unit-testable without mounting Svelte at all.

export type TimeRangeMode = "relative" | "absolute";

export type TimeRange = {
  mode: TimeRangeMode;
  /** Present ONLY for relative ranges — the resolved preset token (e.g. "30m"). */
  relative?: string;
  /** Epoch ms, inclusive lower bound. Always <= `to`. */
  from: number;
  /** Epoch ms, inclusive upper bound. */
  to: number;
};

export type TimeRangePreset =
  | string
  | { token: string; label?: string; durationMs?: number };

export const DEFAULT_TIME_RANGE_PRESETS: string[] = [
  "30m",
  "1h",
  "3h",
  "6h",
  "12h",
  "24h",
  "3d",
  "7d",
  "30d"
];

/** token grammar: <digits><unit>, unit in m|h|d|w. */
const TOKEN_RE = /^(\d+)(m|h|d|w)$/;

const UNIT_MS: Record<string, number> = {
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000
};

/**
 * Parses a preset token ("30m", "1h", "7d", "2w", ...) into a duration in ms.
 * Returns null when the token doesn't match the locked grammar
 * `^(\d+)(m|h|d|w)$`.
 */
export function parsePresetMs(token: string): number | null {
  const match = TOKEN_RE.exec(token);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2];
  const unitMs = UNIT_MS[unit];
  if (!unitMs) return null;
  return amount * unitMs;
}

/**
 * Resolves a relative preset token to a concrete {@link TimeRange} anchored at
 * `now`. `to` is clamped to `max` (if given) and `from` is clamped to `min`
 * (if given). Returns null when the token doesn't parse OR when, after
 * clamping, the window collapses (`from > to`) — the caller (the component)
 * treats a null resolution as "disable this preset".
 */
export function resolveRelative(
  token: string,
  now: number,
  opts?: { min?: number; max?: number }
): TimeRange | null {
  const durationMs = parsePresetMs(token);
  if (durationMs == null) return null;

  let to = now;
  let from = now - durationMs;

  if (opts?.max != null) to = Math.min(to, opts.max);
  if (opts?.min != null) from = Math.max(from, opts.min);

  if (from > to) return null;

  return { mode: "relative", relative: token, from, to };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local-tz "YYYY-MM-DD" for a Date. */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Local-tz "HH:mm" for a Date. */
function toHHMM(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export type AbsoluteSplit = {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
};

/**
 * Splits an epoch-ms `from`/`to` pair into local-timezone date/time parts, one
 * pair per bound. Used to seed the Custom tab's calendar + time pickers +
 * typed inputs from a concrete range (relative or absolute).
 */
export function splitAbsolute(from: number, to: number): AbsoluteSplit {
  const f = new Date(from);
  const t = new Date(to);
  return {
    fromDate: toISODate(f),
    fromTime: toHHMM(f),
    toDate: toISODate(t),
    toTime: toHHMM(t)
  };
}

export type AbsoluteDraft = {
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
};

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

function parseLocalDateTime(dateStr: string, timeStr: string): number | null {
  const dm = DATE_RE.exec(dateStr);
  const tm = TIME_RE.exec(timeStr);
  if (!dm || !tm) return null;
  const year = Number(dm[1]);
  const month = Number(dm[2]);
  const day = Number(dm[3]);
  const hour = Number(tm[1]);
  const minute = Number(tm[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Composes a staged Custom-tab draft into a concrete {from,to} epoch-ms pair.
 * Returns null when the draft is incomplete, any part fails to parse, or the
 * composed `from` is after `to` — the caller uses null to disable Apply and
 * show an inline error.
 */
export function composeAbsolute(draft: AbsoluteDraft): { from: number; to: number } | null {
  if (!draft.fromDate || !draft.fromTime || !draft.toDate || !draft.toTime) return null;
  const from = parseLocalDateTime(draft.fromDate, draft.fromTime);
  const to = parseLocalDateTime(draft.toDate, draft.toTime);
  if (from == null || to == null) return null;
  if (from > to) return null;
  return { from, to };
}

function isFrLocale(locale: string | undefined): boolean {
  return (locale ?? "fr-FR").toLowerCase().startsWith("fr");
}

type UnitMeta = { singular: string; plural: string; masculine: boolean };

const UNIT_META_FR: Record<string, UnitMeta> = {
  m: { singular: "minute", plural: "minutes", masculine: false },
  h: { singular: "heure", plural: "heures", masculine: false },
  d: { singular: "jour", plural: "jours", masculine: true },
  w: { singular: "semaine", plural: "semaines", masculine: false }
};

const UNIT_META_EN: Record<string, UnitMeta> = {
  m: { singular: "minute", plural: "minutes", masculine: false },
  h: { singular: "hour", plural: "hours", masculine: false },
  d: { singular: "day", plural: "days", masculine: false },
  w: { singular: "week", plural: "weeks", masculine: false }
};

function frPresetLabel(amount: number, unit: string): string {
  const meta = UNIT_META_FR[unit];
  if (!meta) return `${amount}${unit}`;
  const unitLabel = amount === 1 ? meta.singular : meta.plural;
  if (amount === 1) {
    return `${meta.masculine ? "Dernier" : "Dernière"} ${unitLabel}`;
  }
  return `${amount} ${meta.masculine ? "derniers" : "dernières"} ${unitLabel}`;
}

function enPresetLabel(amount: number, unit: string): string {
  const meta = UNIT_META_EN[unit];
  if (!meta) return `Last ${amount}${unit}`;
  if (amount === 1) return `Last ${meta.singular}`;
  return `Last ${amount} ${meta.plural}`;
}

/**
 * Human label for a preset token ("30m" -> "30 dernières minutes" / "Last 30
 * minutes"). Falls back to the raw token when it doesn't match the grammar
 * (e.g. a caller-provided custom token) so the UI never renders empty text.
 */
export function formatPresetLabel(token: string, locale = "fr-FR"): string {
  const match = TOKEN_RE.exec(token);
  if (!match) return token;
  const amount = Number(match[1]);
  const unit = match[2];
  return isFrLocale(locale) ? frPresetLabel(amount, unit) : enPresetLabel(amount, unit);
}

/**
 * Human label for the picker's trigger button: the preset label for a
 * relative value, or a formatted date range for an absolute one — collapsing
 * to a single date + "HH:mm–HH:mm" when both bounds fall on the same local
 * calendar day.
 */
export function formatTriggerLabel(value: TimeRange, locale = "fr-FR"): string {
  if (value.mode === "relative" && value.relative) {
    return formatPresetLabel(value.relative, locale);
  }

  const from = new Date(value.from);
  const to = new Date(value.to);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const sameDay =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate();

  if (sameDay) {
    return `${dateFormatter.format(from)} ${timeFormatter.format(from)}–${timeFormatter.format(to)}`;
  }

  return `${dateFormatter.format(from)} ${timeFormatter.format(from)} – ${dateFormatter.format(to)} ${timeFormatter.format(to)}`;
}
