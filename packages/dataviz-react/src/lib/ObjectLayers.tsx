import type React from 'react';
import {
  Button,
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-react';
import {
  buildObjectLayerTree,
  isObjectLayerVisible,
  resolveDataImage,
  resolveWebFrame,
  type DashboardObjectLayer,
  type DataImageConfig,
  type Row,
  type WebFrameConfig,
} from '@sentropic/dataviz-core';

export type WebFrameProps = Omit<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  'src' | 'title' | 'sandbox' | 'referrerPolicy' | 'loading' | 'allow'
> & {
  frame: WebFrameConfig;
};

export function WebFrame({ frame, ...rest }: WebFrameProps) {
  const resolved = resolveWebFrame(frame);
  return (
    <iframe
      {...rest}
      src={resolved.src}
      title={resolved.title}
      sandbox={resolved.sandbox}
      referrerPolicy={resolved.referrerPolicy}
      loading={resolved.loading}
      allow={resolved.allow}
    />
  );
}

export type DataImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  image: DataImageConfig;
  row?: Row;
};

export function DataImage({ image, row, ...rest }: DataImageProps) {
  const resolved = resolveDataImage(image, row);
  return <img {...rest} src={resolved.src} alt={resolved.alt} />;
}

export type ObjectLayerPanelProps = {
  layers: readonly DashboardObjectLayer[];
  selectedId?: string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
  onSelect?: (layer: DashboardObjectLayer) => void;
  onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
  className?: string;
};

export function ObjectLayerPanel({
  layers,
  selectedId,
  expandedIds,
  defaultExpandedIds,
  label = 'Objects',
  onSelect,
  onVisibilityChange,
  className,
}: ObjectLayerPanelProps) {
  const tree = buildObjectLayerTree(layers);

  return (
    <div role="group" aria-label={label} className={className}>
      <TreeView
        nodes={tree.nodes}
        selectedId={selectedId}
        expandedIds={expandedIds}
        defaultExpandedIds={defaultExpandedIds ?? tree.defaultExpandedIds}
        aria-label={`${label} tree`}
      />
      <div>
        {layers.map((layer) => {
          const visible = isObjectLayerVisible(layer);
          return (
            <div key={layer.id} data-layer-id={layer.id}>
              <Button
                type="button"
                variant={layer.id === selectedId ? 'primary' : 'secondary'}
                size="sm"
                aria-label={`Select ${layer.label}`}
                onClick={() => onSelect?.(layer)}
              >
                Select
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`${visible ? 'Hide' : 'Show'} ${layer.label}`}
                disabled={layer.locked}
                onClick={() => onVisibilityChange?.(layer, !visible)}
              >
                {visible ? 'Hide' : 'Show'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
