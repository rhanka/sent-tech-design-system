import type { DataModel } from '@sentropic/dataviz-core';
import type { Fixture } from './types.js';
const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete', folder: 'Geo' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'sales', label: 'Sales', aggregation: 'sum', folder: 'Finance' }],
};
export default [
  { id: 'default', props: { model } },
  { id: 'interactive-selected', props: { model, onSelect: () => {}, selectedId: 'dimension:country' } },
  { id: 'collapsed', props: { model, expandedIds: [], selectedId: 'measure:sales' } },
  { id: 'interactive-collapsed', props: { model, defaultExpandedIds: [], onSelect: () => {}, class: 'consumer', 'data-bench': 'fields' } },
  { id: 'measures-only', props: { model, includeDimensions: false, label: 'Measures', selectedId: 'measure:sales' } },
  { id: 'dimensions-only-attrs', props: { model, includeMeasures: false, includeDimensions: undefined, class: 'consumer', label: 'Fields custom', 'data-bench': 'fields', 'aria-label': 'Consumer fields', style: 'color:red' } },
  { id: 'empty', props: { model: { dimensions: [], measures: [] }, label: '' } },
] satisfies Fixture[];
