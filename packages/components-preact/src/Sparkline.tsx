import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
// Side-effect: installs the options.vnode SVG presentation-attribute
// normalisation in runtime.ts. This module renders intrinsic camelCase SVG
// attributes but otherwise references runtime only via `import type`, which
// TypeScript erases — without this import a bundler applying `sideEffects`
// barrel optimisation (or a direct deep import) would never evaluate
// runtime.js and attributes such as strokeWidth would revert to broken
// camelCase attributes.
import "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type SparklineTone = "neutral" | "success" | "warning" | "error";

export type SparklineProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  data: number[];
  width?: number;
  height?: number;
  tone?: SparklineTone;
  strokeWidth?: number;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  area?: MaybeSignal<boolean>;
  label?: string;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

const PADDING = 2;

export function Sparkline({
  data,
  width = 120,
  height = 28,
  tone = "neutral",
  strokeWidth = 1.5,
  area: areaInput = false,
  label,
  className,
  ...rest
}: SparklineProps) {
  const area = useValue(areaInput);
  const geometry = (() => {
    if (!data || data.length === 0) {
      return { line: "", area: "" };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const innerWidth = Math.max(width - PADDING * 2, 1);
    const innerHeight = Math.max(height - PADDING * 2, 1);
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;
    const points = data.map((value, index) => {
      const x = PADDING + step * index;
      const normalised = (value - min) / span;
      const y = PADDING + (1 - normalised) * innerHeight;
      return { x, y };
    });
    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");
    const baseline = height - PADDING;
    const first = points[0];
    const last = points[points.length - 1];
    const areaPath = `${line} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
    return { line, area: areaPath };
  })();

  return (
    <span {...rest} className={classNames("st-sparkline", `st-sparkline--${tone}`, className)} role="img" aria-label={label}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden={label ? "true" : undefined}
        focusable="false"
      >
        {area && geometry.area ? <path d={geometry.area} className="st-sparkline__area" /> : null}
        {geometry.line ? (
          <path
            d={geometry.line}
            className="st-sparkline__line"
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
    </span>
  );
}
