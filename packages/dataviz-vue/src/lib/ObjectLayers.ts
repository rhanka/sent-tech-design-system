import { defineComponent, h, type PropType } from 'vue';
import { Button, TreeView, type TreeViewProps } from '@sentropic/design-system-vue';
import {
  buildObjectLayerTree,
  isObjectLayerVisible,
  resolveDataImage,
  type DashboardObjectLayer,
  type DataImageConfig,
  type Row,
} from '@sentropic/dataviz-core';

export { WebFrame } from '@sentropic/design-system-vue';
export type { WebFrameProps } from '@sentropic/design-system-vue';

export type DataImageProps = {
  image: DataImageConfig;
  row?: Row;
  class?: string;
};

export const DataImage = defineComponent({
  name: 'DataImage',
  props: {
    image: { type: Object as PropType<DataImageConfig>, required: true },
    row: { type: Object as PropType<Row>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const resolved = resolveDataImage(props.image, props.row);
      return h('img', { src: resolved.src, alt: resolved.alt, class: props.class });
    };
  },
});

export type ObjectLayerPanelProps = {
  layers: readonly DashboardObjectLayer[];
  selectedId?: string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
  onSelect?: (layer: DashboardObjectLayer) => void;
  onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
  class?: string;
};

export const ObjectLayerPanel = defineComponent({
  name: 'ObjectLayerPanel',
  props: {
    layers: { type: Array as unknown as PropType<readonly DashboardObjectLayer[]>, required: true },
    selectedId: { type: String, default: undefined },
    expandedIds: { type: Array as unknown as PropType<TreeViewProps['expandedIds']>, default: undefined },
    defaultExpandedIds: {
      type: Array as unknown as PropType<TreeViewProps['defaultExpandedIds']>,
      default: undefined,
    },
    label: { type: String, default: 'Objects' },
    onSelect: {
      type: Function as PropType<(layer: DashboardObjectLayer) => void>,
      default: undefined,
    },
    onVisibilityChange: {
      type: Function as PropType<(layer: DashboardObjectLayer, visible: boolean) => void>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const tree = buildObjectLayerTree(props.layers);
      return h('div', { role: 'group', 'aria-label': props.label, class: props.class }, [
        h(TreeView, {
          nodes: tree.nodes,
          selectedId: props.selectedId,
          expandedIds: props.expandedIds,
          defaultExpandedIds: props.defaultExpandedIds ?? tree.defaultExpandedIds,
          'aria-label': `${props.label} tree`,
        }),
        h(
          'div',
          props.layers.map((layer) => {
            const visible = isObjectLayerVisible(layer);
            return h('div', { key: layer.id, 'data-layer-id': layer.id }, [
              h(
                Button,
                {
                  type: 'button',
                  variant: layer.id === props.selectedId ? 'primary' : 'secondary',
                  size: 'sm',
                  'aria-label': `Select ${layer.label}`,
                  onClick: () => props.onSelect?.(layer),
                },
                { default: () => 'Select' },
              ),
              h(
                Button,
                {
                  type: 'button',
                  variant: 'ghost',
                  size: 'sm',
                  'aria-label': `${visible ? 'Hide' : 'Show'} ${layer.label}`,
                  disabled: layer.locked,
                  onClick: () => props.onVisibilityChange?.(layer, !visible),
                },
                { default: () => (visible ? 'Hide' : 'Show') },
              ),
            ]);
          }),
        ),
      ]);
    };
  },
});
