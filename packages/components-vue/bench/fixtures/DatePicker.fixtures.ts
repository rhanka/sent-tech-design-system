import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Date', modelValue: new Date(2024, 0, 15) } },
  { id: 'range-full', props: { label: 'Period', mode: 'range', modelValue: { start: new Date(2024, 0, 5), end: new Date(2024, 0, 20) } } },
  { id: 'range-partial', props: { mode: 'range', modelValue: { start: new Date(2024, 2, 1), end: null }, size: 'sm', class: 'consumer', style: 'color: red', 'data-bench': 'date' } },
  { id: 'english-bounds', props: { label: 'Date', modelValue: new Date(2024, 5, 10), locale: 'en-US', min: new Date(2024, 0, 1), max: new Date(2024, 11, 31), size: 'lg', id: 'my-date' } },
  { id: 'invalid-helper', props: { label: 'Date', errorText: 'Required', helperText: 'Pick a date', invalid: false } },
  { id: 'empty', props: { label: 'Date', modelValue: null } },
] satisfies Fixture[];
