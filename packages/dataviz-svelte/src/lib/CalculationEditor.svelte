<script lang="ts" module>
  import type { CalculatedFieldConfig, CalculationVariable, DataModel } from '@sentropic/dataviz-core';

  export type CalculationEditorProps = {
    model: DataModel;
    value: CalculatedFieldConfig;
    onChange: (next: CalculatedFieldConfig) => void;
    variables?: readonly CalculationVariable[];
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { Button, Input, Select, Textarea } from '@sentropic/design-system-svelte';
  import { suggestCalculationTokens, type Aggregation, type CalculatedFieldKind } from '@sentropic/dataviz-core';

  let { model, value, onChange, variables = [], label = 'Calcul', class: className }: CalculationEditorProps = $props();

  const suggestions = $derived(suggestCalculationTokens(model, variables, ''));

  function textValue(event: Event): string {
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
</script>

<div role="group" aria-label={label} class={className}>
  <Input
    label="Identifiant"
    aria-label="Identifiant"
    value={value.id}
    oninput={(event) => onChange({ ...value, id: textValue(event) })}
  />
  <Input
    label="Nom du calcul"
    aria-label="Nom du calcul"
    value={value.label}
    oninput={(event) => onChange({ ...value, label: textValue(event) })}
  />
  <Textarea
    label="Formule"
    aria-label="Formule"
    rows={4}
    value={value.expression}
    oninput={(event) => onChange({ ...value, expression: textValue(event) })}
  />
  <Select
    label="Type"
    aria-label="Type"
    value={value.kind}
    onchange={(event) => onChange({ ...value, kind: kindFrom(textValue(event)) })}
  >
    <option value="measure">Measure</option>
    <option value="dimension">Dimension</option>
  </Select>
  {#if value.kind === 'measure'}
    <Select
      label="Agregation"
      aria-label="Agregation"
      value={value.aggregation ?? 'sum'}
      onchange={(event) => onChange({ ...value, aggregation: aggregationFrom(textValue(event)) })}
    >
      <option value="sum">Sum</option>
      <option value="avg">Average</option>
      <option value="min">Minimum</option>
      <option value="max">Maximum</option>
      <option value="count">Count</option>
    </Select>
  {/if}
  <div role="list" aria-label="Suggestions">
    {#each suggestions as suggestion (`${suggestion.kind}:${suggestion.value}`)}
      <Button
        type="button"
        size="sm"
        aria-label={suggestion.label}
        onclick={() => onChange({ ...value, expression: appendToken(value.expression, suggestion.value) })}
      >
        {suggestion.label}
      </Button>
    {/each}
  </div>
</div>
