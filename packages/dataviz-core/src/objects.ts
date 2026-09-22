import type { Row } from './model.js';

export type DashboardObjectLayerKind = 'group' | 'iframe' | 'image' | 'chart' | 'shape' | 'text';

export type WebFrameLoading = 'eager' | 'lazy';

export type WebFrameReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export type WebFrameSandboxToken =
  | 'allow-downloads'
  | 'allow-forms'
  | 'allow-modals'
  | 'allow-orientation-lock'
  | 'allow-pointer-lock'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-presentation'
  | 'allow-same-origin'
  | 'allow-scripts'
  | 'allow-storage-access-by-user-activation'
  | 'allow-top-navigation'
  | 'allow-top-navigation-by-user-activation';

export interface WebFrameConfig {
  src: string;
  title?: string;
  sandbox?: readonly WebFrameSandboxToken[] | string;
  referrerPolicy?: WebFrameReferrerPolicy;
  loading?: WebFrameLoading;
  allow?: string;
}

export interface ResolvedWebFrame {
  src: string;
  title: string;
  sandbox?: string;
  referrerPolicy: WebFrameReferrerPolicy;
  loading: WebFrameLoading;
  allow?: string;
}

export interface DataImageConfig {
  src?: string;
  srcField?: string;
  srcTemplate?: string;
  fallbackSrc?: string;
  alt?: string;
  altField?: string;
  altTemplate?: string;
}

export interface ResolvedDataImage {
  src: string;
  alt: string;
}

export interface DashboardObjectLayer {
  id: string;
  label: string;
  kind: DashboardObjectLayerKind;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
  order?: number;
  iframe?: WebFrameConfig;
  image?: DataImageConfig;
}

export interface ObjectLayerTreeNode {
  id: string;
  label: string;
  children?: ObjectLayerTreeNode[];
  disabled?: boolean;
}

export interface ObjectLayerTree {
  nodes: ObjectLayerTreeNode[];
  defaultExpandedIds: string[];
}

export interface ObjectLayerPanelState {
  layers: DashboardObjectLayer[];
  selectedId?: string;
}

const TEMPLATE_TOKEN_RE = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;

function cellToString(value: Row[string] | undefined): string {
  if (value === undefined || value === null) return '';
  return String(value);
}

function resolveTemplate(template: string | undefined, row: Row | undefined): string | undefined {
  if (!template) return undefined;
  return template.replace(TEMPLATE_TOKEN_RE, (_match, field: string) => cellToString(row?.[field]));
}

function resolveField(field: string | undefined, row: Row | undefined): string | undefined {
  if (!field || !row || !(field in row)) return undefined;
  const value = cellToString(row[field]);
  return value.length > 0 ? value : undefined;
}

function cloneLayer(layer: DashboardObjectLayer): DashboardObjectLayer {
  const next: DashboardObjectLayer = { ...layer };
  if (layer.iframe) next.iframe = { ...layer.iframe };
  if (layer.image) next.image = { ...layer.image };
  return next;
}

function orderedLayers(layers: readonly DashboardObjectLayer[]): DashboardObjectLayer[] {
  return layers
    .map((layer, index) => ({ layer, index }))
    .sort((a, b) => (a.layer.order ?? a.index) - (b.layer.order ?? b.index))
    .map(({ layer }) => cloneLayer(layer));
}

export function isObjectLayerVisible(layer: DashboardObjectLayer): boolean {
  return layer.visible !== false;
}

export function buildObjectLayerTree(layers: readonly DashboardObjectLayer[]): ObjectLayerTree {
  const sorted = orderedLayers(layers);
  const byParent = new Map<string | undefined, DashboardObjectLayer[]>();
  const ids = new Set(sorted.map((layer) => layer.id));

  for (const layer of sorted) {
    const parentId = layer.parentId && ids.has(layer.parentId) ? layer.parentId : undefined;
    const siblings = byParent.get(parentId) ?? [];
    siblings.push(layer);
    byParent.set(parentId, siblings);
  }

  const defaultExpandedIds: string[] = [];

  const toNode = (layer: DashboardObjectLayer): ObjectLayerTreeNode => {
    const children = byParent.get(layer.id)?.map(toNode);
    const node: ObjectLayerTreeNode = {
      id: layer.id,
      label: layer.label,
    };
    if (children && children.length > 0) {
      node.children = children;
      defaultExpandedIds.push(layer.id);
    }
    if (!isObjectLayerVisible(layer)) node.disabled = true;
    return node;
  };

  return {
    nodes: (byParent.get(undefined) ?? []).map(toNode),
    defaultExpandedIds,
  };
}

export function createObjectLayerPanelState(
  layers: readonly DashboardObjectLayer[],
  selectedId?: string,
): ObjectLayerPanelState {
  const nextLayers = orderedLayers(layers);
  const selectedLayer = selectedId
    ? nextLayers.find((layer) => layer.id === selectedId)
    : nextLayers.find((layer) => layer.kind !== 'group');
  return {
    layers: nextLayers,
    selectedId: selectedLayer?.id,
  };
}

export function selectObjectLayer(
  state: ObjectLayerPanelState,
  selectedId: string,
): ObjectLayerPanelState {
  const layers = state.layers.map(cloneLayer);
  const selectedLayer = layers.find((layer) => layer.id === selectedId);
  return {
    layers,
    selectedId: selectedLayer?.id ?? state.selectedId,
  };
}

export function setObjectLayerVisibility(
  state: ObjectLayerPanelState,
  layerId: string,
  visible: boolean,
): ObjectLayerPanelState {
  return {
    layers: state.layers.map((layer) =>
      layer.id === layerId ? { ...cloneLayer(layer), visible } : cloneLayer(layer),
    ),
    selectedId: state.selectedId,
  };
}

export function toggleObjectLayerVisibility(
  state: ObjectLayerPanelState,
  layerId: string,
  visible?: boolean,
): ObjectLayerPanelState {
  const layer = state.layers.find((candidate) => candidate.id === layerId);
  if (!layer) return { layers: state.layers.map(cloneLayer), selectedId: state.selectedId };
  return setObjectLayerVisibility(state, layerId, visible ?? !isObjectLayerVisible(layer));
}

export function resolveWebFrame(config: WebFrameConfig): ResolvedWebFrame {
  const sandbox =
    typeof config.sandbox === 'string' ? config.sandbox : config.sandbox?.join(' ');
  const frame: ResolvedWebFrame = {
    src: config.src,
    title: config.title ?? 'Embedded page',
    referrerPolicy: config.referrerPolicy ?? 'strict-origin-when-cross-origin',
    loading: config.loading ?? 'lazy',
  };
  if (sandbox !== undefined) frame.sandbox = sandbox;
  if (config.allow !== undefined) frame.allow = config.allow;
  return frame;
}

export function resolveDataImage(config: DataImageConfig, row?: Row): ResolvedDataImage {
  const src =
    resolveTemplate(config.srcTemplate, row) ??
    resolveField(config.srcField, row) ??
    config.src ??
    config.fallbackSrc ??
    '';
  const alt =
    resolveTemplate(config.altTemplate, row) ??
    resolveField(config.altField, row) ??
    config.alt ??
    '';
  return { src: src.length > 0 ? src : config.fallbackSrc ?? '', alt };
}
