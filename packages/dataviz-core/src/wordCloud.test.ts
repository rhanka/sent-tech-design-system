import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildWordCloudData } from './wordCloud.js';

const model: DataModel = {
  dimensions: [
    { id: 'word', label: 'Mot', type: 'discrete' },
  ],
  measures: [
    { id: 'freq', label: 'Fréquence', aggregation: 'sum' },
  ],
};

const rows: Row[] = [
  { word: 'data', freq: 120 },
  { word: 'chart', freq: 85 },
  { word: 'visual', freq: 60 },
];

const config = { word: 'word', weight: 'freq' };

describe('buildWordCloudData', () => {
  it('maps text and weight fields per row with cycling tones', () => {
    const result = buildWordCloudData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ text: 'data', weight: 120, tone: 'category1' });
    expect(result[1]).toEqual({ text: 'chart', weight: 85, tone: 'category2' });
    expect(result[2]).toEqual({ text: 'visual', weight: 60, tone: 'category3' });
  });

  it('drops rows where weight is non-finite', () => {
    const sparseRows: Row[] = [
      { word: 'data', freq: 120 },
      { word: 'chart', freq: null },
      { word: 'visual', freq: NaN },
      { word: 'graph', freq: undefined },
    ];
    const result = buildWordCloudData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ text: 'data', weight: 120 });
  });

  it('coerces the word field to string and cycles tones beyond category8', () => {
    const manyRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
      word: i + 1,
      freq: 10,
    }));
    const result = buildWordCloudData(model, manyRows, config);
    expect(result[0]!.text).toBe('1');
    expect(result[7]!.tone).toBe('category8');
    expect(result[8]!.tone).toBe('category1');
  });
});
