import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PalettePicker } from '../../dist/lib/PalettePicker.js';

class Host {
  readonly categorical = ['#1f77b4', '#ff7f0e'];
  readonly sequential = ['#f7fbff', '#08306b'];
  readonly diverging = ['#053061', '#f7f7f7', '#67001f'];
}

Component({
  standalone: true,
  imports: [PalettePicker],
  template: `
    <st-dataviz-palette-picker
      [categorical]="categorical"
      [sequential]="sequential"
      [diverging]="diverging"
      [steps]="3"
      label="Brand"
      class="probe"
    ></st-dataviz-palette-picker>
  `,
})(Host);

class EmptyHost {}

Component({
  standalone: true,
  imports: [PalettePicker],
  template: `<st-dataviz-palette-picker></st-dataviz-palette-picker>`,
})(EmptyHost);

describe('PalettePicker (angular)', () => {
  it('renders one swatch per categorical colour and both ramps with prefixed labels', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.st-colorSwatch').length).toBe(2);
    const bars = Array.from(root.querySelectorAll('.st-colorScaleBar'));
    expect(bars.length).toBe(2);
    expect(
      Array.from(root.querySelectorAll('.st-colorScaleBar__bar')).map((b) => b.getAttribute('aria-label')),
    ).toEqual([
      'Brand — séquentiel',
      'Brand — divergent',
    ]);
    expect(root.querySelector('.st-stack')?.getAttribute('class')?.split(' ')).toEqual(
      expect.arrayContaining(['probe']),
    );
  });

  it('renders an empty stack when no palette is given', () => {
    const fixture = TestBed.createComponent(EmptyHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.st-stack')).not.toBeNull();
    expect(root.querySelectorAll('.st-colorSwatch').length).toBe(0);
    expect(root.querySelectorAll('.st-colorScaleBar').length).toBe(0);
  });

  it('needs two sequential stops and three diverging stops before ramping', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const adapter = fixture.debugElement.children[0]!.componentInstance as PalettePicker;
    expect(adapter.seqColors?.length).toBe(3);
    expect(adapter.divColors?.length).toBe(3);
  });
});
