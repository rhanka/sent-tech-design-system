import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'with-value', props: { value: '09:30' } },
  { id: 'format-12', props: { value: '13:05', format: '12' } },
  { id: 'bounded-step', props: { value: '08:30', min: '08:00', max: '10:00', step: 30 } },
  { id: 'disabled', props: { value: '12:00', disabled: true } },
  { id: 'labelled-lg', props: { label: 'Departure', size: 'lg', value: '07:15' } },
  { id: 'custom-attrs', props: { label: 'Arrival', id: 'consumer-timepicker', class: 'consumer', style: 'color: red', 'data-bench': 'timePicker' } },
] satisfies Fixture[];
