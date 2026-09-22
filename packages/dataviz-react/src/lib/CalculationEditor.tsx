import { Button, Input, Select, Textarea } from '@sentropic/design-system-react';
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
  className?: string;
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

function kindFrom(value: string): CalculatedFieldKind {
  return value === 'dimension' ? 'dimension' : 'measure';
}

function aggregationFrom(value: string): Aggregation {
  if (value === 'avg' || value === 'min' || value === 'max' || value === 'count') return value;
  return 'sum';
}

function appendToken(expression: string, token: string): string {
  const separator = expression.trim() ? ' ' : '';
  return `${expression}${separator}${token}`;
}

export function CalculationEditor({
  model,
  value,
  onChange,
  variables = [],
  label = 'Calcul',
  className,
}: CalculationEditorProps) {
  const suggestions = suggestCalculationTokens(model, variables, '');

  return (
    <div role="group" aria-label={label} className={className}>
      <Input
        label="Identifiant"
        aria-label="Identifiant"
        value={value.id}
        onChange={(event) => onChange({ ...value, id: event.currentTarget.value })}
      />
      <Input
        label="Nom du calcul"
        aria-label="Nom du calcul"
        value={value.label}
        onChange={(event) => onChange({ ...value, label: event.currentTarget.value })}
      />
      <Textarea
        label="Formule"
        aria-label="Formule"
        rows={4}
        value={value.expression}
        onChange={(event) => onChange({ ...value, expression: event.currentTarget.value })}
      />
      <Select
        label="Type"
        aria-label="Type"
        value={value.kind}
        options={KIND_OPTIONS}
        onChange={(event) => onChange({ ...value, kind: kindFrom(event.currentTarget.value) })}
      />
      {value.kind === 'measure' ? (
        <Select
          label="Agregation"
          aria-label="Agregation"
          value={value.aggregation ?? 'sum'}
          options={AGGREGATION_OPTIONS}
          onChange={(event) => onChange({ ...value, aggregation: aggregationFrom(event.currentTarget.value) })}
        />
      ) : null}
      <div role="list" aria-label="Suggestions">
        {suggestions.map((suggestion) => (
          <Button
            key={`${suggestion.kind}:${suggestion.value}`}
            type="button"
            size="sm"
            aria-label={suggestion.label}
            onClick={() => onChange({ ...value, expression: appendToken(value.expression, suggestion.value) })}
          >
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
