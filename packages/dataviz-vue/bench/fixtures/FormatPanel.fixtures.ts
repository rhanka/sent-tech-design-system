import { createFormatPanelState, type FormatPanelState } from '@sentropic/dataviz-core';
import type { Fixture } from './types.js';
const state = (): FormatPanelState =>
  createFormatPanelState({
    axes: [{ id: 'revenue', label: 'Revenue' }],
    legends: [{ id: 'segment', label: 'Segment' }],
    markers: [{ id: 'points', label: 'Points' }],
  });
const onChange = () => {};
const base = () => ({ value: state(), onChange });
export default [
  { id: 'default', props: base() },
  { id: 'empty', props: { value: createFormatPanelState({ axes: [], legends: [], markers: [] }), onChange } },
  { id: 'custom-label', props: { ...base(), label: 'Formatting' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'format' } },
] satisfies Fixture[];
