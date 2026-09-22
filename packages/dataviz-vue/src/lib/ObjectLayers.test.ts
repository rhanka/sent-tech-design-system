import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { type DashboardObjectLayer, type Row } from '@sentropic/dataviz-core';
import { DataImage, ObjectLayerPanel, WebFrame } from './ObjectLayers.js';

const row: Row = { customer: 'Acme', slug: 'acme' };

const layers: DashboardObjectLayer[] = [
  { id: 'page', label: 'Page', kind: 'group' },
  { id: 'web', label: 'Help page', kind: 'iframe', parentId: 'page' },
  { id: 'logo', label: 'Customer logo', kind: 'image', parentId: 'page', visible: false },
];

describe('Object layers (vue)', () => {
  it('renders iframe and data-driven image objects', () => {
    const web = mount(WebFrame, {
      props: { frame: { src: 'https://example.com/embed', title: 'Embedded report' } },
    });
    const image = mount(DataImage, {
      props: {
        image: { srcTemplate: 'https://cdn.example.com/{{slug}}.png', altTemplate: 'Logo {{customer}}' },
        row,
      },
    });

    expect(web.find('iframe').attributes('src')).toBe('https://example.com/embed');
    expect(web.find('iframe').attributes('title')).toBe('Embedded report');
    expect(image.find('img').attributes('src')).toBe('https://cdn.example.com/acme.png');
    expect(image.find('img').attributes('alt')).toBe('Logo Acme');
  });

  it('renders an actionable layer panel around the core tree', async () => {
    const onSelect = vi.fn();
    const onVisibilityChange = vi.fn();
    const wrapper = mount(ObjectLayerPanel, {
      props: {
        layers,
        selectedId: 'logo',
        label: 'Objects',
        onSelect,
        onVisibilityChange,
      },
    });

    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('Objects');
    expect(wrapper.text()).toContain('Page');
    expect(wrapper.text()).toContain('Help page');
    expect(wrapper.text()).toContain('Customer logo');

    await wrapper.find('button[aria-label="Select Help page"]').trigger('click');
    expect(onSelect).toHaveBeenCalledWith(layers[1]);

    await wrapper.find('button[aria-label="Show Customer logo"]').trigger('click');
    expect(onVisibilityChange).toHaveBeenCalledWith(layers[2], true);
  });
});
