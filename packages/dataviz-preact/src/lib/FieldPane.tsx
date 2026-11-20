import {
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-preact';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
} from '@sentropic/dataviz-core';
import { useValue, type MaybeSignal } from '../signals.js';

export type FieldPaneProps = Omit<
  TreeViewProps,
  'nodes' | 'selectedId' | 'expandedIds' | 'defaultExpandedIds' | 'onSelect' | 'onChange'
> & {
  model: DataModel;
  includeDimensions?: MaybeSignal<boolean>;
  includeMeasures?: MaybeSignal<boolean>;
  selectedId?: MaybeSignal<FieldId | string>;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  onSelect?: (id: FieldId | string) => void;
  onChange?: (id: FieldId | string) => void;
  label?: string;
};

export function FieldPane({
  model,
  includeDimensions,
  includeMeasures,
  selectedId,
  expandedIds,
  defaultExpandedIds,
  onSelect,
  onChange,
  label = 'Fields',
  ...rest
}: FieldPaneProps) {
  const resolvedIncludeDimensions = useValue(includeDimensions);
  const resolvedIncludeMeasures = useValue(includeMeasures);
  const resolvedSelectedId = useValue(selectedId);
  const resolvedExpandedIds = useValue(expandedIds);

  const tree = buildFieldPaneTree(model, {
    includeDimensions: resolvedIncludeDimensions,
    includeMeasures: resolvedIncludeMeasures,
  });

  return (
    <TreeView
      {...rest}
      nodes={tree.nodes}
      selectedId={resolvedSelectedId}
      expandedIds={resolvedExpandedIds}
      defaultExpandedIds={defaultExpandedIds ?? tree.defaultExpandedIds}
      label={label}
      onSelect={onSelect}
      onChange={onChange}
    />
  );
}
