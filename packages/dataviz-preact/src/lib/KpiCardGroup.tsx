import {
  KpiCard,
  type KpiCardDeltaFormat,
  type KpiCardFormat,
  type KpiCardSize,
  type KpiCardTone,
} from '@sentropic/design-system-preact';
import {
  buildKpiCards,
  type DashboardStore,
  type KpiCardConfig,
  type Row,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core for embedded sparklines.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type KpiCardGroupProps = {
  store: DashboardStore;
  viewId?: string;
  configs: KpiCardConfig[];
  comparisonData?: readonly Row[];
  format?: KpiCardFormat;
  deltaFormat?: KpiCardDeltaFormat;
  size?: KpiCardSize;
  tone?: KpiCardTone;
  className?: MaybeSignal<string>;
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
  const resolvedClassName = useValue(className);
  const cards = buildKpiCards(store.model, store.applyCrossfilter(viewId), configs, {
    comparisonData,
  });

  return (
    <div className={resolvedClassName}>
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
