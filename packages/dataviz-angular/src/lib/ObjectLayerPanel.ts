import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import {
  Button as DsButton,
  TreeView as DsTreeView,
  type TreeNode,
  type TreeViewProps,
} from '@sentropic/design-system-angular';
import {
  buildObjectLayerTree,
  isObjectLayerVisible,
  type DashboardObjectLayer,
} from '@sentropic/dataviz-core';

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

/**
 * Layer tree plus per-layer select / visibility actions, built by the core
 * `buildObjectLayerTree` / `isObjectLayerVisible` helpers and rendered with
 * the design-system TreeView and Button.
 *
 * tools/dataviz-angular-port refuses this shape: `ObjectLayerPanel` shares
 * the Vue `ObjectLayers.ts` file with `WebFrame`/`DataImage`, so the stem
 * carries no `ObjectLayerPanelProps` type alias — and its `setup()` is pure
 * prop derivation with no reactive state, hence no `void <state>.value`
 * marker either (see tools/dataviz-angular-port/README.md). This port
 * follows the React contract, which renders the DS TreeView unconditionally
 * (unlike the Vue variant, which hand-renders its own tree rows when
 * `onSelect` is set — the same contract decision lot 9 recorded for
 * `FieldPane`).
 *
 * Parity residue, measured not hidden: the Angular DS `Button` declares no
 * `aria-label` input (React/Vue forward it onto the `<button>`), so the
 * per-layer `Select <label>` / `Show|Hide <label>` labels have no Angular
 * counterpart. The buttons keep their variant, size, disabled state, click
 * handler and visible text; the run attributes the missing attributes to
 * the design system.
 */
@Component({
  selector: 'st-dataviz-object-layer-panel',
  standalone: true,
  imports: [DsButton, DsTreeView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="label" [class]="classInput">
      <st-tree-view
        [nodes]="nodes"
        [selectedId]="selectedId"
        [expandedIds]="expandedIds"
        [defaultExpandedIds]="effectiveDefaults"
        [label]="treeLabel"
      ></st-tree-view>
      <div>
        @for (layer of layers; track layer.id) {
          <div [attr.data-layer-id]="layer.id">
            <st-button
              type="button"
              [variant]="layer.id === selectedId ? 'primary' : 'secondary'"
              size="sm"
              (click)="select(layer)"
              >Select</st-button
            >
            <st-button
              type="button"
              variant="ghost"
              size="sm"
              [disabled]="layer.locked"
              (click)="toggleVisibility(layer)"
              >{{ layerVisibility(layer) ? 'Hide' : 'Show' }}</st-button
            >
          </div>
        }
      </div>
    </div>
  `,
})
export class ObjectLayerPanel implements OnInit, OnChanges {
  static readonly stComponentName = 'ObjectLayerPanel';

  @NgInput({ required: true }) layers: readonly DashboardObjectLayer[] = [];
  @NgInput() selectedId?: string;
  @NgInput() expandedIds?: TreeViewProps['expandedIds'];
  @NgInput() defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  @NgInput() label = 'Objects';
  @NgInput() onSelect?: (layer: DashboardObjectLayer) => void;
  @NgInput() onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  nodes: TreeNode[] = [];
  effectiveDefaults: string[] = [];
  treeLabel = 'Objects tree';

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  select(layer: DashboardObjectLayer): void {
    this.onSelect?.(layer);
  }

  toggleVisibility(layer: DashboardObjectLayer): void {
    this.onVisibilityChange?.(layer, !isObjectLayerVisible(layer));
  }

  layerVisibility(layer: DashboardObjectLayer): boolean {
    return isObjectLayerVisible(layer);
  }

  private recompute(): void {
    const tree = buildObjectLayerTree(this.layers ?? []);
    this.nodes = tree.nodes;
    this.effectiveDefaults = this.defaultExpandedIds ?? tree.defaultExpandedIds;
    this.treeLabel = `${this.label} tree`;
  }
}
