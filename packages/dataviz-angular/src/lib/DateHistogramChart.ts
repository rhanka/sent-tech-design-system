import { ChangeDetectionStrategy, Component, Input as NgInput } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { BarChart, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-angular';
import {
  buildDateHistogramModel,
  rangeSelectionKey,
  type DashboardStore,
  type DateHistogramBin,
  type DateHistogramConfig,
  type DateHistogramModel,
} from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
import { classNames } from './classNames.js';

export type DateHistogramChartTone = BarChartTone;
export type DateHistogramLabelFormatter = (bin: DateHistogramBin, model: DateHistogramModel) => string;

export type DateHistogramChartProps = {
  store: DashboardStore;
  viewId?: string;
  date: DateHistogramConfig['date'];
  interval?: DateHistogramConfig['interval'];
  bins?: DateHistogramConfig['bins'];
  domain?: DateHistogramConfig['domain'];
  label: string;
  tone?: DateHistogramChartTone;
  selectable?: boolean;
  width?: number;
  height?: number;
  hoverKey?: string | null;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  formatLabel?: DateHistogramLabelFormatter;
  class?: string;
};

const DATE_LABEL = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function defaultFormatLabel(bin: DateHistogramBin): string {
  return DATE_LABEL.format(new Date(bin.start));
}

function emptyModel(dateId: string): DateHistogramModel {
  return { dateId, domain: [Number.NaN, Number.NaN], bins: [] };
}

function filterFor(bin: DateHistogramBin) {
  const max = bin.end > bin.start ? bin.end - 1 : bin.end;
  return { min: bin.start, max };
}

function selectionKeyFor(bin: DateHistogramBin): string {
  const range = filterFor(bin);
  return rangeSelectionKey(range.min, range.max);
}

/** State wiring for a DS Angular BarChart-backed date histogram. */
@Component({
  selector: 'st-dataviz-date-histogram-chart',
  standalone: true,
  imports: [BarChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <st-bar-chart
      [data]="data"
      [label]="label"
      [width]="width"
      [height]="height"
      [selectedKeys]="chartSelectedKeys"
      [onSelect]="onSelect"
      [hoverKey]="hoverKey"
      [onHoverKeyChange]="onHoverKeyChange"
      [onSelectKey]="onSelectKey"
      [class]="chartClass"
    ></st-bar-chart>
  `,
})
export class DateHistogramChart implements OnDestroy {
  static readonly stComponentName = 'DateHistogramChart';

  private signals?: AngularSignalStore;

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
  }

  get store(): DashboardStore {
    if (!this.signals) {
      throw new Error('DateHistogramChart: store is required.');
    }
    return this.signals.store;
  }

  @NgInput() viewId?: string;
  @NgInput({ required: true }) date!: DateHistogramConfig['date'];
  @NgInput() interval?: DateHistogramConfig['interval'];
  @NgInput() bins?: DateHistogramConfig['bins'];
  @NgInput() domain?: DateHistogramConfig['domain'];
  @NgInput({ required: true }) label!: string;
  @NgInput() tone?: DateHistogramChartTone;
  @NgInput() selectable = true;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() hoverKey?: string | null;
  @NgInput() onHoverKeyChange?: (key: string | null) => void;
  @NgInput() onSelectKey?: (key: string | null) => void;
  @NgInput() formatLabel: DateHistogramLabelFormatter = defaultFormatLabel;
  @NgInput('class') classInput?: string;

  get chartClass(): string {
    return classNames('st-dateHistogramChart', this.classInput);
  }

  get model(): DateHistogramModel {
    if (this.signals) void this.signals.state();
    try {
      return buildDateHistogramModel(this.store.model, this.store.applyCrossfilter(this.viewId), {
        date: this.date,
        interval: this.interval,
        bins: this.bins,
        domain: this.domain,
      });
    } catch {
      return emptyModel(this.date);
    }
  }

  get labels(): string[] {
    const model = this.model;
    return model.bins.map((bin) => this.formatLabel(bin, model));
  }

  get data(): BarChartDatum[] {
    const labels = this.labels;
    return this.model.bins.map((bin, index) => {
      const datum = { label: labels[index] ?? String(index + 1), value: bin.count };
      return this.tone ? { ...datum, tone: this.tone } : datum;
    });
  }

  get chartSelectedKeys(): string[] {
    if (!this.selectable || !this.viewId || !this.signals) return [];
    const activeKeys = this.signals.state().selections[this.viewId] ?? [];
    const labels = this.labels;
    return this.model.bins.flatMap((bin, index) =>
      activeKeys.includes(selectionKeyFor(bin)) ? [labels[index] ?? String(index + 1)] : [],
    );
  }

  readonly handleBarSelect = (key: string): void => {
    if (!this.selectable || !this.viewId) return;
    const index = this.labels.indexOf(key);
    const bin = this.model.bins[index];
    if (!bin) return;
    this.store.toggleSelection(this.viewId, selectionKeyFor(bin));
  };

  get onSelect(): ((key: string) => void) | undefined {
    return this.selectable && this.viewId ? this.handleBarSelect : undefined;
  }

  ngOnDestroy(): void {
    this.signals?.destroy();
  }
}
