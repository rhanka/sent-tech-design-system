// Statistiques descriptives : quantiles par interpolation linéaire (type 7).
export function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
export function describe(values) {
  const v = values.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const r = (x) => Math.round(x * 100) / 100;
  return { n: v.length, median: r(quantile(v, 0.5)), p25: r(quantile(v, 0.25)), p75: r(quantile(v, 0.75)),
    min: r(v[0]), max: r(v[v.length - 1]) };
}
