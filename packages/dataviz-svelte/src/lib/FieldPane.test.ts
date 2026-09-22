import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { type DataModel } from '@sentropic/dataviz-core';
import FieldPane from './FieldPane.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete', folder: 'Geo' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenu', aggregation: 'sum', folder: 'Finance' }],
};

describe('FieldPane (svelte)', () => {
  it('renders the core field tree through DS TreeView', () => {
    const { getByText } = render(FieldPane, { props: { model } });

    expect(getByText('Dimensions')).toBeTruthy();
    expect(getByText('Measures')).toBeTruthy();
    expect(getByText('Geo')).toBeTruthy();
    expect(getByText('Pays')).toBeTruthy();
    expect(getByText('Revenu')).toBeTruthy();
  });

  it('filters field groups with core field pane options', () => {
    const { queryByText, getByText } = render(FieldPane, {
      props: { model, includeDimensions: false },
    });

    expect(queryByText('Dimensions')).toBeNull();
    expect(queryByText('Pays')).toBeNull();
    expect(getByText('Measures')).toBeTruthy();
    expect(getByText('Revenu')).toBeTruthy();
  });

  it('passes selectedId to the DS TreeView', () => {
    const { getByText } = render(FieldPane, { props: { model, selectedId: 'measure:revenue' } });

    expect(
      getByText('Revenu')
        .closest('.st-treeView__row')
        ?.classList.contains('st-treeView__row--selected'),
    ).toBe(true);
  });

  it('calls onSelect with the clicked field id for authoring', async () => {
    const onSelect = vi.fn();
    const { getByText } = render(FieldPane, { props: { model, onSelect } });

    await fireEvent.click(getByText('Pays'));

    expect(onSelect).toHaveBeenCalledWith('dimension:country');
  });
});
