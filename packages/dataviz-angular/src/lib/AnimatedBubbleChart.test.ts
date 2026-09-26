import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AnimatedBubbleChart } from '../../dist/lib/AnimatedBubbleChart.js';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 1);

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'day', label: 'Day', type: 'discrete' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'open', label: 'Open', aggregation: 'avg' },
    { id: 'close', label: 'Close', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', day: '2026-01-01', ts: T0, amount: 10, open: 100, close: 105 },
  { service: 'checkout', region: 'us', day: '2026-01-02', ts: T0 + DAY, amount: 5, open: 105, close: 102 },
  { service: 'billing', region: 'eu', day: '2026-01-03', ts: T0 + 2 * DAY, amount: 7, open: 102, close: 107 },
];

class Host {
  readonly store = createDashboardStore({
    model,
    data: rows,
    crossfilter: { views: { v: { field: 'service' }, other: { field: 'service' } } },
  });
}

Component({
  standalone: true,
  imports: [AnimatedBubbleChart],
  template: `<st-dataviz-animated-bubble-chart [store]="store" viewId="v" x="amount" y="close" size="open" time="day" series="region" label="Bubbles" class="probe"></st-dataviz-animated-bubble-chart>`,
})(Host);

const listItems = (root: Element): string[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim() ?? '');

describe('AnimatedBubbleChart (angular)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first time step paused, with labelled native controls', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.dataviz-animated-bubble')?.classList).toContain('probe');
    // First frame: the 2026-01-01 row only.
    expect(listItems(root)).toEqual(['eu: x 10, y 105']);
    expect(root.querySelector('[aria-label="Data values for Bubbles"]')).not.toBeNull();

    const group = root.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-label')).toBe('Contrôle temporel');
    const button = root.querySelector('[role="group"] > button');
    expect(button?.getAttribute('aria-label')).toBe('Lecture');
    expect(button?.textContent?.trim()).toBe('▶');
    const slider = root.querySelector('input[type="range"]');
    expect(slider?.getAttribute('aria-label')).toBe('Pas de temps');
    expect(slider?.getAttribute('aria-valuetext')).toBe('2026-01-01');
    expect(slider?.getAttribute('max')).toBe('2');
    expect(root.querySelector('[aria-live="polite"]')?.textContent?.trim()).toBe('2026-01-01');
  });

  it('plays through the steps on a one-second timer and pauses on slider input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const adapter = fixture.debugElement.children[0]!.componentInstance as AnimatedBubbleChart;

    root.querySelector('[role="group"] > button')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(adapter.playing).toBe(true);

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(listItems(root)).toEqual(['us: x 5, y 102']);
    expect(root.querySelector('[aria-live="polite"]')?.textContent?.trim()).toBe('2026-01-02');

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    // Wraps around the three steps.
    expect(root.querySelector('[aria-live="polite"]')?.textContent?.trim()).toBe('2026-01-01');

    const slider = root.querySelector('input[type="range"]') as HTMLInputElement;
    slider.value = '2';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(adapter.playing).toBe(false);
    expect(listItems(root)).toEqual(['eu: x 7, y 107']);
  });

  it('narrows the steps when another view selects', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.store.toggleSelection('other', 'billing');
    fixture.detectChanges();

    expect(listItems(root)).toEqual(['eu: x 7, y 107']);
    expect(root.querySelector('input[type="range"]')?.getAttribute('max')).toBe('0');
  });
});
