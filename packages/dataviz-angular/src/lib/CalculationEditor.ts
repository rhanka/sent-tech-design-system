import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  Button as DsButton,
  Input as DsInput,
  Select as DsSelect,
  Textarea as DsTextarea,
  type SelectOption,
} from '@sentropic/design-system-angular';
import {
  suggestCalculationTokens,
  type Aggregation,
  type CalculatedFieldConfig,
  type CalculatedFieldKind,
  type CalculationSuggestion,
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

const KIND_OPTIONS: SelectOption[] = [
  { value: 'measure', label: 'Measure' },
  { value: 'dimension', label: 'Dimension' },
];

const AGGREGATION_OPTIONS: SelectOption[] = [
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

/**
 * Controlled editor for one calculated field: metadata inputs, kind /
 * aggregation selects and token-suggestion buttons that append to the
 * expression. Every edit calls `onChange` with the patched config, like
 * Vue/React.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` holds no reactive
 * state, so there is no `void <state>.value` marker to anchor on (see
 * tools/dataviz-angular-port/README.md). The suggestions derive from props
 * in `recompute()`; the controlled inputs write through `(modelValueChange)`,
 * the design-system event the lot 9 `RelativeDateFilter` port established.
 *
 * The DS `Input`/`Select`/`Textarea`/`Button` now forward `aria-label`
 * (like React/Vue), so the fixed field labels and per-suggestion labels
 * render on the control alongside the visible `label` inputs.
 */
@Component({
  selector: 'st-dataviz-calculation-editor',
  standalone: true,
  imports: [DsButton, DsInput, DsSelect, DsTextarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="label" [class]="classInput">
      <st-input
        label="Identifiant"
        aria-label="Identifiant"
        [modelValue]="value.id"
        (modelValueChange)="update({ id: $event })"
      ></st-input>
      <st-input
        label="Nom du calcul"
        aria-label="Nom du calcul"
        [modelValue]="value.label"
        (modelValueChange)="update({ label: $event })"
      ></st-input>
      <st-textarea
        label="Formule"
        aria-label="Formule"
        [rows]="4"
        [modelValue]="value.expression"
        (modelValueChange)="update({ expression: $event })"
      ></st-textarea>
      <st-select
        label="Type"
        aria-label="Type"
        [modelValue]="value.kind"
        [options]="kindOptions"
        (modelValueChange)="update({ kind: kindFrom($event) })"
      ></st-select>
      @if (value.kind === 'measure') {
        <st-select
          label="Agregation"
          aria-label="Agregation"
          [modelValue]="value.aggregation ?? 'sum'"
          [options]="aggregationOptions"
          (modelValueChange)="update({ aggregation: aggregationFrom($event) })"
        ></st-select>
      }
      <div role="list" aria-label="Suggestions">
        @for (suggestion of suggestions; track suggestion.kind + ':' + suggestion.value) {
          <st-button type="button" size="sm" [aria-label]="suggestion.label" (click)="insertToken(suggestion.value)">{{
            suggestion.label
          }}</st-button>
        }
      </div>
    </div>
  `,
})
export class CalculationEditor implements OnInit, OnChanges {
  static readonly stComponentName = 'CalculationEditor';

  @NgInput({ required: true }) model!: DataModel;
  @NgInput({ required: true }) value!: CalculatedFieldConfig;
  @NgInput({ required: true }) onChange!: (next: CalculatedFieldConfig) => void;
  @NgInput() variables: readonly CalculationVariable[] = [];
  @NgInput() label = 'Calcul';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  suggestions: CalculationSuggestion[] = [];
  readonly kindOptions = KIND_OPTIONS;
  readonly aggregationOptions = AGGREGATION_OPTIONS;

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  update(patch: Partial<CalculatedFieldConfig>): void {
    this.onChange({ ...this.value, ...patch });
  }

  kindFrom(raw: string): CalculatedFieldKind {
    return kindFrom(raw);
  }

  aggregationFrom(raw: string): Aggregation {
    return aggregationFrom(raw);
  }

  insertToken(token: string): void {
    this.update({ expression: appendToken(this.value.expression, token) });
  }

  private recompute(): void {
    this.suggestions = this.model ? suggestCalculationTokens(this.model, this.variables, '') : [];
  }
}
