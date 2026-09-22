import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AreaChart } from './AreaChart.js';
import { ComboChart } from './ComboChart.js';
import { LollipopChart } from './LollipopChart.js';
import { StackedBarChart } from './StackedBarChart.js';
import { StepLineChart } from './StepLineChart.js';

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

describe('categorical charts (vue)', () => {
  it('renders a combo chart from categorical bar and line measures', () => {
    const w = mount(ComboChart, {
      props: {
        store: newStore(),
        viewId: 'combo',
        category: 'quarter',
        measures: ['sales', { id: 'margin', mark: 'line', axis: 'right' }],
        label: 'Combo ventes',
      },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Combo ventes');
    expect(w.findAll('.st-comboChart__bar')).toHaveLength(3);
    expect(w.findAll('.st-comboChart__dot')).toHaveLength(3);
    expect(w.text()).toContain('Ventes, Q1: 15');
    expect(w.text()).toContain('Marge, Q2: 5');
  });

  it('renders a stacked bar chart from a category and series dimension', () => {
    const w = mount(StackedBarChart, {
      props: {
        store: newStore(),
        viewId: 'stacked',
        category: 'quarter',
        series: 'channel',
        measure: 'sales',
        label: 'Ventes empilees',
      },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Ventes empilees');
    expect(w.findAll('.st-stackedBar__seg')).toHaveLength(6);
    expect(w.text()).toContain('Q1, Direct: 10');
    expect(w.text()).toContain('Q2, Partner: 15');
  });

  it('renders lollipop, step line and area charts from the same categorical series', () => {
    const store = newStore();
    const lollipop = mount(LollipopChart, {
      props: { store, viewId: 'lollipop', category: 'quarter', measure: 'sales', label: 'Lollipop ventes' },
    });
    const step = mount(StepLineChart, {
      props: { store, viewId: 'step', category: 'quarter', measure: 'sales', label: 'Step ventes' },
    });
    const area = mount(AreaChart, {
      props: { store, viewId: 'area', category: 'quarter', measure: 'sales', label: 'Area ventes' },
    });

    expect(lollipop.find('[role="img"]').attributes('aria-label')).toBe('Lollipop ventes');
    expect(step.find('[role="img"]').attributes('aria-label')).toBe('Step ventes');
    expect(area.find('[role="img"]').attributes('aria-label')).toBe('Area ventes');
    expect(lollipop.findAll('.st-lollipopChart__dot')).toHaveLength(3);
    expect(step.findAll('.st-stepLineChart__dot')).toHaveLength(3);
    expect(area.findAll('.st-areaChart__dot')).toHaveLength(3);
    expect(step.text()).toContain('Q2: 35');
    expect(area.text()).toContain('Q2: 35');
  });

  it('rebuilds simple categorical charts from this view cross-filter scope', async () => {
    const store = newStore();
    const w = mount(LollipopChart, {
      props: { store, viewId: 'lollipop', category: 'quarter', measure: 'sales', label: 'Lollipop ventes' },
    });

    expect(w.findAll('.st-lollipopChart__dot')).toHaveLength(3);
    store.setFilter('quarter', { kind: 'include', values: ['Q1'] });
    await nextTick();

    expect(w.findAll('.st-lollipopChart__dot')).toHaveLength(1);
    expect(w.text()).toContain('Q1: 15');
    expect(w.text()).not.toContain('Q2: 35');
  });

  it('renders no combo marks when fields are unknown', () => {
    const w = mount(ComboChart, {
      props: { store: newStore(), viewId: 'combo', category: 'quarter', measures: ['missing'], label: 'Vide' },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Vide');
    expect(w.findAll('.st-comboChart__bar')).toHaveLength(0);
    expect(w.findAll('.st-comboChart__dot')).toHaveLength(0);
  });
});
