import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { type DashboardObjectLayer, type Row } from '@sentropic/dataviz-core';
import DataImage from './DataImage.svelte';
import ObjectLayerPanel from './ObjectLayerPanel.svelte';
import WebFrame from './WebFrame.svelte';

const row: Row = { customer: 'Acme', slug: 'acme' };

const layers: DashboardObjectLayer[] = [
  { id: 'page', label: 'Page', kind: 'group' },
  { id: 'web', label: 'Help page', kind: 'iframe', parentId: 'page' },
  { id: 'logo', label: 'Customer logo', kind: 'image', parentId: 'page', visible: false },
];

describe('Object layers (svelte)', () => {
  it('renders iframe and data-driven image objects', () => {
    render(WebFrame, { props: { frame: { src: 'https://example.com/embed', title: 'Embedded report' } } });
    render(DataImage, {
      props: {
        image: { srcTemplate: 'https://cdn.example.com/{{slug}}.png', altTemplate: 'Logo {{customer}}' },
        row,
      },
    });

    expect(screen.getByTitle('Embedded report').getAttribute('src')).toBe('https://example.com/embed');
    expect(screen.getByAltText('Logo Acme').getAttribute('src')).toBe('https://cdn.example.com/acme.png');
  });

  it('renders an actionable layer panel around the core tree', async () => {
    const onSelect = vi.fn();
    const onVisibilityChange = vi.fn();
    render(ObjectLayerPanel, {
      props: {
        layers,
        selectedId: 'logo',
        label: 'Objects',
        onSelect,
        onVisibilityChange,
      },
    });

    expect(screen.getByRole('group', { name: 'Objects' })).toBeTruthy();
    expect(screen.getByText('Page')).toBeTruthy();
    expect(screen.getByText('Help page')).toBeTruthy();
    expect(screen.getByText('Customer logo')).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: 'Select Help page' }));
    expect(onSelect).toHaveBeenCalledWith(layers[1]);

    await fireEvent.click(screen.getByRole('button', { name: 'Show Customer logo' }));
    expect(onVisibilityChange).toHaveBeenCalledWith(layers[2], true);
  });
});
