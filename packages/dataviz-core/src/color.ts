/**
 * Color-scale builders — framework-agnostic, presentation-free, and free of any
 * hardcoded colors: every builder operates on color *strings supplied by the
 * caller* (typically resolved from `@sentropic/design-system-*` tone tokens at
 * the call site), so the design system stays the single source of color truth.
 *
 * Interpolation runs in **OKLab**, a perceptually-uniform space, so sequential
 * and diverging ramps stay even in lightness and never go muddy or dark through
 * the midpoint the way a naive sRGB lerp does. Inputs are sRGB hex strings
 * (`#rgb` / `#rrggbb`); outputs are `#rrggbb`. Invalid inputs degrade
 * gracefully rather than throwing, mirroring the rest of dataviz-core.
 */

/** An sRGB color, channels in `0..255`. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Parse a `#rgb` or `#rrggbb` hex string to {@link RGB}; `null` when invalid. */
export function parseHex(input: string): RGB | null {
  const hex = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return {
      r: parseInt(hex[0]! + hex[0]!, 16),
      g: parseInt(hex[1]! + hex[1]!, 16),
      b: parseInt(hex[2]! + hex[2]!, 16),
    };
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  return null;
}

function clamp255(v: number): number {
  if (v <= 0) return 0;
  if (v >= 255) return 255;
  return Math.round(v);
}

/** Format an {@link RGB} as a lowercase `#rrggbb` string. */
export function toHex(c: RGB): string {
  const h = (v: number) => clamp255(v).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

// ── OKLab conversion (Björn Ottosson). sRGB 0..255 ⇄ OKLab. ──────────────────

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(x: number): number {
  const c = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return c * 255;
}

interface OKLab {
  L: number;
  a: number;
  b: number;
}

function rgbToOklab(rgb: RGB): OKLab {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabToRgb(lab: OKLab): RGB {
  const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) };
}

function clampFraction(t: number): number {
  if (!Number.isFinite(t) || t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

/**
 * Mix two colors in OKLab. `t` is clamped to `[0, 1]` (`0` ⇒ `a`, `1` ⇒ `b`).
 * If either input is an invalid color, the other valid one is returned (or
 * `'#000000'` when both are invalid) — never throws.
 */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca && !cb) return '#000000';
  if (!ca) return toHex(cb!);
  if (!cb) return toHex(ca);

  const f = clampFraction(t);
  if (f === 0) return toHex(ca);
  if (f === 1) return toHex(cb);

  const la = rgbToOklab(ca);
  const lb = rgbToOklab(cb);
  return toHex(
    oklabToRgb({
      L: la.L + (lb.L - la.L) * f,
      a: la.a + (lb.a - la.a) * f,
      b: la.b + (lb.b - la.b) * f,
    }),
  );
}

/**
 * Sample a multi-stop gradient at `t` (clamped to `[0, 1]`). `0` returns the
 * first stop, `1` the last; intermediate `t` interpolates (OKLab) between the
 * two bracketing stops. An empty list returns `'#000000'`; a single stop is
 * returned as-is.
 */
export function sampleScale(stops: readonly string[], t: number): string {
  if (stops.length === 0) return '#000000';
  if (stops.length === 1) return mix(stops[0]!, stops[0]!, 0);
  const f = clampFraction(t);
  const span = stops.length - 1;
  const pos = f * span;
  const i = Math.min(Math.floor(pos), span - 1);
  return mix(stops[i]!, stops[i + 1]!, pos - i);
}

/**
 * Build a sequential color ramp of `count` evenly-spaced samples across the
 * `stops` (e.g. light→dark for a single hue). `count <= 0` ⇒ `[]`; `count === 1`
 * ⇒ the first stop.
 */
export function buildSequentialScale(stops: readonly string[], count: number): string[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return [];
  if (n === 1) return [sampleScale(stops, 0)];
  return Array.from({ length: n }, (_, i) => sampleScale(stops, i / (n - 1)));
}

/**
 * Build a diverging color ramp of `count` samples through a neutral midpoint
 * (e.g. negative→neutral→positive). Equivalent to a 3-stop sequential scale.
 */
export function buildDivergingScale(
  low: string,
  mid: string,
  high: string,
  count: number,
): string[] {
  return buildSequentialScale([low, mid, high], count);
}

/**
 * Build a categorical palette of `count` colors by cycling `palette` in order
 * (so series 9 reuses color 1, etc.). `count <= 0` or an empty palette ⇒ `[]`.
 */
export function buildCategoricalScale(palette: readonly string[], count: number): string[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0 || palette.length === 0) return [];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]!);
}

/**
 * Map a continuous `value` in the domain `[min, max]` to a color along `stops`
 * (OKLab gradient). This is the data-driven companion to the ramp builders:
 * use it to colour a heatmap cell, a severity indicator, a choropleth region…
 *
 * Out-of-domain values clamp to the nearest endpoint (via {@link sampleScale}).
 * A degenerate domain (`min === max`) or a non-finite value/bound returns the
 * first stop, so callers never get `NaN`-driven colors.
 */
export function colorAt(
  value: number,
  min: number,
  max: number,
  stops: readonly string[],
): string {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return sampleScale(stops, 0);
  }
  const t = max === min ? 0 : (value - min) / (max - min);
  return sampleScale(stops, t);
}

/**
 * Build a reusable value→color mapper bound to a domain and `stops` (the
 * gradient is interpolated per call but the inputs are captured once). Mirrors
 * the `makeFormatter` shape so it can be passed straight to a chart's color
 * accessor.
 */
export function makeColorScale(
  min: number,
  max: number,
  stops: readonly string[],
): (value: number) => string {
  return (value: number): string => colorAt(value, min, max, stops);
}
