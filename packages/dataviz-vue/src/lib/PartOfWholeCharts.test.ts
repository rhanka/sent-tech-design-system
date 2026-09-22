import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
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

describe('part-of-whole charts (vue)', () => {
  it('renders donut and funnel charts from part-whole aggregates', () => {
    const store = newStore();
    const donut = mount(DonutChart, {
      props: { store, viewId: 'donut', category: 'region', measure: 'revenue', label: 'Revenue donut' },
    });
    const funnel = mount(FunnelChart, {
      props: { store, viewId: 'funnel', category: 'region', measure: 'revenue', label: 'Revenue funnel' },
    });

    expect(donut.find('[role="img"]').attributes('aria-label')).toBe('Revenue donut');
    expect(funnel.find('[role="img"]').attributes('aria-label')).toBe('Revenue funnel');
    expect(donut.findAll('.st-donutChart__slice')).toHaveLength(2);
    expect(funnel.findAll('.st-funnelChart__segment')).toHaveLength(2);
    expect(donut.text()).toContain('North: 60');
  });

  it('renders treemap and sunburst charts from a part-whole hierarchy', () => {
    const store = newStore();
    const treemap = mount(TreemapChart, {
      props: { store, viewId: 'tree', hierarchy: ['region', 'segment'], measure: 'revenue', label: 'Revenue tree' },
    });
    const sunburst = mount(SunburstChart, {
      props: { store, viewId: 'sun', hierarchy: ['region', 'segment'], measure: 'revenue', label: 'Revenue sun' },
    });

    expect(treemap.find('[role="img"]').attributes('aria-label')).toBe('Revenue tree');
    expect(sunburst.find('[role="img"]').attributes('aria-label')).toBe('Revenue sun');
    expect(treemap.findAll('.st-treemapChart__cell')).toHaveLength(4);
    expect(sunburst.findAll('.st-sunburstChart__arc').length).toBeGreaterThan(0);
    expect(treemap.text()).toContain('North, Enterprise: 40');
    expect(sunburst.text()).toContain('Total, North, SMB: 20');
  });

  it('renders waterfall, sankey and radar charts from their core models', () => {
    const store = newStore();
    const waterfall = mount(WaterfallChart, {
      props: { store, viewId: 'waterfall', category: 'region', measure: 'delta', label: 'Delta waterfall' },
    });
    const sankey = mount(SankeyChart, {
      props: { store, viewId: 'sankey', source: 'source', target: 'target', measure: 'revenue', label: 'Revenue flow' },
    });
    const radar = mount(RadarChart, {
      props: { store, viewId: 'radar', axes: ['revenue', 'margin'], series: 'segment', label: 'Segment radar' },
    });

    expect(waterfall.find('[role="img"]').attributes('aria-label')).toBe('Delta waterfall');
    expect(sankey.find('[role="img"]').attributes('aria-label')).toBe('Revenue flow');
    expect(radar.find('[role="img"]').attributes('aria-label')).toBe('Segment radar');
    expect(waterfall.findAll('.st-waterfallChart__bar')).toHaveLength(3);
    expect(sankey.findAll('.st-sankeyChart__link')).toHaveLength(3);
    expect(radar.findAll('.st-radarChart__polygon')).toHaveLength(2);
    expect(sankey.text()).toContain('Lead -> Qualified: 70');
    expect(radar.text()).toContain('Enterprise, Revenue: 70');
  });

  it('renders a Mekko chart from category and segment part-whole aggregates', () => {
    const store = newStore();
    const mekko = mount(MekkoChart, {
      props: {
        store,
        viewId: 'mekko',
        category: 'region',
        series: 'segment',
        measure: 'revenue',
        label: 'Revenue mekko',
      },
    });

    expect(mekko.find('[role="img"]').attributes('aria-label')).toBe('Revenue mekko');
    expect(mekko.findAll('.st-marimekkoChart__cell')).toHaveLength(4);
    expect(mekko.text()).toContain('North');
    expect(mekko.text()).toContain('South');
    expect(mekko.text()).toContain('North, Enterprise');
  });

  it('renders chord, rose and packed bubble charts from remaining part-whole core models', () => {
    const store = newStore();
    const chord = mount(ChordChart, {
      props: { store, viewId: 'chord', source: 'source', target: 'target', measure: 'revenue', label: 'Revenue chord' },
    });
    const rose = mount(RoseChart, {
      props: { store, viewId: 'rose', category: 'region', measure: 'revenue', label: 'Revenue rose' },
    });
    const packed = mount(PackedBubbleChart, {
      props: { store, viewId: 'packed', category: 'region', measure: 'revenue', label: 'Revenue packed' },
    });

    expect(chord.find('[role="img"]').attributes('aria-label')).toBe('Revenue chord');
    expect(rose.find('[role="img"]').attributes('aria-label')).toBe('Revenue rose');
    expect(packed.find('[role="img"]').attributes('aria-label')).toBe('Revenue packed');
    expect(chord.findAll('.st-chordDiagram__ribbon')).toHaveLength(3);
    expect(rose.findAll('.st-roseChart__sector')).toHaveLength(2);
    expect(packed.findAll('.st-packedBubblesChart__bubble')).toHaveLength(2);
    expect(chord.text()).toContain('Lead -> Qualified: 70');
    expect(rose.text()).toContain('North: 60');
    expect(packed.text()).toContain('South: 40');
  });

  it('rebuilds part-whole aggregates from this view cross-filter scope', async () => {
    const store = newStore();
    const w = mount(DonutChart, {
      props: { store, viewId: 'donut', category: 'region', measure: 'revenue', label: 'Revenue donut' },
    });

    expect(w.findAll('.st-donutChart__slice')).toHaveLength(2);
    store.setFilter('region', { kind: 'include', values: ['North'] });
    await nextTick();

    expect(w.findAll('.st-donutChart__slice')).toHaveLength(1);
    expect(w.text()).toContain('North: 60');
    expect(w.text()).not.toContain('South: 40');
  });

  it('renders no marks when part-whole fields are unknown', () => {
    const w = mount(DonutChart, {
      props: { store: newStore(), viewId: 'donut', category: 'missing', measure: 'revenue', label: 'Vide' },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Vide');
    expect(w.findAll('.st-donutChart__slice')).toHaveLength(0);
  });
});
