import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildAnomalySwimLaneData } from './anomalySwimLane.js';

const model: DataModel = {
  dimensions: [
    { id: 'job', label: 'Job ML', type: 'discrete' },
  ],
  measures: [
    { id: 'at',    label: 'Heure',          aggregation: 'min' },
    { id: 'score', label: 'Score anomalie', aggregation: 'max' },
  ],
};

const rows: Row[] = [
  { job: 'fraud-detector',   at: 0, score: 12  },
  { job: 'fraud-detector',   at: 1, score: 45  },
  { job: 'fraud-detector',   at: 2, score: 78  },
  { job: 'churn-predictor',  at: 0, score: 5   },
  { job: 'churn-predictor',  at: 1, score: 90  },
  { job: 'churn-predictor',  at: 2, score: 30  },
];

const config = { job: 'job', at: 'at', score: 'score' };

describe('buildAnomalySwimLaneData', () => {
  it('groups rows by job into two lanes', () => {
    const result = buildAnomalySwimLaneData(model, rows, config);
    expect(result).toHaveLength(2);
    expect(result[0]!.job).toBe('fraud-detector');
    expect(result[1]!.job).toBe('churn-predictor');
  });

  it('maps buckets correctly within each job', () => {
    const result = buildAnomalySwimLaneData(model, rows, config);
    const fraud = result[0]!;
    expect(fraud.buckets).toHaveLength(3);
    expect(fraud.buckets[0]).toEqual({ at: 0, score: 12 });
    expect(fraud.buckets[1]).toEqual({ at: 1, score: 45 });
    expect(fraud.buckets[2]).toEqual({ at: 2, score: 78 });
  });

  it('drops rows where at is non-finite', () => {
    const sparseRows: Row[] = [
      { job: 'fraud-detector', at: 0,    score: 12 },
      { job: 'fraud-detector', at: null, score: 45 },
      { job: 'fraud-detector', at: NaN,  score: 78 },
    ];
    const result = buildAnomalySwimLaneData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.buckets).toHaveLength(1);
    expect(result[0]!.buckets[0]!.score).toBe(12);
  });

  it('drops rows where score is non-finite', () => {
    const sparseRows: Row[] = [
      { job: 'fraud-detector', at: 0, score: 12   },
      { job: 'fraud-detector', at: 1, score: null },
      { job: 'fraud-detector', at: 2, score: NaN  },
    ];
    const result = buildAnomalySwimLaneData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.buckets).toHaveLength(1);
    expect(result[0]!.buckets[0]!.at).toBe(0);
  });

  it('sorts buckets by ascending at within a job', () => {
    const unorderedRows: Row[] = [
      { job: 'fraud-detector', at: 5, score: 80 },
      { job: 'fraud-detector', at: 0, score: 10 },
    ];
    const result = buildAnomalySwimLaneData(model, unorderedRows, config);
    const buckets = result[0]!.buckets;
    expect(buckets[0]!.at).toBe(0);
    expect(buckets[1]!.at).toBe(5);
  });

  it('coerces string score values to number', () => {
    const stringScoreRows: Row[] = [{ job: 'fraud-detector', at: 0, score: '42' }];
    const result = buildAnomalySwimLaneData(model, stringScoreRows, config);
    expect(result[0]!.buckets[0]!.score).toBe(42);
  });
});
