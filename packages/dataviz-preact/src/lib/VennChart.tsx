import {
  VennChart as DsVennChart,
  type VennChartArea,
} from '@sentropic/design-system-preact';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type VennChartProps = {
  areas: VennChartArea[];
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: MaybeSignal<string>;
};

export function VennChart({
  areas,
  width,
  height,
  label,
  className,
}: VennChartProps) {
  const resolvedClassName = useValue(className);
  return (
    <DsVennChart
      data={areas}
      label={label}
      width={width}
      height={height}
      className={resolvedClassName}
    />
  );
}
