import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'absolute-value', props: { modelValue: { mode: 'absolute', from: Date.UTC(2025, 0, 6, 9, 30), to: Date.UTC(2025, 0, 6, 11, 0) } } },
  { id: 'relative-en', props: { modelValue: { mode: 'relative', relative: '7d', from: 0, to: 604_800_000 }, locale: 'en-US' } },
  { id: 'labelled-lg', props: { label: 'Range', size: 'lg', modelValue: { mode: 'relative', relative: '30m', from: 0, to: 1_800_000 } } },
  { id: 'disabled', props: { disabled: true, modelValue: { mode: 'relative', relative: '1h', from: 0, to: 3_600_000 } } },
  { id: 'custom-format', props: { modelValue: { mode: 'relative', relative: '1h', from: 0, to: 3_600_000 }, formatRange: () => 'Last hour (custom)', formatPresetLabel: (token: string) => `Preset ${token}` } },
  { id: 'custom-attrs', props: { label: 'Range', class: 'consumer', style: 'color: red', 'data-bench': 'timeRangePicker', modelValue: { mode: 'relative', relative: '3h', from: 0, to: 10_800_000 } } },
  { id: 'custom-extra-slot', props: { label: 'Range', modelValue: { mode: 'relative', relative: '24h', from: 0, to: 86_400_000 } }, slots: { customExtra: '<span>Extra control</span>' } },
] satisfies Fixture[];
