import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), value: 'sales', label: 'Gauge' });
export default [
  { id: 'default', props: base() },
  { id: 'range', props: { ...base(), min: 0, max: 30, unit: '€' } },
  { id: 'thresholds', props: { ...base(), thresholds: [{ value: 15, label: 'mid' }] } },
  { id: 'sized', props: { ...base(), size: 200, thickness: 24, startAngle: -120, endAngle: 120 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'gauge' } },
] satisfies Fixture[];
