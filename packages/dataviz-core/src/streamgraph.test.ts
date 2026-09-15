import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildStreamgraphData } from './streamgraph.js';

const model: DataModel = {
  dimensions: [
    { id: 'month', label: 'Mois', type: 'discrete' },
    { id: 'series', label: 'Série', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenu', aggregation: 'sum' },
  ],
};

// category=month (x-axis), label=series (legend series), value=revenue
const rows: Row[] = [
  { month: 'Jan', series: 'A', revenue: 100 },
  { month: 'Jan', series: 'B', revenue: 200 },
  { month: 'Feb', series: 'A', revenue: 150 },
  { month: 'Feb', series: 'B', revenue: 250 },
];

const config = { category: 'month', label: 'series', value: 'revenue' };

describe('buildStreamgraphData', () => {
  it('pivots rows into one datum per category with values array', () => {
    const result = buildStreamgraphData(model, rows, config);
    expect(result).toHaveLength(2);
    const jan = result.find((d) => d.category === 'Jan');
    expect(jan).toBeDefined();
    expect(jan!.values).toHaveLength(2);
    expect(jan!.values[0]).toEqual({ label: 'A', value: 100 });
    expect(jan!.values[1]).toEqual({ label: 'B', value: 200 });

    const feb = result.find((d) => d.category === 'Feb');
    expect(feb).toBeDefined();
    expect(feb!.values).toHaveLength(2);
    expect(feb!.values[0]).toEqual({ label: 'A', value: 150 });
    expect(feb!.values[1]).toEqual({ label: 'B', value: 250 });
  });

  it('skips values with non-finite measure', () => {
    const sparseRows: Row[] = [
      { month: 'Jan', series: 'A', revenue: 100 },
      { month: 'Jan', series: 'B', revenue: null },
      { month: 'Jan', series: 'C', revenue: NaN },
    ];
    const result = buildStreamgraphData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.values).toHaveLength(1);
    expect(result[0]!.values[0]).toEqual({ label: 'A', value: 100 });
  });
});
