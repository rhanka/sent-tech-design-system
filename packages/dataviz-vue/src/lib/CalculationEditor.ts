import { defineComponent, h, type Component, type PropType } from 'vue';
import { Button, Input, Select, Textarea } from '@sentropic/design-system-vue';
import {
  suggestCalculationTokens,
  type Aggregation,
  type CalculatedFieldConfig,
  type CalculatedFieldKind,
  type CalculationVariable,
  type DataModel,
} from '@sentropic/dataviz-core';

export type CalculationEditorProps = {
  model: DataModel;
  value: CalculatedFieldConfig;
  onChange: (next: CalculatedFieldConfig) => void;
  variables?: readonly CalculationVariable[];
  label?: string;
  class?: string;
};

const KIND_OPTIONS = [
  { value: 'measure', label: 'Measure' },
  { value: 'dimension', label: 'Dimension' },
];

const AGGREGATION_OPTIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
  { value: 'count', label: 'Count' },
];

function eventValue(event: Event): string {
  const target = event.currentTarget;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return target.value;
  }
  return '';
}

function kindFrom(raw: string): CalculatedFieldKind {
  return raw === 'dimension' ? 'dimension' : 'measure';
}

function aggregationFrom(raw: string): Aggregation {
  if (raw === 'avg' || raw === 'min' || raw === 'max' || raw === 'count') return raw;
  return 'sum';
}

function appendToken(expression: string, token: string): string {
  return `${expression}${expression.trim() ? ' ' : ''}${token}`;
}

export const CalculationEditor = defineComponent({
  name: 'CalculationEditor',
  props: {
    model: { type: Object as PropType<DataModel>, required: true },
    value: { type: Object as PropType<CalculatedFieldConfig>, required: true },
    onChange: { type: Function as PropType<(next: CalculatedFieldConfig) => void>, required: true },
    variables: { type: Array as PropType<readonly CalculationVariable[]>, default: () => [] },
    label: { type: String, default: 'Calcul' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const update = (patch: Partial<CalculatedFieldConfig>) => {
      props.onChange({ ...props.value, ...patch });
    };

    return () => {
      const suggestions = suggestCalculationTokens(props.model, props.variables, '');
      return h('div', { role: 'group', 'aria-label': props.label, class: props.class }, [
        h(Input as Component, {
          label: 'Identifiant',
          'aria-label': 'Identifiant',
          modelValue: props.value.id,
          'onUpdate:modelValue': (raw: string) => update({ id: raw }),
          onInput: (event: Event) => update({ id: eventValue(event) }),
        }),
        h(Input as Component, {
          label: 'Nom du calcul',
          'aria-label': 'Nom du calcul',
          modelValue: props.value.label,
          'onUpdate:modelValue': (raw: string) => update({ label: raw }),
          onInput: (event: Event) => update({ label: eventValue(event) }),
        }),
        h(Textarea as Component, {
          label: 'Formule',
          'aria-label': 'Formule',
          rows: 4,
          modelValue: props.value.expression,
          'onUpdate:modelValue': (raw: string) => update({ expression: raw }),
          onInput: (event: Event) => update({ expression: eventValue(event) }),
        }),
        h(Select as Component, {
          label: 'Type',
          'aria-label': 'Type',
          modelValue: props.value.kind,
          options: KIND_OPTIONS,
          'onUpdate:modelValue': (raw: string) => update({ kind: kindFrom(raw) }),
          onChange: (event: Event) => update({ kind: kindFrom(eventValue(event)) }),
        }),
        props.value.kind === 'measure'
          ? h(Select as Component, {
              label: 'Agregation',
              'aria-label': 'Agregation',
              modelValue: props.value.aggregation ?? 'sum',
              options: AGGREGATION_OPTIONS,
              'onUpdate:modelValue': (raw: string) => update({ aggregation: aggregationFrom(raw) }),
              onChange: (event: Event) => update({ aggregation: aggregationFrom(eventValue(event)) }),
            })
          : null,
        h(
          'div',
          { role: 'list', 'aria-label': 'Suggestions' },
          suggestions.map((suggestion) =>
            h(
              Button as Component,
              {
                key: `${suggestion.kind}:${suggestion.value}`,
                type: 'button',
                size: 'sm',
                'aria-label': suggestion.label,
                onClick: () => update({ expression: appendToken(props.value.expression, suggestion.value) }),
              },
              () => suggestion.label,
            ),
          ),
        ),
      ]);
    };
  },
});
