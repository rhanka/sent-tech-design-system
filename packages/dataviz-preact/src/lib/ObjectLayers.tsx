import type { IframeHTMLAttributes, ImgHTMLAttributes } from 'preact';
import {
  Button,
  TreeView,
  type TreeViewProps,
} from '@sentropic/design-system-preact';
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
import { classNames } from '../classNames.js';
import { useValue, type MaybeSignal } from '../signals.js';

export type WebFrameProps = Omit<
  IframeHTMLAttributes<HTMLIFrameElement>,
  'src' | 'title' | 'sandbox' | 'referrerPolicy' | 'loading' | 'allow'
> & {
  frame: WebFrameConfig;
};

export function WebFrame({ frame, className, ...rest }: WebFrameProps) {
  const resolved = resolveWebFrame(frame);
  const resolvedClassName = classNames(className);
  return (
    <iframe
      {...rest}
      className={resolvedClassName}
      src={resolved.src}
      title={resolved.title}
      sandbox={resolved.sandbox}
      referrerPolicy={resolved.referrerPolicy}
      loading={resolved.loading}
      allow={resolved.allow}
    />
  );
}

export type DataImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  image: DataImageConfig;
  row?: Row;
};

export function DataImage({ image, row, className, ...rest }: DataImageProps) {
  const resolved = resolveDataImage(image, row);
  const resolvedClassName = classNames(className);
  return <img {...rest} className={resolvedClassName} src={resolved.src} alt={resolved.alt} />;
}

export type ObjectLayerPanelProps = {
  layers: readonly DashboardObjectLayer[];
  selectedId?: MaybeSignal<string>;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
  onSelect?: (layer: DashboardObjectLayer) => void;
  onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
  className?: MaybeSignal<string>;
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
  const resolvedSelectedId = useValue(selectedId);
  const resolvedExpandedIds = useValue(expandedIds);
  const resolvedClassName = useValue(className);
  const tree = buildObjectLayerTree(layers);

  return (
    <div role="group" aria-label={label} className={resolvedClassName}>
      <TreeView
        nodes={tree.nodes}
        selectedId={resolvedSelectedId}
        expandedIds={resolvedExpandedIds}
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
                variant={layer.id === resolvedSelectedId ? 'primary' : 'secondary'}
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
