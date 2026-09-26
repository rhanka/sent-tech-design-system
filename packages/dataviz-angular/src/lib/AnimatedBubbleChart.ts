import { ChangeDetectionStrategy, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ScatterPlot as DsScatterPlot, type ScatterPlotDatum } from '@sentropic/design-system-angular';
import { buildBubbleFrame, distinctSorted, type DashboardStore } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';

export type AnimatedBubbleChartProps = {
  /** Dashboard store (provides rows + model). */
  store: DashboardStore;
  /** View id for the cross-filter graph. */
  viewId: string;
  /** Measure id mapped to x-axis. */
  x: string;
  /** Measure id mapped to y-axis. */
  y: string;
  /** Measure id whose value scales the bubble radius. */
  size: string;
  /** Dimension (or measure) whose distinct values define the time steps. */
  time: string;
  /** Optional dimension whose values drive categorical tones + labels. */
  series?: string;
  /** Accessible label for the chart. */
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

/**
 * A bubble chart animated over sorted time steps, with native play/pause and
 * time-step controls beside the design-system ScatterPlot.
 *
 * tools/dataviz-angular-port refuses this shape: `setup()` holds local
 * animation state (`stepIndex`/`playing` refs) plus an interval timer and
 * renders several siblings (chart + control group), not one terminal `h()`
 * over a derived value (see tools/dataviz-angular-port/README.md). The
 * derivation itself is the shared core engine (`distinctSorted` /
 * `buildBubbleFrame`), reused never re-derived per PATTERN.md §3.
 *
 * The initial render is the comparable one: `playing` starts `false` and
 * `stepIndex` at `0`, so the first frame (timer started only by the play
 * button, cleared in `ngOnDestroy`) is exactly the SSR first frame the
 * parity harness compares against React.
 *
 * Layout follows the sources with native elements only — like Vue/React, the
 * controls are a plain button, range input and live region, not DS
 * components. The adapter-pattern guard forbids literal `style` attributes
 * in adapter sources, so the five Vue/React inline-style declarations have
 * no Angular counterpart; the parity run measures that residue instead of
 * hiding it.
 */
@Component({
  selector: 'st-dataviz-animated-bubble-chart',
  standalone: true,
  imports: [DsScatterPlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="rootClass">
      <st-scatter-plot
        [data]="data"
        [xLabel]="xLabel"
        [yLabel]="yLabel"
        [width]="width"
        [height]="height"
        [label]="label"
      ></st-scatter-plot>
      <div role="group" aria-label="Contrôle temporel">
        <button type="button" [attr.aria-label]="playing ? 'Pause' : 'Lecture'" (click)="togglePlay()">
          {{ playing ? '⏸' : '▶' }}
        </button>
        <input
          type="range"
          min="0"
          [max]="maxStep"
          [value]="safeIndex"
          aria-label="Pas de temps"
          [attr.aria-valuetext]="currentStep"
          (input)="handleSlider($event)"
        />
        <span aria-live="polite" aria-atomic="true">{{ currentStep }}</span>
      </div>
    </div>
  `,
})
export class AnimatedBubbleChart implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = 'AnimatedBubbleChart';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private signals?: AngularSignalStore;
  private unsubscribe: () => void = () => {};
  private timer: ReturnType<typeof setInterval> | undefined;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
    this.unsubscribe();
    this.unsubscribe = value.subscribe(() => {
      this.recompute();
      this.changeDetector.markForCheck();
    });
  }

  get store(): DashboardStore {
    if (!this.signals) {
      throw new Error('AnimatedBubbleChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput({ required: true }) viewId!: string;
  @NgInput({ required: true }) x!: string;
  @NgInput({ required: true }) y!: string;
  @NgInput({ required: true }) size!: string;
  @NgInput({ required: true }) time!: string;
  @NgInput() series?: string;
  @NgInput({ required: true }) label!: string;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput('class') classInput?: string;

  /** Recomputed by `recompute()`; never derived in a template getter. */
  data: ScatterPlotDatum[] = [];
  xLabel = '';
  yLabel = '';
  steps: string[] = [];
  stepIndex = 0;
  safeIndex = 0;
  currentStep = '';
  maxStep = 0;
  playing = false;
  rootClass?: string;

  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  ngOnDestroy(): void {
    // Inlined (not via stopTimer()) so the adapter-pattern guard reads the
    // teardown in this body.
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.unsubscribe();
    this.signals?.destroy();
  }

  togglePlay(): void {
    this.playing = !this.playing;
    if (this.playing) this.startTimer();
    else this.stopTimer();
  }

  handleSlider(event: Event): void {
    this.stepIndex = Number((event.target as HTMLInputElement).value);
    this.playing = false;
    this.stopTimer();
    this.recompute();
  }

  private startTimer(): void {
    if (this.timer !== undefined) return;
    this.timer = setInterval(() => {
      if (this.steps.length > 0) {
        this.stepIndex = (this.stepIndex + 1) % this.steps.length;
        this.recompute();
      }
      this.changeDetector.markForCheck();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private recompute(): void {
    if (!this.signals) return;
    void this.signals.state();
    const store = this.signals.store;
    this.steps = distinctSorted(store.applyCrossfilter(this.viewId), this.time);
    this.safeIndex = this.steps.length > 0 ? Math.min(this.stepIndex, this.steps.length - 1) : 0;
    this.currentStep = this.steps[this.safeIndex] ?? '';
    this.maxStep = Math.max(0, this.steps.length - 1);
    const frameRows = store
      .applyCrossfilter(this.viewId)
      .filter((row) => String(row[this.time]) === this.currentStep);
    const frame = buildBubbleFrame(store.model, frameRows, {
      x: this.x,
      y: this.y,
      size: this.size,
      series: this.series,
    });
    this.data = frame.data as ScatterPlotDatum[];
    this.xLabel = frame.xLabel;
    this.yLabel = frame.yLabel;
    this.rootClass = ['dataviz-animated-bubble', this.classInput].filter(Boolean).join(' ') || undefined;
  }
}
