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
  type KpiCardConfig,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

export type KpiCardGroupProps = {
  store: DashboardStore;
  viewId?: string;
  configs: KpiCardConfig[];
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  className?: string;
};

function finite(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

export function KpiCardGroup({
  store,
  viewId,
  configs,
  comparisonData,
  format,
  deltaFormat = 'percent',
  size,
  tone,
  className,
}: KpiCardGroupProps) {
  useDashboard(store);
  const cards = buildKpiCards(store.model, store.applyCrossfilter(viewId), configs, {
    comparisonData,
  });

  return (
    <div className={className}>
      {cards.map((card) => (
        <KpiCard
          key={card.id}
          value={card.value}
          label={card.label}
          delta={finite(deltaFormat === 'absolute' ? card.delta : card.deltaPercent)}
          deltaFormat={deltaFormat}
          format={format}
          size={size}
          tone={tone}
          sparkline={card.sparkline?.map((point) => point.value)}
        />
      ))}
    </div>
  );
}
