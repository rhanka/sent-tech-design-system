import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ChordChart } from './ChordChart.js';
import { DonutChart } from './DonutChart.js';
import { FunnelChart } from './FunnelChart.js';
import { MekkoChart } from './MekkoChart.js';
import { PackedBubbleChart } from './PackedBubbleChart.js';
import { RadarChart } from './RadarChart.js';
import { RoseChart } from './RoseChart.js';
import { SankeyChart } from './SankeyChart.js';
import { SunburstChart } from './SunburstChart.js';
import { TreemapChart } from './TreemapChart.js';
import { WaterfallChart } from './WaterfallChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'source', label: 'Source', type: 'discrete' },
    { id: 'target', label: 'Target', type: 'discrete' },
  ],
  measures: [
    { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
    { id: 'margin', label: 'Margin', aggregation: 'sum' },
    { id: 'delta', label: 'Delta', aggregation: 'sum' },
  ],
};

const data: Row[] = [
  { region: 'North', segment: 'Enterprise', source: 'Lead', target: 'Qualified', revenue: 40, margin: 12, delta: 12 },
  { region: 'North', segment: 'SMB', source: 'Qualified', target: 'Won', revenue: 20, margin: 6, delta: -4 },
  { region: 'South', segment: 'Enterprise', source: 'Lead', target: 'Qualified', revenue: 30, margin: 9, delta: 8 },
  { region: 'South', segment: 'SMB', source: 'Qualified', target: 'Lost', revenue: 10, margin: 2, delta: -3 },
];

const newStore = () => createDashboardStore({ model, data });

describe('part-of-whole charts (react)', () => {
  it('renders donut and funnel charts from part-whole aggregates', () => {
    const store = newStore();
    const { container } = render(
      <>
        <DonutChart store={store} viewId="donut" category="region" measure="revenue" label="Revenue donut" />
        <FunnelChart store={store} viewId="funnel" category="region" measure="revenue" label="Revenue funnel" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Revenue donut' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue funnel' })).toBeTruthy();
    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(2);
    expect(container.querySelectorAll('.st-funnelChart__segment')).toHaveLength(2);
    expect(screen.getAllByText(/North: 60/).length).toBeGreaterThan(0);
  });

  it('renders treemap and sunburst charts from a part-whole hierarchy', () => {
    const store = newStore();
    const { container } = render(
      <>
        <TreemapChart store={store} viewId="tree" hierarchy={['region', 'segment']} measure="revenue" label="Revenue tree" />
        <SunburstChart store={store} viewId="sun" hierarchy={['region', 'segment']} measure="revenue" label="Revenue sun" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Revenue tree' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue sun' })).toBeTruthy();
    expect(container.querySelectorAll('.st-treemapChart__cell')).toHaveLength(4);
    expect(container.querySelectorAll('.st-sunburstChart__arc').length).toBeGreaterThan(0);
    expect(container.querySelector('.st-treemapChart')?.textContent).toContain('North, Enterprise: 40');
    expect(container.querySelector('.st-sunburstChart')?.textContent).toContain('Total, North, SMB: 20');
  });

  it('renders waterfall, sankey and radar charts from their core models', () => {
    const store = newStore();
    const { container } = render(
      <>
        <WaterfallChart store={store} viewId="waterfall" category="region" measure="delta" label="Delta waterfall" />
        <SankeyChart store={store} viewId="sankey" source="source" target="target" measure="revenue" label="Revenue flow" />
        <RadarChart store={store} viewId="radar" axes={['revenue', 'margin']} series="segment" label="Segment radar" />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Delta waterfall' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue flow' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Segment radar' })).toBeTruthy();
    expect(container.querySelectorAll('.st-waterfallChart__bar')).toHaveLength(3);
    expect(container.querySelectorAll('.st-sankeyChart__link')).toHaveLength(3);
    expect(container.querySelectorAll('.st-radarChart__polygon')).toHaveLength(2);
    expect(screen.getByText(/Lead -> Qualified: 70/)).toBeTruthy();
    expect(screen.getByText(/Enterprise, Revenue: 70/)).toBeTruthy();
  });

  it('renders a Mekko chart from category and segment part-whole aggregates', () => {
    const store = newStore();
    const { container } = render(
      <MekkoChart
        store={store}
        viewId="mekko"
        category="region"
        series="segment"
        measure="revenue"
        label="Revenue mekko"
      />,
    );

    expect(screen.getByRole('img', { name: 'Revenue mekko' })).toBeTruthy();
    expect(container.querySelectorAll('.st-marimekkoChart__cell')).toHaveLength(4);
    expect(container.querySelector('.st-marimekkoChart')?.textContent).toContain('North');
    expect(container.querySelector('.st-marimekkoChart')?.textContent).toContain('South');
    expect(container.querySelector('.st-marimekkoChart')?.textContent).toContain('North, Enterprise');
  });

  it('renders chord, rose and packed bubble charts from remaining part-whole core models', () => {
    const store = newStore();
    const { container } = render(
      <>
        <ChordChart store={store} viewId="chord" source="source" target="target" measure="revenue" label="Revenue chord" />
        <RoseChart store={store} viewId="rose" category="region" measure="revenue" label="Revenue rose" />
        <PackedBubbleChart
          store={store}
          viewId="packed"
          category="region"
          measure="revenue"
          label="Revenue packed"
        />
      </>,
    );

    expect(screen.getByRole('img', { name: 'Revenue chord' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue rose' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Revenue packed' })).toBeTruthy();
    expect(container.querySelectorAll('.st-chordDiagram__ribbon')).toHaveLength(3);
    expect(container.querySelectorAll('.st-roseChart__sector')).toHaveLength(2);
    expect(container.querySelectorAll('.st-packedBubblesChart__bubble')).toHaveLength(2);
    expect(container.querySelector('.st-chordDiagram')?.textContent).toContain('Lead -> Qualified: 70');
    expect(container.querySelector('.st-roseChart')?.textContent).toContain('North: 60');
    expect(container.querySelector('.st-packedBubblesChart')?.textContent).toContain('South: 40');
  });

  it('rebuilds part-whole aggregates from this view cross-filter scope', () => {
    const store = newStore();
    const { container } = render(
      <DonutChart store={store} viewId="donut" category="region" measure="revenue" label="Revenue donut" />,
    );

    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(2);
    act(() => {
      store.setFilter('region', { kind: 'include', values: ['North'] });
    });

    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(1);
    expect(screen.getByText(/North: 60/)).toBeTruthy();
    expect(screen.queryByText(/South: 40/)).toBeNull();
  });

  it('renders no marks when part-whole fields are unknown', () => {
    const { container } = render(
      <DonutChart store={newStore()} viewId="donut" category="missing" measure="revenue" label="Vide" />,
    );

    expect(screen.getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(0);
  });
});
