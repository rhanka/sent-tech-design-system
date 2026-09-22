import { describe, it, expect } from 'vitest';
import { type DataModel, type Row } from './index.js';
import { buildGanttData } from './gantt.js';

const model: DataModel = {
  dimensions: [
    { id: 'task', label: 'Tâche', type: 'discrete' },
    { id: 'category', label: 'Catégorie', type: 'discrete' },
  ],
  measures: [
    { id: 'start', label: 'Début', aggregation: 'min' },
    { id: 'end', label: 'Fin', aggregation: 'max' },
  ],
};

const rows: Row[] = [
  { task: 'Analyse', start: 0, end: 3, category: 'Planification' },
  { task: 'Conception', start: 2, end: 7, category: 'Planification' },
  { task: 'Développement', start: 5, end: 14, category: 'Réalisation' },
];

const config = { task: 'task', start: 'start', end: 'end', category: 'category' };

describe('buildGanttData', () => {
  it('maps task/start/end/category fields per row', () => {
    const result = buildGanttData(model, rows, config);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ task: 'Analyse', start: 0, end: 3, category: 'Planification' });
    expect(result[1]).toEqual({ task: 'Conception', start: 2, end: 7, category: 'Planification' });
    expect(result[2]).toEqual({ task: 'Développement', start: 5, end: 14, category: 'Réalisation' });
  });

  it('skips rows where start or end is non-finite', () => {
    const sparseRows: Row[] = [
      { task: 'Analyse', start: 0, end: 3, category: 'A' },
      { task: 'Conception', start: null, end: 7, category: 'A' },
      { task: 'Dev', start: 5, end: NaN, category: 'B' },
    ];
    const result = buildGanttData(model, sparseRows, config);
    expect(result).toHaveLength(1);
    expect(result[0]!.task).toBe('Analyse');
  });

  it('omits category field when no category config provided', () => {
    const configNoCategory = { task: 'task', start: 'start', end: 'end' };
    const result = buildGanttData(model, rows, configNoCategory);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ task: 'Analyse', start: 0, end: 3 });
  });

  it('coerces task field to a string', () => {
    const numericRows: Row[] = [{ task: 42, start: 0, end: 3 }];
    const result = buildGanttData(model, numericRows, { task: 'task', start: 'start', end: 'end' });
    expect(result[0]!.task).toBe('42');
  });
});
