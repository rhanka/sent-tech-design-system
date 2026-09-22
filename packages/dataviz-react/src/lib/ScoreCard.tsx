import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-react';
import {
  buildKpiCards,
  type DashboardStore,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type ScoreCardProps = {
  store: DashboardStore;
  viewId?: string;
  measure: string;
  label?: string;
  goal?: number;
  sparklineDimension?: string;
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  unit?: string;
  currency?: string;
  locale?: string;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  className?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export function ScoreCard({
  store,
  viewId,
  measure,
  label,
  goal,
  sparklineDimension,
  comparisonData,
  format,
  deltaFormat = 'percent',
  unit,
  currency,
  locale,
  size,
  tone,
  className,
}: ScoreCardProps) {
  useDashboard(store);

  const [card] = buildKpiCards(
    store.model,
    store.applyCrossfilter(viewId),
    [{ id: 'card', label, measure, goal, sparklineDimension }],
    { comparisonData },
  );

  return (
    <KpiCard
      value={card!.value}
      label={card!.label}
      delta={finite(deltaFormat === 'absolute' ? card!.delta : card!.deltaPercent)}
      deltaFormat={deltaFormat}
      unit={unit}
      currency={currency}
      locale={locale}
      format={format}
      size={size}
      tone={tone}
      sparkline={card!.sparkline?.map((point) => point.value)}
      className={className}
    />
  );
}
