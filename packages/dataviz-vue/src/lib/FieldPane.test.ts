import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { type DataModel } from '@sentropic/dataviz-core';
import { FieldPane } from './FieldPane.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete', folder: 'Geo' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenu', aggregation: 'sum', folder: 'Finance' }],
};

describe('FieldPane (vue)', () => {
  it('renders the core field tree through DS TreeView', () => {
    const wrapper = mount(FieldPane, { props: { model } });

    expect(wrapper.text()).toContain('Dimensions');
    expect(wrapper.text()).toContain('Measures');
    expect(wrapper.text()).toContain('Geo');
    expect(wrapper.text()).toContain('Pays');
    expect(wrapper.text()).toContain('Revenu');
  });

  it('filters field groups with core field pane options', () => {
    const wrapper = mount(FieldPane, { props: { model, includeDimensions: false } });

    expect(wrapper.text()).not.toContain('Dimensions');
    expect(wrapper.text()).not.toContain('Pays');
    expect(wrapper.text()).toContain('Measures');
    expect(wrapper.text()).toContain('Revenu');
  });

  it('passes selectedId to the DS TreeView', () => {
    const wrapper = mount(FieldPane, { props: { model, selectedId: 'measure:revenue' } });
    const selected = wrapper.find('.st-treeView__row--selected');

    expect(selected.exists()).toBe(true);
    expect(selected.text()).toContain('Revenu');
  });

  it('calls onSelect with the clicked field id for authoring', async () => {
    const onSelect = vi.fn();
    const wrapper = mount(FieldPane, { props: { model, onSelect } });
    const countryRow = wrapper.findAll('.st-treeView__row').find((row) => row.text().includes('Pays'));

    expect(countryRow).toBeTruthy();
    await countryRow!.trigger('click');

    expect(onSelect).toHaveBeenCalledWith('dimension:country');
  });
});
