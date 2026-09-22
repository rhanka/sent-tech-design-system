import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { DashboardFilterBar } from './DashboardFilterBar.js';

describe('DashboardFilterBar (vue)', () => {
  it('renders a search input for query-search control', () => {
    const w = mount(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'query-search', label: 'Recherche', fields: ['source'] }],
      },
    });
    expect(w.find('input[type="search"], input.st-search__input, [role="search"] input').exists()).toBe(true);
  });

  it('renders a date picker for date-range control', () => {
    const w = mount(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'date-range', label: 'Période' }],
      },
    });
    expect(w.text()).toContain('Période');
  });

  it('renders a select with presets for relative-date control', () => {
    const presets = [
      { label: 'Dernière heure', from: '-1h', to: 'now' },
      { label: 'Dernier jour', from: '-1d', to: 'now' },
    ];
    const w = mount(DashboardFilterBar, {
      props: {
        controls: [{ kind: 'relative-date', label: 'Période relative', presets }],
      },
    });
    expect(w.text()).toContain('Période relative');
    expect(w.text()).toContain('Dernière heure');
    expect(w.text()).toContain('Dernier jour');
  });

  it('renders FilterPill chips when chips=true and activeFilters provided', () => {
    const activeFilters = [
      { field: 'severity', operator: 'eq' as const, value: 'error', label: 'Sévérité' },
    ];
    const w = mount(DashboardFilterBar, {
      props: { controls: [], chips: true, activeFilters },
    });
    expect(w.text()).toContain('Sévérité');
    expect(w.text()).toContain('error');
  });

  it('renders export button when export config provided', () => {
    const onExport = vi.fn();
    const exportConfig = {
      label: 'Exporter CSV',
      fields: ['time', 'source'],
      filenameTemplate: '{tenant}-logs.csv',
    };
    const w = mount(DashboardFilterBar, {
      props: { controls: [], export: exportConfig, onExport },
    });
    expect(w.text()).toContain('Exporter CSV');
  });
});
