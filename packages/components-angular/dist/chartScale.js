export const CHART_MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };
export function niceTicks(min, max, target = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        const base = Number.isFinite(max) ? max : 0;
        return [base];
    }
    const range = max - min;
    const rough = range / Math.max(target - 1, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / pow;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * pow;
    const ticks = [];
    for (let value = Math.floor(min / step) * step; value <= Math.ceil(max / step) * step + step / 2; value += step) {
        ticks.push(Number(value.toFixed(10)));
    }
    return ticks;
}
const uniqueSortedTicks = (values) => Array.from(new Set(values.filter(Number.isFinite).map((value) => Number(value.toFixed(10))))).sort((a, b) => a - b);
export function fixedTicks(min, max, target = 5) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max)
        return niceTicks(min, max, target);
    return uniqueSortedTicks([min, ...niceTicks(min, max, target).filter((tick) => tick > min && tick < max), max]);
}
export function scaleLinear(value, d0, d1, r0, r1) {
    if (d1 === d0)
        return r0;
    return r0 + ((value - d0) * (r1 - r0)) / (d1 - d0);
}
export function smallestPositive(...values) {
    let lowest = Infinity;
    for (const value of values)
        if (Number.isFinite(value) && value > 0 && value < lowest)
            lowest = value;
    return Number.isFinite(lowest) ? lowest : 1;
}
export function logTicks(min, max) {
    const lo = min > 0 ? min : 1;
    const hi = max > lo ? max : lo * 10;
    const ticks = [];
    for (let exp = Math.floor(Math.log10(lo)); exp <= Math.ceil(Math.log10(hi)); exp += 1) {
        ticks.push(Number(Math.pow(10, exp).toFixed(10)));
    }
    return ticks.length ? ticks : [lo];
}
export function fixedLogTicks(min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min >= max)
        return logTicks(min, max);
    return uniqueSortedTicks([min, ...logTicks(min, max).filter((tick) => tick > min && tick < max), max]);
}
export function validLinearDomain(domain) {
    return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1] ? domain : null;
}
export function validLogDomain(domain) {
    return domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] > 0 && domain[0] < domain[1] ? domain : null;
}
export function clampFraction(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.min(1, Math.max(0, value));
}
export function formatTick(value) {
    if (Math.abs(value) >= 1000)
        return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(value))
        return String(value);
    return value.toFixed(1);
}
export function isNumeric(value) {
    return typeof value === "number" && Number.isFinite(value);
}
export function buildLinearPath(points) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}
export function buildSmoothPath(points) {
    return buildLinearPath(points);
}
export function forecastRuns(flags) {
    const runs = [];
    for (let index = 0; index < flags.length - 1; index += 1) {
        const forecast = Boolean(flags[index] || flags[index + 1]);
        const last = runs[runs.length - 1];
        if (last && last.forecast === forecast)
            last.end = index + 1;
        else
            runs.push({ start: index, end: index + 1, forecast });
    }
    return runs;
}
export function overlayToneClass(prefix, tone) {
    return `${prefix}--${tone ?? "neutral"}`;
}
export function linearRegression(points) {
    const finite = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (finite.length < 2)
        return null;
    const minX = Math.min(...finite.map((point) => point.x));
    const maxX = Math.max(...finite.map((point) => point.x));
    if (minX === maxX)
        return null;
    return { slope: 0, intercept: finite[0]?.y ?? 0, minX, maxX };
}
export function extendValueDomain(min, max, options) {
    const values = [
        min,
        max,
        ...(options.referenceLines ?? []).filter((line) => (line.axis ?? "y") === "y").map((line) => line.value),
        ...(options.bands ?? []).flatMap((band) => [band.from, band.to]),
        ...(options.goalLine ? [options.goalLine.value] : []),
    ].filter(Number.isFinite);
    return [Math.min(...values), Math.max(...values)];
}
export function chartDataList(label, items) {
    return [label, ...items].filter(Boolean).join("\n");
}
export function overlayDataListItems() {
    return [];
}
export function isLightTone() {
    return false;
}
export function labelColorForTone() {
    return "var(--st-semantic-text-primary)";
}
//# sourceMappingURL=chartScale.js.map