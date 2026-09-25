import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnChanges, OnInit } from '@angular/core';
import { VennChart as DsVennChart, type VennChartArea } from '@sentropic/design-system-angular';

export type VennChartProps = {
  areas: VennChartArea[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

/**
 * A design-system VennChart: a pure prop forward, no dashboard store involved.
 * tools/dataviz-angular-port refuses this shape for the opposite reason most of
 * lot 8's other refusals share: it has no local reactive state at all, so
 * `setup()` never has a `void <state>.value` marker to anchor on. The refusal
 * table's "stateful panels and filters" label (see
 * tools/dataviz-angular-port/README.md) is misleading here — this component is
 * the simplest one in the class precisely because it holds no state.
 */
@Component({
  selector: 'st-dataviz-venn-chart',
  standalone: true,
  imports: [DsVennChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-venn-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [class]="classInput"
    ></st-venn-chart>
  `,
})
export class VennChart implements OnInit, OnChanges {
  static readonly stComponentName = 'VennChart';

  @NgInput({ required: true }) areas!: VennChartArea[];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput({ required: true }) label!: string;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: VennChartArea[] = [];

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  private recompute(): void {
    this.data = this.areas;
  }
}
