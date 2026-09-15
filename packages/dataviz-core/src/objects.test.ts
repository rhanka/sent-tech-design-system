import { describe, expect, it } from 'vitest';
import {
  buildObjectLayerTree,
  createObjectLayerPanelState,
  resolveDataImage,
  resolveWebFrame,
  selectObjectLayer,
  toggleObjectLayerVisibility,
  type DashboardObjectLayer,
  type Row,
} from './index.js';

const layers: DashboardObjectLayer[] = [
  { id: 'page', label: 'Page', kind: 'group' },
  {
    id: 'web',
    label: 'Help page',
    kind: 'iframe',
    parentId: 'page',
    iframe: { src: 'https://example.com/help', title: 'Help' },
  },
  {
    id: 'logo',
    label: 'Customer logo',
    kind: 'image',
    parentId: 'page',
    visible: false,
    image: { srcField: 'logo_url', altTemplate: 'Logo {{customer}}' },
  },
];

describe('dashboard objects and layers', () => {
  it('builds a TreeView-compatible object hierarchy with expansion ids', () => {
    const tree = buildObjectLayerTree(layers);

    expect(tree.defaultExpandedIds).toEqual(['page']);
    expect(tree.nodes).toEqual([
      {
        id: 'page',
        label: 'Page',
        children: [
          { id: 'web', label: 'Help page' },
          { id: 'logo', label: 'Customer logo', disabled: true },
        ],
      },
    ]);
  });

  it('updates object layer panel state immutably', () => {
    const state = createObjectLayerPanelState(layers, 'web');
    const selected = selectObjectLayer(state, 'logo');
    const visible = toggleObjectLayerVisibility(selected, 'logo');

    expect(selected.selectedId).toBe('logo');
    expect(visible.layers.find((layer) => layer.id === 'logo')?.visible).toBe(true);
    expect(state.layers.find((layer) => layer.id === 'logo')?.visible).toBe(false);
  });

  it('resolves iframe defaults and joins sandbox tokens', () => {
    expect(
      resolveWebFrame({
        src: 'https://example.com/embed',
        sandbox: ['allow-scripts', 'allow-same-origin'],
      }),
    ).toEqual({
      src: 'https://example.com/embed',
      title: 'Embedded page',
      sandbox: 'allow-scripts allow-same-origin',
      referrerPolicy: 'strict-origin-when-cross-origin',
      loading: 'lazy',
    });
  });

  it('resolves data-driven image source and alternate text from rows', () => {
    const row: Row = {
      customer: 'Acme',
      slug: 'acme',
      logo_url: 'https://cdn.example.com/acme.png',
    };

    expect(
      resolveDataImage(
        {
          srcTemplate: 'https://assets.example.com/{{slug}}.png',
          altTemplate: 'Logo {{customer}}',
          fallbackSrc: 'https://assets.example.com/fallback.png',
        },
        row,
      ),
    ).toEqual({
      src: 'https://assets.example.com/acme.png',
      alt: 'Logo Acme',
    });

    expect(resolveDataImage({ srcField: 'missing', fallbackSrc: '/fallback.png' }, row)).toEqual({
      src: '/fallback.png',
      alt: '',
    });
  });
});
