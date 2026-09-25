import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { VennChart } from '../../dist/lib/VennChart.js';
import type { VennChartArea } from '@sentropic/design-system-angular';

class Host {
  areas: VennChartArea[] = [
    { sets: ['A'], value: 10 },
    { sets: ['B'], value: 5 },
  ];
  label = 'Sets';
}

Component({
  standalone: true,
  imports: [VennChart],
  template: `<st-dataviz-venn-chart [areas]="areas" [label]="label" class="probe"></st-dataviz-venn-chart>`,
})(Host);

const dataList = (root: Element): string[] =>
  Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim() ?? '');

describe('VennChart (angular)', () => {
  it('forwards the areas straight to the DS VennChart, with no store involved', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const marker = root.querySelector('[data-st-component]');
    expect(marker?.getAttribute('data-st-component')).toBe('VennChart');
    expect(marker?.getAttribute('class')?.split(' ')).toEqual(expect.arrayContaining(['st-vennChart', 'probe']));
    expect(root.querySelector('.st-vennChart__visual')?.getAttribute('aria-label')).toBe('Sets');
    expect(root.querySelectorAll('circle.st-vennChart__circle').length).toBe(2);
    expect(dataList(root)).toEqual(['A: 10', 'B: 5']);
  });

  it('re-renders when the areas input changes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    fixture.componentInstance.areas = [{ sets: ['A', 'B'], value: 3 }];
    // No zone.js in this setup: a plain host-field mutation needs an explicit
    // markForCheck() before detectChanges() will pick it up.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(dataList(fixture.nativeElement as HTMLElement)).toEqual(['A ∩ B: 3']);
  });
});
