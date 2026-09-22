import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildTimelineData } from './timeline.js';

const model: DataModel = {
  dimensions: [
    { id: 'event', label: 'Évènement', type: 'discrete' },
    { id: 'description', label: 'Description', type: 'discrete' },
    { id: 'tone', label: 'Ton', type: 'discrete' },
  ],
  measures: [
    { id: 'position', label: 'Position', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { event: 'Lancement', position: 0, description: 'Démarrage du projet', tone: 'category1' },
  { event: 'Livraison v1', position: 5, description: 'Première livraison', tone: 'category3' },
  { event: 'Clôture', position: 12 },
];

const config = { label: 'event', position: 'position', description: 'description', tone: 'tone' };

describe('buildTimelineData', () => {
  it('maps position/label/description/tone per row', () => {
    const result = buildTimelineData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ position: 0, label: 'Lancement', description: 'Démarrage du projet', tone: 'category1' });
    expect(result[1]).toEqual({ position: 5, label: 'Livraison v1', description: 'Première livraison', tone: 'category3' });
    expect(result[2]).toEqual({ position: 12, label: 'Clôture' });
  });

  it('skips rows with non-finite position', () => {
    const sparseRows: Row[] = [
      { event: 'A', position: 0 },
      { event: 'B', position: null },
      { event: 'C', position: NaN },
    ];
    const result = buildTimelineData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('A');
  });

  it('omits description and tone when not configured', () => {
    const result = buildTimelineData(model, rows, { label: 'event', position: 'position' });
    expect(result[0]).toEqual({ position: 0, label: 'Lancement' });
  });
});
