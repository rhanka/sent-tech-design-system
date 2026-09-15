import { describe, expect, it } from 'vitest';
import {
  applyCalculatedFields,
  applyCalculationBins,
  applyCalculationGroups,
  applyCalculationSet,
  calculateTableValues,
  evaluateCalculationExpression,
  extendModelWithCalculatedFields,
  findMeasure,
  suggestCalculationTokens,
  type CalculatedFieldConfig,
  type CalculationVariable,
  type DataModel,
  type Row,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'cost', label: 'Cost', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { segment: 'Enterprise', region: 'NA', revenue: 100, cost: 40 },
  { segment: 'SMB', region: 'EU', revenue: 25, cost: 10 },
  { segment: 'Consumer', region: 'NA', revenue: 80, cost: 50 },
];

const variables: CalculationVariable[] = [{ id: 'tax', label: 'Tax', value: 0.1 }];

describe('calculation expressions', () => {
  it('evaluates field references, variables and arithmetic without mutating rows', () => {
    const result = evaluateCalculationExpression('[revenue] - [cost] * (1 + $tax)', rows[0]!, variables);

    expect(result).toBeCloseTo(56);
    expect(rows[0]).not.toHaveProperty('margin');
  });

  it('applies calculated fields and extends the data model', () => {
    const fields: CalculatedFieldConfig[] = [
      { id: 'margin', label: 'Margin', kind: 'measure', expression: '[revenue] - [cost]', aggregation: 'sum' },
    ];

    const nextRows = applyCalculatedFields(rows, fields);
    const nextModel = extendModelWithCalculatedFields(model, fields);

    expect(nextRows.map((row) => row.margin)).toEqual([60, 15, 30]);
    expect(findMeasure(nextModel, 'margin')).toEqual({ id: 'margin', label: 'Margin', aggregation: 'sum' });
    expect(rows[0]).not.toHaveProperty('margin');
  });

  it('suggests fields and variables for formula autocomplete', () => {
    expect(suggestCalculationTokens(model, variables, 'rev')[0]).toEqual({
      kind: 'field',
      value: '[revenue]',
      label: 'Revenue',
      detail: 'measure',
    });
    expect(suggestCalculationTokens(model, variables, '$')).toContainEqual({
      kind: 'variable',
      value: '$tax',
      label: 'Tax',
      detail: '0.1',
    });
  });

  it('builds bins, groups and sets as calculated dimensions', () => {
    expect(applyCalculationBins(rows, { id: 'band', label: 'Revenue band', field: 'revenue', size: 50 }).map((row) => row.band)).toEqual([
      '100-150',
      '0-50',
      '50-100',
    ]);

    expect(
      applyCalculationGroups(rows, {
        id: 'market',
        label: 'Market',
        field: 'segment',
        groups: [{ label: 'Core', values: ['Enterprise', 'SMB'] }],
        fallbackLabel: 'Other',
      }).map((row) => row.market),
    ).toEqual(['Core', 'Core', 'Other']);

    expect(
      applyCalculationSet(rows, {
        id: 'target_region',
        label: 'Target region',
        field: 'region',
        values: ['NA'],
        inLabel: 'Target',
        outLabel: 'Rest',
      }).map((row) => row.target_region),
    ).toEqual(['Target', 'Rest', 'Target']);
  });

  it('calculates table values for running totals, percent-of-total and rank', () => {
    expect(calculateTableValues([10, 30, 20], 'running-total')).toEqual([10, 40, 60]);
    expect(calculateTableValues([10, 30, 20], 'percent-of-total')).toEqual([1 / 6, 0.5, 1 / 3]);
    expect(calculateTableValues([10, 30, 20], 'rank-desc')).toEqual([3, 1, 2]);
  });
});
