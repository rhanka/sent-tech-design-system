import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  buildFieldPaneTree,
  fieldId,
  fieldToPill,
  listFields,
  parseFieldId,
} from './index.js';

const model: DataModel = {
  dimensions: [
    {
      id: 'country',
      label: 'Country',
      type: 'discrete',
      folder: 'Geography',
      hierarchy: ['country', 'city'],
    },
    { id: 'city', label: 'City', type: 'discrete', folder: 'Geography' },
    { id: 'age', label: 'Age', type: 'continuous', folder: 'People' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum', folder: 'Sales' },
    { id: 'orders', label: 'Orders', aggregation: 'count' },
  ],
};

describe('field ids', () => {
  it('builds and parses stable typed ids', () => {
    expect(fieldId('dimension', 'country')).toBe('dimension:country');
    expect(parseFieldId('measure:revenue')).toEqual({ kind: 'measure', sourceId: 'revenue' });
  });

  it('rejects malformed field ids', () => {
    expect(parseFieldId('metric:revenue')).toBeUndefined();
    expect(parseFieldId('dimension:')).toBeUndefined();
  });
});

describe('listFields', () => {
  it('returns dimensions then measures with BI role metadata', () => {
    expect(listFields(model)).toEqual([
      {
        id: 'dimension:country',
        sourceId: 'country',
        kind: 'dimension',
        label: 'Country',
        folder: 'Geography',
        role: 'discrete',
        type: 'discrete',
        hierarchy: ['country', 'city'],
      },
      {
        id: 'dimension:city',
        sourceId: 'city',
        kind: 'dimension',
        label: 'City',
        folder: 'Geography',
        role: 'discrete',
        type: 'discrete',
      },
      {
        id: 'dimension:age',
        sourceId: 'age',
        kind: 'dimension',
        label: 'Age',
        folder: 'People',
        role: 'continuous',
        type: 'continuous',
      },
      {
        id: 'measure:revenue',
        sourceId: 'revenue',
        kind: 'measure',
        label: 'Revenue',
        folder: 'Sales',
        role: 'sum',
        aggregation: 'sum',
      },
      {
        id: 'measure:orders',
        sourceId: 'orders',
        kind: 'measure',
        label: 'Orders',
        role: 'count',
        aggregation: 'count',
      },
    ]);
  });
});

describe('buildFieldPaneTree', () => {
  it('builds TreeView-compatible grouped nodes and expansion ids', () => {
    const tree = buildFieldPaneTree(model);
    expect(tree.defaultExpandedIds).toEqual([
      'group:dimensions',
      'folder:dimension:Geography',
      'folder:dimension:People',
      'group:measures',
      'folder:measure:Sales',
    ]);
    expect(tree.nodes).toEqual([
      {
        id: 'group:dimensions',
        label: 'Dimensions',
        children: [
          {
            id: 'folder:dimension:Geography',
            label: 'Geography',
            children: [
              {
                id: 'dimension:country',
                label: 'Country',
                field: listFields(model)[0],
              },
              {
                id: 'dimension:city',
                label: 'City',
                field: listFields(model)[1],
              },
            ],
          },
          {
            id: 'folder:dimension:People',
            label: 'People',
            children: [
              {
                id: 'dimension:age',
                label: 'Age',
                field: listFields(model)[2],
              },
            ],
          },
        ],
      },
      {
        id: 'group:measures',
        label: 'Measures',
        children: [
          {
            id: 'folder:measure:Sales',
            label: 'Sales',
            children: [
              {
                id: 'measure:revenue',
                label: 'Revenue',
                field: listFields(model)[3],
              },
            ],
          },
          {
            id: 'measure:orders',
            label: 'Orders',
            field: listFields(model)[4],
          },
        ],
      },
    ]);
  });

  it('can omit dimensions or measures for scoped panes', () => {
    expect(buildFieldPaneTree(model, { includeDimensions: false }).nodes).toHaveLength(1);
    expect(buildFieldPaneTree(model, { includeMeasures: false }).nodes).toHaveLength(1);
  });
});

describe('fieldToPill', () => {
  it('maps fields to DS Tag-compatible pill models', () => {
    const [country, , age, revenue] = listFields(model);
    expect(fieldToPill(country!)).toEqual({
      id: 'dimension:country',
      label: 'Country',
      detail: 'Discrete dimension',
      kind: 'dimension',
      tone: 'info',
    });
    expect(fieldToPill(age!)).toEqual({
      id: 'dimension:age',
      label: 'Age',
      detail: 'Continuous dimension',
      kind: 'dimension',
      tone: 'warning',
    });
    expect(fieldToPill(revenue!)).toEqual({
      id: 'measure:revenue',
      label: 'Revenue',
      detail: 'sum measure',
      kind: 'measure',
      tone: 'success',
    });
  });
});
