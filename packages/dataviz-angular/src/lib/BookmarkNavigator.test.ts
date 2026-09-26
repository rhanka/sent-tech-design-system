import '@angular/compiler';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDashboardStore,
  type DashboardBookmark,
  type DataModel,
} from '@sentropic/dataviz-core';
import { BookmarkNavigator } from '../../dist/lib/BookmarkNavigator.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const bookmarks: DashboardBookmark[] = [
  {
    id: 'fr',
    label: 'France',
    state: { filters: { country: { kind: 'include', values: ['FR'] } } },
  },
  {
    id: 'us',
    label: 'Etats-Unis',
    state: { filters: { country: { kind: 'include', values: ['US'] } } },
  },
];

class Host {
  readonly store = createDashboardStore({ model, data: [] });
  readonly bookmarks = bookmarks;
  readonly onBookmarkChange = vi.fn();
}

Component({
  standalone: true,
  imports: [BookmarkNavigator],
  template: `<st-dataviz-bookmark-navigator [store]="store" [bookmarks]="bookmarks" [onBookmarkChange]="onBookmarkChange" class="probe"></st-dataviz-bookmark-navigator>`,
})(Host);

const buttonTexts = (root: Element): string[] =>
  Array.from(root.querySelectorAll('[role="group"] button')).map((b) => b.textContent?.trim() ?? '');

describe('BookmarkNavigator (angular)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a labelled group with previous/next/playback and one button per bookmark', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Signets');
    expect(buttonTexts(root)).toEqual(['Précédent', 'Suivant', 'Lecture', 'France', 'Etats-Unis']);
  });

  it('applies the clicked bookmark to the store and notifies', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const france = Array.from(root.querySelectorAll('[role="group"] button')).find(
      (b) => b.textContent?.trim() === 'France',
    )!;
    france.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.store.getState().filters.country).toEqual({
      kind: 'include',
      values: ['FR'],
    });
    expect(fixture.componentInstance.onBookmarkChange).toHaveBeenCalledWith(bookmarks[0]);
    const adapter = fixture.debugElement.children[0]!.componentInstance as BookmarkNavigator;
    expect(adapter.activeId).toBe('fr');
  });

  it('steps forward and back through the bookmarks', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(root.querySelectorAll('[role="group"] button'));

    buttons().find((b) => b.textContent?.trim() === 'Suivant')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.store.getState().filters.country).toEqual({
      kind: 'include',
      values: ['US'],
    });

    buttons().find((b) => b.textContent?.trim() === 'Précédent')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.store.getState().filters.country).toEqual({
      kind: 'include',
      values: ['FR'],
    });
  });

  it('advances on the playback timer and stops when toggled off', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const buttons = () => Array.from(root.querySelectorAll('[role="group"] button'));

    buttons().find((b) => b.textContent?.trim() === 'Lecture')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(buttonTexts(root)).toContain('Pause');

    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(fixture.componentInstance.store.getState().filters.country).toEqual({
      kind: 'include',
      values: ['US'],
    });

    buttons().find((b) => b.textContent?.trim() === 'Pause')!.dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    vi.advanceTimersByTime(20000);
    fixture.detectChanges();
    expect(fixture.componentInstance.store.getState().filters.country).toEqual({
      kind: 'include',
      values: ['US'],
    });
  });
});
