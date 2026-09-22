import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import AreaChart from './AreaChart.svelte';
import ComboChart from './ComboChart.svelte';
import LollipopChart from './LollipopChart.svelte';
import StackedBarChart from './StackedBarChart.svelte';
import StepLineChart from './StepLineChart.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'quarter', label: 'Trimestre', type: 'discrete' },
    { id: 'channel', label: 'Canal', type: 'discrete' },
  ],
  measures: [
    { id: 'sales', label: 'Ventes', aggregation: 'sum' },
    { id: 'margin', label: 'Marge', aggregation: 'sum' },
  ],
};

const data: Row[] = [
  { quarter: 'Q1', channel: 'Direct', sales: 10, margin: 2 },
  { quarter: 'Q1', channel: 'Partner', sales: 5, margin: 1 },
  { quarter: 'Q2', channel: 'Direct', sales: 20, margin: 3 },
  { quarter: 'Q2', channel: 'Partner', sales: 15, margin: 2 },
  { quarter: 'Q3', channel: 'Direct', sales: 8, margin: 4 },
];

const newStore = () => createDashboardStore({ model, data });

describe('categorical charts', () => {
  it('renders a combo chart from categorical bar and line measures', () => {
    const { container, getByRole, getByText } = render(ComboChart, {
      props: {
        store: newStore(),
        viewId: 'combo',
        category: 'quarter',
        measures: ['sales', { id: 'margin', mark: 'line', axis: 'right' }],
        label: 'Combo ventes',
      },
    });

    expect(getByRole('img', { name: 'Combo ventes' })).toBeTruthy();
    expect(container.querySelectorAll('.st-comboChart__bar')).toHaveLength(3);
    expect(container.querySelectorAll('.st-comboChart__dot')).toHaveLength(3);
    expect(getByText(/Ventes, Q1: 15/)).toBeTruthy();
    expect(getByText(/Marge, Q2: 5/)).toBeTruthy();
  });

  it('renders a stacked bar chart from a category and series dimension', () => {
    const { container, getByRole, getByText } = render(StackedBarChart, {
      props: {
        store: newStore(),
        viewId: 'stacked',
        category: 'quarter',
        series: 'channel',
        measure: 'sales',
        label: 'Ventes empilees',
      },
    });

    expect(getByRole('img', { name: 'Ventes empilees' })).toBeTruthy();
    expect(container.querySelectorAll('.st-stackedBar__seg')).toHaveLength(6);
    expect(getByText(/Q1, Direct: 10/)).toBeTruthy();
    expect(getByText(/Q2, Partner: 15/)).toBeTruthy();
  });

  it('renders lollipop, step line and area charts from the same categorical series', () => {
    const store = newStore();
    const lollipop = render(LollipopChart, {
      props: { store, viewId: 'lollipop', category: 'quarter', measure: 'sales', label: 'Lollipop ventes' },
    });
    const step = render(StepLineChart, {
      props: { store, viewId: 'step', category: 'quarter', measure: 'sales', label: 'Step ventes' },
    });
    const area = render(AreaChart, {
      props: { store, viewId: 'area', category: 'quarter', measure: 'sales', label: 'Area ventes' },
    });

    expect(lollipop.getByRole('img', { name: 'Lollipop ventes' })).toBeTruthy();
    expect(step.getByRole('img', { name: 'Step ventes' })).toBeTruthy();
    expect(area.getByRole('img', { name: 'Area ventes' })).toBeTruthy();
    expect(lollipop.container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(3);
    expect(step.container.querySelectorAll('.st-stepLineChart__dot')).toHaveLength(3);
    expect(area.container.querySelectorAll('.st-areaChart__dot')).toHaveLength(3);
    expect(step.container.textContent).toContain('Q2: 35');
    expect(area.container.textContent).toContain('Q2: 35');
  });

  it('rebuilds simple categorical charts from this view cross-filter scope', async () => {
    const store = newStore();
    const { container, getByText, queryByText } = render(LollipopChart, {
      props: { store, viewId: 'lollipop', category: 'quarter', measure: 'sales', label: 'Lollipop ventes' },
    });

    expect(container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(3);
    store.setFilter('quarter', { kind: 'include', values: ['Q1'] });
    await tick();

    expect(container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(1);
    expect(getByText(/Q1: 15/)).toBeTruthy();
    expect(queryByText(/Q2: 35/)).toBeNull();
  });

  it('renders no combo marks when fields are unknown', () => {
    const { container, getByRole } = render(ComboChart, {
      props: { store: newStore(), viewId: 'combo', category: 'quarter', measures: ['missing'], label: 'Vide' },
    });

    expect(getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(container.querySelectorAll('.st-comboChart__bar')).toHaveLength(0);
    expect(container.querySelectorAll('.st-comboChart__dot')).toHaveLength(0);
  });
});
