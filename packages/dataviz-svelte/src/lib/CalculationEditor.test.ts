import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { type CalculatedFieldConfig, type CalculationVariable, type DataModel } from '@sentropic/dataviz-core';
import CalculationEditor from './CalculationEditor.svelte';

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

describe('CalculationEditor (svelte)', () => {
  it('edits calculated field metadata and inserts suggestions', async () => {
    const onChange = vi.fn();
    render(CalculationEditor, { props: { model, variables, value: draft(), onChange, label: 'Calcul' } });

    expect(screen.getByRole('group', { name: 'Calcul' })).toBeTruthy();

    await fireEvent.input(screen.getByLabelText('Nom du calcul'), { target: { value: 'Net Margin' } });
    expect(onChange.mock.lastCall?.[0].label).toBe('Net Margin');

    await fireEvent.input(screen.getByLabelText('Formule'), { target: { value: '[revenue] * 2' } });
    expect(onChange.mock.lastCall?.[0].expression).toBe('[revenue] * 2');

    await fireEvent.click(screen.getByRole('button', { name: 'Revenue' }));
    expect(onChange.mock.lastCall?.[0].expression).toBe('[revenue] - [cost] [revenue]');
  });
});
