import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { CalculatedFieldConfig, CalculationVariable, DataModel } from '@sentropic/dataviz-core';
import { CalculationEditor } from '../../dist/lib/CalculationEditor.js';

const model: DataModel = {
  dimensions: [{ id: 'segment', label: 'Segment', type: 'discrete' }],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'cost', label: 'Cost', aggregation: 'sum' },
  ],
};

const variables: CalculationVariable[] = [{ id: 'discount', label: 'Discount', value: 0.15 }];

const draft = (): CalculatedFieldConfig => ({
  id: 'margin',
  label: 'Margin',
  kind: 'measure',
  expression: '[revenue] - [cost]',
  aggregation: 'sum',
});

class Host {
  readonly model = model;
  readonly variables = variables;
  value = draft();
  readonly onChange = vi.fn((next: CalculatedFieldConfig) => {
    this.value = next;
  });
}

Component({
  standalone: true,
  imports: [CalculationEditor],
  template: `<st-dataviz-calculation-editor [model]="model" [value]="value" [onChange]="onChange" [variables]="variables" class="probe"></st-dataviz-calculation-editor>`,
})(Host);

describe('CalculationEditor (angular)', () => {
  it('renders a labelled group with metadata fields and suggestion buttons', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Calcul');
    const text = root.textContent ?? '';
    for (const label of ['Identifiant', 'Nom du calcul', 'Formule', 'Type', 'Agregation', 'Revenue', 'Cost'])
      expect(text).toContain(label);
    expect(root.querySelector('[role="list"]')?.getAttribute('aria-label')).toBe('Suggestions');
  });

  it('emits metadata edits through onChange', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const field = (label: string) =>
      Array.from(root.querySelectorAll('.st-field')).find((f) => f.textContent?.includes(label))!;
    const setText = (label: string, tag: string, value: string, event: string) => {
      const control = field(label).querySelector(tag) as HTMLInputElement;
      control.value = value;
      control.dispatchEvent(new Event(event, { bubbles: true }));
      fixture.detectChanges();
    };

    setText('Nom du calcul', 'input', 'Net Margin', 'input');
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].label).toBe('Net Margin');

    setText('Formule', 'textarea', '[revenue] * 2', 'input');
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].expression).toBe('[revenue] * 2');

    setText('Type', 'select', 'dimension', 'change');
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].kind).toBe('dimension');
  });

  it('appends a suggestion token to the expression', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const revenue = Array.from(root.querySelectorAll('[role="list"] button')).find(
      (b) => b.textContent?.trim() === 'Revenue',
    )!;
    revenue.dispatchEvent(new Event('click', { bubbles: true }));

    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].expression).toBe('[revenue] - [cost] [revenue]');
  });
});
