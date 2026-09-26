import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { TreeView, type TreeNode } from '@sentropic/design-system-angular';
import {
  buildFieldPaneTree,
  type DataModel,
  type FieldId,
} from '@sentropic/dataviz-core';

export type FieldPaneProps = {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onSelect?: (id: FieldId | string) => void;
  onChange?: (id: FieldId | string) => void;
  label?: string;
  class?: string;
};

/**
 * Field tree for a data model, built by `buildFieldPaneTree` and rendered
 * with the design-system TreeView. The selection callbacks mirror the React
 * contract (`onSelect` / `onChange` with the leaf id).
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` is pure prop
 * derivation with no reactive state, so there is no `void <state>.value`
 * marker to anchor on (see tools/dataviz-angular-port/README.md). This port
 * follows the single-TreeView React contract, not the Vue variant that
 * hand-renders its own tree rows when `onSelect` is set: the DS TreeView
 * already carries the selection, expansion and labelling inputs the binding
 * needs.
 */
@Component({
  selector: 'st-dataviz-field-pane',
  standalone: true,
  imports: [TreeView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-tree-view
      [nodes]="nodes"
      [selectedId]="selectedId"
      [expandedIds]="expandedIds"
      [defaultExpandedIds]="effectiveDefaults"
      [label]="label"
      [class]="classInput"
      (select)="handleSelect($event)"
      (selectedChange)="handleChange($event)"
    ></st-tree-view>
  `,
})
export class FieldPane implements OnInit, OnChanges {
  static readonly stComponentName = 'FieldPane';

  @NgInput({ required: true }) model!: DataModel;
  @NgInput() includeDimensions?: boolean;
  @NgInput() includeMeasures?: boolean;
  @NgInput() selectedId?: FieldId | string;
  @NgInput() expandedIds?: string[];
  @NgInput() defaultExpandedIds?: string[];
  @NgInput() onSelect?: (id: FieldId | string) => void;
  @NgInput() onChange?: (id: FieldId | string) => void;
  @NgInput() label = 'Fields';
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  nodes: TreeNode[] = [];
  effectiveDefaults: string[] = [];

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  handleSelect(id: string): void {
    this.onSelect?.(id);
  }

  handleChange(id: string): void {
    this.onChange?.(id);
  }

  private recompute(): void {
    if (!this.model) {
      this.nodes = [];
      this.effectiveDefaults = [];
      return;
    }
    const tree = buildFieldPaneTree(this.model, {
      includeDimensions: this.includeDimensions,
      includeMeasures: this.includeMeasures,
    });
    this.nodes = tree.nodes;
    this.effectiveDefaults = this.defaultExpandedIds ?? tree.defaultExpandedIds;
  }
}
