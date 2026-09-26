import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardObjectLayer } from '@sentropic/dataviz-core';
import { ObjectLayerPanel } from '../../dist/lib/ObjectLayerPanel.js';

const layers: DashboardObjectLayer[] = [
  { id: 'page', label: 'Page', kind: 'group' },
  { id: 'web', label: 'Help page', kind: 'iframe', parentId: 'page' },
  { id: 'logo', label: 'Customer logo', kind: 'image', parentId: 'page', visible: false },
];

class Host {
  readonly layers = layers;
  readonly onSelect = vi.fn();
  readonly onVisibilityChange = vi.fn();
}

Component({
  standalone: true,
  imports: [ObjectLayerPanel],
  template: `<st-dataviz-object-layer-panel [layers]="layers" selectedId="logo" [onSelect]="onSelect" [onVisibilityChange]="onVisibilityChange" class="probe"></st-dataviz-object-layer-panel>`,
})(Host);

describe('ObjectLayerPanel (angular)', () => {
  it('renders the core layer tree labelled "<label> tree" on the group', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Objects');
    expect(root.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('Objects tree');
    const text = root.textContent ?? '';
    for (const label of ['Page', 'Help page', 'Customer logo']) expect(text).toContain(label);
    const adapter = fixture.debugElement.children[0]!.componentInstance as ObjectLayerPanel;
    expect(adapter.effectiveDefaults).toEqual(['page']);
  });

  it('forwards select and visibility actions with the layer and next state', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(root.querySelectorAll('[data-layer-id="web"] button'));
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['Select', 'Hide']);
    buttons[0]!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(fixture.componentInstance.onSelect).toHaveBeenCalledWith(layers[1]);

    const logoButtons = Array.from(root.querySelectorAll('[data-layer-id="logo"] button'));
    expect(logoButtons.map((b) => b.textContent?.trim())).toEqual(['Select', 'Show']);
    logoButtons[1]!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(fixture.componentInstance.onVisibilityChange).toHaveBeenCalledWith(layers[2], true);
  });
});
