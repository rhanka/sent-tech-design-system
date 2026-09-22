import { act, render, screen } from '@testing-library/react';
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

describe('categorical charts (react)', () => {
  it('renders a combo chart from categorical bar and line measures', () => {
    const { container } = render(
      <ComboChart
        store={newStore()}
        viewId="combo"
        category="quarter"
        measures={['sales', { id: 'margin', mark: 'line', axis: 'right' }]}
        label="Combo ventes"
      />,
    );

    expect(screen.getByRole('img', { name: 'Combo ventes' })).toBeTruthy();
    expect(container.querySelectorAll('.st-comboChart__bar')).toHaveLength(3);
    expect(container.querySelectorAll('.st-comboChart__dot')).toHaveLength(3);
    expect(screen.getByText(/Ventes, Q1: 15/)).toBeTruthy();
    expect(screen.getByText(/Marge, Q2: 5/)).toBeTruthy();
  });

  it('renders a stacked bar chart from a category and series dimension', () => {
    const { container } = render(
      <StackedBarChart
        store={newStore()}
        viewId="stacked"
        category="quarter"
        series="channel"
        measure="sales"
        label="Ventes empilees"
      />,
    );

    expect(screen.getByRole('img', { name: 'Ventes empilees' })).toBeTruthy();
    expect(container.querySelectorAll('.st-stackedBar__seg')).toHaveLength(6);
    expect(screen.getByText(/Q1, Direct: 10/)).toBeTruthy();
    expect(screen.getByText(/Q2, Partner: 15/)).toBeTruthy();
  });

  it('renders lollipop, step line and area charts from the same categorical series', () => {
    const store = newStore();
    const { container } = render(
      <>
        <LollipopChart store={store} viewId="lollipop" category="quarter" measure="sales" label="Lollipop ventes" />
        <StepLineChart store={store} viewId="step" category="quarter" measure="sales" label="Step ventes" />
        <AreaChart store={store} viewId="area" category="quarter" measure="sales" label="Area ventes" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Lollipop ventes' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Step ventes' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Area ventes' })).toBeTruthy();
    expect(container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(3);
    expect(container.querySelectorAll('.st-stepLineChart__dot')).toHaveLength(3);
    expect(container.querySelectorAll('.st-areaChart__dot')).toHaveLength(3);
    expect(screen.getAllByText(/Q2: 35/).length).toBeGreaterThan(0);
  });

  it('rebuilds simple categorical charts from this view cross-filter scope', () => {
    const store = newStore();
    const { container } = render(
      <LollipopChart store={store} viewId="lollipop" category="quarter" measure="sales" label="Lollipop ventes" />,
    );

    expect(container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(3);
    act(() => {
      store.setFilter('quarter', { kind: 'include', values: ['Q1'] });
    });

    expect(container.querySelectorAll('.st-lollipopChart__dot')).toHaveLength(1);
    expect(screen.getByText(/Q1: 15/)).toBeTruthy();
    expect(screen.queryByText(/Q2: 35/)).toBeNull();
  });

  it('renders no combo marks when fields are unknown', () => {
    const { container } = render(
      <ComboChart
        store={newStore()}
        viewId="combo"
        category="quarter"
        measures={['missing']}
        label="Vide"
      />,
    );

    expect(screen.getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(container.querySelectorAll('.st-comboChart__bar')).toHaveLength(0);
    expect(container.querySelectorAll('.st-comboChart__dot')).toHaveLength(0);
  });
});
