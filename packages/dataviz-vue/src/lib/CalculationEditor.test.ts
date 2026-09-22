import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { type CalculatedFieldConfig, type CalculationVariable, type DataModel } from '@sentropic/dataviz-core';
import { CalculationEditor } from './CalculationEditor.js';

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

describe('CalculationEditor (vue)', () => {
  it('edits calculated field metadata and inserts suggestions', async () => {
    const onChange = vi.fn();
    const w = mount(CalculationEditor, { props: { model, variables, value: draft(), onChange, label: 'Calcul' } });

    expect(w.find('[role="group"]').attributes('aria-label')).toBe('Calcul');

    await w.find('input[aria-label="Nom du calcul"]').setValue('Net Margin');
    expect(onChange.mock.lastCall?.[0].label).toBe('Net Margin');

    await w.find('textarea[aria-label="Formule"]').setValue('[revenue] * 2');
    expect(onChange.mock.lastCall?.[0].expression).toBe('[revenue] * 2');

    await w.find('button[aria-label="Revenue"]').trigger('click');
    expect(onChange.mock.lastCall?.[0].expression).toBe('[revenue] - [cost] [revenue]');
  });
});
