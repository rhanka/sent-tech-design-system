import { fireEvent, render, screen } from '@testing-library/react';
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

describe('FieldPane (react)', () => {
  it('renders the core field tree through DS TreeView', () => {
    render(<FieldPane model={model} />);

    expect(screen.getByText('Dimensions')).toBeTruthy();
    expect(screen.getByText('Measures')).toBeTruthy();
    expect(screen.getByText('Geo')).toBeTruthy();
    expect(screen.getByText('Pays')).toBeTruthy();
    expect(screen.getByText('Revenu')).toBeTruthy();
  });

  it('filters field groups with core field pane options', () => {
    render(<FieldPane model={model} includeDimensions={false} />);

    expect(screen.queryByText('Dimensions')).toBeNull();
    expect(screen.queryByText('Pays')).toBeNull();
    expect(screen.getByText('Measures')).toBeTruthy();
    expect(screen.getByText('Revenu')).toBeTruthy();
  });

  it('passes selectedId to the DS TreeView', () => {
    render(<FieldPane model={model} selectedId="measure:revenue" />);

    expect(
      screen
        .getByText('Revenu')
        .closest('.st-treeView__row')
        ?.classList.contains('st-treeView__row--selected'),
    ).toBe(true);
  });

  it('calls onSelect with the clicked field id for authoring', () => {
    const onSelect = vi.fn();
    render(<FieldPane model={model} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Pays'));

    expect(onSelect).toHaveBeenCalledWith('dimension:country');
  });
});
