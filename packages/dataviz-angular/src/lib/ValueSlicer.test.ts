import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ValueSlicer } from '../../dist/lib/ValueSlicer.js';

const model: DataModel = {
  dimensions: [{ id: 'region', label: 'Region', type: 'discrete' }],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

const rows: Row[] = [
  { region: 'eu', amount: 10 },
  { region: 'us', amount: 5 },
  { region: 'eu', amount: 3 },
  { region: 'apac', amount: 2 },
];

function newStore() {
  return createDashboardStore({ model, data: rows });
}

class Host {
  readonly store = newStore();
}

Component({
  standalone: true,
  imports: [ValueSlicer],
  template: `<st-dataviz-value-slicer [store]="store" dimension="region" class="probe"></st-dataviz-value-slicer>`,
})(Host);

const checkboxes = (root: Element) => Array.from(root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
const labels = (root: Element) =>
  Array.from(root.querySelectorAll('.st-choice__label')).map((l) => l.textContent?.trim());

describe('ValueSlicer (angular)', () => {
  it('renders one unchecked checkbox per distinct value, in first-seen order', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-checkboxGroup__legend')?.textContent?.trim()).toBe('Region');
    expect(root.querySelector('.st-checkboxGroup')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
    expect(labels(root)).toEqual(['eu', 'us', 'apac']);
    expect(checkboxes(root).every((c) => !c.checked)).toBe(true);
  });

  it('sets an include filter with the checked values when a box is checked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const store = fixture.componentInstance.store;

    const euBox = checkboxes(root)[0]!;
    euBox.checked = true;
    euBox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['eu'] });
    expect(checkboxes(fixture.nativeElement as HTMLElement)[0]!.checked).toBe(true);
  });

  it('reflects a filter set from outside the component (proves the store subscription)', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.store.setFilter('region', { kind: 'include', values: ['us', 'apac'] });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(checkboxes(root).map((c) => c.checked)).toEqual([false, true, true]);

    fixture.componentInstance.store.clearFilter('region');
    fixture.detectChanges();
    expect(checkboxes(fixture.nativeElement as HTMLElement).every((c) => !c.checked)).toBe(true);
  });

  it('clears the filter once the last checked value is unchecked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    store.setFilter('region', { kind: 'include', values: ['eu'] });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const euBox = checkboxes(root)[0]!;
    euBox.checked = false;
    euBox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(store.getState().filters.region).toBeUndefined();
  });
});
