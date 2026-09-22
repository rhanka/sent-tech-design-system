import {
  VennChart as DsVennChart,
  type VennChartArea,
} from '@sentropic/design-system-react';

export type VennChartProps = {
  areas: VennChartArea[];
  width?: number;
  height?: number;
  /** Accessible label for the chart (aria-label). */
  label: string;
  className?: string;
};

export function VennChart({
  areas,
  width,
  height,
  label,
  className,
}: VennChartProps) {
  return (
    <DsVennChart
      data={areas}
      label={label}
      width={width}
      height={height}
      className={className}
    />
  );
}
