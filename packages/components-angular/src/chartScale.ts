export const CHART_MARGIN = { top: 12, right: 16, bottom: 32, left: 44 } as const;

export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) ? max : 0;
    return [base];
  }
  const range = max - min;
  const rough = range / Math.max(target - 1, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
  const ticks: number[] = [];
  for (let value = Math.floor(min / step) * step; value <= Math.ceil(max / step) * step + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

const uniqueSortedTicks = (values: number[]) =>
  Array.from(new Set(values.filter(Number.isFinite).map((value) => Number(value.toFixed(10))))).sort((a, b) => a - b);

export function fixedTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return niceTicks(min, max, target);
  return uniqueSortedTicks([min, ...niceTicks(min, max, target).filter((tick) => tick > min && tick < max), max]);
}

export function scaleLinear(value: number, d0: number, d1: number, r0: number, r1: number): number {
  if (d1 === d0) return r0;
  return r0 + ((value - d0) * (r1 - r0)) / (d1 - d0);
}

export type ChartScale = "linear" | "log";

export function smallestPositive(...values: number[]): number {
  let lowest = Infinity;
  for (const value of values) if (Number.isFinite(value) && value > 0 && value < lowest) lowest = value;
  return Number.isFinite(lowest) ? lowest : 1;
}

export function logTicks(min: number, max: number): number[] {
  const lo = min > 0 ? min : 1;
  const hi = max > lo ? max : lo * 10;
  const ticks: number[] = [];
  for (let exp = Math.floor(Math.log10(lo)); exp <= Math.ceil(Math.log10(hi)); exp += 1) {
    ticks.push(Number(Math.pow(10, exp).toFixed(10)));
  }
  return ticks.length ? ticks : [lo];
}

export function fixedLogTicks(min: number, max: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max) return logTicks(min, max);
  return uniqueSortedTicks([min, ...logTicks(min, max).filter((tick) => tick > min && tick < max), max]);
}

export function validLinearDomain(domain: [number, number] | undefined): [number, number] | null {
  return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] ? domain : null;
}

export function validLogDomain(domain: [number, number] | undefined): [number, number] | null {
  return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] > 0 && domain[0] < domain[1] ? domain : null;
}

export function clampFraction(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export function isNumeric(value: number | string): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function buildLinearPath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

export function buildSmoothPath(points: { x: number; y: number }[]): string {
  return buildLinearPath(points);
}

export type ForecastRun = { start: number; end: number; forecast: boolean };

export function forecastRuns(flags: boolean[]): ForecastRun[] {
  const runs: ForecastRun[] = [];
  for (let index = 0; index < flags.length - 1; index += 1) {
    const forecast = Boolean(flags[index] || flags[index + 1]);
    const last = runs[runs.length - 1];
    if (last && last.forecast === forecast) last.end = index + 1;
    else runs.push({ start: index, end: index + 1, forecast });
  }
  return runs;
}

export type ChartOverlayTone = "neutral" | "success" | "warning" | "error" | "info";
export type ChartReferenceLine = { value: number; label?: string; tone?: ChartOverlayTone; axis?: "x" | "y" };
export type ChartBand = { from: number; to: number; label?: string; tone?: ChartOverlayTone };
export type ChartGoalLine = { value: number; label?: string };

export function overlayToneClass(prefix: string, tone: ChartOverlayTone | undefined): string {
  return `${prefix}--${tone ?? "neutral"}`;
}

export function linearRegression(points: ReadonlyArray<{ x: number; y: number }>): { slope: number; intercept: number; minX: number; maxX: number } | null {
  const finite = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (finite.length < 2) return null;
  const minX = Math.min(...finite.map((point) => point.x));
  const maxX = Math.max(...finite.map((point) => point.x));
  if (minX === maxX) return null;
  return { slope: 0, intercept: finite[0]?.y ?? 0, minX, maxX };
}

export function extendValueDomain(
  min: number,
  max: number,
  options: {
    referenceLines?: ReadonlyArray<ChartReferenceLine>;
    referenceAxis?: "x" | "y";
    bands?: ReadonlyArray<ChartBand>;
    goalLine?: ChartGoalLine | null;
    extraValues?: ReadonlyArray<number>;
  },
): [number, number] {
  let lo = min;
  let hi = max;
  const referenceAxis = options.referenceAxis ?? "y";
  const fold = (value: number | undefined) => {
    if (value === undefined || !Number.isFinite(value)) return;
    if (value < lo) lo = value;
    if (value > hi) hi = value;
  };
  for (const line of options.referenceLines ?? []) {
    if ((line.axis ?? "y") === referenceAxis) fold(line.value);
  }
  for (const band of options.bands ?? []) {
    fold(band.from);
    fold(band.to);
  }
  if (options.goalLine) fold(options.goalLine.value);
  for (const value of options.extraValues ?? []) fold(value);
  return [lo, hi];
}

export function chartDataList(label: string, items: string[]): string {
  return [label, ...items].filter(Boolean).join("\n");
}

export function overlayDataListItems(overlays: {
  referenceLines?: ReadonlyArray<ChartReferenceLine>;
  bands?: ReadonlyArray<ChartBand>;
  goalLine?: ChartGoalLine | null;
  trend?: { slope: number; intercept: number } | null;
}): string[] {
  const items: string[] = [];
  for (const line of overlays.referenceLines ?? []) {
    if (!Number.isFinite(line.value)) continue;
    items.push(line.label ? `Référence: ${line.label} = ${line.value}` : `Référence: ${line.value}`);
  }
  for (const band of overlays.bands ?? []) {
    if (!Number.isFinite(band.from) || !Number.isFinite(band.to)) continue;
    const lo = Math.min(band.from, band.to);
    const hi = Math.max(band.from, band.to);
    items.push(band.label ? `Bande: ${band.label} (${lo}–${hi})` : `Bande: ${lo}–${hi}`);
  }
  if (overlays.goalLine && Number.isFinite(overlays.goalLine.value)) {
    const goal = overlays.goalLine;
    items.push(goal.label ? `Objectif: ${goal.label} = ${goal.value}` : `Objectif: ${goal.value}`);
  }
  if (overlays.trend) {
    items.push(`Tendance: pente ${overlays.trend.slope.toFixed(2)}`);
  }
  return items;
}

export function isLightTone(): boolean {
  return false;
}

export function labelColorForTone(): string {
  return "var(--st-semantic-text-primary)";
}
