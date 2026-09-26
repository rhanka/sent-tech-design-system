import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { DataModel } from '@sentropic/dataviz-core';
import { FieldPane } from '../../dist/lib/FieldPane.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'score', label: 'Score', type: 'continuous' },
  ],
  measures: [{ id: 'amount', label: 'Amount', aggregation: 'sum' }],
};

class Host {
  readonly model = model;
  readonly onSelect = vi.fn();
}

Component({
  standalone: true,
  imports: [FieldPane],
  template: `<st-dataviz-field-pane [model]="model" [onSelect]="onSelect" class="probe"></st-dataviz-field-pane>`,
})(Host);

const treeItems = (root: Element) => Array.from(root.querySelectorAll('[role="treeitem"]'));

describe('FieldPane (angular)', () => {
  it('renders a DS TreeView labelled "Fields" with the dimension and measure groups', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('Fields');
    const labels = treeItems(root).map((li) => li.textContent?.trim());
    expect(labels).toEqual(expect.arrayContaining(['Dimensions', 'Measures', 'Region', 'Score', 'Amount']));
    expect(root.querySelector('.st-treeView')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
  });

  it('derives the default expansion from the core tree', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as FieldPane;
    expect(adapter.effectiveDefaults).toEqual(
      expect.arrayContaining(['group:dimensions', 'group:measures']),
    );
  });

  it('forwards a leaf activation to onSelect with the field id', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const region = treeItems(root).find((li) => li.textContent?.trim() === 'Region')!;
    region.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.onSelect).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.onSelect.mock.calls[0]![0]).toContain('region');
  });
});
