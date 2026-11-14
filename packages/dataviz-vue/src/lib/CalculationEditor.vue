<script setup lang="ts">
import { computed } from 'vue';
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

defineOptions({ name: 'CalculationEditor' });
const props = withDefaults(defineProps<CalculationEditorProps>(), {
  variables: () => [], label: 'Calcul', class: undefined,
});
const suggestions = computed(() => suggestCalculationTokens(props.model, props.variables, ''));
const update = (patch: Partial<CalculatedFieldConfig>) => {
  props.onChange({ ...props.value, ...patch });
};
</script>

<template>
  <div role="group" :aria-label="props.label" :class="props.class">
    <Input label="Identifiant" aria-label="Identifiant" :model-value="props.value.id"
      @update:model-value="(raw: string) => update({ id: raw })" />
    <Input label="Nom du calcul" aria-label="Nom du calcul" :model-value="props.value.label"
      @update:model-value="(raw: string) => update({ label: raw })" />
    <Textarea label="Formule" aria-label="Formule" :rows="4" :model-value="props.value.expression"
      @update:model-value="(raw: string) => update({ expression: raw })" />
    <Select label="Type" aria-label="Type" :model-value="props.value.kind" :options="KIND_OPTIONS"
      @update:model-value="(raw: string) => update({ kind: kindFrom(raw) })" />
    <Select v-if="props.value.kind === 'measure'" label="Agregation" aria-label="Agregation"
      :model-value="props.value.aggregation ?? 'sum'" :options="AGGREGATION_OPTIONS"
      @update:model-value="(raw: string) => update({ aggregation: aggregationFrom(raw) })" />
    <div role="list" aria-label="Suggestions">
      <Button v-for="suggestion in suggestions" :key="`${suggestion.kind}:${suggestion.value}`" type="button" size="sm"
        :aria-label="suggestion.label"
        @click="() => update({ expression: appendToken(props.value.expression, suggestion.value) })">{{ suggestion.label }}</Button>
    </div>
  </div>
</template>
