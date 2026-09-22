import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardFilterBar } from './DashboardFilterBar.js';

describe('DashboardFilterBar (react)', () => {
  it('renders a Search for query-search control', () => {
    render(
      <DashboardFilterBar
        controls={[{ kind: 'query-search', label: 'Recherche', fields: ['source', 'severity'] }]}
      />,
    );
    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('renders a DatePicker for date-range control', () => {
    render(
      <DashboardFilterBar
        controls={[{ kind: 'date-range', label: 'Période' }]}
      />,
    );
    expect(screen.getByText('Période')).toBeTruthy();
  });

  it('renders a Select with presets for relative-date control', () => {
    const presets = [
      { label: 'Dernière heure', from: '-1h', to: 'now' },
      { label: 'Dernier jour', from: '-1d', to: 'now' },
    ];
    render(
      <DashboardFilterBar
        controls={[{ kind: 'relative-date', label: 'Période relative', presets }]}
      />,
    );
    expect(screen.getByText('Période relative')).toBeTruthy();
    expect(screen.getByText('Dernière heure')).toBeTruthy();
    expect(screen.getByText('Dernier jour')).toBeTruthy();
  });

  it('calls onQueryChange when Search changes', () => {
    const onQueryChange = vi.fn();
    render(
      <DashboardFilterBar
        controls={[{ kind: 'query-search', label: 'Recherche', fields: ['source'] }]}
        onQueryChange={onQueryChange}
      />,
    );
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'error' } });
    expect(onQueryChange).toHaveBeenCalledWith('error');
  });

  it('renders FilterPill chips when chips=true and activeFilters provided', () => {
    const activeFilters = [
      { field: 'severity', operator: 'eq' as const, value: 'error', label: 'Sévérité' },
    ];
    render(
      <DashboardFilterBar
        controls={[]}
        chips
        activeFilters={activeFilters}
      />,
    );
    expect(screen.getByText('Sévérité')).toBeTruthy();
    expect(screen.getByText('error')).toBeTruthy();
  });

  it('renders export button when export config provided', () => {
    const onExport = vi.fn();
    const exportConfig = { label: 'Exporter CSV', fields: ['time', 'source'], filenameTemplate: '{tenant}-logs.csv' };
    render(
      <DashboardFilterBar
        controls={[]}
        export={exportConfig}
        onExport={onExport}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Exporter CSV' });
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onExport).toHaveBeenCalledWith(exportConfig);
  });
});
