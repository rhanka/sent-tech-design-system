import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type DashboardObjectLayer, type Row } from '@sentropic/dataviz-core';
import { DataImage, ObjectLayerPanel, WebFrame } from './ObjectLayers.js';

const row: Row = { customer: 'Acme', slug: 'acme' };

const layers: DashboardObjectLayer[] = [
  { id: 'page', label: 'Page', kind: 'group' },
  { id: 'web', label: 'Help page', kind: 'iframe', parentId: 'page' },
  { id: 'logo', label: 'Customer logo', kind: 'image', parentId: 'page', visible: false },
];

describe('Object layers (react)', () => {
  it('renders iframe and data-driven image objects', () => {
    render(
      <>
        <WebFrame frame={{ src: 'https://example.com/embed', title: 'Embedded report' }} />
        <DataImage
          image={{ srcTemplate: 'https://cdn.example.com/{{slug}}.png', altTemplate: 'Logo {{customer}}' }}
          row={row}
        />
      </>,
    );

    expect(screen.getByTitle('Embedded report').getAttribute('src')).toBe('https://example.com/embed');
    expect(screen.getByAltText('Logo Acme').getAttribute('src')).toBe('https://cdn.example.com/acme.png');
  });

  it('renders an actionable layer panel around the core tree', () => {
    const onSelect = vi.fn();
    const onVisibilityChange = vi.fn();
    render(
      <ObjectLayerPanel
        layers={layers}
        selectedId="logo"
        label="Objects"
        onSelect={onSelect}
        onVisibilityChange={onVisibilityChange}
      />,
    );

    expect(screen.getByRole('group', { name: 'Objects' })).toBeTruthy();
    expect(screen.getByText('Page')).toBeTruthy();
    expect(screen.getByText('Help page')).toBeTruthy();
    expect(screen.getByText('Customer logo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Select Help page' }));
    expect(onSelect).toHaveBeenCalledWith(layers[1]);

    fireEvent.click(screen.getByRole('button', { name: 'Show Customer logo' }));
    expect(onVisibilityChange).toHaveBeenCalledWith(layers[2], true);
  });
});
