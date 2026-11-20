import { Button, Input, Select, Textarea } from '@sentropic/design-system-preact';
import {
  suggestCalculationTokens,
  type Aggregation,
  type CalculatedFieldConfig,
  type CalculatedFieldKind,
  type CalculationVariable,
  type DataModel,
} from '@sentropic/dataviz-core';
import { useValue, type MaybeSignal } from '../signals.js';

export type CalculationEditorProps = {
  model: DataModel;
  value: MaybeSignal<CalculatedFieldConfig>;
  onChange: (next: CalculatedFieldConfig) => void;
  variables?: readonly CalculationVariable[];
  label?: string;
  className?: MaybeSignal<string>;
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
  const resolvedValue = useValue(value);
  const resolvedClassName = useValue(className);
  const suggestions = suggestCalculationTokens(model, variables, '');

  return (
    <div role="group" aria-label={label} className={resolvedClassName}>
      <Input
        label="Identifiant"
        aria-label="Identifiant"
        value={resolvedValue.id}
        onChange={(event) => onChange({ ...resolvedValue, id: event.currentTarget.value })}
      />
      <Input
        label="Nom du calcul"
        aria-label="Nom du calcul"
        value={resolvedValue.label}
        onChange={(event) => onChange({ ...resolvedValue, label: event.currentTarget.value })}
      />
      <Textarea
        label="Formule"
        aria-label="Formule"
        rows={4}
        value={resolvedValue.expression}
        onChange={(event) => onChange({ ...resolvedValue, expression: event.currentTarget.value })}
      />
      <Select
        label="Type"
        aria-label="Type"
        value={resolvedValue.kind}
        options={KIND_OPTIONS}
        onChange={(event) => onChange({ ...resolvedValue, kind: kindFrom(event.currentTarget.value) })}
      />
      {resolvedValue.kind === 'measure' ? (
        <Select
          label="Agregation"
          aria-label="Agregation"
          value={resolvedValue.aggregation ?? 'sum'}
          options={AGGREGATION_OPTIONS}
          onChange={(event) => onChange({ ...resolvedValue, aggregation: aggregationFrom(event.currentTarget.value) })}
        />
      ) : null}
      <div role="list" aria-label="Suggestions">
        {suggestions.map((suggestion) => (
          <Button
            key={`${suggestion.kind}:${suggestion.value}`}
            type="button"
            size="sm"
            aria-label={suggestion.label}
            onClick={() => onChange({ ...resolvedValue, expression: appendToken(resolvedValue.expression, suggestion.value) })}
          >
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
