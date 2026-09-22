import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DashboardFilterBar from './DashboardFilterBar.svelte';

describe('DashboardFilterBar (svelte)', () => {
  it('renders a search input for query-search control', () => {
    render(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'query-search', label: 'Recherche', fields: ['source'] }],
      },
    });
    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('renders a date picker label for date-range control', () => {
    render(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'date-range', label: 'Période' }],
      },
    });
    expect(screen.getByText('Période')).toBeTruthy();
  });

  it('renders a select with presets for relative-date control', () => {
    const presets = [
      { label: 'Dernière heure', from: '-1h', to: 'now' },
      { label: 'Dernier jour', from: '-1d', to: 'now' },
    ];
    render(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'relative-date', label: 'Période relative', presets }],
      },
    });
    expect(screen.getByText('Période relative')).toBeTruthy();
    expect(screen.getByText('Dernière heure')).toBeTruthy();
    expect(screen.getByText('Dernier jour')).toBeTruthy();
  });

  it('renders FilterPill chips when chips=true and activeFilters provided', () => {
    const activeFilters = [
      { field: 'severity', operator: 'eq' as const, value: 'error', label: 'Sévérité' },
    ];
    render(DashboardFilterBar, {
      props: { controls: [], chips: true, activeFilters },
    });
    expect(screen.getByText('Sévérité')).toBeTruthy();
    expect(screen.getByText('error')).toBeTruthy();
  });

  it('renders export button when export config provided', () => {
    const onExport = vi.fn();
    const exportConfig = {
      label: 'Exporter CSV',
      fields: ['time', 'source'],
      filenameTemplate: '{tenant}-logs.csv',
    };
    render(DashboardFilterBar, {
      props: { controls: [], export: exportConfig, onExport },
    });
    expect(screen.getByRole('button', { name: 'Exporter CSV' })).toBeTruthy();
  });
});
