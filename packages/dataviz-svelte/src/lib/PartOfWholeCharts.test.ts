import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import ChordChart from './ChordChart.svelte';
import DonutChart from './DonutChart.svelte';
import FunnelChart from './FunnelChart.svelte';
import MekkoChart from './MekkoChart.svelte';
import PackedBubbleChart from './PackedBubbleChart.svelte';
import RadarChart from './RadarChart.svelte';
import RoseChart from './RoseChart.svelte';
import SankeyChart from './SankeyChart.svelte';
import SunburstChart from './SunburstChart.svelte';
import TreemapChart from './TreemapChart.svelte';
import WaterfallChart from './WaterfallChart.svelte';

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

describe('part-of-whole charts', () => {
  it('renders donut and funnel charts from part-whole aggregates', () => {
    const store = newStore();
    const donut = render(DonutChart, {
      props: { store, viewId: 'donut', category: 'region', measure: 'revenue', label: 'Revenue donut' },
    });
    const funnel = render(FunnelChart, {
      props: { store, viewId: 'funnel', category: 'region', measure: 'revenue', label: 'Revenue funnel' },
    });

    expect(donut.getByRole('img', { name: 'Revenue donut' })).toBeTruthy();
    expect(funnel.getByRole('img', { name: 'Revenue funnel' })).toBeTruthy();
    expect(donut.container.querySelectorAll('.st-donutChart__slice')).toHaveLength(2);
    expect(funnel.container.querySelectorAll('.st-funnelChart__segment')).toHaveLength(2);
    expect(donut.container.textContent).toContain('North: 60');
  });

  it('renders treemap and sunburst charts from a part-whole hierarchy', () => {
    const store = newStore();
    const treemap = render(TreemapChart, {
      props: { store, viewId: 'tree', hierarchy: ['region', 'segment'], measure: 'revenue', label: 'Revenue tree' },
    });
    const sunburst = render(SunburstChart, {
      props: { store, viewId: 'sun', hierarchy: ['region', 'segment'], measure: 'revenue', label: 'Revenue sun' },
    });

    expect(treemap.getByRole('img', { name: 'Revenue tree' })).toBeTruthy();
    expect(sunburst.getByRole('img', { name: 'Revenue sun' })).toBeTruthy();
    expect(treemap.container.querySelectorAll('.st-treemapChart__cell')).toHaveLength(4);
    expect(sunburst.container.querySelectorAll('.st-sunburstChart__arc').length).toBeGreaterThan(0);
    expect(treemap.container.textContent).toContain('North, Enterprise: 40');
    expect(sunburst.container.textContent).toContain('Total, North, SMB: 20');
  });

  it('renders waterfall, sankey and radar charts from their core models', () => {
    const store = newStore();
    const waterfall = render(WaterfallChart, {
      props: { store, viewId: 'waterfall', category: 'region', measure: 'delta', label: 'Delta waterfall' },
    });
    const sankey = render(SankeyChart, {
      props: { store, viewId: 'sankey', source: 'source', target: 'target', measure: 'revenue', label: 'Revenue flow' },
    });
    const radar = render(RadarChart, {
      props: { store, viewId: 'radar', axes: ['revenue', 'margin'], series: 'segment', label: 'Segment radar' },
    });

    expect(waterfall.getByRole('img', { name: 'Delta waterfall' })).toBeTruthy();
    expect(sankey.getByRole('img', { name: 'Revenue flow' })).toBeTruthy();
    expect(radar.getByRole('img', { name: 'Segment radar' })).toBeTruthy();
    expect(waterfall.container.querySelectorAll('.st-waterfallChart__bar')).toHaveLength(3);
    expect(sankey.container.querySelectorAll('.st-sankeyChart__link')).toHaveLength(3);
    expect(radar.container.querySelectorAll('.st-radarChart__polygon')).toHaveLength(2);
    expect(sankey.container.textContent).toContain('Lead -> Qualified: 70');
    expect(radar.container.textContent).toContain('Enterprise, Revenue: 70');
  });

  it('renders a Mekko chart from category and segment part-whole aggregates', () => {
    const store = newStore();
    const mekko = render(MekkoChart, {
      props: {
        store,
        viewId: 'mekko',
        category: 'region',
        series: 'segment',
        measure: 'revenue',
        label: 'Revenue mekko',
      },
    });

    expect(mekko.getByRole('img', { name: 'Revenue mekko' })).toBeTruthy();
    expect(mekko.container.querySelectorAll('.st-marimekkoChart__cell')).toHaveLength(4);
    expect(mekko.container.textContent).toContain('North');
    expect(mekko.container.textContent).toContain('South');
    expect(mekko.container.textContent).toContain('North, Enterprise');
  });

  it('renders chord, rose and packed bubble charts from remaining part-whole core models', () => {
    const store = newStore();
    const chord = render(ChordChart, {
      props: { store, viewId: 'chord', source: 'source', target: 'target', measure: 'revenue', label: 'Revenue chord' },
    });
    const rose = render(RoseChart, {
      props: { store, viewId: 'rose', category: 'region', measure: 'revenue', label: 'Revenue rose' },
    });
    const packed = render(PackedBubbleChart, {
      props: { store, viewId: 'packed', category: 'region', measure: 'revenue', label: 'Revenue packed' },
    });

    expect(chord.getByRole('img', { name: 'Revenue chord' })).toBeTruthy();
    expect(rose.getByRole('img', { name: 'Revenue rose' })).toBeTruthy();
    expect(packed.getByRole('img', { name: 'Revenue packed' })).toBeTruthy();
    expect(chord.container.querySelectorAll('.st-chordDiagram__ribbon')).toHaveLength(3);
    expect(rose.container.querySelectorAll('.st-roseChart__sector')).toHaveLength(2);
    expect(packed.container.querySelectorAll('.st-packedBubblesChart__bubble')).toHaveLength(2);
    expect(chord.container.textContent).toContain('Lead -> Qualified: 70');
    expect(rose.container.textContent).toContain('North: 60');
    expect(packed.container.textContent).toContain('South: 40');
  });

  it('rebuilds part-whole aggregates from this view cross-filter scope', async () => {
    const store = newStore();
    const { container, getByText, queryByText } = render(DonutChart, {
      props: { store, viewId: 'donut', category: 'region', measure: 'revenue', label: 'Revenue donut' },
    });

    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(2);
    store.setFilter('region', { kind: 'include', values: ['North'] });
    await tick();

    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(1);
    expect(getByText(/North: 60/)).toBeTruthy();
    expect(queryByText(/South: 40/)).toBeNull();
  });

  it('renders no marks when part-whole fields are unknown', () => {
    const { container, getByRole } = render(DonutChart, {
      props: { store: newStore(), viewId: 'donut', category: 'missing', measure: 'revenue', label: 'Vide' },
    });

    expect(getByRole('img', { name: 'Vide' })).toBeTruthy();
    expect(container.querySelectorAll('.st-donutChart__slice')).toHaveLength(0);
  });
});
