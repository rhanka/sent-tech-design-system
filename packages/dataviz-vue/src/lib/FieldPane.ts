import { defineComponent, h, type PropType, type VNode } from 'vue';
import {
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-vue';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
  type FieldPaneNode,
} from '@sentropic/dataviz-core';

export type FieldPaneProps = {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  onSelect?: (id: FieldId | string) => void;
  label?: string;
  class?: string;
};

function renderInteractiveRows(
  nodes: FieldPaneNode[],
  expanded: ReadonlySet<string>,
  selectedId: FieldId | string | undefined,
  onSelect: (id: FieldId | string) => void,
): VNode[] {
  return nodes.map((node): VNode => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expanded.has(node.id);
    const rowClass = [
      'st-treeView__row',
      node.id === selectedId && 'st-treeView__row--selected',
      node.disabled && 'st-treeView__row--disabled',
    ];
    const rowChildren = [
      h(
        'span',
        {
          class: ['st-treeView__caret', !hasChildren && 'st-treeView__caret--leaf', isExpanded && 'st-treeView__caret--open'],
        },
        '\u203a',
      ),
      h('span', { class: 'st-treeView__label' }, node.label),
    ];
    const row =
      node.field && !node.disabled
        ? h(
            'button',
            {
              type: 'button',
              class: rowClass,
              role: 'treeitem',
              'aria-selected': node.id === selectedId,
              style:
                'appearance:none;background:transparent;border:0;color:inherit;font:inherit;padding:0;text-align:left;width:100%;',
              onClick: () => onSelect(node.id),
            },
            rowChildren,
          )
        : h(
            'div',
            {
              class: rowClass,
              role: 'treeitem',
              'aria-expanded': hasChildren ? isExpanded : undefined,
            },
            rowChildren,
          );

    return h('div', { key: node.id }, [
      row,
      hasChildren && isExpanded
        ? renderInteractiveRows(node.children!, expanded, selectedId, onSelect)
        : null,
    ]);
  });
}

export const FieldPane = defineComponent({
  name: 'FieldPane',
  props: {
    model: { type: Object as PropType<DataModel>, required: true },
    includeDimensions: { type: Boolean, default: undefined },
    includeMeasures: { type: Boolean, default: undefined },
    selectedId: { type: String as PropType<FieldId | string>, default: undefined },
    expandedIds: { type: Array as unknown as PropType<TreeViewProps['expandedIds']>, default: undefined },
    defaultExpandedIds: {
      type: Array as unknown as PropType<TreeViewProps['defaultExpandedIds']>,
      default: undefined,
    },
    onSelect: { type: Function as PropType<(id: FieldId | string) => void>, default: undefined },
    label: { type: String, default: 'Fields' },
    class: { type: String, default: undefined },
  },
  setup(props) {
    return () => {
      const tree = buildFieldPaneTree(props.model, {
        includeDimensions: props.includeDimensions,
        includeMeasures: props.includeMeasures,
      });

      if (props.onSelect) {
        const expanded = new Set(props.expandedIds ?? props.defaultExpandedIds ?? tree.defaultExpandedIds);
        return h(
          'div',
          {
            class: ['st-treeView', props.class],
            role: 'tree',
            'aria-label': props.label,
          },
          renderInteractiveRows(tree.nodes, expanded, props.selectedId, props.onSelect),
        );
      }

      return h(TreeView, {
        nodes: tree.nodes,
        selectedId: props.selectedId,
        expandedIds: props.expandedIds,
        defaultExpandedIds: props.defaultExpandedIds ?? tree.defaultExpandedIds,
        class: props.class,
        'aria-label': props.label,
      });
    };
  },
});
