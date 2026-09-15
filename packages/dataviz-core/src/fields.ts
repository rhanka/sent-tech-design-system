/**
 * Field-pane view models.
 *
 * The core owns BI semantics (dimension/measure, folders, hierarchies, stable
 * field ids). Framework packages can render these models with DS primitives
 * such as TreeView and Tag without duplicating field logic.
 */

import type { Aggregation, DataModel, DimensionType } from './model.js';

export type FieldKind = 'dimension' | 'measure';
export type FieldId = `${FieldKind}:${string}`;
export type FieldPillTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface FieldDescriptor {
  id: FieldId;
  sourceId: string;
  kind: FieldKind;
  label: string;
  folder?: string;
  role: DimensionType | Aggregation;
  type?: DimensionType;
  aggregation?: Aggregation;
  hierarchy?: string[];
}

export interface FieldPaneNode {
  id: string;
  label: string;
  children?: FieldPaneNode[];
  disabled?: boolean;
  field?: FieldDescriptor;
}

export interface FieldPaneTree {
  nodes: FieldPaneNode[];
  defaultExpandedIds: string[];
}

export interface FieldPaneOptions {
  includeDimensions?: boolean;
  includeMeasures?: boolean;
}

export interface FieldPillModel {
  id: FieldId;
  label: string;
  detail: string;
  kind: FieldKind;
  tone: FieldPillTone;
}

export function fieldId(kind: FieldKind, sourceId: string): FieldId {
  return `${kind}:${sourceId}` as FieldId;
}

export function parseFieldId(id: string): { kind: FieldKind; sourceId: string } | undefined {
  const separator = id.indexOf(':');
  if (separator <= 0 || separator === id.length - 1) return undefined;
  const kind = id.slice(0, separator);
  if (kind !== 'dimension' && kind !== 'measure') return undefined;
  return { kind, sourceId: id.slice(separator + 1) };
}

export function listFields(model: DataModel): FieldDescriptor[] {
  const dimensions = model.dimensions.map((dimension) => {
    const field: FieldDescriptor = {
      id: fieldId('dimension', dimension.id),
      sourceId: dimension.id,
      kind: 'dimension',
      label: dimension.label,
      role: dimension.type,
      type: dimension.type,
    };
    if (dimension.folder !== undefined) field.folder = dimension.folder;
    if (dimension.hierarchy !== undefined) field.hierarchy = [...dimension.hierarchy];
    return field;
  });

  const measures = model.measures.map((measure) => {
    const field: FieldDescriptor = {
      id: fieldId('measure', measure.id),
      sourceId: measure.id,
      kind: 'measure',
      label: measure.label,
      role: measure.aggregation,
      aggregation: measure.aggregation,
    };
    if (measure.folder !== undefined) field.folder = measure.folder;
    return field;
  });

  return [...dimensions, ...measures];
}

function folderNodeId(kind: FieldKind, folder: string): string {
  return `folder:${kind}:${folder}`;
}

function groupNode(
  id: string,
  label: string,
  kind: FieldKind,
  fields: FieldDescriptor[],
  defaultExpandedIds: string[],
): FieldPaneNode {
  defaultExpandedIds.push(id);
  const children: FieldPaneNode[] = [];
  const folders = new Map<string, FieldPaneNode>();

  for (const field of fields) {
    const leaf: FieldPaneNode = { id: field.id, label: field.label, field };
    if (!field.folder) {
      children.push(leaf);
      continue;
    }

    let folder = folders.get(field.folder);
    if (!folder) {
      folder = { id: folderNodeId(kind, field.folder), label: field.folder, children: [] };
      folders.set(field.folder, folder);
      children.push(folder);
      defaultExpandedIds.push(folder.id);
    }
    folder.children!.push(leaf);
  }

  return { id, label, children };
}

export function buildFieldPaneTree(
  model: DataModel,
  options: FieldPaneOptions = {},
): FieldPaneTree {
  const includeDimensions = options.includeDimensions ?? true;
  const includeMeasures = options.includeMeasures ?? true;
  const fields = listFields(model);
  const defaultExpandedIds: string[] = [];
  const nodes: FieldPaneNode[] = [];

  if (includeDimensions) {
    nodes.push(
      groupNode(
        'group:dimensions',
        'Dimensions',
        'dimension',
        fields.filter((field) => field.kind === 'dimension'),
        defaultExpandedIds,
      ),
    );
  }

  if (includeMeasures) {
    nodes.push(
      groupNode(
        'group:measures',
        'Measures',
        'measure',
        fields.filter((field) => field.kind === 'measure'),
        defaultExpandedIds,
      ),
    );
  }

  return { nodes, defaultExpandedIds };
}

export function fieldToPill(field: FieldDescriptor): FieldPillModel {
  if (field.kind === 'measure') {
    return {
      id: field.id,
      label: field.label,
      detail: `${field.aggregation} measure`,
      kind: field.kind,
      tone: 'success',
    };
  }

  const isContinuous = field.type === 'continuous';
  return {
    id: field.id,
    label: field.label,
    detail: isContinuous ? 'Continuous dimension' : 'Discrete dimension',
    kind: field.kind,
    tone: isContinuous ? 'warning' : 'info',
  };
}
