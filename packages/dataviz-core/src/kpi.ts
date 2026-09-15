/**
 * KPI card data contracts.
 *
 * The core computes the BI values; framework adapters render these with DS
 * primitives such as Card, Badge, ProgressBar and Sparkline.
 */

import { aggregate, groupAggregate } from './aggregate.js';
import { findDimension, findMeasure } from './model.js';
import type { DataModel, Row } from './model.js';

export interface KpiCardConfig {
  id: string;
  label?: string;
  measure: string;
  goal?: number;
  sparklineDimension?: string;
}

export interface KpiBuildOptions {
  comparisonData?: readonly Row[];
}

export interface KpiSparklinePoint {
  key: string;
  value: number;
}

export interface KpiCard {
  id: string;
  label: string;
  measureId: string;
  value: number;
  comparisonValue?: number;
  delta?: number;
  deltaPercent?: number;
  goal?: number;
  progress?: number;
  sparkline?: KpiSparklinePoint[];
}

export function buildKpiCards(
  model: DataModel,
  data: readonly Row[],
  configs: readonly KpiCardConfig[],
  options: KpiBuildOptions = {},
): KpiCard[] {
  return configs.map((config) => {
    const measure = findMeasure(model, config.measure);
    if (!measure) {
      throw new Error(`Unknown KPI measure: ${config.measure}`);
    }

    const card: KpiCard = {
      id: config.id,
      label: config.label ?? measure.label,
      measureId: measure.id,
      value: aggregate([...data], measure),
    };

    if (options.comparisonData !== undefined) {
      const comparisonValue = aggregate([...options.comparisonData], measure);
      card.comparisonValue = comparisonValue;
      card.delta = card.value - comparisonValue;
      card.deltaPercent = comparisonValue === 0 ? Number.NaN : card.delta / comparisonValue;
    }

    if (config.goal !== undefined) {
      card.goal = config.goal;
      card.progress = config.goal === 0 ? Number.NaN : card.value / config.goal;
    }

    if (config.sparklineDimension !== undefined) {
      if (!findDimension(model, config.sparklineDimension)) {
        throw new Error(`Unknown KPI sparkline dimension: ${config.sparklineDimension}`);
      }
      card.sparkline = groupAggregate([...data], config.sparklineDimension, measure);
    }

    return card;
  });
}
