import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { createFormatPanelState, type FormatPanelState } from '@sentropic/dataviz-core';
import { FormatPanel } from '../../dist/lib/FormatPanel.js';

const state = (): FormatPanelState =>
  createFormatPanelState({
    axes: [{ id: 'revenue', label: 'Revenue' }],
    legends: [{ id: 'segment', label: 'Segment' }],
    markers: [{ id: 'points', label: 'Points' }],
  });

class Host {
  value = state();
  readonly onChange = vi.fn((next: FormatPanelState) => {
    this.value = next;
  });
}

Component({
  standalone: true,
  imports: [FormatPanel],
  template: `<st-dataviz-format-panel [value]="value" [onChange]="onChange" class="probe"></st-dataviz-format-panel>`,
})(Host);

describe('FormatPanel (angular)', () => {
  it('renders a labelled group with axis, legend and marker fields', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Format');
    const text = root.textContent ?? '';
    for (const label of [
      'Minimum Revenue',
      'Maximum Revenue',
      'Echelle Revenue',
      'Inverser Revenue',
      'Titre Segment',
      'Afficher Segment',
      'Forme Points',
      'Taille Points',
      'Couleur Points',
    ])
      expect(text).toContain(label);
  });

  it('emits axis, legend and marker edits through onChange', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const field = (label: string) =>
      Array.from(root.querySelectorAll('.st-field, .st-choice')).find((f) => f.textContent?.includes(label))!;

    const min = field('Minimum Revenue').querySelector('input') as HTMLInputElement;
    min.value = '10';
    min.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].axes[0].min).toBe(10);

    const title = field('Titre Segment').querySelector('input') as HTMLInputElement;
    title.value = 'Markets';
    title.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].legends[0].title).toBe('Markets');

    const shape = field('Forme Points').querySelector('select') as HTMLSelectElement;
    shape.value = 'diamond';
    shape.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].markers[0].shape).toBe('diamond');

    const inverted = field('Inverser Revenue').querySelector('input') as HTMLInputElement;
    inverted.checked = true;
    inverted.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.onChange.mock.lastCall?.[0].axes[0].inverted).toBe(true);
  });
});
